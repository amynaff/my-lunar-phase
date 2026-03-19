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

interface PasswordResetProps {
  resetUrl: string;
  name?: string;
}

export default function PasswordReset({
  resetUrl = "https://mylunarphase.com/reset",
  name,
}: PasswordResetProps) {
  const greeting = name ? `Hi ${name},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Reset your MyLunarPhase password</Preview>
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
              Password Reset
            </Text>

            <Hr style={{ borderColor: colors.rose, margin: "0 0 28px" }} />

            <Text
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: colors.gray,
                margin: "0 0 8px",
                textAlign: "left" as const,
              }}
            >
              {greeting}
            </Text>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: colors.gray,
                margin: "0 0 8px",
                textAlign: "left" as const,
              }}
            >
              We received a request to reset your password. Click the button
              below to choose a new one.
            </Text>

            <Text
              style={{
                fontSize: "13px",
                lineHeight: "20px",
                color: colors.rose,
                fontWeight: 600,
                margin: "0 0 28px",
                textAlign: "left" as const,
              }}
            >
              This link will expire in 1 hour.
            </Text>

            <Button
              href={resetUrl}
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
              Reset Password
            </Button>

            <Text
              style={{
                fontSize: "13px",
                lineHeight: "20px",
                color: colors.gray,
                margin: "28px 0 0",
                textAlign: "left" as const,
              }}
            >
              If you did not request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>

            <Hr style={{ borderColor: "#e5e3ef", margin: "32px 0 16px" }} />

            <Text
              style={{
                fontSize: "11px",
                lineHeight: "18px",
                color: colors.gray,
                margin: "0 0 8px",
                wordBreak: "break-all" as const,
              }}
            >
              If the button does not work, paste this link into your browser:{" "}
              {resetUrl}
            </Text>

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
