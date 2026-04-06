"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Moon, Heart, Sparkles, Dumbbell, Users, FlaskConical, Star,
  Brain, Salad, BookHeart, MessageCircleHeart, Globe,
} from "lucide-react";
import { GradientBackground } from "@/components/shared/gradient-background";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

/* ───────── Life Stages ───────── */
const lifeStages = [
  {
    emoji: "\uD83C\uDF19", title: "Regular Cycles", age: "Reproductive Years", className: "from-accent-purple to-accent-lavender",
    desc: "Your monthly rhythm is your superpower. Get nutrition, movement, self-care, and journal prompts tuned to all four phases of your cycle — every single day.",
    tags: ["\uD83E\uDD57 Phase nutrition", "\uD83D\uDCAA Cycle workouts", "\uD83D\uDCD3 Journaling", "\uD83C\uDF3F Affirmations"],
  },
  {
    emoji: "\uD83C\uDF17", title: "Perimenopause", age: "Usually 40s–50s", className: "from-amber-400 to-amber-300",
    desc: "A powerful transition that deserves real support. Navigate irregular cycles, mood shifts, brain fog, and sleep changes with compassionate, expert-backed guidance.",
    tags: ["\uD83E\uDDE0 Brain fog tips", "\uD83D\uDE34 Sleep hygiene", "\uD83E\uDDD8 Stress tools", "\uD83D\uDC9B Symptom tracking"],
  },
  {
    emoji: "\u2728", title: "Menopause", age: "12+ months without period", className: "from-violet-500 to-accent-lavender",
    desc: "Your second spring. This isn\u2019t an ending \u2014 it\u2019s a new beginning. Wisdom, freedom, and a wellness practice that celebrates who you\u2019ve become.",
    tags: ["\uD83C\uDF38 Second spring", "\uD83C\uDFCB\uFE0F Bone health", "\u2764\uFE0F Heart health", "\u270D\uFE0F Vision journaling"],
  },
  {
    emoji: "\uD83C\uDF1F", title: "Post Menopause", age: "After menopause transition", className: "from-pink-500 to-pink-300",
    desc: "Your wisdom years. Hormones have settled into a new steady state \u2014 now it\u2019s about thriving with clarity, vitality, and vibrant living on your own terms.",
    tags: ["\uD83E\uDDB4 Bone strength", "\uD83E\uDDE0 Mental clarity", "\u2764\uFE0F Heart health", "\u26A1 Sustained energy"],
  },
];

/* ───────── Cycle Phases ───────── */
const cyclePhases = [
  { moon: "\uD83C\uDF11", season: "New Moon \u00B7 Inner Winter", name: "Menstrual", days: "Days 1\u20135", energy: "Low & Inward", desc: "A time for rest, reflection, and gentle self-care. Your body is doing profound work.", superpower: "Deep intuition & self-awareness", color: "border-t-rose-700" },
  { moon: "\uD83C\uDF12", season: "Waxing Moon \u00B7 Inner Spring", name: "Follicular", days: "Days 6\u201313", energy: "Rising & Creative", desc: "Fresh energy emerges. Perfect for new beginnings, projects, and showing up boldly.", superpower: "New ideas & fresh perspectives", color: "border-t-pink-400" },
  { moon: "\uD83C\uDF15", season: "Full Moon \u00B7 Inner Summer", name: "Ovulatory", days: "Days 14\u201317", energy: "High & Outward", desc: "Peak energy and social magnetism. You\u2019re radiant, communicative, and magnetic.", superpower: "Communication & connection", color: "border-t-pink-600" },
  { moon: "\uD83C\uDF16", season: "Waning Moon \u00B7 Inner Autumn", name: "Luteal", days: "Days 18\u201328", energy: "Winding Down", desc: "Complete tasks, nest at home, and turn inward. Your detail focus is at its peak.", superpower: "Focus & attention to detail", color: "border-t-purple-600" },
];

/* ───────── Moon Phases ───────── */
const moonPhases = [
  { emoji: "\uD83C\uDF11", name: "New Moon", energy: "Inward & Restorative", desc: "Rest, reflect, and set intentions for the cycle ahead." },
  { emoji: "\uD83C\uDF12", name: "Waxing Crescent", energy: "Rising & Hopeful", desc: "Plant seeds. Fresh energy is beginning to emerge." },
  { emoji: "\uD83C\uDF13", name: "First Quarter", energy: "Active & Determined", desc: "Take action on your intentions. Build momentum now." },
  { emoji: "\uD83C\uDF14", name: "Waxing Gibbous", energy: "Building & Refining", desc: "Refine your approach. Trust the process unfolding." },
  { emoji: "\uD83C\uDF15", name: "Full Moon", energy: "High & Radiant", desc: "Peak energy and illumination. Celebrate your progress." },
  { emoji: "\uD83C\uDF16", name: "Waning Gibbous", energy: "Generous & Grateful", desc: "Share your wisdom. Practice deep gratitude." },
  { emoji: "\uD83C\uDF17", name: "Last Quarter", energy: "Releasing & Clearing", desc: "Let go of what no longer serves you. Make space." },
  { emoji: "\uD83C\uDF18", name: "Waning Crescent", energy: "Restful & Surrendering", desc: "Rest deeply. Prepare for your next beginning." },
];

