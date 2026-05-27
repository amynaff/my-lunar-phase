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
        <p className="text-sm text-text-muted font-quicksand mb-10">Last updated: April 4, 2026</p>

        <div className="font-quicksand text-text-secondary space-y-8 text-[15px] leading-relaxed">

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">A Note From Our Founder</h2>
            <p>
              Hi, I&apos;m the solo developer behind MyLunarPhase. I built this app because I&apos;m passionate about women&apos;s health and believe every woman deserves tools that honor her body&apos;s natural rhythms.
            </p>
            <p className="mt-3 font-semibold text-accent-purple">
              I want to be crystal clear: I am not here to collect your personal information. Your health data is yours. Period.
            </p>
            <p className="mt-3">
              MyLunarPhase will never sell, share, or profit from your personal data. I built this app to help, not to harvest. This privacy policy explains exactly what data exists, why, and what happens with it.
            </p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">What We Store &amp; Why</h2>
            <p className="mb-3">We only store what is necessary for the app to work for you:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Email &amp; password</strong> &mdash; So you can sign in to your account. Passwords are hashed with bcrypt and we cannot see them.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Cycle &amp; period data</strong> &mdash; Your period dates, cycle length, and life stage are <strong>encrypted with AES-256-GCM</strong> before being stored. Even if someone accessed our database, they could not read your cycle data.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Mood &amp; journal entries</strong> &mdash; Private to you. Journal notes are <strong>encrypted at the application level</strong> before storage. No one can see them, including us.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Connected device data</strong> &mdash; If you connect health devices (like Withings, Oura, or Fitbit), we store the health measurements they send (temperature, sleep, heart rate). This data is encrypted and only used to provide you with wellness insights.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Community posts</strong> &mdash; Fully anonymous. They cannot be traced back to your account.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Partner sharing</strong> &mdash; Only happens if you explicitly opt in. You choose what to share and can revoke access anytime.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">What We Do NOT Do</h2>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> sell your data. Ever.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> share your data with advertisers or data brokers.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> track you across other websites or apps.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> use your health data for marketing purposes.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do <strong>not</strong> run analytics or ad tracking on this app.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Third-Party Services We Use</h2>
            <p className="mb-3">
              To make the app work, we use a small number of trusted services. Here&apos;s exactly what each one does and what data it touches:
            </p>
            <div className="space-y-4">
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Supabase (Database)</h3>
                <p className="text-sm">Stores your account and wellness data. Hosted in the US (Oregon). Data is encrypted at rest and in transit. Supabase does not access or use your data.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Google Sign-In (Authentication)</h3>
                <p className="text-sm">If you choose to sign in with Google, we receive only your name and email. We do not access your Google contacts, calendar, or any other Google data.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Stripe (Payments)</h3>
                <p className="text-sm">Handles subscription payments. We never see or store your credit card number. Stripe is PCI-compliant and processes payments securely. We only receive confirmation that a payment was made.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Grok AI (Luna AI Chat)</h3>
                <p className="text-sm">Powers the Luna AI wellness chat. When you use Luna AI, your message is sent to the AI to generate a response. Conversations are not used to train AI models. Your chat history is stored in your account so you can revisit it.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Resend (Email)</h3>
                <p className="text-sm">Sends transactional emails like password resets and subscription confirmations. Your email address is shared with Resend solely for delivery. They do not use it for marketing.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Upstash (Rate Limiting)</h3>
                <p className="text-sm">Prevents abuse by limiting how many requests can be made. It only processes anonymous request counts &mdash; no personal data is sent to Upstash.</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border-light p-4">
                <h3 className="font-semibold text-text-primary mb-1">Netlify (Hosting)</h3>
                <p className="text-sm">Hosts the web application. Netlify may collect basic server logs (IP addresses, page visits) as part of standard web hosting. We do not add any additional tracking.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Data Security</h2>
            <p>Your health data deserves the highest level of protection. We go beyond industry standards:</p>
            <ul className="space-y-2 ml-4 mt-3">
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Application-level encryption (AES-256-GCM)</strong> &mdash; Your sensitive health data (period dates, cycle logs, mood notes, health device measurements) is encrypted <em>before</em> it reaches the database. Even if the database were breached, your data would be unreadable without the encryption key.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Unique encryption per value</strong> &mdash; Each piece of data is encrypted with its own random initialization vector, so identical information produces completely different encrypted output.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Encrypted in transit</strong> &mdash; All data between your device and our servers is protected with HTTPS/TLS.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Encrypted at rest</strong> &mdash; Our database provider (Supabase) encrypts all stored data at the infrastructure level, in addition to our application-level encryption.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Passwords are hashed</strong> &mdash; Using bcrypt with salt rounds. We cannot view or recover your password.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Payment security</strong> &mdash; Credit card information is handled entirely by Stripe (PCI-compliant) and never touches our servers.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Cross-device sync</strong> &mdash; Your cycle data syncs securely across devices so you never lose your data. All synced data is encrypted before transmission and storage.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Connected Health Devices</h2>
            <p>When you connect a health device (such as Withings, Oura Ring, Fitbit, or others):</p>
            <ul className="space-y-2 ml-4 mt-3">
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We use OAuth 2.0 to securely connect &mdash; we never see your device account password.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We only request the minimum data needed (temperature, sleep, heart rate) &mdash; never contacts, location, or other unrelated data.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>Health measurements are encrypted with AES-256-GCM before storage.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>You can disconnect any device at any time from Settings, which permanently deletes all associated data.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span>We do not share your device data with any third party.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Your Rights &amp; Control</h2>
            <p>You are always in control of your data:</p>
            <ul className="space-y-2 ml-4 mt-3">
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Delete your account</strong> &mdash; Anytime from Settings. This permanently removes all your data.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Export your data</strong> &mdash; Download your information before deleting if you wish.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Revoke partner sharing</strong> &mdash; Disconnect your partner at any time from Partner settings.</span></li>
              <li className="flex gap-2"><span className="text-accent-purple flex-shrink-0">-</span><span><strong>Cancel subscription</strong> &mdash; Cancel anytime. Your data stays until you choose to delete it.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Cookies</h2>
            <p>We only use essential cookies required for authentication (keeping you signed in). We do not use advertising cookies, tracking cookies, or any third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Changes to This Policy</h2>
            <p>If we ever update this policy, we&apos;ll notify you within the app. We will never quietly change how we handle your data.</p>
          </section>

          <section>
            <h2 className="font-cormorant text-2xl text-text-primary mb-3">Questions?</h2>
            <p>
              I believe in transparency. If you have any questions about your privacy or how your data is handled, please reach out at{" "}
              <a href="mailto:privacy@mylunarphase.com" className="text-accent-purple hover:underline">privacy@mylunarphase.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
