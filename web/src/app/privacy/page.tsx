import { Moon } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="flex items-center gap-2 px-6 py-4 border-b border-border-light">
        <Link href="/" className="flex items-center gap-2">
          <Moon className="h-6 w-6 text-accent-purple" />
          <span className="font-cormorant text-xl font-semibold text-text-primary">MyLunarPhase</span>
        </Link>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-cormorant text-4xl font-semibold text-text-primary mb-4">Privacy Policy</h1>
        <p className="text-sm text-text-muted font-quicksand mb-10">Last updated: July 1, 2026</p>

        <div className="font-quicksand text-text-secondary space-y-8 text-[15px] leading-relaxed">

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">A Note From Our Founder</h2>
            <p>
              Hi, I&apos;m the solo developer behind MyLunarPhase. I built this app because I&apos;m passionate about women&apos;s health and believe every woman deserves tools that honor her body&apos;s natural rhythms.
            </p>
            <p className="mt-3 font-semibold text-accent-purple">
              I only collect the information the app needs to work for you &mdash; never to sell it, and never to profit from it. Your health data is yours.
            </p>
            <p className="mt-3">
              This policy explains exactly what data we collect, why, who it is shared with, and the control you have over it. It describes the MyLunarPhase iOS app.
            </p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">What We Collect &amp; Why</h2>
            <p className="mb-3">We only collect what is necessary for the app to work for you:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Account details</strong> &mdash; Your name and email address, so you can create an account and sign in. If you use Sign in with Apple, we receive only your name and email.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Cycle &amp; period data</strong> &mdash; Your period dates, cycle length, symptoms, and life stage. This is kept on your device to power the app. If you use Partner Sharing, the cycle information you choose to share is stored on our servers so your partner can see it.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Mood &amp; journal entries</strong> &mdash; Saved to your account so they sync to your sign-in and power your personalized insights.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Subscription status</strong> &mdash; Whether you have an active subscription or free trial, so we can unlock premium features.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Notification token</strong> &mdash; If you enable reminders, a device token so we can send the notifications you asked for.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Community &amp; partner features</strong> &mdash; If you post in the community or connect a partner, the content you share is stored so it can be shown to the people you shared it with. Partner sharing only happens if you explicitly opt in, and you can revoke access anytime.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">AI-Powered Features</h2>
            <p>
              When you use Luna AI or request journal insights, the entries you submit are sent to our AI provider, <strong>Anthropic (Claude)</strong>, to generate a response. This content is processed to give you a reply and is <strong>not used to train AI models</strong>. Your chat history is stored in your account so you can revisit it.
            </p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">What We Do NOT Do</h2>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> sell your data. Ever.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> share your data with advertisers or data brokers.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> track you across other websites or apps.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> use your health data for marketing purposes.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> run advertising or third-party analytics tracking in the app.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Third-Party Services We Use</h2>
            <p className="mb-3">
              To make the app work, we rely on a small number of trusted services. Here&apos;s exactly what each one does and what data it touches:
            </p>
            <div className="space-y-4">
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Apple (Sign In &amp; Payments)</h3>
                <p className="text-sm">If you use Sign in with Apple, we receive only your name and email. Subscriptions are purchased and billed through the Apple App Store &mdash; we never see or store your payment card details.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">RevenueCat (Subscriptions)</h3>
                <p className="text-sm">Helps us manage and verify your App Store subscription status so we can unlock premium features. It receives your subscription and purchase information, not your health data.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Anthropic (Luna AI)</h3>
                <p className="text-sm">Powers Luna AI chat and journal insights. When you use these features, your message is sent to Anthropic (Claude) to generate a response. Conversations are not used to train AI models.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Railway (Hosting &amp; Database)</h3>
                <p className="text-sm">Hosts our backend and stores your account and wellness data on secure servers in the United States. Data is encrypted in transit and at rest at the infrastructure level.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Resend (Email)</h3>
                <p className="text-sm">Sends transactional emails like password resets. Your email address is shared with Resend solely for delivery. They do not use it for marketing.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Data Security</h2>
            <p>Your health data deserves strong protection. We use the following safeguards:</p>
            <ul className="space-y-2 ml-4 mt-3">
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Encrypted in transit</strong> &mdash; All data between your device and our servers is protected with HTTPS/TLS.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Encrypted at rest</strong> &mdash; Our hosting provider encrypts stored data at the infrastructure level.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Passwords are securely hashed</strong> &mdash; We store only a one-way hash of your password and cannot view or recover it.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Payment security</strong> &mdash; All purchases are handled by the Apple App Store; payment card details never touch our servers.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>On-device data</strong> &mdash; Much of your day-to-day cycle data stays on your device and is only sent to our servers for features you use, such as partner sharing or AI insights.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Your Rights &amp; Control</h2>
            <p>You are always in control of your data:</p>
            <ul className="space-y-2 ml-4 mt-3">
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Delete your account</strong> &mdash; Anytime from Settings &rarr; Delete Account. This permanently removes your personal data from our servers within 30 days.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Request a copy of your data</strong> &mdash; Email us and we&apos;ll provide the information associated with your account.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Revoke partner sharing</strong> &mdash; Disconnect your partner at any time from Partner settings.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Cancel subscription</strong> &mdash; Cancel anytime in your Apple Account subscription settings. Your data stays until you choose to delete it.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Children&apos;s Privacy</h2>
            <p>MyLunarPhase is not intended for anyone under 13, and we do not knowingly collect personal data from children under 13. If you believe a child has provided us information, please contact us and we will delete it.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Changes to This Policy</h2>
            <p>If we ever update this policy, we&apos;ll post the changes here with a new date. We will never quietly change how we handle your data.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Questions?</h2>
            <p>
              I believe in transparency. If you have any questions about your privacy or how your data is handled, please reach out at{" "}
              <a href="mailto:support-mylunarphaseapp@proton.me" className="text-accent-purple hover:underline">support-mylunarphaseapp@proton.me</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
