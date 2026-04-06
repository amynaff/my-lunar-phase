async function initSentry() {
  try {
    const Sentry = await import("@sentry/nextjs");

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      enabled: process.env.NODE_ENV === "production",
      tracesSampleRate: 0.1,
    });
  } catch {
    // @sentry/nextjs not installed
  }
}

initSentry();

export {};
