/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Handle incoming push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload: { title?: string; body?: string; url?: string } = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { body: event.data.text() };
  }

  const title = payload.title ?? "My Lunar Phase";
  const options: NotificationOptions = {
    body: payload.body ?? "Time to log your daily wellness check-in 🌙",
    icon: "/icon-192.png",
    badge: "/apple-touch-icon.png",
    data: { url: payload.url ?? "/log" },
    tag: "daily-reminder",
    renotify: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Open the app when a notification is clicked
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url: string = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const existing = windowClients.find((c) => c.url.includes(url));
        if (existing) return existing.focus();
        return self.clients.openWindow(url);
      })
  );
});
