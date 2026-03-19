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

interface WelcomeEmailProps {
  name?: string;
  dashboardUrl?: string;
}

export default function WelcomeEmail({
  name = "there",
  dashboardUrl = "https://mylunarphase.com/dashboard",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to MyLunarPhase - Your wellness journey starts here</Preview>
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
              Wellness in sync with you
            </Text>

            <Hr style={{ borderColor: colors.rose, margin: "0 0 28px" }} />

            <Heading
              as="h1"
              style={{
                fontSize: "22px",
                color: colors.darkText,
                fontFamily,
                fontWeight: 600,
                margin: "0 0 16px",
              }}
            >
              Welcome, {name}!
            </Heading>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: colors.gray,
                margin: "0 0 8px",
              }}
            >
              We are so glad you are here. MyLunarPhase is your personal space to
              track your cycle, nourish your body, and care for your wellbeing
              &mdash; all in one place.
            </Text>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: colors.gray,
                margin: "0 0 28px",
              }}
            >
              Here is what you can explore:
            </Text>

            <Section style={{ textAlign: "left" as const, margin: "0 0 28px" }}>
              {[
                "Mood & cycle logging tailored to your rhythm",
                "AI-powered nutrition and movement suggestions",
                "Self-care routines designed for every phase",
                "Partner sharing so your loved ones stay in sync",
              ].map((feature, i) => (
                <Text
                  key={i}
                  style={{
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: colors.darkText,
                    margin: "0 0 8px",
                    paddingLeft: "8px",
                  }}
                >
                  &bull; {feature}
                </Text>
              ))}
            </Section>

            <Button
              href={dashboardUrl}
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
              Go to Dashboard
            </Button>

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
