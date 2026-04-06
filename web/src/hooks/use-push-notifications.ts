"use client";

import { useState, useCallback } from "react";

export type PushState = "unsupported" | "denied" | "granted" | "default" | "loading";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>("default");

  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setState("unsupported");
      return false;
    }

    setState("loading");

    try {
      const keyRes = await fetch("/api/push/vapid-public-key");
      if (!keyRes.ok) {
        setState("default");
        return false;
      }
      const { publicKey } = await keyRes.json();

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission as PushState);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
      });

      const sub = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys?.p256dh, auth: sub.keys?.auth },
        }),
      });

      setState("granted");
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      setState("default");
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      await subscription.unsubscribe();
      setState("default");
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
  }, [isSupported]);

  const checkState = useCallback(async () => {
    if (!isSupported) {
      setState("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "granted") {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setState(sub ? "granted" : "default");
    } else {
      setState(perm as PushState);
    }
  }, [isSupported]);

  return { state, isSupported, subscribe, unsubscribe, checkState };
}
