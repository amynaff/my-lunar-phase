import type { Metadata } from "next";
import Link from "next/link";
import { Moon } from "lucide-react";

export const metadata: Metadata = {
  title: "The 4 Phases of Your Menstrual Cycle — And Why They Change Everything | MyLunarPhase",
  description:
    "Follicular, ovulatory, luteal, menstrual — each phase brings distinct hormones, energy levels, and nutritional needs. Learn what to expect and how to thrive in each phase of your cycle.",
  keywords: [
    "menstrual cycle phases",
    "follicular phase",
    "ovulatory phase",
    "luteal phase",
    "menstrual phase",
    "cycle syncing",
    "hormone health",
    "period phases",
  ],
  alternates: {
    canonical: "/blog/menstrual-cycle-phases",
  },
  openGraph: {
    title: "The 4 Phases of Your Menstrual Cycle | MyLunarPhase",
    description:
      "A complete guide to the follicular, ovulatory, luteal, and menstrual phases — including what to eat, how to move, and how to take care of yourself in each one.",
    url: "https://mylunarphase.com/blog/menstrual-cycle-phases",
    type: "article",
  },
};

const phases = [
  {
    moon: "🌑",
    name: "Menstrual Phase",
    days: "Days 1–5",
    hormones: "Estrogen and progesterone are at their lowest.",
    energy: "Low, inward, restorative",
    color: "border-rose-700",
    description:
      "Your uterine lining sheds, and hormones drop to their lowest point of the month. This is not a time of weakness — it's a powerful reset. Your body is doing profound work, and it deserves rest.",
    eat: [
      "Iron-rich foods: lentils, beef, dark leafy greens",
      "Anti-inflammatory foods: turmeric, ginger, berries",
      "Dark chocolate (magnesium for cramps)",
      "Warm, nourishing soups and stews",
    ],
    move: [
      "Gentle yoga or stretching",
      "Short walks in nature",
      "Rest — seriously, it counts",
    ],
    selfCare: [
      "Heat therapy for cramps",
      "Journaling: what do you want to release this cycle?",
      "Limit social obligations if you can",
    ],
  },
  {
    moon: "🌒",
    name: "Follicular Phase",
    days: "Days 6–13",
    hormones: "Estrogen rises steadily as follicles develop.",
    energy: "Rising, creative, optimistic",
    color: "border-pink-400",
    description:
      "After menstruation, estrogen begins to climb. You'll notice more energy, sharper thinking, and a renewed sense of possibility. This is the ideal time to start new projects, schedule important meetings, and take on creative challenges.",
    eat: [
      "Fermented foods to support estrogen metabolism",
      "Seeds: flaxseeds, pumpkin seeds (seed cycling)",
      "Lean proteins and complex carbs for energy",
      "Cruciferous vegetables for liver detox",
    ],
    move: [
      "HIIT and cardio — your body can handle intensity",
      "Strength training with progressive overload",
      "Group fitness classes or sports",
    ],
    selfCare: [
      "Set intentions for the coming cycle",
      "Try something new: a class, a recipe, a project",
      "Connect with friends — your social energy is high",
    ],
  },
  {
    moon: "🌕",
    name: "Ovulatory Phase",
    days: "Days 14–17",
    hormones: "Estrogen peaks; LH and FSH surge; testosterone rises.",
    energy: "Peak, outward, magnetic",
    color: "border-pink-600",
    description:
      "You're at your physical and communicative peak. Estrogen and testosterone are both elevated — you feel confident, radiant, and socially magnetic. This is the ideal time for presentations, dates, negotiations, and anything requiring charisma.",
    eat: [
      "Antioxidant-rich foods: berries, colorful vegetables",
      "Raw vegetables and lighter meals",
      "Zinc-rich foods: pumpkin seeds, chickpeas",
      "Cooling, hydrating foods",
    ],
    move: [
      "High-intensity training: sprints, plyometrics",
      "Competitive sports",
      "Dance, Zumba, anything that feels joyful",
    ],
    selfCare: [
      "Schedule your most important meetings or dates",
      "Speak your truth — communication is effortless",
      "Practice gratitude for your body's incredible capacity",
    ],
  },
  {
    moon: "🌘",
    name: "Luteal Phase",
    days: "Days 18–28",
    hormones: "Progesterone rises then falls; estrogen dips.",
    energy: "Winding down, detail-oriented, nesting",
    color: "border-purple-600",
    description:
      "Progesterone dominates in the first half of the luteal phase, bringing calm and focus. As it drops toward the end (PMS week), many women experience irritability, bloating, or fatigue. Understanding this is biological — not a character flaw — is transformative.",
    eat: [
      "Magnesium-rich foods: dark chocolate, spinach, nuts",
      "Complex carbs to stabilize serotonin: sweet potatoes, oats",
      "Reduce caffeine and alcohol (worsen PMS)",
      "Calcium: dairy or fortified plant milk",
    ],
    move: [
      "Moderate-intensity steady-state cardio",
      "Pilates, barre, yoga",
      "Outdoor walks — the best mood stabilizer",
    ],
    selfCare: [
      "Complete projects — your detail focus is excellent",
      "Honor the need to 'nest': clean, organize, prepare",
      "Journal: what are you ready to release?",
    ],
  },
];

