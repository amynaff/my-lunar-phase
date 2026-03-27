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

interface SubscriptionConfirmProps {
  plan: string;
  amount: string;
  name?: string;
}

export default function SubscriptionConfirm({
  plan = "Premium",
  amount = "$6.99/mo",
  name,
}: SubscriptionConfirmProps) {
  const greeting = name ? `Hi ${name},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Your MyLunarPhase {plan} subscription is confirmed</Preview>
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
              Payment Confirmation
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
              Thank you for subscribing! Your payment has been confirmed and
              your plan is now active.
            </Text>

            <Section
              style={{
                backgroundColor: colors.bg,
                borderRadius: "12px",
                padding: "24px",
                margin: "0 0 28px",
              }}
            >
              <table
                style={{ width: "100%", borderCollapse: "collapse" as const }}
              >
                <tr>
                  <td
                    style={{
                      fontSize: "13px",
                      color: colors.gray,
                      padding: "6px 0",
                      textAlign: "left" as const,
                    }}
                  >
                    Plan
                  </td>
                  <td
                    style={{
                      fontSize: "15px",
                      color: colors.darkText,
                      fontWeight: 600,
                      padding: "6px 0",
                      textAlign: "right" as const,
                    }}
                  >
                    {plan}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontSize: "13px",
                      color: colors.gray,
                      padding: "6px 0",
                      textAlign: "left" as const,
                    }}
                  >
                    Amount
                  </td>
                  <td
                    style={{
                      fontSize: "15px",
                      color: colors.primary,
                      fontWeight: 700,
                      padding: "6px 0",
                      textAlign: "right" as const,
                    }}
                  >
                    {amount}
                  </td>
                </tr>
              </table>
            </Section>

            <Heading
              as="h2"
              style={{
                fontSize: "16px",
                color: colors.darkText,
                fontFamily,
                fontWeight: 600,
                margin: "0 0 12px",
                textAlign: "left" as const,
              }}
            >
              What you now have access to:
            </Heading>

            <Section style={{ textAlign: "left" as const, margin: "0 0 28px" }}>
              {[
                "Unlimited AI wellness insights",
                "Advanced cycle analytics",
                "Personalized meal & movement plans",
                "Priority partner sharing features",
              ].map((feature, i) => (
                <Text
                  key={i}
                  style={{
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: colors.gray,
                    margin: "0 0 6px",
                    paddingLeft: "8px",
                  }}
                >
                  &bull; {feature}
                </Text>
              ))}
            </Section>

            <Button
              href="https://mylunarphase.com/dashboard"
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
              Start Exploring
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
