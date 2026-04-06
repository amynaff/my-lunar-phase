import type { Metadata } from "next";
import Link from "next/link";
import { Moon } from "lucide-react";

export const metadata: Metadata = {
  title: "The Lunar Cycle and Menstruation: Ancient Wisdom Meets Modern Science | MyLunarPhase",
  description:
    "Women have tracked their cycles by the moon for millennia. Explore the fascinating connection between the lunar cycle and the menstrual cycle — what history shows, what science says, and how to work with lunar energy today.",
  keywords: [
    "lunar cycle and menstruation",
    "moon cycle period",
    "moon phase period tracker",
    "period moon phases",
    "menstrual cycle moon connection",
    "syncing period with moon",
    "white moon cycle",
    "red moon cycle",
  ],
  alternates: {
    canonical: "/blog/moon-cycle-menstruation",
  },
  openGraph: {
    title: "The Lunar Cycle and Menstruation | MyLunarPhase",
    description:
      "Exploring the ancient and modern connection between the moon's 29.5-day cycle and the menstrual cycle — and how lunar awareness can deepen your relationship with your body.",
    url: "https://mylunarphase.com/blog/moon-cycle-menstruation",
    type: "article",
  },
};

const moonPhases = [
  { moon: "🌑", name: "New Moon", energy: "New Beginnings", innerSeason: "Inner Winter / Menstrual Phase", description: "A time of rest, reflection, and intention-setting. In many traditions, the new moon aligns with menstruation — a natural invitation to turn inward, release the old cycle, and set intentions for the new one." },
  { moon: "🌒", name: "Waxing Crescent", energy: "Emerging", innerSeason: "Early Follicular", description: "Seeds of intention begin to sprout. Energy is tentative but building. Ideas planted at the new moon begin to take root." },
  { moon: "🌓", name: "First Quarter", energy: "Action", innerSeason: "Mid Follicular", description: "Time to act on your intentions. The momentum is building; obstacles arise and must be met with determination." },
  { moon: "🌔", name: "Waxing Gibbous", energy: "Refinement", innerSeason: "Late Follicular", description: "Adjust and refine your approach. You're almost at peak energy — trust the process and continue building." },
  { moon: "🌕", name: "Full Moon", energy: "Peak Illumination", innerSeason: "Ovulatory Phase", description: "The full moon often corresponds to ovulation in women who are moon-synced. Peak energy, heightened emotion, maximum visibility — what was hidden comes to light. Celebrate and express." },
  { moon: "🌖", name: "Waning Gibbous", energy: "Gratitude & Sharing", innerSeason: "Early Luteal", description: "Harvest the fruits of your efforts. Share your wisdom generously. Practice deep gratitude for what has grown." },
  { moon: "🌗", name: "Last Quarter", energy: "Release", innerSeason: "Mid Luteal", description: "Let go of what no longer serves. Clear mental and physical clutter. Make space for the new cycle approaching." },
  { moon: "🌘", name: "Waning Crescent", energy: "Surrender & Rest", innerSeason: "Late Luteal / Pre-Menstrual", description: "Rest deeply. The cycle completes. Surrender to the need for stillness before the new moon's return." },
];

