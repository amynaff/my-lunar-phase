"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCycleStore } from "@/stores/cycle-store";

/**
 * Syncs the local cycle store with the server database.
 * - On mount: loads from server and merges with local data
 * - On changes: debounced save back to server
 *
 * This ensures cycle data persists across devices while
 * keeping the local store as the source of truth for fast UI.
 */
export function useCycleSync() {
  const store = useCycleStore();
  const hasLoaded = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const lastSavedJSON = useRef<string>("");

  // Load from server on mount
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    async function loadFromServer() {
      try {
        const res = await fetch("/api/cycle-data");
        if (!res.ok) return;

        const { cycleData } = await res.json();
        if (!cycleData) return;

        // Server data exists — merge it into local store
        // Server is the source of truth for persisted data
        const localStore = useCycleStore.getState();

        // If server has onboarding complete but local doesn't, use server data
        // If local has onboarding complete, it means user already set up on this device
        if (cycleData.hasCompletedOnboarding) {
          if (cycleData.lifeStage) {
            localStore.setLifeStage(cycleData.lifeStage);
          }
          if (cycleData.cycleLength) {
            localStore.setCycleLength(cycleData.cycleLength);
          }
          if (cycleData.periodLength) {
            localStore.setPeriodLength(cycleData.periodLength);
          }
          if (cycleData.lastPeriodStart) {
            localStore.setLastPeriodStart(new Date(cycleData.lastPeriodStart));
          }
          if (!localStore.hasCompletedOnboarding) {
            localStore.completeOnboarding();
          }
        }
      } catch {
        // Silently fail — local data is still available
      }
    }

    loadFromServer();
  }, []);

  // Save to server on changes (debounced)
  const saveToServer = useCallback(() => {
    const state = useCycleStore.getState();

    const payload = {
      lifeStage: state.lifeStage,
      cycleLength: state.cycleLength,
      periodLength: state.periodLength,
      lastPeriodStart: state.lastPeriodStart,
      periodLogs: state.periodLogs,
      hasCompletedOnboarding: state.hasCompletedOnboarding,
    };

    const payloadJSON = JSON.stringify(payload);

    // Skip if nothing changed
    if (payloadJSON === lastSavedJSON.current) return;
    lastSavedJSON.current = payloadJSON;

    fetch("/api/cycle-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payloadJSON,
    }).catch(() => {
      // Silently fail — will retry on next change
      lastSavedJSON.current = "";
    });
  }, []);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useCycleStore.subscribe(() => {
      // Debounce saves to avoid hammering the API
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(saveToServer, 2000);
    });

    return () => {
      unsubscribe();
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [saveToServer]);
}
