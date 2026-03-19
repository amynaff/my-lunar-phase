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
} from "@react-email/components";

const colors = {
  primary: "#4a3485",
  accent: "#9d84ed",
  bg: "#f8f7ff",
  rose: "#f9a8d4",
  white: "#ffffff",
  gray: "#6b7280",
  darkText: "#1f1735",
};

const fontFamily = "'Quicksand', 'Helvetica', sans-serif";

interface PartnerInviteProps {
  code: string;
  inviterName?: string;
  appUrl: string;
}

export default function PartnerInvite({
  code = "ABC123",
  inviterName,
  appUrl = "https://mylunarphase.com",
}: PartnerInviteProps) {
  const fromText = inviterName
    ? `${inviterName} has invited you`
    : "Someone special has invited you";

  return (
    <Html>
      <Head />
      <Preview>You have been invited to connect on MyLunarPhase</Preview>
      <Body style={{ backgroundColor: colors.bg, fontFamily, margin: 0, padding: 0 }}>
        <Container
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >
          <Section
            style={{
              backgroundColor: colors.white,
              borderRadius: "16px",
              padding: "40px 32px",
              textAlign: "center" as const,
            }}
          >
            <Text
              style={{
                fontSize: "32px",
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
                fontSize: "13px",
                color: colors.accent,
                margin: "0 0 24px",
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
              }}
            >
              Partner Invite
            </Text>

            <Hr style={{ borderColor: colors.rose, margin: "0 0 28px" }} />

            <Heading
              as="h1"
              style={{
                fontSize: "20px",
                color: colors.darkText,
                fontFamily,
                fontWeight: 600,
                margin: "0 0 16px",
              }}
            >
              You are invited!
            </Heading>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: colors.gray,
                margin: "0 0 8px",
              }}
            >
              {fromText} to connect as a partner on MyLunarPhase &mdash; a
              wellness app that helps couples stay in sync through every phase.
            </Text>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: colors.gray,
                margin: "0 0 28px",
              }}
            >
              Use the invite code below to get started:
            </Text>

            <Section
              style={{
                backgroundColor: colors.bg,
                borderRadius: "12px",
                padding: "24px",
                margin: "0 0 28px",
              }}
            >
              <Heading
                as="h2"
                style={{
                  fontSize: "36px",
                  letterSpacing: "6px",
                  color: colors.primary,
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 700,
                  margin: 0,
                  textAlign: "center" as const,
                }}
              >
                {code}
              </Heading>
            </Section>

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
              Join MyLunarPhase
            </Button>

            <Text
              style={{
                fontSize: "13px",
                lineHeight: "20px",
                color: colors.gray,
                margin: "28px 0 0",
              }}
            >
              After signing up, enter the invite code in the Partner section of
              your settings to connect.
            </Text>

            <Hr style={{ borderColor: "#e5e3ef", margin: "32px 0 16px" }} />

            <Text
              style={{
                fontSize: "12px",
                color: colors.gray,
                margin: 0,
              }}
            >
              &copy; {new Date().getFullYear()} MyLunarPhase. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
