"use client";

export function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%, var(--bg-primary) 100%)",
        }}
      />
      {children}
    </div>
  );
}
