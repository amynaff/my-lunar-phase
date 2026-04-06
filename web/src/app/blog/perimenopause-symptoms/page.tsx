import type { Metadata } from "next";
import Link from "next/link";
import { Moon } from "lucide-react";

export const metadata: Metadata = {
  title: "Perimenopause Symptoms: What's Normal, What Helps, and What to Track | MyLunarPhase",
  description:
    "Hot flashes, mood swings, irregular periods, brain fog — perimenopause affects every woman differently. Learn the common symptoms, natural relief strategies, and how tracking can help you navigate this transition.",
  keywords: [
    "perimenopause symptoms",
    "perimenopause signs",
    "perimenopause age",
    "irregular periods perimenopause",
    "hot flashes natural relief",
    "perimenopause brain fog",
    "perimenopause mood swings",
    "perimenopause tracker",
  ],
  alternates: {
    canonical: "/blog/perimenopause-symptoms",
  },
  openGraph: {
    title: "Perimenopause Symptoms: What's Normal and What Helps | MyLunarPhase",
    description:
      "A comprehensive guide to perimenopause symptoms — from hot flashes to brain fog — plus evidence-based strategies for relief and the role of symptom tracking.",
    url: "https://mylunarphase.com/blog/perimenopause-symptoms",
    type: "article",
  },
};

const symptoms = [
  {
    emoji: "🔥",
    name: "Hot Flashes & Night Sweats",
    prevalence: "Affects ~75% of women",
    description:
      "Sudden waves of heat, often intense, lasting 1–5 minutes. Night sweats are the nocturnal version and can severely disrupt sleep.",
    naturalRelief: [
      "Layer clothing; use moisture-wicking fabrics",
      "Keep your bedroom cool (60–67°F / 15–19°C)",
      "Avoid triggers: spicy food, alcohol, caffeine, stress",
      "Mindfulness-based stress reduction has shown measurable benefit",
      "Phytoestrogen-rich foods (soy, flaxseeds) may help mild cases",
    ],
  },
  {
    emoji: "🧠",
    name: "Brain Fog & Memory Changes",
    prevalence: "Affects ~60% of women",
    description:
      "Difficulty concentrating, word-finding problems, forgetfulness. This is a real hormonal effect — not a sign of early dementia. Estrogen supports neurotransmitter function.",
    naturalRelief: [
      "Regular aerobic exercise (most evidence-backed intervention)",
      "Quality sleep — non-negotiable for memory consolidation",
      "Omega-3 fatty acids from fish, walnuts, flaxseeds",
      "Reduce cognitive load: external calendars, lists, reminders",
      "Limit alcohol — it worsens cognitive symptoms significantly",
    ],
  },
  {
    emoji: "😤",
    name: "Mood Swings & Irritability",
    prevalence: "Affects ~40% of women",
    description:
      "Estrogen fluctuations affect serotonin and dopamine. You may feel anxious, irritable, or emotionally volatile — often disproportionate to circumstances.",
    naturalRelief: [
      "Consistent sleep schedule (even one bad night worsens mood)",
      "Daily movement — even 20-minute walks make a measurable difference",
      "Magnesium glycinate (400mg) in the evenings",
      "Therapy or peer support — normalizing the experience helps enormously",
      "Track your cycle to predict rough patches",
    ],
  },
  {
    emoji: "😴",
    name: "Sleep Disruption",
    prevalence: "Affects ~56% of women",
    description:
      "A cruel irony: when you need rest most, it's hardest to get. Night sweats, racing thoughts, and hormonal changes all conspire against deep sleep.",
    naturalRelief: [
      "Strict sleep schedule — same time every day",
      "Cool, dark bedroom",
      "Magnesium or valerian root before bed",
      "Avoid screens 1 hour before sleep",
      "Address night sweats first — they're often the root cause",
    ],
  },
  {
    emoji: "📅",
    name: "Irregular Periods",
    prevalence: "Defining feature of perimenopause",
    description:
      "Cycles may lengthen, shorten, skip, or become heavier/lighter. This irregularity is caused by fluctuating FSH and estrogen as follicle supply decreases.",
    naturalRelief: [
      "Track every cycle — changes are your data",
      "Continue contraception until 12 months without a period",
      "Note unusually heavy bleeding (consult your doctor)",
      "Iron supplementation if periods are very heavy",
    ],
  },
];