/* ───────── Self-Care Cards ───────── */
const selfCareCards = [
  { emoji: "\uD83D\uDEC1", title: "Warm Bath", desc: "Add epsom salts for muscle relief and deep relaxation." },
  { emoji: "\uD83D\uDCD3", title: "Gentle Journaling", desc: "Reflect on the past month. What do you want to release?" },
  { emoji: "\uD83C\uDFAC", title: "Cozy Movies", desc: "Comfort watching without guilt. Rest is productive now." },
  { emoji: "\uD83D\uDE34", title: "Extra Sleep", desc: "Napping and early bedtimes are genuinely healing right now." },
  { emoji: "\uD83C\uDF75", title: "Warm Drinks", desc: "Herbal tea, warm broth, or cocoa for comfort and calm." },
  { emoji: "\uD83D\uDEAB", title: "Permission to Say No", desc: "Cancel plans guilt-free. Protecting your energy is wisdom." },
];

/* ───────── Features ───────── */
const features = [
  { icon: Salad, title: "Phase Nutrition", desc: "Daily food guidance that shifts with your hormones. Iron-rich at menstruation, antioxidants at ovulation, magnesium during the luteal phase. Your plate, in sync with your body." },
  { icon: Dumbbell, title: "Smart Movement", desc: "Stop training against your body. Know when to push hard and when to restore. Exercise guidance that matches your energy \u2014 better results, less burnout, more joy." },
  { icon: BookHeart, title: "Self-Care & Affirmations", desc: "Phase-specific activities, journaling prompts, and affirmations for where you actually are \u2014 including full support for perimenopause and menopause." },
  { icon: Moon, title: "Moon Phase Wisdom", desc: "Align your inner cycle with the lunar cycle. Each moon phase carries its own energy \u2014 MyLunarPhase shows you how they correspond and what they mean for you." },
  { icon: Users, title: "Partner Support", desc: "Invite a partner to understand your cycle. Shared insight builds empathy, reduces conflict, and deepens connection \u2014 because relationships thrive on understanding." },
];

/* ───────── Testimonials ───────── */
const testimonials = [
  { name: "Sarah M., 34", role: "Yoga instructor \u00B7 Regular cycles", text: "I finally understand why I\u2019m exhausted the week before my period. MyLunarPhase changed how I plan my entire month \u2014 work, workouts, social life. Everything.", gradient: "from-accent-lavender to-accent-rose" },
  { name: "Linda K., 47", role: "Teacher \u00B7 Perimenopause", text: "I\u2019m 47 and in perimenopause. I\u2019d tried every period app and none of them spoke to me. MyLunarPhase actually gets where I am. The support for this stage is unlike anything else.", gradient: "from-amber-400 to-amber-300" },
  { name: "Carol W., 61", role: "Retired nurse \u00B7 Post menopause", text: "I\u2019m 61 and post-menopausal. I thought wellness apps weren\u2019t for me anymore. MyLunarPhase proved me completely wrong \u2014 the focus on bone health, mental clarity, and energy is exactly what I needed.", gradient: "from-pink-400 to-pink-300" },
];

/* ───────── Phase Prompts ───────── */
const phasePrompts = [
  { phase: "\uD83C\uDF11 Menstrual", prompt: "\u201CWhat do I need to release from this cycle?\u201D", border: "border-t-rose-700" },
  { phase: "\uD83C\uDF12 Follicular", prompt: "\u201CWhat new project excites me most right now?\u201D", border: "border-t-pink-400" },
  { phase: "\uD83C\uDF15 Ovulatory", prompt: "\u201CWhat important truth do I need to speak?\u201D", border: "border-t-pink-600" },
  { phase: "\uD83C\uDF16 Luteal", prompt: "\u201CWhat boundaries do I need to set?\u201D", border: "border-t-purple-600" },
];

