import type { Metadata } from "next";
import Link from "next/link";
import { Moon, Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Choose a Period Tracker App That Actually Works for You | MyLunarPhase",
  description:
    "Not all period trackers are equal. Learn what features matter most — cycle phase guidance, symptom tracking, privacy, hormone awareness — and how to find the right app for your needs.",
  keywords: [
    "period tracker app",
    "best period tracking app",
    "menstrual cycle app",
    "period tracker",
    "cycle tracking app",
    "hormone tracking app",
    "women's health app",
  ],
  alternates: {
    canonical: "/blog/period-tracker-app",
  },
  openGraph: {
    title: "How to Choose a Period Tracker App That Actually Works | MyLunarPhase",
    description:
      "A practical guide to choosing a period tracker app — what features matter, what to avoid, and how to find the right fit for your stage of life.",
    url: "https://mylunarphase.com/blog/period-tracker-app",
    type: "article",
  },
};

const features = [
  {
    name: "Cycle phase tracking (not just period dates)",
    why: "Knowing you're in your luteal phase explains why you're craving carbs and want to cancel plans. Without phase-awareness, you're only getting a fraction of the value.",
    important: true,
  },
  {
    name: "Symptom + mood logging",
    why: "Patterns emerge over time. Tracking mood, energy, sleep, and physical symptoms lets you connect the dots between how you feel and where you are in your cycle.",
    important: true,
  },
  {
    name: "Personalized daily guidance",
    why: "A great app doesn't just show you where you are — it tells you what to do with that information. Nutrition, movement, and self-care tailored to your phase.",
    important: true,
  },
  {
    name: "Support for perimenopause and menopause",
    why: "Most period apps are built for 20-somethings with textbook cycles. If you're in your 40s or navigating irregular cycles, you need an app that actually understands your life stage.",
    important: true,
  },
  {
    name: "Strong privacy policy",
    why: "Your menstrual data is sensitive health information. Many apps share or sell user data. Always read the privacy policy before trusting any health app.",
    important: true,
  },
  {
    name: "Fertility predictions (if relevant)",
    why: "Useful if you're trying to conceive or using fertility awareness methods. Not necessary for general wellness tracking.",
    important: false,
  },
  {
    name: "Partner sharing",
    why: "Some apps let you share cycle data with a partner, which can improve understanding and communication in relationships.",
    important: false,
  },
  {
    name: "AI health coaching",
    why: "The ability to ask questions about your cycle, symptoms, or health — and get contextually aware, personalized answers.",
    important: false,
  },
];

