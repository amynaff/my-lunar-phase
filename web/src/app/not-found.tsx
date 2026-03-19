import Link from "next/link";
import { Moon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg-primary">
      <Moon className="h-16 w-16 text-accent-lavender mb-6" />
      <h1 className="font-cormorant text-4xl font-semibold text-text-primary mb-2">
        Page Not Found
      </h1>
      <p className="text-text-secondary font-quicksand mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
