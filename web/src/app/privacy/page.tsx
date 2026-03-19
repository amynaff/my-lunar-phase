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
        <h1 className="font-cormorant text-4xl font-semibold text-text-primary mb-8">Privacy Policy</h1>
        <div className="prose prose-sm font-quicksand text-text-secondary space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Information We Collect</h2>
          <p>We collect information you provide directly, including your email address, cycle data, mood entries, and wellness preferences. This data is used solely to provide personalized wellness recommendations.</p>
          <h2 className="font-cormorant text-2xl text-text-primary">How We Use Your Information</h2>
          <p>Your data is used to personalize your wellness experience, provide AI-powered recommendations, and sync data with connected partners (with your explicit consent).</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Data Security</h2>
          <p>We use industry-standard encryption and security measures to protect your personal health data. Your cycle and mood data is encrypted at rest and in transit.</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Data Sharing</h2>
          <p>We never sell your personal data. Partner data sharing is opt-in and can be revoked at any time. Anonymous community posts cannot be traced back to your account.</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Your Rights</h2>
          <p>You can delete your account and all associated data at any time from Settings. You can export your data before deletion.</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Contact</h2>
          <p>For privacy questions, email privacy@mylunarphase.com.</p>
        </div>
      </div>
    </div>
  );
}
