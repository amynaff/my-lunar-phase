export type Provider = "withings" | "oura" | "fitbit" | "garmin" | "whoop" | "google_fit";

export type MeasurementType =
  | "temperature"
  | "weight"
  | "blood_pressure"
  | "heart_rate"
  | "sleep"
  | "spo2"
  | "hrv"
  | "respiratory_rate"
  | "stress";

export interface ProviderConfig {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  measurements: MeasurementType[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  providerUserId: string | null;
}

export interface NormalizedMeasurement {
  type: MeasurementType;
  value: number;
  unit: string;
  secondaryValue?: number;
  measuredAt: Date;
  deviceId?: string;
  metadata?: Record<string, unknown>;
}

export const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  withings: {
    name: "withings",
    displayName: "Withings",
    description: "Body temperature, weight, blood pressure, sleep",
    icon: "🌡️",
    authUrl: "https://account.withings.com/oauth2_user/authorize2",
    tokenUrl: "https://wbsapi.withings.net/v2/oauth2",
    scopes: ["user.metrics", "user.activity"],
    measurements: ["temperature", "weight", "blood_pressure", "heart_rate", "sleep"],
  },
  oura: {
    name: "oura",
    displayName: "Oura Ring",
    description: "Sleep, temperature trends, HRV, activity",
    icon: "💍",
    authUrl: "https://cloud.ouraring.com/oauth/authorize",
    tokenUrl: "https://api.ouraring.com/oauth/token",
    scopes: ["daily", "heartrate", "personal", "session", "sleep", "workout"],
    measurements: ["temperature", "heart_rate", "sleep", "hrv"],
  },
  fitbit: {
    name: "fitbit",
    displayName: "Fitbit",
    description: "Activity, sleep, heart rate, temperature",
    icon: "⌚",
    authUrl: "https://www.fitbit.com/oauth2/authorize",
    tokenUrl: "https://api.fitbit.com/oauth2/token",
    scopes: ["activity", "heartrate", "sleep", "temperature"],
    measurements: ["temperature", "heart_rate", "sleep", "spo2"],
  },
  garmin: {
    name: "garmin",
    displayName: "Garmin",
    description: "Activity, sleep, heart rate, stress",
    icon: "🏃",
    authUrl: "",
    tokenUrl: "",
    scopes: [],
    measurements: ["heart_rate", "sleep", "stress", "spo2"],
  },
  whoop: {
    name: "whoop",
    displayName: "Whoop",
    description: "HRV, strain, recovery, sleep",
    icon: "💪",
    authUrl: "https://api.prod.whoop.com/oauth/oauth2/auth",
    tokenUrl: "https://api.prod.whoop.com/oauth/oauth2/token",
    scopes: ["read:recovery", "read:sleep", "read:workout", "read:cycles", "read:body_measurement"],
    measurements: ["heart_rate", "sleep", "hrv", "respiratory_rate"],
  },
  google_fit: {
    name: "google_fit",
    displayName: "Google Fit",
    description: "Activity, heart rate, sleep, nutrition",
    icon: "🏋️",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/fitness.activity.read", "https://www.googleapis.com/auth/fitness.heart_rate.read", "https://www.googleapis.com/auth/fitness.sleep.read"],
    measurements: ["heart_rate", "sleep"],
  },
};
