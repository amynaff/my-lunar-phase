import { prisma } from "@/lib/prisma";
import type { TokenResponse, NormalizedMeasurement } from "./types";

const API_BASE = "https://wbsapi.withings.net";

// Withings measure type codes
const MEASURE_TYPES = {
  weight: 1,
  systolic: 10,
  diastolic: 9,
  heartRate: 11,
  temperature: 12,
  bodyTemperature: 71,
  spo2: 54,
} as const;

export function getWithingsAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.WITHINGS_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    scope: "user.metrics,user.activity",
    state,
  });
  return `https://account.withings.com/oauth2_user/authorize2?${params}`;
}

export async function exchangeWithingsCode(code: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    action: "requesttoken",
    grant_type: "authorization_code",
    client_id: process.env.WITHINGS_CLIENT_ID!,
    client_secret: process.env.WITHINGS_CLIENT_SECRET!,
    code,
    redirect_uri: getRedirectUri(),
  });

  const res = await fetch(`${API_BASE}/v2/oauth2`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json();
  if (data.status !== 0) {
    throw new Error(`Withings token error: ${data.error || "unknown"}`);
  }

  const { access_token, refresh_token, expires_in, userid } = data.body;
  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt: new Date(Date.now() + expires_in * 1000),
    providerUserId: String(userid),
  };
}

export async function refreshWithingsToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    action: "requesttoken",
    grant_type: "refresh_token",
    client_id: process.env.WITHINGS_CLIENT_ID!,
    client_secret: process.env.WITHINGS_CLIENT_SECRET!,
    refresh_token: refreshToken,
  });

  const res = await fetch(`${API_BASE}/v2/oauth2`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json();
  if (data.status !== 0) {
    throw new Error(`Withings refresh error: ${data.error || "unknown"}`);
  }

  const { access_token, refresh_token: new_refresh, expires_in, userid } = data.body;
  return {
    accessToken: access_token,
    refreshToken: new_refresh,
    expiresAt: new Date(Date.now() + expires_in * 1000),
    providerUserId: String(userid),
  };
}

async function getValidToken(integrationId: string): Promise<string> {
  const integration = await prisma.healthIntegration.findUniqueOrThrow({
    where: { id: integrationId },
  });

  // If token expires within 5 minutes, refresh it
  if (integration.expiresAt && integration.expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
    if (!integration.refreshToken) throw new Error("No refresh token available");

    const tokens = await refreshWithingsToken(integration.refreshToken);
    await prisma.healthIntegration.update({
      where: { id: integrationId },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    });
    return tokens.accessToken;
  }

  return integration.accessToken;
}

export async function fetchWithingsMeasurements(
  integrationId: string,
  userId: string,
  startDate?: Date
): Promise<NormalizedMeasurement[]> {
  const accessToken = await getValidToken(integrationId);

  const params = new URLSearchParams({
    action: "getmeas",
    category: "1", // real measurements only
  });

  if (startDate) {
    params.set("startdate", String(Math.floor(startDate.getTime() / 1000)));
  }
  params.set("enddate", String(Math.floor(Date.now() / 1000)));

  const res = await fetch(`${API_BASE}/measure`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await res.json();
  if (data.status !== 0) {
    throw new Error(`Withings measure error: status ${data.status}`);
  }

  const measurements: NormalizedMeasurement[] = [];

  for (const group of data.body?.measuregrps || []) {
    const measuredAt = new Date(group.date * 1000);
    const deviceId = group.deviceid || undefined;

    // Group blood pressure readings (systolic + diastolic appear together)
    let systolic: number | undefined;
    let diastolic: number | undefined;

    for (const m of group.measures) {
      const realValue = m.value * Math.pow(10, m.unit);

      switch (m.type) {
        case MEASURE_TYPES.weight:
          measurements.push({ type: "weight", value: realValue, unit: "kg", measuredAt, deviceId });
          break;
        case MEASURE_TYPES.temperature:
        case MEASURE_TYPES.bodyTemperature:
          measurements.push({ type: "temperature", value: realValue, unit: "celsius", measuredAt, deviceId });
          break;
        case MEASURE_TYPES.heartRate:
          measurements.push({ type: "heart_rate", value: realValue, unit: "bpm", measuredAt, deviceId });
          break;
        case MEASURE_TYPES.systolic:
          systolic = realValue;
          break;
        case MEASURE_TYPES.diastolic:
          diastolic = realValue;
          break;
        case MEASURE_TYPES.spo2:
          measurements.push({ type: "spo2", value: realValue, unit: "percent", measuredAt, deviceId });
          break;
      }
    }

    if (systolic !== undefined) {
      measurements.push({
        type: "blood_pressure",
        value: systolic,
        unit: "mmHg",
        secondaryValue: diastolic,
        measuredAt,
        deviceId,
      });
    }
  }

  return measurements;
}

export async function syncWithingsData(integrationId: string, userId: string): Promise<number> {
  // Get last sync time to only fetch new data
  const integration = await prisma.healthIntegration.findUniqueOrThrow({
    where: { id: integrationId },
  });

  const startDate = integration.lastSyncAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // default: last 30 days

  const measurements = await fetchWithingsMeasurements(integrationId, userId, startDate);

  if (measurements.length > 0) {
    // Upsert measurements (avoid duplicates by checking existing timestamps)
    for (const m of measurements) {
      const existing = await prisma.healthMeasurement.findFirst({
        where: {
          integrationId,
          type: m.type,
          measuredAt: m.measuredAt,
        },
      });

      if (!existing) {
        await prisma.healthMeasurement.create({
          data: {
            integrationId,
            userId,
            provider: "withings",
            type: m.type,
            value: m.value,
            unit: m.unit,
            secondaryValue: m.secondaryValue,
            measuredAt: m.measuredAt,
            deviceId: m.deviceId,
            metadata: m.metadata ? JSON.stringify(m.metadata) : null,
          },
        });
      }
    }
  }

  // Update last sync time
  await prisma.healthIntegration.update({
    where: { id: integrationId },
    data: { lastSyncAt: new Date() },
  });

  return measurements.length;
}

function getRedirectUri(): string {
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/api/integrations/withings/callback`;
}
