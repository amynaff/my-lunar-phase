"use client";

import { Moon } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg-primary">
      <Moon className="h-16 w-16 text-accent-pink mb-6" />
      <h1 className="font-cormorant text-4xl font-semibold text-text-primary mb-2">
        Something went wrong
      </h1>
      <p className="text-text-secondary font-quicksand mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold"
      >
        Try Again
      </button>
    </div>
  );
}