export default function MenstrualCyclePhasesPost() {
  const publishDate = "2026-04-03";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The 4 Phases of Your Menstrual Cycle — And Why They Change Everything",
    datePublished: publishDate,
    dateModified: publishDate,
    author: { "@type": "Organization", name: "MyLunarPhase" },
    publisher: { "@type": "Organization", name: "MyLunarPhase", url: "https://mylunarphase.com" },
    description:
      "A complete guide to the four phases of the menstrual cycle — follicular, ovulatory, luteal, and menstrual — including nutrition, movement, and self-care for each phase.",
    mainEntityOfPage: "https://mylunarphase.com/blog/menstrual-cycle-phases",
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
        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-quicksand text-xs font-semibold text-accent-purple bg-accent-purple/10 px-2.5 py-0.5 rounded-full">
            Cycle Education
          </span>
          <span className="font-quicksand text-xs text-text-muted">April 3, 2026 · 8 min read</span>
        </div>

        <h1 className="font-cormorant text-[clamp(32px,4.5vw,52px)] font-normal text-text-primary leading-tight mb-6">
          The 4 Phases of Your Menstrual Cycle — And Why They Change Everything
        </h1>

        <p className="font-quicksand text-lg text-text-secondary leading-relaxed mb-10">
          Your menstrual cycle is not just a monthly inconvenience — it's a sophisticated biological rhythm that affects your energy, mood, cognition, metabolism, and emotional life every single day. Understanding your four phases isn't just interesting; it's genuinely life-changing.
        </p>

        <hr className="border-border-light mb-10" />

        {/* Intro */}
        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">What Are the Four Phases?</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            A typical menstrual cycle runs 21–35 days (28 days on average) and is divided into four distinct phases, each governed by different hormonal patterns:
          </p>
          <ol className="font-quicksand text-text-secondary leading-relaxed space-y-2 pl-6 list-decimal">
            <li><strong className="text-text-primary">Menstrual phase</strong> (Days 1–5): your period</li>
            <li><strong className="text-text-primary">Follicular phase</strong> (Days 6–13): rising energy and estrogen</li>
            <li><strong className="text-text-primary">Ovulatory phase</strong> (Days 14–17): peak energy and fertility</li>
            <li><strong className="text-text-primary">Luteal phase</strong> (Days 18–28): progesterone dominance, PMS window</li>
          </ol>
          <p className="font-quicksand text-text-secondary leading-relaxed mt-4">
            The concept of <strong className="text-text-primary">cycle syncing</strong> — aligning your nutrition, exercise, work, and social life with these phases — has gained significant scientific and cultural traction in recent years. And for good reason: working with your hormones instead of against them makes everything feel easier.
          </p>
        </section>

        {/* Phase Cards */}
        {phases.map((phase) => (
          <section key={phase.name} className={`mb-12 pl-5 border-l-4 ${phase.color}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{phase.moon}</span>
              <div>
                <h2 className="font-cormorant text-2xl text-text-primary">{phase.name}</h2>
                <p className="font-quicksand text-sm text-text-muted">{phase.days} · {phase.hormones}</p>
              </div>
            </div>
            <p className="font-quicksand text-text-secondary leading-relaxed mb-5">{phase.description}</p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/60 rounded-xl p-4 border border-border-light">
                <p className="font-quicksand text-xs font-semibold text-accent-purple mb-2 uppercase tracking-wide">🥗 Eat</p>
                <ul className="font-quicksand text-xs text-text-secondary space-y-1">
                  {phase.eat.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-border-light">
                <p className="font-quicksand text-xs font-semibold text-accent-purple mb-2 uppercase tracking-wide">💪 Move</p>
                <ul className="font-quicksand text-xs text-text-secondary space-y-1">
                  {phase.move.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-border-light">
                <p className="font-quicksand text-xs font-semibold text-accent-purple mb-2 uppercase tracking-wide">🌸 Self-Care</p>
                <ul className="font-quicksand text-xs text-text-secondary space-y-1">
                  {phase.selfCare.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* Conclusion */}
        <section className="mb-12">
          <h2 className="font-cormorant text-3xl text-text-primary mb-4">The Bottom Line</h2>
          <p className="font-quicksand text-text-secondary leading-relaxed mb-4">
            Understanding your menstrual cycle phases is one of the most powerful things you can do for your health, productivity, and overall wellbeing. When you stop fighting your body's natural rhythms and start flowing with them, everything changes.
          </p>
          <p className="font-quicksand text-text-secondary leading-relaxed">
            MyLunarPhase tracks your cycle phase in real time and delivers personalized daily guidance for nutrition, movement, and self-care — so you're always supported, exactly where you are.
          </p>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-accent-purple/10 to-accent-rose/10 rounded-3xl p-8 border border-border-light text-center">
          <p className="font-cormorant text-2xl text-text-primary mb-2">
            Track your phases with MyLunarPhase
          </p>
          <p className="font-quicksand text-sm text-text-secondary mb-5">
            Get daily personalized guidance for every phase of your cycle. 7-day free trial.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex px-8 py-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-rose text-white font-quicksand font-semibold hover:-translate-y-0.5 transition-transform"
          >
            Start Free →
          </Link>
        </div>

        {/* Back */}
        <div className="mt-10">
          <Link href="/blog" className="font-quicksand text-sm text-accent-purple hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