export default function PeriodTrackerAppPost() {
  const publishDate = "2026-03-20";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Choose a Period Tracker App That Actually Works for You",
    datePublished: publishDate,
    dateModified: publishDate,
    author: { "@type": "Organization", name: "MyLunarPhase" },
    publisher: { "@type": "Organization", name: "MyLunarPhase", url: "https://mylunarphase.com" },
    description:
      "A practical guide to the features that matter when choosing a period tracker app — from cycle phase guidance to privacy.",
    mainEntityOfPage: "https://mylunarphase.com/blog/period-tracker-app",
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <header className="flex items-center gap-2 px-6 py-4 border-b border-border-light">
        <Link href="/" className="flex items-center gap-2">
          <Moon className="h-6 w-6 text-accent-purple" />
          <span className="font-cormorant text-xl font-semibold text-text-primary">MyLunarPhase</span>
        </Link>
        <span className="text-text-muted mx-2">/</span>
        <Link href="/blog" className="font-quicksand text-sm text-text-secondary hover:text-text-primary">Blog</Link>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-quicksand text-xs font-semibold text-text-primary bg-gray-100 px-2.5 py-0.5 rounded-full">
            App Guide
          </span>
          <span className="font-quicksand text-xs text-text-muted">March 20, 2026 · 6 min read</span>
        </div>

        <h1 className="font-cormorant text-[clamp(32px,4.5vw,52px)] font-normal text-text-primary leading-tight mb-6">
          How to Choose a Period Tracker App That Actually Works for You
        </h1>

        <p className="font-quicksand text-lg text-text-secondary leading-relaxed mb-10">
          There are hundreds of period tracking apps in the App Store and Google Play. Most of them do the bare minimum: you tap a button when your period starts, and the app predicts when the next one comes. That's it. That's barely scratching the surface of what period tracking can do for your life.
        </p>

        <hr className="border-border-light mb-10" />

        <section className="mb-10">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">Period Tracking vs. Cycle Tracking: What's the Difference?</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            <strong className="text-text-primary">Period tracking</strong> is logging when your period starts and ends. Useful, but limited.
          </p>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            <strong className="text-text-primary">Cycle tracking</strong> is understanding your entire monthly rhythm — all four phases, the hormones that drive them, and how they affect every aspect of your life including energy, mood, metabolism, cognitive performance, and emotional needs.
          </p>
          <p className="font-quicksand text-text-secondary leading-relaxed">
            A great cycle tracking app doesn't just tell you when your next period is coming. It helps you understand <em>why</em> you feel the way you feel today — and what you can do about it.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-6">Features That Actually Matter</h2>
          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.name} className={`flex gap-4 p-5 rounded-xl border ${f.important ? "bg-accent-purple/5 border-accent-purple/20" : "bg-white/50 border-border-light"}`}>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${f.important ? "bg-accent-purple text-white" : "bg-gray-200 text-gray-500"}`}>
                  {f.important ? <Check className="w-3.5 h-3.5" /> : <span className="text-xs">+</span>}
                </div>
                <div>
                  <p className={`font-quicksand font-semibold text-sm mb-1 ${f.important ? "text-text-primary" : "text-text-secondary"}`}>
                    {f.name}
                    {f.important && <span className="ml-2 text-xs text-accent-purple font-normal">(essential)</span>}
                  </p>
                  <p className="font-quicksand text-sm text-text-muted leading-relaxed">{f.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">Red Flags to Watch For</h2>
          <div className="space-y-3">
            {[
              { flag: "Vague or short privacy policy", detail: "If the app doesn't clearly state what happens with your health data, assume the worst." },
              { flag: "No perimenopause or menopause support", detail: "If the app assumes you have a 28-day cycle and nothing more, it wasn't built for most women's actual lives." },
              { flag: "Generic, one-size-fits-all advice", detail: "Telling everyone to 'eat leafy greens' on day 3 isn't personalization. Look for apps that adapt to your individual cycle." },
              { flag: "Aggressive fertility-focused design", detail: "Many apps are primarily designed for TTC (trying to conceive). If that's not your goal, the UX may feel intrusive or irrelevant." },
            ].map(({ flag, detail }) => (
              <div key={flag} className="flex gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200">
                <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-quicksand font-semibold text-sm text-rose-900">{flag}</p>
                  <p className="font-quicksand text-xs text-rose-700 leading-relaxed mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">A Note on Privacy</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            Menstrual data is some of the most sensitive health data that exists. In a changing legal and social landscape, it's more important than ever to know where your data goes.
          </p>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            Before trusting any period app, ask:
          </p>
          <ul className="font-quicksand text-text-secondary text-sm space-y-2 pl-5 list-disc mb-4">
            <li>Is data stored locally on your device, or in the cloud?</li>
            <li>Is data encrypted at rest and in transit?</li>
            <li>Does the company sell or share data with third parties?</li>
            <li>Can you delete your data completely?</li>
          </ul>
          <p className="font-quicksand text-text-secondary leading-relaxed">
            At MyLunarPhase, we're built with a privacy-first philosophy. We don't sell your data — ever. Read our{" "}
            <Link href="/privacy" className="text-accent-purple hover:underline">privacy policy</Link> for the full details.
          </p>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-accent-purple/10 to-accent-rose/10 rounded-3xl p-8 border border-border-light text-center">
          <p className="font-cormorant text-2xl text-text-primary mb-2">
            Try MyLunarPhase free for 60 days
          </p>
          <p className="font-quicksand text-sm text-text-secondary mb-5">
            Cycle phase guidance, symptom tracking, personalized nutrition, movement, and self-care — for every woman at every stage.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex px-8 py-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-rose text-white font-quicksand font-semibold hover:-translate-y-0.5 transition-transform"
          >
            Start Free →
          </Link>
        </div>

        <div className="mt-10">
          <Link href="/blog" className="font-quicksand text-sm text-accent-purple hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