export default function PerimenopauseSymptomsPost() {
  const publishDate = "2026-03-28";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Perimenopause Symptoms: What's Normal, What Helps, and What to Track",
    datePublished: publishDate,
    dateModified: publishDate,
    author: { "@type": "Organization", name: "MyLunarPhase" },
    publisher: { "@type": "Organization", name: "MyLunarPhase", url: "https://mylunarphase.com" },
    description:
      "Hot flashes, mood swings, irregular periods, brain fog — a comprehensive guide to perimenopause symptoms with evidence-based relief strategies.",
    mainEntityOfPage: "https://mylunarphase.com/blog/perimenopause-symptoms",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What age does perimenopause start?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Perimenopause typically starts in the mid-to-late 40s, though it can begin as early as the late 30s. The average age of onset is 47. It ends with menopause (12 consecutive months without a period), which occurs on average at age 51.",
        },
      },
      {
        "@type": "Question",
        name: "How long does perimenopause last?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Perimenopause typically lasts 4–8 years, though it can range from a few months to over a decade. The final 1–2 years before menopause tend to have the most intense symptoms as estrogen declines most sharply.",
        },
      },
      {
        "@type": "Question",
        name: "Can you get pregnant during perimenopause?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Ovulation continues intermittently during perimenopause, so pregnancy is possible until 12 consecutive months without a period (official menopause). Contraception should be used until that point if pregnancy is not desired.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
          <span className="font-quicksand text-xs font-semibold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Perimenopause
          </span>
          <span className="font-quicksand text-xs text-text-muted">March 28, 2026 · 10 min read</span>
        </div>

        <h1 className="font-cormorant text-[clamp(32px,4.5vw,52px)] font-normal text-text-primary leading-tight mb-6">
          Perimenopause Symptoms: What&apos;s Normal, What Helps, and What to Track
        </h1>

        <p className="font-quicksand text-lg text-text-secondary leading-relaxed mb-4">
          Perimenopause is one of the most significant — and least talked about — transitions in a woman's life. It typically begins in your mid-to-late 40s and can last 4–8 years, marked by fluctuating hormones and a wide range of symptoms that affect body, mind, and mood.
        </p>
        <p className="font-quicksand text-text-secondary leading-relaxed mb-10">
          The good news: understanding what's happening and why makes it dramatically easier to navigate. Here's what you need to know.
        </p>

        <hr className="border-border-light mb-10" />

        <section className="mb-10">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">What Is Perimenopause?</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            Perimenopause is the transition period leading up to menopause — defined as 12 consecutive months without a period. During perimenopause, your ovaries begin producing less estrogen and progesterone, and ovulation becomes less predictable. This hormonal fluctuation (not just decline) causes most symptoms.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 font-quicksand text-sm text-amber-900">
            <strong>Key fact:</strong> Perimenopause typically starts between ages 44–50, but can begin as early as the late 30s. The average age of menopause in the US is 51.
          </div>
        </section>

        {/* Symptoms */}
        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-6">The Most Common Perimenopause Symptoms</h2>
          <div className="space-y-8">
            {symptoms.map((s) => (
              <div key={s.name} className="border border-border-light rounded-2xl p-6 bg-white/60">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <h3 className="font-cormorant text-xl text-text-primary">{s.name}</h3>
                    <p className="font-quicksand text-xs text-text-muted">{s.prevalence}</p>
                  </div>
                </div>
                <p className="font-quicksand text-sm text-text-secondary leading-relaxed mb-4">{s.description}</p>
                <div>
                  <p className="font-quicksand text-xs font-semibold text-accent-purple uppercase tracking-wide mb-2">Natural & Lifestyle Relief</p>
                  <ul className="font-quicksand text-sm text-text-secondary space-y-1">
                    {s.naturalRelief.map((item) => <li key={item}>✓ {item}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Tracking Matters */}
        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">Why Tracking Makes a Difference</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            Perimenopause is unpredictable by nature. Tracking your symptoms — even informally — gives you three things:
          </p>
          <ol className="font-quicksand text-text-secondary leading-relaxed space-y-3 pl-6 list-decimal mb-4">
            <li><strong className="text-text-primary">Patterns:</strong> You'll start to notice that symptoms cluster around certain times — often during the luteal phase or immediately before your period.</li>
            <li><strong className="text-text-primary">Evidence:</strong> If you seek medical support, a detailed symptom log is invaluable for your doctor and can help you access appropriate care faster.</li>
            <li><strong className="text-text-primary">Control:</strong> There's something profoundly calming about transforming "I feel terrible and I don't know why" into "I'm in day 18, estrogen is dropping, this makes sense."</li>
          </ol>
          <p className="font-quicksand text-text-secondary leading-relaxed">
            MyLunarPhase is designed specifically to support women in perimenopause — tracking irregular cycles, mood, sleep, energy, and symptoms with phase-aware context.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What age does perimenopause start?", a: "Perimenopause typically starts in the mid-to-late 40s, though it can begin as early as the late 30s. The average age of onset is 47." },
              { q: "How long does perimenopause last?", a: "Perimenopause typically lasts 4–8 years, though it can range from a few months to over a decade. The final 1–2 years before menopause often have the most intense symptoms." },
              { q: "Can you get pregnant during perimenopause?", a: "Yes. Ovulation continues intermittently, so pregnancy is possible until 12 consecutive months without a period. Continue contraception until then if pregnancy is not desired." },
              { q: "Is perimenopause the same as menopause?", a: "No. Perimenopause is the transition leading up to menopause. Menopause is the point 12 months after your last period. Post-menopause is everything after." },
            ].map(({ q, a }) => (
              <div key={q} className="border border-border-light rounded-xl p-5 bg-white/50">
                <p className="font-quicksand font-semibold text-text-primary mb-2">{q}</p>
                <p className="font-quicksand text-sm text-text-secondary leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-amber-50 to-accent-purple/10 rounded-3xl p-8 border border-amber-200 text-center">
          <p className="font-cormorant text-2xl text-text-primary mb-2">
            Navigating perimenopause? You&apos;re not alone.
          </p>
          <p className="font-quicksand text-sm text-text-secondary mb-5">
            MyLunarPhase is built for every stage — including the beautiful, complex transition of perimenopause.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex px-8 py-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-rose text-white font-quicksand font-semibold hover:-translate-y-0.5 transition-transform"
          >
            Start 60-Day Free Trial →
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
