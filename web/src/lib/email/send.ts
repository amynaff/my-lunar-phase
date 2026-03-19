import { resend } from "@/lib/resend";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.EMAIL_FROM || "MyLunarPhase <hello@mylunarphase.com>";
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email");
  }
  return data;
}
