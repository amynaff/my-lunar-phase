"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Moon, Heart, Sparkles, Apple, Dumbbell, Users, FlaskConical, Shield } from "lucide-react";
import { PricingCards } from "@/components/subscription/pricing-cards";
import { GradientBackground } from "@/components/shared/gradient-background";

const features = [
  { icon: Moon, title: "Cycle & Moon Tracking", description: "Track your menstrual cycle and sync with moon phases for deeper wisdom." },
  { icon: Sparkles, title: "Luna AI", description: "Personal AI wellness companion with phase-specific guidance." },
  { icon: Apple, title: "Nutrition Guidance", description: "Phase-optimized nutrition recommendations and grocery lists." },
  { icon: Dumbbell, title: "Movement Plans", description: "Exercise suggestions tailored to your current phase." },
  { icon: Heart, title: "Self-Care", description: "Journaling prompts, affirmations, and self-care rituals." },
  { icon: Users, title: "Partner Support", description: "Share cycle insights with your partner for better understanding." },
  { icon: FlaskConical, title: "Labs Guide", description: "Know which hormone tests to request and when." },
  { icon: Shield, title: "All Life Stages", description: "Support for regular cycles, perimenopause, menopause, and beyond." },
];

export default function LandingPage() {
  return (
    <GradientBackground>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-bg-card-solid/90 backdrop-blur border-b border-border-light">
        <Link href="/" className="flex items-center gap-2">
          <Moon className="h-6 w-6 text-accent-purple" />
          <span className="font-cormorant text-xl font-semibold text-text-primary">
            MyLunarPhase
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-quicksand font-medium text-text-secondary hover:text-text-primary">
            Sign In
          </Link>
          <Link href="/sign-up" className="px-5 py-2 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white text-sm font-quicksand font-semibold">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-cormorant text-5xl lg:text-7xl font-semibold text-text-primary leading-tight">
            Honor Your Body&apos;s
            <br />
            <span className="bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">
              Natural Rhythm
            </span>
          </h1>
          <p className="mt-6 text-lg text-text-secondary font-quicksand max-w-2xl mx-auto">
            A comprehensive women&apos;s hormone wellness platform with personalized nutrition,
            movement, self-care, AI reflection, moon phase wisdom, and partner support.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/sign-up" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold text-lg hover:opacity-90 transition-opacity">
              Start Free
            </Link>
            <Link href="#features" className="px-8 py-4 rounded-2xl border border-border-light text-text-secondary font-quicksand font-semibold hover:bg-bg-secondary transition-colors">
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-cormorant text-3xl lg:text-4xl font-semibold text-text-primary">
            Everything You Need
          </h2>
          <p className="mt-3 text-text-secondary font-quicksand">Support for every stage of your wellness journey</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-[20px] border border-border-light bg-bg-card"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-purple/15 mb-4">
                <Icon className="h-6 w-6 text-accent-purple" />
              </div>
              <h3 className="font-quicksand font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-sm text-text-secondary font-quicksand">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-cormorant text-3xl lg:text-4xl font-semibold text-text-primary">Simple Pricing</h2>
          <p className="mt-3 text-text-secondary font-quicksand">Start free, upgrade when you&apos;re ready</p>
        </div>
        <PricingCards />
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light bg-bg-card-solid">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-accent-purple" />
            <span className="font-cormorant text-lg font-semibold text-text-primary">MyLunarPhase</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-secondary font-quicksand">
            <Link href="/privacy" className="hover:text-text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-text-primary">Terms of Service</Link>
          </div>
          <p className="text-xs text-text-muted font-quicksand">
            &copy; {new Date().getFullYear()} MyLunarPhase. All rights reserved.
          </p>
        </div>
      </footer>
    </GradientBackground>
  );
}
