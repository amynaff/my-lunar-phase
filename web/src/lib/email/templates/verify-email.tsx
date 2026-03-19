import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
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

interface VerifyEmailProps {
  code: string;
  name?: string;
}

export default function VerifyEmail({
  code = "000000",
  name,
}: VerifyEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Your verification code is {code}</Preview>
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
              Email Verification
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
                margin: "0 0 28px",
                textAlign: "left" as const,
              }}
            >
              Please use the code below to verify your email address. This code
              will expire in 10 minutes.
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
                as="h1"
                style={{
                  fontSize: "40px",
                  letterSpacing: "8px",
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

            <Text
              style={{
                fontSize: "13px",
                lineHeight: "20px",
                color: colors.gray,
                margin: "0 0 0",
                textAlign: "left" as const,
              }}
            >
              If you did not request this verification, you can safely ignore
              this email.
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
