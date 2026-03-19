"use client";

import { useState } from "react";

interface CycleConfigProps {
  onComplete: (data: { lastPeriodStart: Date; cycleLength: number; periodLength: number }) => void;
}

export function CycleConfig({ onComplete }: CycleConfigProps) {
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  function handleSubmit() {
    if (!lastPeriodStart) return;
    onComplete({
      lastPeriodStart: new Date(lastPeriodStart),
      cycleLength,
      periodLength,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Last Period Start Date
        </label>
        <input
          type="date"
          value={lastPeriodStart}
          onChange={(e) => setLastPeriodStart(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-full mt-2 px-4 py-3.5 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand focus:outline-none focus:border-accent-purple"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Cycle Length: {cycleLength} days
        </label>
        <input
          type="range"
          min={21}
          max={40}
          value={cycleLength}
          onChange={(e) => setCycleLength(Number(e.target.value))}
          className="w-full mt-2 accent-accent-purple"
        />
        <div className="flex justify-between text-[10px] text-text-muted font-quicksand mt-1">
          <span>21 days</span>
          <span>40 days</span>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Period Length: {periodLength} days
        </label>
        <input
          type="range"
          min={2}
          max={10}
          value={periodLength}
          onChange={(e) => setPeriodLength(Number(e.target.value))}
          className="w-full mt-2 accent-accent-pink"
        />
        <div className="flex justify-between text-[10px] text-text-muted font-quicksand mt-1">
          <span>2 days</span>
          <span>10 days</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!lastPeriodStart}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
