import { Moon } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="flex items-center gap-2 px-6 py-4 border-b border-border-light">
        <Link href="/" className="flex items-center gap-2">
          <Moon className="h-6 w-6 text-accent-purple" />
          <span className="font-cormorant text-xl font-semibold text-text-primary">MyLunarPhase</span>
        </Link>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-cormorant text-4xl font-semibold text-text-primary mb-8">Terms of Service</h1>
        <div className="prose prose-sm font-quicksand text-text-secondary space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Acceptance of Terms</h2>
          <p>By using MyLunarPhase, you agree to these terms. If you do not agree, please do not use the service.</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Service Description</h2>
          <p>MyLunarPhase is a wellness platform that provides cycle tracking, nutrition guidance, movement recommendations, and AI-powered wellness support. It is not a medical service and should not replace professional medical advice.</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Medical Disclaimer</h2>
          <p>MyLunarPhase is for informational and educational purposes only. Always consult with a qualified healthcare provider for medical advice, diagnosis, or treatment.</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Subscriptions</h2>
          <p>Premium subscriptions are billed monthly or annually. You can cancel at any time. Refunds are handled on a case-by-case basis.</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Community Guidelines</h2>
          <p>Community posts are anonymous and must be respectful. We reserve the right to remove content that violates our community standards.</p>
          <h2 className="font-cormorant text-2xl text-text-primary">Account Termination</h2>
          <p>You can delete your account at any time. We reserve the right to terminate accounts that violate these terms.</p>
        </div>
      </div>
    </div>
  );
}
