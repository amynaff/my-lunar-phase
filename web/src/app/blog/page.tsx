import type { Metadata } from "next";
import Link from "next/link";
import { Moon } from "lucide-react";

export const metadata: Metadata = {
  title: "Women's Health Blog | MyLunarPhase",
  description:
    "Expert articles on menstrual cycle phases, perimenopause, hormone wellness, and cycle syncing. Evidence-based guidance for every woman at every life stage.",
  openGraph: {
    title: "Women's Health Blog | MyLunarPhase",
    description:
      "Expert articles on menstrual cycle phases, perimenopause, hormone wellness, and cycle syncing.",
    url: "https://mylunarphase.com/blog",
  },
};

const posts = [
  {
    slug: "menstrual-cycle-phases",
    title: "The 4 Phases of Your Menstrual Cycle — And Why They Change Everything",
    excerpt:
      "Follicular, ovulatory, luteal, menstrual — each phase brings distinct hormones, energy levels, and nutritional needs. Here's what to expect and how to thrive in each one.",
    date: "April 3, 2026",
    readTime: "8 min read",
    category: "Cycle Education",
    emoji: "🌙",
  },
  {
    slug: "perimenopause-symptoms",
    title: "Perimenopause Symptoms: What's Normal, What Helps, and What to Track",
    excerpt:
      "Hot flashes, mood swings, irregular periods, brain fog — perimenopause affects every woman differently. Learn the signs, natural relief strategies, and how tracking helps.",
    date: "March 28, 2026",
    readTime: "10 min read",
    category: "Perimenopause",
    emoji: "🌗",
  },
  {
    slug: "period-tracker-app",
    title: "How to Choose a Period Tracker App That Actually Works for You",
    excerpt:
      "Not all period trackers are equal. We break down what features matter most — and how hormone-aware tracking goes far beyond just logging your period dates.",
    date: "March 20, 2026",
    readTime: "6 min read",
    category: "App Guide",
    emoji: "📱",
  },
  {
    slug: "moon-cycle-menstruation",
    title: "The Lunar Cycle and Menstruation: Ancient Wisdom Meets Modern Science",
    excerpt:
      "Women have tracked their cycles by the moon for millennia. Explore the fascinating connection between lunar phases and the menstrual cycle — and what research actually says.",
    date: "March 14, 2026",
    readTime: "7 min read",
    category: "Moon Wisdom",
    emoji: "🌕",
  },
  {
    slug: "best-womens-health-app-2026",
    title: "Best Women's Health Apps in 2026: A Comprehensive Comparison",
    excerpt:
      "Flo, Clue, Natural Cycles, MyLunarPhase — how do the top women's health apps compare? We look at features, privacy, pricing, and who each app is best for.",
    date: "March 5, 2026",
    readTime: "9 min read",
    category: "Comparisons",
    emoji: "⭐",
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="flex items-center gap-2 px-6 py-4 border-b border-border-light">
        <Link href="/" className="flex items-center gap-2">
          <Moon className="h-6 w-6 text-accent-purple" />
          <span className="font-cormorant text-xl font-semibold text-text-primary">
            MyLunarPhase
          </span>
        </Link>
        <span className="text-text-muted mx-2">/</span>
        <span className="font-quicksand text-sm text-text-secondary">Blog</span>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="font-quicksand text-sm font-semibold text-accent-purple uppercase tracking-widest mb-4">
          Women&apos;s Health Blog
        </p>
        <h1 className="font-cormorant text-[clamp(36px,5vw,60px)] font-normal text-text-primary leading-tight mb-6">
          Wisdom for every phase<br />of <em className="italic text-accent-purple">womanhood</em>
        </h1>
        <p className="font-quicksand text-text-secondary text-lg max-w-2xl mx-auto">
          Evidence-based articles on cycle syncing, hormone wellness, perimenopause,
          and everything in between — written for real women, not textbooks.
        </p>
      </section>

      {/* Posts */}
      <section className="max-w-4xl mx-auto px-6 pb-20 grid gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-5 p-6 rounded-2xl bg-white/70 border border-border-light hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-4xl flex-shrink-0 mt-1">{post.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-quicksand text-xs font-semibold text-accent-purple bg-accent-purple/10 px-2.5 py-0.5 rounded-full">
                  {post.category}
                </span>
                <span className="font-quicksand text-xs text-text-muted">
                  {post.date} · {post.readTime}
                </span>
              </div>
              <h2 className="font-cormorant text-xl font-semibold text-text-primary group-hover:text-accent-purple transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="font-quicksand text-sm text-text-secondary leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div className="bg-gradient-to-br from-accent-purple/10 to-accent-rose/10 rounded-3xl p-10 border border-border-light">
          <p className="font-cormorant text-3xl text-text-primary mb-3">
            Ready to tune in to your body?
          </p>
          <p className="font-quicksand text-text-secondary mb-6">
            Start your 60-day free trial and get personalized guidance for your unique cycle.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex px-8 py-3.5 rounded-full bg-gradient-to-r from-accent-purple to-accent-rose text-white font-quicksand font-semibold hover:-translate-y-0.5 transition-transform"
          >
            Start Free Trial →
          </Link>
        </div>
      </section>
    </div>
  );
}
