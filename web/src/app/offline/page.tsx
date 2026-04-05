export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">🌙</div>
      <h1
        className="text-3xl mb-3"
        style={{ fontFamily: "var(--font-cormorant)", color: "var(--text-primary)" }}
      >
        You&apos;re offline
      </h1>
      <p
        className="text-base max-w-sm"
        style={{ fontFamily: "var(--font-quicksand)", color: "var(--text-secondary)" }}
      >
        No connection right now. The pages you&apos;ve visited recently are
        still available — check back when you&apos;re back online.
      </p>
    </div>
  );
}