export default function MoonCycleMenstruationPost() {
  const publishDate = "2026-03-14";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Lunar Cycle and Menstruation: Ancient Wisdom Meets Modern Science",
    datePublished: publishDate,
    dateModified: publishDate,
    author: { "@type": "Organization", name: "MyLunarPhase" },
    publisher: { "@type": "Organization", name: "MyLunarPhase", url: "https://mylunarphase.com" },
    description:
      "Exploring the connection between the lunar cycle and the menstrual cycle — from ancient traditions to modern research.",
    mainEntityOfPage: "https://mylunarphase.com/blog/moon-cycle-menstruation",
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
          <span className="font-quicksand text-xs font-semibold text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full">
            Moon Wisdom
          </span>
          <span className="font-quicksand text-xs text-text-muted">March 14, 2026 · 7 min read</span>
        </div>

        <h1 className="font-cormorant text-[clamp(32px,4.5vw,52px)] font-normal text-text-primary leading-tight mb-6">
          The Lunar Cycle and Menstruation: Ancient Wisdom Meets Modern Science
        </h1>

        <p className="font-quicksand text-lg text-text-secondary leading-relaxed mb-10">
          The lunar cycle is 29.5 days. The average menstrual cycle is 28–29 days. This near-perfect synchrony is not a coincidence — or at least, that's what women across cultures have believed for thousands of years. But what does science actually say?
        </p>

        <hr className="border-border-light mb-10" />

        <section className="mb-10">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">A Universal Human Story</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            From the Aboriginal Australians to the ancient Egyptians, from Mayan astronomers to Indigenous North American peoples — virtually every pre-industrial culture noticed the correspondence between the moon's cycle and the female cycle. The very word "menstruation" comes from the Latin <em>mensis</em>, meaning month, which comes from the Greek <em>mene</em>, meaning moon.
          </p>
          <p className="font-quicksand text-text-secondary leading-relaxed">
            This wasn't mysticism — it was observation. When you live without artificial light, the moon is your primary timekeeper. And for women, the body kept its own lunar time.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">What the Research Shows</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            Modern research on the moon-menstruation connection is genuinely interesting — though not definitive. A notable 2021 study published in <em>Science Advances</em> found that historically, before widespread adoption of artificial lighting, menstrual cycles did synchronize with the lunar cycle. This synchrony was disrupted by exposure to electric light and digital screens — which suppress melatonin, the hormone that mediates circadian and potentially lunar biological rhythms.
          </p>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            Other research has found correlations between moon phase and menstrual onset, though results are mixed and methodological challenges abound. The honest scientific answer is: <em>we don't know yet</em>. The relationship may be real but obscured by modern light pollution.
          </p>
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 font-quicksand text-sm text-violet-900">
            <strong>Key takeaway:</strong> Even if your menstrual cycle doesn&apos;t align with the moon phases, the lunar cycle provides a beautiful, universal framework for understanding cyclical rhythms — and many women find meaningful resonance when they begin paying attention.
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">The White Moon and Red Moon Cycles</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            In many traditions, two primary archetypes describe how a woman's cycle may relate to the moon:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="font-cormorant text-xl text-text-primary mb-2">🌑 White Moon Cycle</p>
              <p className="font-quicksand text-sm text-text-secondary">Menstruation at the <strong>new moon</strong>, ovulation at the full moon. Traditionally associated with the fertile mother archetype — highly attuned to creation, nurturing, and bringing new life into the world (literal or metaphorical).</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="font-cormorant text-xl text-text-primary mb-2">🌕 Red Moon Cycle</p>
              <p className="font-quicksand text-sm text-text-secondary">Menstruation at the <strong>full moon</strong>, ovulation at the new moon. Traditionally associated with the wise woman or healer archetype — channeling peak creative and spiritual energy inward rather than toward biological reproduction.</p>
            </div>
          </div>
          <p className="font-quicksand text-text-secondary leading-relaxed">
            There's no "better" cycle. Both are expressions of natural feminine rhythms. And cycles shift — you may experience both across different phases of your life.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-6">The 8 Moon Phases and Their Corresponding Energies</h2>
          <div className="space-y-4">
            {moonPhases.map((phase) => (
              <div key={phase.name} className="flex gap-4 p-4 rounded-xl bg-white/60 border border-border-light">
                <span className="text-2xl flex-shrink-0">{phase.moon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-quicksand font-semibold text-sm text-text-primary">{phase.name}</p>
                    <span className="text-xs text-text-muted">· {phase.innerSeason}</span>
                  </div>
                  <p className="font-quicksand text-xs text-text-secondary leading-relaxed">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">How to Work With Lunar Energy Today</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            You don't need your cycle to align perfectly with the moon to benefit from lunar awareness. Even tracking moon phases alongside your menstrual cycle — without expecting synchrony — can deepen your sense of rhythm and connection with natural cycles.
          </p>
          <ul className="font-quicksand text-text-secondary text-sm space-y-2 pl-5 list-disc">
            <li>Note the current moon phase each day alongside your symptoms and energy</li>
            <li>Use new moons as natural points to set intentions for your upcoming cycle</li>
            <li>Use full moons as moments of celebration, expression, and visibility</li>
            <li>Use waning moons for rest, release, and completion</li>
            <li>Reduce artificial light exposure in the evenings — this may, over time, help re-synchronize your cycle with the moon</li>
          </ul>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-violet-50 to-accent-purple/10 rounded-3xl p-8 border border-violet-200 text-center">
          <p className="font-cormorant text-2xl text-text-primary mb-2">
            Track both your cycle and the moon
          </p>
          <p className="font-quicksand text-sm text-text-secondary mb-5">
            MyLunarPhase shows your current moon phase alongside your cycle phase — helping you live in rhythm with both your inner and outer cycles.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex px-8 py-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-rose text-white font-quicksand font-semibold hover:-translate-y-0.5 transition-transform"
          >
            Start Free Trial →
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
