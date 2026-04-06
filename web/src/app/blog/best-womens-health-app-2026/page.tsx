import type { Metadata } from "next";
import Link from "next/link";
import { Moon, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Best Women's Health Apps in 2026: A Comprehensive Comparison | MyLunarPhase",
  description:
    "Flo, Clue, Natural Cycles, MyLunarPhase — how do the top women's health apps compare in 2026? We compare features, privacy, pricing, and who each app is best for.",
  keywords: [
    "best women's health app 2026",
    "best period tracking app 2026",
    "Flo vs Clue",
    "women's health app comparison",
    "period tracker comparison",
    "best cycle tracking app",
    "MyLunarPhase review",
  ],
  alternates: {
    canonical: "/blog/best-womens-health-app-2026",
  },
  openGraph: {
    title: "Best Women's Health Apps in 2026: A Comparison | MyLunarPhase",
    description:
      "A detailed comparison of the top women's health and period tracking apps in 2026 — features, privacy, pricing, and who each app is best for.",
    url: "https://mylunarphase.com/blog/best-womens-health-app-2026",
    type: "article",
  },
};

const apps = [
  {
    name: "MyLunarPhase",
    emoji: "🌙",
    tagline: "Whole-cycle wellness for every stage of womanhood",
    price: "$6.99/mo (60-day free trial)",
    bestFor: "Women who want personalized daily guidance beyond just period prediction",
    pros: [
      "Cycle phase-aware daily guidance (nutrition, movement, self-care)",
      "Built for all life stages including perimenopause and menopause",
      "Moon phase integration",
      "Partner sharing",
      "AI health coaching (LunaAI)",
      "Labs guide for understanding your bloodwork",
      "Strong privacy — no data selling, ever",
    ],
    cons: [
      "Newer app — smaller community than established players",
      "No dedicated fertility mode (NFP/FAM)",
    ],
    highlight: true,
  },
  {
    name: "Flo",
    emoji: "🌸",
    tagline: "The world's most downloaded period tracker",
    price: "Free / $12.99/mo premium",
    bestFor: "General period tracking and prediction with a large community",
    pros: [
      "Huge user base and community features",
      "Well-designed symptom logging",
      "Pregnancy and fertility tracking",
      "Health insights based on logged data",
    ],
    cons: [
      "Privacy controversies (FTC settlement in 2021 for sharing health data)",
      "Premium required for most meaningful features",
      "Limited support for perimenopause / menopause",
      "Generic advice not adapted to individual phase",
    ],
    highlight: false,
  },
  {
    name: "Clue",
    emoji: "🔵",
    tagline: "Science-based period and cycle tracker",
    price: "Free / $9.99/mo premium",
    bestFor: "Data-driven women who want scientific approach without wellness fluff",
    pros: [
      "Clean, science-backed interface",
      "Strong privacy record",
      "Good symptom and mood tracking",
      "LGBTQ+ inclusive design",
    ],
    cons: [
      "No personalized guidance or coaching",
      "Limited wellness content",
      "No perimenopause-specific features",
      "No moon phase integration",
    ],
    highlight: false,
  },
  {
    name: "Natural Cycles",
    emoji: "🌡️",
    tagline: "FDA-cleared birth control app",
    price: "$12.99/mo or $79.99/yr",
    bestFor: "Women using fertility awareness method for contraception",
    pros: [
      "FDA-cleared contraceptive app",
      "Basal body temperature tracking",
      "Scientifically validated algorithm",
      "Good for TTC or birth control",
    ],
    cons: [
      "Requires daily temperature measurement",
      "Expensive relative to general wellness value",
      "Primarily fertility-focused, not holistic wellness",
      "No cycle phase guidance or self-care content",
    ],
    highlight: false,
  },
];

