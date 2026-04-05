import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
  Preview,
  Row,
  Column,
} from "@react-email/components";

const colors = {
  primary: "#4a3485",
  accent: "#9d84ed",
  bg: "#f8f7ff",
  rose: "#f9a8d4",
  white: "#ffffff",
  gray: "#6b7280",
  darkText: "#1f1735",
  softPurple: "#ede9fe",
  border: "#e5e3ef",
};

const fontFamily = "'Quicksand', 'Helvetica', sans-serif";

const phaseEmojis: Record<string, string> = {
  menstrual: "🌑",
  follicular: "🌒",
  ovulatory: "🌕",
  luteal: "🌖",
};

const phaseNames: Record<string, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

const phaseColors: Record<string, string> = {
  menstrual: "#be185d",
  follicular: "#ec4899",
  ovulatory: "#f9a8d4",
  luteal: "#9333ea",
};

const phaseDescriptions: Record<string, string> = {
  menstrual: "Inner Winter — A time for rest and gentle self-care.",
  follicular: "Inner Spring — Fresh energy and new beginnings.",
  ovulatory: "Inner Summer — Peak energy and social connection.",
  luteal: "Inner Autumn — Time to wind down and turn inward.",
};

export interface WeeklyDigestProps {
  name?: string;
  phase?: string;
  daysUntilNextPeriod?: number;
  streak?: number;
  nutritionTip?: string;
  movementTip?: string;
  selfcareTip?: string;
  appUrl?: string;
  unsubscribeUrl?: string;
}

