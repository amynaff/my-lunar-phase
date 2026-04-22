import type { Metadata } from "next";
import Link from "next/link";
import { Moon, Globe, Smartphone } from "lucide-react";

export const metadata: Metadata = {
  title: "Download MyLunarPhase | Women's Cycle & Wellness App",
  description:
    "Download MyLunarPhase — the women's wellness app for cycle tracking, hormone health, and personalized daily guidance. Available as a web app now. iOS and Android coming soon.",
  alternates: {
    canonical: "/download",
  },
  openGraph: {
    title: "Download MyLunarPhase | Women's Wellness App",
    description:
      "Get personalized nutrition, movement, and self-care guidance for every phase of your cycle. Start your 7-day free trial today.",
    url: "https://mylunarphase.com/download",
  },
};

export default function DownloadPage() {
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MyLunarPhase",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, iOS (coming soon), Android (coming soon)",
    url: "https://mylunarphase.com",
    description:
      "Women's wellness app for menstrual cycle tracking, hormone health, perimenopause support, and personalized daily guidance.",
    offers: {
      "@type": "Offer",
      price: "6.99",
      priceCurrency: "USD",
      description: "Monthly subscription — 7-day free trial included",
    },
    screenshot: "https://mylunarphase.com/opengraph-image",
    author: {
      "@type": "Organization",
      name: "MyLunarPhase",
      url: "https://mylunarphase.com",
    },
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />

      {/* Header */}
      <header className="flex items-center gap-2 px-6 py-4 border-b border-border-light">
        <Link href="/" className="flex items-center gap-2">
          <Moon className="h-6 w-6 text-accent-purple" />
          <span className="font-cormorant text-xl font-semibold text-text-primary">MyLunarPhase</span>
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-accent-purple/10 text-accent-purple px-4 py-1.5 rounded-full font-quicksand text-sm font-semibold mb-6">
          <Smartphone className="w-4 h-4" />
          Get the App
        </div>
        <h1 className="font-cormorant text-[clamp(36px,5vw,64px)] font-normal text-text-primary leading-tight mb-6">
          Your cycle.<br />
          <em className="italic text-accent-purple">Your wisdom.</em><br />
          In your pocket.
        </h1>
        <p className="font-quicksand text-text-secondary text-lg max-w-2xl mx-auto mb-12">
          MyLunarPhase gives you personalized daily guidance for nutrition, movement, and self-care — tuned to your hormonal phase every single day.
        </p>

        {/* Download Options */}
        <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto mb-16">
          {/* Web App */}
          <Link
            href="/sign-up"
            className="group flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink text-white shadow-lg shadow-accent-purple/30 hover:-translate-y-1 transition-transform"
          >
            <Globe className="w-10 h-10" />
            <div>
              <p className="font-quicksand text-xs opacity-80 mb-1">Use now on any device</p>
              <p className="font-quicksand font-bold text-lg">Web App</p>
            </div>
            <span className="font-quicksand text-xs bg-white/20 px-3 py-1 rounded-full">
              Start 60-Day Free Trial →
            </span>
          </Link>

          {/* App Store */}
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/70 border border-border-light opacity-60">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-text-primary">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div>
              <p className="font-quicksand text-xs text-text-muted mb-1">Coming soon</p>
              <p className="font-quicksand font-bold text-lg text-text-primary">App Store</p>
              <p className="font-quicksand text-xs text-text-muted">iOS</p>
            </div>
          </div>

          {/* Google Play */}
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/70 border border-border-light opacity-60">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-text-primary">
              <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
            </svg>
            <div>
              <p className="font-quicksand text-xs text-text-muted mb-1">Coming soon</p>
              <p className="font-quicksand font-bold text-lg text-text-primary">Google Play</p>
              <p className="font-quicksand text-xs text-text-muted">Android</p>
            </div>
          </div>
        </div>

        <p className="font-quicksand text-sm text-text-muted">
          The web app works beautifully on all devices — including iPhone and Android. Add it to your home screen for an app-like experience.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="font-cormorant text-[clamp(28px,4vw,44px)] font-normal text-text-primary text-center mb-10">
          Everything you need in one place
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { emoji: "🌙", title: "Cycle Phase Tracking", desc: "Know exactly where you are in your cycle and what that means for your body today." },
            { emoji: "🥗", title: "Phase Nutrition", desc: "Daily food guidance that shifts with your hormones — iron-rich at menstruation, anti-inflammatory at ovulation." },
            { emoji: "💪", title: "Smart Movement", desc: "Know when to push hard and when to restore. Exercise guidance matched to your energy." },
            { emoji: "🌸", title: "Self-Care & Affirmations", desc: "Phase-specific activities, journaling prompts, and affirmations for where you actually are." },
            { emoji: "🌕", title: "Moon Phase Wisdom", desc: "Track your cycle alongside the lunar cycle and tap into ancient rhythmic wisdom." },
            { emoji: "🤖", title: "LunaAI Coach", desc: "Ask anything about your cycle, symptoms, or wellness — get contextually aware, personalized answers." },
            { emoji: "👫", title: "Partner Sharing", desc: "Invite a partner to understand your cycle. Shared insight builds empathy and connection." },
            { emoji: "🔬", title: "Labs Guide", desc: "Understand your bloodwork in plain language — what to ask for and what results mean." },
            { emoji: "🌗", title: "Perimenopause Support", desc: "Built for all life stages — including the beautiful, complex transition of perimenopause." },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 rounded-xl bg-white/60 border border-border-light">
              <span className="text-2xl flex-shrink-0">{emoji}</span>
              <div>
                <p className="font-quicksand font-semibold text-sm text-text-primary mb-1">{title}</p>
                <p className="font-quicksand text-xs text-text-secondary leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-xl mx-auto px-6 pb-20 text-center">
        <div className="bg-gradient-to-br from-accent-purple/10 to-accent-rose/10 rounded-3xl p-10 border border-border-light">
          <p className="font-cormorant text-3xl text-text-primary mb-2">Simple pricing</p>
          <p className="font-quicksand text-text-secondary mb-6">
            <strong className="text-accent-purple text-xl">$6.99/month</strong> after your 7-day free trial.
            No credit card required to start.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex px-10 py-4 rounded-full bg-gradient-to-r from-accent-purple to-accent-rose text-white font-quicksand font-bold text-lg hover:-translate-y-0.5 transition-transform shadow-lg shadow-accent-purple/30"
          >
            Start 60-Day Free Trial
          </Link>
          <p className="font-quicksand text-xs text-text-muted mt-4">
            Cancel anytime. Your data is always yours.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Moon className="h-5 w-5 text-accent-purple" />
          <span className="font-cormorant text-lg font-semibold text-text-primary">MyLunarPhase</span>
        </div>
        <div className="flex items-center justify-center gap-6 font-quicksand text-sm text-text-muted">
          <Link href="/" className="hover:text-text-primary">Home</Link>
          <Link href="/blog" className="hover:text-text-primary">Blog</Link>
          <Link href="/privacy" className="hover:text-text-primary">Privacy</Link>
          <Link href="/terms" className="hover:text-text-primary">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