/* ───────── Section Eyebrow ───────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="block w-9 h-px bg-border-medium" />
      <span className="text-[11px] font-quicksand font-bold tracking-[0.12em] uppercase text-accent-purple">{children}</span>
      <span className="block w-9 h-px bg-border-medium" />
    </div>
  );
}

/* ───────── Page ───────── */
export default function LandingPage() {
  return (
    <GradientBackground>
      {/* ═══ NAV ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[rgba(248,247,255,0.88)] backdrop-blur-xl border-b border-border-light">
        <Link href="/" className="flex items-center gap-2.5">
          <Moon className="h-6 w-6 text-accent-purple" />
          <span className="font-cormorant text-[22px] font-semibold text-text-primary">MyLunarPhase</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8 text-sm font-quicksand font-semibold text-text-secondary">
          <Link href="#stages" className="hover:text-text-primary transition-colors">All Women</Link>
          <Link href="#phases" className="hover:text-text-primary transition-colors">Your Phases</Link>
          <Link href="#luna-ai" className="hover:text-text-primary transition-colors">LunaAI</Link>
          <Link href="/blog" className="hover:text-text-primary transition-colors">Blog</Link>
          <Link href="#pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
          <Link href="/download" className="hover:text-text-primary transition-colors">Download</Link>
          <Link href="/sign-up" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-lg shadow-accent-purple/35">
            Web App
          </Link>
        </nav>
        <Link href="/sign-up" className="lg:hidden px-5 py-2 rounded-full bg-gradient-to-r from-accent-purple to-accent-pink text-white text-sm font-quicksand font-semibold">
          Get Started
        </Link>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-[960px]">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/75 border border-border-medium rounded-full px-5 py-1.5 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse" />
            <span className="text-[11px] font-quicksand font-bold tracking-[0.1em] uppercase text-text-secondary">Women&apos;s Wellness at Every Age</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-cormorant text-[clamp(52px,8.5vw,108px)] font-light leading-[0.93] text-text-primary tracking-tight mb-3">
            Your body has a<br />
            <em className="italic bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">rhythm. Honor it.</em>
          </motion.h1>

          <motion.p variants={fadeUp} className="font-cormorant text-[clamp(17px,2.2vw,26px)] font-light text-text-secondary tracking-wide mb-3">
            Nourish. Move. Care. Phase by phase.
          </motion.p>

          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-purple/10 to-accent-pink/8 border border-border-medium rounded-full px-5 py-2 mb-7">
            <span className="text-sm">&#10024;</span>
            <span className="text-[13px] font-quicksand font-bold text-text-secondary">Not just another period tracker</span>
          </motion.div>

          <motion.p variants={fadeUp} className="text-[17px] leading-relaxed text-text-secondary font-quicksand font-medium max-w-[540px] mx-auto mb-12">
            A complete wellness companion for every woman at every stage of life. Whether you&apos;re cycling, navigating perimenopause, or embracing menopause — MyLunarPhase meets you exactly where you are.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3.5 flex-wrap mb-12">
            <Link href="/sign-up" className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-bold text-base shadow-[0_8px_32px_rgba(157,132,237,0.4)] hover:-translate-y-0.5 transition-transform">
              Start 60-Day Free Trial
            </Link>
            <a href="#stages" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/65 border border-border-medium text-text-secondary font-quicksand font-semibold backdrop-blur-sm hover:-translate-y-0.5 transition-transform" onClick={(e) => { e.preventDefault(); document.getElementById('stages')?.scrollIntoView({ behavior: 'smooth' }); }}>
              See how it works &rarr;
            </a>
          </motion.div>

          {/* Store pills */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2.5 bg-text-primary text-white px-5 py-2.5 rounded-xl opacity-50">
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] fill-white flex-shrink-0"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              <span className="text-left"><span className="block text-[9px] font-normal opacity-75 leading-none">Coming Soon on the</span><span className="block text-[13px] font-semibold leading-snug">App Store</span></span>
            </span>
            <span className="inline-flex items-center gap-2.5 bg-text-primary text-white px-5 py-2.5 rounded-xl opacity-50">
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] fill-white flex-shrink-0"><path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" /></svg>
              <span className="text-left"><span className="block text-[9px] font-normal opacity-75 leading-none">Coming Soon on</span><span className="block text-[13px] font-semibold leading-snug">Google Play</span></span>
            </span>
            <Link href="/sign-up" className="inline-flex items-center gap-2.5 bg-gradient-to-r from-accent-purple to-accent-pink text-white px-5 py-2.5 rounded-xl hover:-translate-y-0.5 transition-transform">
              <Globe className="w-[19px] h-[19px]" />
              <span className="text-left"><span className="block text-[9px] font-normal opacity-75 leading-none">Use the</span><span className="block text-[13px] font-semibold leading-snug">Web App</span></span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ LIFE STAGES ═══ */}
      <section id="stages" className="max-w-[1100px] mx-auto px-6 py-24">
        <Eyebrow>For Every Woman, At Every Age</Eyebrow>
        <h2 className="font-cormorant text-[clamp(32px,4.5vw,56px)] font-normal text-center text-text-primary leading-tight mb-4">
          Built for every stage<br />of <em className="italic text-accent-purple">womanhood</em>
        </h2>
        <p className="text-center text-base text-text-secondary font-quicksand font-medium max-w-[560px] mx-auto mb-14 leading-relaxed">
          Regular cycles, perimenopause, menopause, post menopause — MyLunarPhase meets you exactly where you are, at every age.
        </p>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {lifeStages.map((s) => (
            <motion.div key={s.title} variants={fadeUp} className="relative overflow-hidden rounded-[28px] border border-border-light bg-bg-card backdrop-blur-xl p-8 hover:-translate-y-1.5 hover:shadow-[0_24px_56px_rgba(74,52,133,0.13)] transition-all">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.className}`} />
              <span className="text-4xl block mb-4">{s.emoji}</span>
              <p className="text-[10px] font-quicksand font-bold tracking-[0.1em] uppercase text-text-muted mb-1.5">{s.age}</p>
              <h3 className="font-cormorant text-2xl font-semibold text-text-primary mb-2.5">{s.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary font-quicksand mb-4">{s.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span key={t} className="text-[11px] font-quicksand font-semibold px-2.5 py-1 rounded-full bg-bg-secondary border border-border-light text-text-secondary">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ CYCLE PHASES ═══ */}
      <section id="phases" className="bg-gradient-to-b from-transparent via-accent-purple/[0.06] to-transparent">
        <div className="max-w-[1100px] mx-auto px-6 py-16">
          {/* Intro card */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-[28px] border border-border-medium bg-bg-card backdrop-blur-xl p-8 md:p-10 border-l-4 border-l-accent-purple mb-8">
            <p className="text-[11px] font-quicksand font-bold tracking-[0.1em] uppercase text-accent-purple mb-3">{"\uD83C\uDF19"} Inside Regular Cycles</p>
            <h2 className="font-cormorant text-[clamp(26px,3.5vw,42px)] font-normal text-text-primary leading-tight mb-3.5">
              The four phases<br />of your menstrual cycle
            </h2>
            <p className="text-[15px] leading-relaxed text-text-secondary font-quicksand max-w-[560px] mb-5">
              For women with regular cycles, the app guides you through all four internal seasons — each with its own nutrition, movement, self-care, and affirmations.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-quicksand font-bold px-3.5 py-1.5 rounded-full bg-rose-700/10 text-rose-700">{"\uD83C\uDF11"} New Moon &middot; Inner Winter</span>
              <span className="text-xs font-quicksand font-bold px-3.5 py-1.5 rounded-full bg-pink-400/10 text-pink-500">{"\uD83C\uDF12"} Waxing Moon &middot; Inner Spring</span>
              <span className="text-xs font-quicksand font-bold px-3.5 py-1.5 rounded-full bg-pink-200/20 text-pink-600">{"\uD83C\uDF15"} Full Moon &middot; Inner Summer</span>
              <span className="text-xs font-quicksand font-bold px-3.5 py-1.5 rounded-full bg-purple-600/10 text-purple-600">{"\uD83C\uDF16"} Waning Moon &middot; Inner Autumn</span>
            </div>
          </motion.div>

          {/* Phase cards */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {cyclePhases.map((p) => (
              <motion.div key={p.name} variants={fadeUp} className={`rounded-3xl border border-border-light bg-bg-card backdrop-blur-xl p-6 border-t-[3px] ${p.color} hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(74,52,133,0.12)] transition-all`}>
                <span className="text-4xl block mb-2.5">{p.moon}</span>
                <p className="text-[10px] font-quicksand font-bold tracking-[0.1em] uppercase text-text-muted mb-1">{p.season}</p>
                <h3 className="font-cormorant text-[22px] font-semibold text-text-primary mb-0.5">{p.name}</h3>
                <p className="text-[10.5px] font-quicksand font-bold tracking-wide uppercase text-text-muted mb-2">{p.days}</p>
                <p className="text-[11px] font-quicksand font-semibold text-accent-purple mb-2.5">{p.energy}</p>
                <p className="text-[13px] leading-relaxed text-text-secondary font-quicksand mb-3.5">{p.desc}</p>
                <div className="bg-bg-secondary rounded-lg border border-border-light p-2.5">
                  <p className="text-[9px] font-quicksand font-bold tracking-[0.08em] uppercase text-text-muted mb-0.5">Your Superpower</p>
                  <p className="text-[11.5px] font-quicksand font-semibold text-text-secondary">{p.superpower}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="max-w-[1100px] mx-auto px-6 py-24">
        <Eyebrow>Six Pillars of Support</Eyebrow>
        <h2 className="font-cormorant text-[clamp(32px,4.5vw,56px)] font-normal text-center text-text-primary leading-tight mb-4">
          A complete wellness<br /><em className="italic text-accent-purple">platform, not just an app</em>
        </h2>
        <p className="text-center text-base text-text-secondary font-quicksand font-medium max-w-[560px] mx-auto mb-12">
          Personalized to your phase, your life stage, and your body.
        </p>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Labs Guide — spans 2 cols */}
          <motion.div variants={fadeUp} className="md:col-span-2 rounded-3xl border border-border-light bg-bg-card backdrop-blur-xl p-7 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(74,52,133,0.1)] transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-center">
              <div>
                <span className="text-3xl block mb-4">{"\uD83E\uDDEA"}</span>
                <h3 className="font-cormorant text-[22px] font-semibold text-text-primary mb-2.5">Labs Guide</h3>
                <p className="text-sm leading-relaxed text-text-secondary font-quicksand">We check cholesterol. We check blood sugar. But the hormones that affect everything? Apparently optional. MyLunarPhase helps you understand which labs to ask for, what they mean, and what optimal ranges look like for women — not just &ldquo;normal.&rdquo;</p>
              </div>
              <div className="bg-bg-secondary rounded-2xl p-5 border border-border-light">
                <p className="text-[10px] font-quicksand font-bold tracking-[0.1em] uppercase text-text-muted mb-3">Recommended Labs</p>
                {[
                  { color: "bg-pink-400", name: "Basic Panels", count: "CBC, CMP" },
                  { color: "bg-purple-400", name: "Sex Hormones", count: "8 markers" },
                  { color: "bg-amber-400", name: "Thyroid Function", count: "6 markers" },
                  { color: "bg-emerald-400", name: "Metabolic Health", count: "3 markers" },
                  { color: "bg-blue-400", name: "Cardiovascular", count: "5 markers" },
                  { color: "bg-violet-400", name: "Consider Adding", count: "Vit D, AMH" },
                ].map((lab) => (
                  <div key={lab.name} className="flex items-center gap-2 py-1.5 border-b border-border-light last:border-0">
                    <span className={`w-2 h-2 rounded-full ${lab.color} flex-shrink-0`} />
                    <span className="text-xs font-quicksand font-semibold text-text-primary">{lab.name}</span>
                    <span className="text-[10px] text-text-muted ml-auto">{lab.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className="rounded-3xl border border-border-light bg-bg-card backdrop-blur-xl p-7 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(74,52,133,0.1)] transition-all">
              <f.icon className="h-7 w-7 text-accent-purple mb-4" />
              <h3 className="font-cormorant text-[22px] font-semibold text-text-primary mb-2.5">{f.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary font-quicksand">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ MOON PHASES ═══ */}
      <section className="max-w-[1100px] mx-auto px-6 py-16">
        <Eyebrow>Lunar Wisdom</Eyebrow>
        <h2 className="font-cormorant text-[clamp(32px,4.5vw,56px)] font-normal text-center text-text-primary leading-tight mb-4">
          Your inner cycle <em className="italic text-accent-purple">and</em><br />the moon — connected
        </h2>
        <p className="text-center text-base text-text-secondary font-quicksand font-medium max-w-[560px] mx-auto mb-12">
          Every moon phase carries its own energy. MyLunarPhase shows you how to work with both rhythms at once.
        </p>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moonPhases.map((m) => (
            <motion.div key={m.name} variants={fadeUp} className="rounded-[20px] border border-border-light bg-bg-card backdrop-blur-xl p-5 text-center hover:-translate-y-1 transition-transform">
              <span className="text-3xl block mb-2">{m.emoji}</span>
              <h3 className="font-cormorant text-base font-semibold text-text-primary mb-1">{m.name}</h3>
              <p className="text-[10px] font-quicksand font-bold tracking-wide uppercase text-accent-purple mb-2">{m.energy}</p>
              <p className="text-[11.5px] leading-snug text-text-secondary font-quicksand">{m.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ DAILY SELF-CARE ═══ */}
      <section className="max-w-[1100px] mx-auto px-6 py-16">
        <Eyebrow>Daily Guidance</Eyebrow>
        <h2 className="font-cormorant text-[clamp(32px,4.5vw,56px)] font-normal text-center text-text-primary leading-tight mb-4">
          Your phase tells you<br /><em className="italic text-accent-purple">exactly what you need</em>
        </h2>
        <p className="text-center text-base text-text-secondary font-quicksand font-medium max-w-[560px] mx-auto mb-9">
          Activities, emotions, affirmations, and journal prompts — specific to where you are right now.
        </p>
        {/* Life stage tabs (visual only) */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
          <span className="px-5 py-2 rounded-full text-xs font-quicksand font-bold bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-lg shadow-accent-purple/35">{"\uD83C\uDF19"} Regular Cycles</span>
          <span className="px-5 py-2 rounded-full text-xs font-quicksand font-bold border border-border-medium bg-bg-card text-text-secondary">{"\uD83C\uDF17"} Perimenopause</span>
          <span className="px-5 py-2 rounded-full text-xs font-quicksand font-bold border border-border-medium bg-bg-card text-text-secondary">{"\u2728"} Menopause</span>
          <span className="px-5 py-2 rounded-full text-xs font-quicksand font-bold border border-border-medium bg-bg-card text-text-secondary">{"\uD83C\uDF1F"} Post Menopause</span>
        </div>
        <p className="text-center text-xs text-text-muted font-quicksand italic mb-7">Within Regular Cycles, guidance shifts across all four phases: Menstrual &middot; Follicular &middot; Ovulatory &middot; Luteal</p>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          {selfCareCards.map((c) => (
            <motion.div key={c.title} variants={fadeUp} className="rounded-[20px] border border-border-light bg-bg-card backdrop-blur-xl p-5">
              <span className="text-[22px] block mb-2.5">{c.emoji}</span>
              <h4 className="text-sm font-quicksand font-bold text-text-primary mb-1">{c.title}</h4>
              <p className="text-xs leading-snug text-text-secondary font-quicksand">{c.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Affirmation */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-5 bg-gradient-to-r from-accent-purple/15 to-accent-pink/8 border border-border-medium rounded-[20px] p-7 text-center">
          <p className="text-[10px] font-quicksand font-bold tracking-[0.12em] uppercase text-text-muted mb-2.5">Today&apos;s Affirmation</p>
          <p className="font-cormorant text-[26px] font-normal italic text-text-primary leading-snug">
            &ldquo;I deserve rest and restoration.<br />Slowing down is a form of self-love.&rdquo;
          </p>
        </motion.div>
      </section>

      {/* ═══ LUNA AI ═══ */}
      <section id="luna-ai" className="max-w-[1100px] mx-auto px-6 py-24">
        <Eyebrow>Introducing LunaAI</Eyebrow>
        <h2 className="font-cormorant text-[clamp(32px,4.5vw,56px)] font-normal text-center text-text-primary leading-tight mb-4">
          A journal that<br /><em className="italic text-accent-purple">pays attention</em>
        </h2>
        <p className="text-center text-base text-text-secondary font-quicksand font-medium max-w-[560px] mx-auto mb-14">
          Most journals just store your words. LunaAI actually reads them — and writes back.
        </p>

        {/* Hero feature card */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-text-primary/[0.06] to-accent-pink/[0.04] border border-border-medium rounded-[32px] p-10 md:p-12 mb-6">
          <div>
            <p className="text-[11px] font-quicksand font-bold tracking-[0.12em] uppercase text-accent-purple mb-4">{"\u2726"} LunaAI Journal</p>
            <h3 className="font-cormorant text-[clamp(28px,3.5vw,44px)] font-normal text-text-primary leading-tight mb-4">
              Not advice.<br />Not a summary.<br />Just genuine attention.
            </h3>
            <p className="text-[15px] leading-relaxed text-text-secondary font-quicksand mb-8">
              You write. Luna reads your entry, notices one specific thing you said, and responds with a short, personal reflection — ending with a gentle question to invite deeper thought.
            </p>
            <div className="space-y-5">
              {[
                { icon: "\u270D\uFE0F", title: "You write freely", desc: "Free-form entry or phase-specific prompts tailored to where you are in your cycle right now" },
                { icon: "\uD83C\uDF19", title: "Luna responds", desc: "A short, personal reflection that sees something specific in what you wrote — then opens a door" },
                { icon: "\uD83D\uDCC8", title: "Your story builds", desc: "Streaks, entry counts, and Luna's reflections saved to your account — your inner life, remembered" },
              ].map((p) => (
                <div key={p.title} className="flex gap-3.5 items-start">
                  <span className="text-[22px] flex-shrink-0 mt-0.5">{p.icon}</span>
                  <div>
                    <p className="text-sm font-quicksand font-bold text-text-primary mb-0.5">{p.title}</p>
                    <p className="text-[13px] leading-snug text-text-secondary font-quicksand">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journal mockup */}
          <div className="bg-white rounded-3xl shadow-[0_24px_64px_rgba(74,52,133,0.16)] border border-border-light overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-quicksand font-bold text-accent-purple tracking-wide">{"\uD83C\uDF16"} Luteal Phase &middot; Day 22</span>
                <span className="text-[11px] font-quicksand font-bold text-amber-500">{"\uD83D\uDD25"} 7 day streak</span>
              </div>
              <div className="bg-bg-secondary rounded-xl p-3.5 mb-3.5">
                <p className="text-[9px] font-quicksand font-bold tracking-[0.1em] uppercase text-text-muted mb-1.5">Today&apos;s Prompt</p>
                <p className="font-cormorant text-[15px] italic text-text-primary leading-snug">&ldquo;What do you need to complete before your next cycle?&rdquo;</p>
              </div>
              <div className="bg-white/90 border-[1.5px] border-border-medium rounded-xl p-3.5 mb-3.5">
                <p className="text-[13px] leading-relaxed text-text-secondary font-quicksand italic">&ldquo;I keep starting things and not finishing them. I feel scattered and frustrated with myself. I just want to feel calm again...&rdquo;</p>
              </div>
              <div className="bg-gradient-to-r from-accent-purple/10 to-accent-pink/[0.06] border border-border-medium rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-base">{"\uD83C\uDF19"}</span>
                  <span className="text-[11px] font-quicksand font-bold tracking-[0.08em] uppercase text-accent-purple">Luna&apos;s reflection</span>
                </div>
                <p className="text-[13px] leading-relaxed text-text-primary font-quicksand italic">
                  &ldquo;You said you want to feel calm again — which means you know what calm feels like for you. That knowing is already wisdom. What&apos;s one small thing you could set down today that would bring you a little closer to it?&rdquo;
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Phase prompts */}
        <Eyebrow>Phase-Specific Prompts</Eyebrow>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {phasePrompts.map((p) => (
            <motion.div key={p.phase} variants={fadeUp} className={`rounded-2xl border border-border-light bg-bg-card backdrop-blur-xl p-5 border-t-[3px] ${p.border}`}>
              <p className="text-[11px] font-quicksand font-bold tracking-wide uppercase text-text-muted mb-2.5">{p.phase}</p>
              <p className="font-cormorant text-[17px] italic text-text-primary leading-snug">{p.prompt}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="bg-gradient-to-b from-transparent via-bg-secondary/45 to-transparent py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <Eyebrow>Real Women, Real Results</Eyebrow>
          <h2 className="font-cormorant text-[clamp(32px,4.5vw,56px)] font-normal text-center text-text-primary leading-tight mb-12">
            Every stage of life,<br /><em className="italic text-accent-purple">supported and seen</em>
          </h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-white rounded-3xl border border-border-light p-6 shadow-[0_4px_22px_rgba(74,52,133,0.06)] hover:-translate-y-1 transition-transform">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[14.5px] leading-relaxed text-text-secondary font-quicksand italic mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-[34px] h-[34px] rounded-full bg-gradient-to-br ${t.gradient}`} />
                  <div>
                    <p className="text-[13px] font-quicksand font-bold text-text-primary">{t.name}</p>
                    <p className="text-[11px] text-text-muted font-quicksand">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="max-w-[1100px] mx-auto px-6 py-20">
        <Eyebrow>Simple Pricing</Eyebrow>
        <h2 className="font-cormorant text-[clamp(32px,4.5vw,56px)] font-normal text-center text-text-primary leading-tight mb-12">
          Start free, upgrade<br />when you&apos;re <em className="italic text-accent-purple">ready</em>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free */}
          <div className="bg-white rounded-[28px] border border-border-light p-7">
            <p className="text-[11px] font-quicksand font-bold tracking-[0.1em] uppercase text-text-muted mb-2.5">Free Trial</p>
            <p className="font-cormorant text-[44px] font-light text-text-primary leading-none">$0 <span className="text-[14px] font-quicksand font-normal text-text-muted">/ 60 days</span></p>
            <p className="text-[13px] text-text-secondary font-quicksand mt-2.5 mb-6 leading-snug">Full access to everything. No credit card required.</p>
            <ul className="space-y-0 mb-6">
              {["All life stages", "Phase nutrition & movement", "Self-care & affirmations", "Moon phase wisdom", "Labs guide", "iOS & Web app"].map((f) => (
                <li key={f} className="flex items-center gap-2 py-2 border-b border-border-light text-[13px] text-text-secondary font-quicksand">
                  <span className="text-[9px] text-accent-purple flex-shrink-0">{"\u2726"}</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="block text-center py-3.5 rounded-2xl border-2 border-border-medium text-text-primary font-quicksand font-bold hover:-translate-y-0.5 transition-transform">
              Start Free Trial
            </Link>
          </div>
          {/* Monthly */}
          <div className="bg-white rounded-[28px] border border-border-light p-7">
            <p className="text-[11px] font-quicksand font-bold tracking-[0.1em] uppercase text-text-muted mb-2.5">Monthly</p>
            <p className="font-cormorant text-[44px] font-light text-text-primary leading-none">$6.99 <span className="text-[14px] font-quicksand font-normal text-text-muted">/ month</span></p>
            <p className="text-[13px] text-text-secondary font-quicksand mt-2.5 mb-6 leading-snug">Everything, unlimited. Cancel anytime.</p>
            <ul className="space-y-0 mb-6">
              {["Everything in Free", "Partner support & sharing", "Pattern analysis", "Advanced symptom tracking", "Unlimited history", "Community access"].map((f) => (
                <li key={f} className="flex items-center gap-2 py-2 border-b border-border-light text-[13px] text-text-secondary font-quicksand">
                  <span className="text-[9px] text-accent-purple flex-shrink-0">{"\u2726"}</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="block text-center py-3.5 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-bold hover:-translate-y-0.5 transition-transform">
              Get Monthly
            </Link>
          </div>
          {/* Annual */}
          <div className="relative bg-gradient-to-br from-[#3d2b75] to-[#6d4fc4] rounded-[28px] p-7 shadow-[0_28px_64px_rgba(61,43,117,0.38)]">
            <span className="absolute -top-2.5 right-5 px-3.5 py-1 rounded-full bg-gradient-to-r from-accent-pink to-accent-rose text-white text-[10px] font-quicksand font-extrabold tracking-wide uppercase">Best Value</span>
            <p className="text-[11px] font-quicksand font-bold tracking-[0.1em] uppercase text-white/60 mb-2.5">Annual</p>
            <p className="font-cormorant text-[44px] font-light text-white leading-none">$59.99 <span className="text-[14px] font-quicksand font-normal text-white/60">/ year</span></p>
            <p className="text-[13px] text-white/70 font-quicksand mt-2.5 mb-6 leading-snug">Save 29% — just $5/month. Best deal.</p>
            <ul className="space-y-0 mb-6">
              {["Everything in Free", "Partner support & sharing", "Pattern analysis", "Advanced symptom tracking", "Unlimited history", "Community access"].map((f) => (
                <li key={f} className="flex items-center gap-2 py-2 border-b border-white/15 text-[13px] text-white font-quicksand">
                  <span className="text-[9px] text-pink-300 flex-shrink-0">{"\u2726"}</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="block text-center py-3.5 rounded-2xl bg-white text-text-primary font-quicksand font-bold shadow-[0_4px_18px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 transition-transform">
              Get Annual — Save 29%
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ OUR PHILOSOPHY ═══ */}
      <section className="px-6 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-[720px] mx-auto">
          <Eyebrow>Our Philosophy</Eyebrow>
          <h2 className="font-cormorant text-[clamp(32px,5vw,52px)] font-light text-text-primary leading-[1.1] tracking-tight mb-8 text-center">
            Moon &amp; Body: A Beautiful Parallel,<br />Not a Scientific Claim
          </h2>
          <div className="space-y-5 text-[15px] leading-relaxed text-text-secondary font-quicksand">
            <p>
              Many ancient cultures observed a poetic parallel between the lunar cycle (about 29.5 days) and the average length of the menstrual cycle, inspiring stories, rituals, and traditions that linked women&apos;s bodies to the moon and the natural world. However, large-scale scientific research has found no consistent correlation or causal link between lunar phases and menstrual cycles or period timing. Studies analyzing millions of cycles (including data from popular period-tracking apps) show that any apparent alignments occur by chance rather than through any reliable synchronization influenced by the moon&apos;s light or gravity.
            </p>
            <p>
              Our app is not based on any medical or scientific claim that lunar phases control, predict, or alter your cycle. Instead, it is intentionally designed as a gentle invitation to reconnect with nature&apos;s rhythms while honoring your own. By weaving lunar phase awareness together with tracking the four key stages of a woman&apos;s life — menstrual/reproductive years, perimenopause, menopause, and postmenopause — we offer a space for mindfulness, self-awareness, and empowerment.
            </p>
            <p>
              Whether you&apos;re flowing with the moon&apos;s waxing and waning or navigating the beautiful transitions of your body across life&apos;s seasons, this tool is here to help you stay grounded in the natural world and deeply attuned to your personal rhythms — without any pseudoscience, just pure connection.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-6 pt-24 pb-32 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-[680px] mx-auto">
          <Eyebrow>Coming Soon</Eyebrow>
          <h2 className="font-cormorant text-[clamp(42px,6vw,78px)] font-light text-text-primary leading-[1.05] tracking-tight mb-4">
            You deserve a wellness app<br />that <em className="italic text-accent-pink">actually sees you.</em>
          </h2>
          <p className="text-[17px] leading-relaxed text-text-secondary font-quicksand font-medium mb-12">
            Whether you&apos;re 22 or 62, cycling or not — MyLunarPhase is built for the full, beautiful complexity of being a woman. iOS and web apps launching soon.
          </p>
          <div className="flex items-center justify-center gap-3.5 flex-wrap">
            <span className="inline-flex items-center gap-2.5 bg-text-primary text-white px-5 py-2.5 rounded-xl opacity-60">
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] fill-white flex-shrink-0"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              <span className="text-left"><span className="block text-[9px] font-normal opacity-75 leading-none">Coming Soon on the</span><span className="block text-[13px] font-semibold leading-snug">App Store</span></span>
            </span>
            <span className="inline-flex items-center gap-2.5 bg-text-primary text-white px-5 py-2.5 rounded-xl opacity-60">
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] fill-white flex-shrink-0"><path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" /></svg>
              <span className="text-left"><span className="block text-[9px] font-normal opacity-75 leading-none">Coming Soon on</span><span className="block text-[13px] font-semibold leading-snug">Google Play</span></span>
            </span>
            <Link href="/sign-up" className="inline-flex items-center gap-2.5 bg-gradient-to-r from-accent-purple to-accent-pink text-white px-5 py-2.5 rounded-xl hover:-translate-y-0.5 transition-transform">
              <Globe className="w-[19px] h-[19px]" />
              <span className="text-left"><span className="block text-[9px] font-normal opacity-75 leading-none">Use the</span><span className="block text-[13px] font-semibold leading-snug">Web App</span></span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border-light px-6 md:px-12 py-9 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-cormorant text-lg font-semibold text-text-primary">MyLunarPhase</span>
        <div className="flex items-center gap-6 text-[13px] text-text-muted font-quicksand">
          <Link href="/suggestions" className="hover:text-text-secondary transition-colors font-semibold text-accent-purple">Suggest a Feature</Link>
          <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-text-secondary transition-colors">Terms of Service</Link>
        </div>
        <p className="text-xs text-text-muted font-quicksand">&copy; {new Date().getFullYear()} MyLunarPhase. All rights reserved.</p>
      </footer>
    </GradientBackground>
  );
}