export default function WeeklyDigest({
  name = "there",
  phase = "follicular",
  daysUntilNextPeriod = 14,
  streak = 0,
  nutritionTip = "Nourish your body with whole, seasonal foods this week.",
  movementTip = "Move in a way that feels good to you today.",
  selfcareTip = "Take a moment to check in with yourself.",
  appUrl = "https://mylunarphase.com/dashboard",
  unsubscribeUrl = "https://mylunarphase.com/settings",
}: WeeklyDigestProps) {
  const phaseColor = phaseColors[phase] ?? colors.primary;
  const phaseEmoji = phaseEmojis[phase] ?? "🌙";
  const phaseName = phaseNames[phase] ?? phase;
  const phaseDesc = phaseDescriptions[phase] ?? "";

  return (
    <Html>
      <Head />
      <Preview>
        Your weekly wellness digest — {phaseName} phase {phaseEmoji}
      </Preview>
      <Body style={{ backgroundColor: colors.bg, fontFamily, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 20px" }}>
          {/* Header */}
          <Section
            style={{
              backgroundColor: colors.white,
              borderRadius: "16px 16px 0 0",
              padding: "32px 32px 24px",
              textAlign: "center" as const,
              borderTop: `4px solid ${phaseColor}`,
            }}
          >
            <Text
              style={{
                fontSize: "28px",
                margin: "0 0 4px",
                color: colors.primary,
                fontWeight: 700,
                fontFamily,
              }}
            >
              MyLunarPhase
            </Text>
            <Text
              style={{
                fontSize: "11px",
                color: colors.accent,
                margin: "0 0 20px",
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
              }}
            >
              Your Weekly Digest
            </Text>

            <Hr style={{ borderColor: colors.border, margin: "0 0 20px" }} />

            <Heading
              as="h1"
              style={{
                fontSize: "20px",
                color: colors.darkText,
                fontFamily,
                fontWeight: 600,
                margin: "0 0 8px",
              }}
            >
              Hello, {name} 🌙
            </Heading>
            <Text
              style={{
                fontSize: "14px",
                color: colors.gray,
                margin: 0,
                lineHeight: "22px",
              }}
            >
              Here&apos;s your personalised wellness snapshot for the week.
            </Text>
          </Section>

          {/* Phase Banner */}
          <Section
            style={{
              backgroundColor: `${phaseColor}18`,
              padding: "20px 32px",
              borderLeft: `3px solid ${phaseColor}`,
              margin: "0",
            }}
          >
            <Row>
              <Column style={{ width: "48px" }}>
                <Text style={{ fontSize: "32px", margin: 0 }}>{phaseEmoji}</Text>
              </Column>
              <Column>
                <Text
                  style={{
                    fontSize: "13px",
                    color: phaseColor,
                    margin: "0 0 2px",
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "1px",
                  }}
                >
                  {phaseName} Phase
                </Text>
                <Text
                  style={{
                    fontSize: "13px",
                    color: colors.gray,
                    margin: 0,
                    lineHeight: "20px",
                  }}
                >
                  {phaseDesc}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Stats Row */}
          <Section
            style={{
              backgroundColor: colors.white,
              padding: "20px 32px",
            }}
          >
            <Row>
              <Column
                style={{
                  textAlign: "center" as const,
                  padding: "12px",
                  backgroundColor: colors.softPurple,
                  borderRadius: "12px",
                  marginRight: "8px",
                }}
              >
                <Text
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: colors.primary,
                    margin: 0,
                    fontFamily,
                  }}
                >
                  {daysUntilNextPeriod}
                </Text>
                <Text
                  style={{
                    fontSize: "11px",
                    color: colors.gray,
                    margin: 0,
                    fontFamily,
                  }}
                >
                  days until next period
                </Text>
              </Column>
              <Column style={{ width: "8px" }} />
              <Column
                style={{
                  textAlign: "center" as const,
                  padding: "12px",
                  backgroundColor: "#fdf2f8",
                  borderRadius: "12px",
                }}
              >
                <Text
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#be185d",
                    margin: 0,
                    fontFamily,
                  }}
                >
                  {streak}
                </Text>
                <Text
                  style={{
                    fontSize: "11px",
                    color: colors.gray,
                    margin: 0,
                    fontFamily,
                  }}
                >
                  {streak === 1 ? "day streak" : "day streak"} 🔥
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Tips Section */}
          <Section
            style={{
              backgroundColor: colors.white,
              padding: "0 32px 24px",
            }}
          >
            <Hr style={{ borderColor: colors.border, margin: "0 0 20px" }} />
            <Text
              style={{
                fontSize: "11px",
                color: colors.accent,
                margin: "0 0 14px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase" as const,
              }}
            >
              This Week&apos;s Phase Tips
            </Text>

            {/* Nutrition */}
            <Section
              style={{
                backgroundColor: "#f0fdf4",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#16a34a",
                  margin: "0 0 4px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "1px",
                }}
              >
                🥗 Nutrition
              </Text>
              <Text
                style={{
                  fontSize: "13px",
                  color: colors.darkText,
                  margin: 0,
                  lineHeight: "20px",
                }}
              >
                {nutritionTip}
              </Text>
            </Section>

            {/* Movement */}
            <Section
              style={{
                backgroundColor: "#eff6ff",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#2563eb",
                  margin: "0 0 4px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "1px",
                }}
              >
                🏃 Movement
              </Text>
              <Text
                style={{
                  fontSize: "13px",
                  color: colors.darkText,
                  margin: 0,
                  lineHeight: "20px",
                }}
              >
                {movementTip}
              </Text>
            </Section>

            {/* Self-care */}
            <Section
              style={{
                backgroundColor: "#fdf4ff",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "0",
              }}
            >
              <Text
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9333ea",
                  margin: "0 0 4px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "1px",
                }}
              >
                ✨ Self-Care
              </Text>
              <Text
                style={{
                  fontSize: "13px",
                  color: colors.darkText,
                  margin: 0,
                  lineHeight: "20px",
                }}
              >
                {selfcareTip}
              </Text>
            </Section>
          </Section>

          {/* CTA */}
          <Section
            style={{
              backgroundColor: colors.white,
              padding: "0 32px 32px",
              textAlign: "center" as const,
            }}
          >
            <Hr style={{ borderColor: colors.border, margin: "0 0 24px" }} />
            <Button
              href={appUrl}
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
                fontSize: "15px",
                fontFamily,
                fontWeight: 600,
                padding: "14px 32px",
                borderRadius: "10px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Open MyLunarPhase
            </Button>
          </Section>

          {/* Footer */}
          <Section
            style={{
              backgroundColor: colors.white,
              borderRadius: "0 0 16px 16px",
              padding: "16px 32px 24px",
              textAlign: "center" as const,
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <Text style={{ fontSize: "11px", color: colors.gray, margin: "0 0 6px" }}>
              &copy; {new Date().getFullYear()} MyLunarPhase. All rights reserved.
            </Text>
            <Text style={{ fontSize: "11px", color: colors.gray, margin: 0 }}>
              <a
                href={unsubscribeUrl}
                style={{ color: colors.accent, textDecoration: "underline" }}
              >
                Manage email preferences
              </a>
              {" · "}
              <a
                href="https://mylunarphase.com/privacy"
                style={{ color: colors.accent, textDecoration: "underline" }}
              >
                Privacy Policy
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