export default function BestWomensHealthApp2026Post() {
  const publishDate = "2026-03-05";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best Women's Health Apps in 2026: A Comprehensive Comparison",
    datePublished: publishDate,
    dateModified: publishDate,
    author: { "@type": "Organization", name: "MyLunarPhase" },
    publisher: { "@type": "Organization", name: "MyLunarPhase", url: "https://mylunarphase.com" },
    description:
      "A detailed comparison of the top women's health apps in 2026 — Flo, Clue, Natural Cycles, and MyLunarPhase.",
    mainEntityOfPage: "https://mylunarphase.com/blog/best-womens-health-app-2026",
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
          <span className="font-quicksand text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-0.5 rounded-full">
            Comparisons
          </span>
          <span className="font-quicksand text-xs text-text-muted">March 5, 2026 · 9 min read</span>
        </div>

        <h1 className="font-cormorant text-[clamp(32px,4.5vw,52px)] font-normal text-text-primary leading-tight mb-6">
          Best Women&apos;s Health Apps in 2026: A Comprehensive Comparison
        </h1>

        <p className="font-quicksand text-lg text-text-secondary leading-relaxed mb-4">
          The women's health app market has exploded in recent years — and with it, the number of apps competing for space on your phone. Flo. Clue. Natural Cycles. MyLunarPhase. Eve. Ovia. The choice can feel overwhelming.
        </p>
        <p className="font-quicksand text-text-secondary leading-relaxed mb-10">
          We've done a detailed comparison of the top apps in 2026 so you can make an informed decision. We'll be transparent: this article is written by MyLunarPhase, so take our self-assessment with a grain of salt — but we've tried to give each app a fair, honest evaluation.
        </p>

        <hr className="border-border-light mb-10" />

        <section className="mb-10">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">How We Evaluated Each App</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">We scored each app on five criteria:</p>
          <ol className="font-quicksand text-text-secondary text-sm space-y-1 pl-5 list-decimal">
            <li><strong className="text-text-primary">Cycle tracking depth</strong> — Does it go beyond period dates?</li>
            <li><strong className="text-text-primary">Personalized guidance</strong> — Does it adapt to your specific phase and stage?</li>
            <li><strong className="text-text-primary">Life stage support</strong> — Does it work for perimenopause and menopause?</li>
            <li><strong className="text-text-primary">Privacy</strong> — Is your health data protected?</li>
            <li><strong className="text-text-primary">Value for money</strong> — Is the premium tier worth it?</li>
          </ol>
        </section>

        {/* App Cards */}
        <section className="mb-12 space-y-6">
          {apps.map((app) => (
            <div key={app.name} className={`rounded-2xl border p-6 ${app.highlight ? "border-accent-purple/40 bg-accent-purple/5 ring-1 ring-accent-purple/20" : "border-border-light bg-white/60"}`}>
              {app.highlight && (
                <div className="inline-block mb-3 font-quicksand text-xs font-bold text-accent-purple bg-accent-purple/10 px-3 py-1 rounded-full uppercase tracking-wide">
                  ★ Our App
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{app.emoji}</span>
                <div>
                  <h3 className="font-cormorant text-2xl text-text-primary">{app.name}</h3>
                  <p className="font-quicksand text-xs text-text-muted">{app.tagline}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-quicksand text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Pros</p>
                  <ul className="space-y-1">
                    {app.pros.map((p) => (
                      <li key={p} className="flex gap-2 font-quicksand text-xs text-text-secondary">
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-quicksand text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2">Cons</p>
                  <ul className="space-y-1">
                    {app.cons.map((c) => (
                      <li key={c} className="flex gap-2 font-quicksand text-xs text-text-secondary">
                        <span className="text-rose-400 flex-shrink-0">–</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-border-light">
                <div>
                  <p className="font-quicksand text-xs text-text-muted">Price</p>
                  <p className="font-quicksand text-sm font-semibold text-text-primary">{app.price}</p>
                </div>
                <div>
                  <p className="font-quicksand text-xs text-text-muted">Best for</p>
                  <p className="font-quicksand text-sm text-text-secondary">{app.bestFor}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">Our Recommendation</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            The right app depends entirely on your goals:
          </p>
          <ul className="font-quicksand text-text-secondary text-sm space-y-2 pl-5 list-disc mb-4">
            <li><strong className="text-text-primary">For comprehensive cycle wellness</strong> — MyLunarPhase (we're biased, but we built it because nothing else did this)</li>
            <li><strong className="text-text-primary">For data-forward period tracking</strong> — Clue (solid science, good privacy)</li>
            <li><strong className="text-text-primary">For community + general period tracking</strong> — Flo (just read their privacy policy carefully)</li>
            <li><strong className="text-text-primary">For fertility awareness method / birth control</strong> — Natural Cycles (genuinely FDA-cleared)</li>
          </ul>
          <p className="font-quicksand text-text-secondary leading-relaxed">
            The most important thing? Actually use it. The best app is the one you open every day. Try MyLunarPhase free for 60 days — no credit card required for the trial — and see if it's the right fit.
          </p>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-accent-purple/10 to-accent-rose/10 rounded-3xl p-8 border border-border-light text-center">
          <p className="font-cormorant text-2xl text-text-primary mb-2">
            Try MyLunarPhase free for 60 days
          </p>
          <p className="font-quicksand text-sm text-text-secondary mb-5">
            Personalized daily guidance for every phase. No credit card required.
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
