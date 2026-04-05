async function initSentry() {
  try {
    const Sentry = await import("@sentry/nextjs");

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      enabled: process.env.NODE_ENV === "production",
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.01,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
  } catch {
    // @sentry/nextjs not installed
  }
}

initSentry();
