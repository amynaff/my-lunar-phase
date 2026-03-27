"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMoodStore, getMoodColor } from "@/stores/mood-store";
import { getMoonPhase } from "@/lib/cycle/moon-phase";
import { moonPhaseInfo } from "@/lib/cycle/data";

export function MoodHeatmap() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { entries } = useMoodStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number | null; date: string; mood?: number; moonEmoji: string }> = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, date: "", moonEmoji: "" });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const entry = entries[dateStr];
      const dateObj = new Date(year, month, d);
      const moonPhase = getMoonPhase(dateObj);
      const moonEmoji = moonPhaseInfo[moonPhase].emoji;
      cells.push({ day: d, date: dateStr, mood: entry?.mood, moonEmoji });
    }

    return cells;
  }, [year, month, entries]);

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          className="p-1.5 rounded-lg hover:bg-bg-secondary"
        >
          <ChevronLeft className="h-4 w-4 text-text-secondary" />
        </button>
        <h3 className="font-cormorant text-lg font-semibold text-text-primary">
          {monthName} {year}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1))}
          className="p-1.5 rounded-lg hover:bg-bg-secondary"
        >
          <ChevronRight className="h-4 w-4 text-text-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-text-muted font-quicksand font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, i) => (
          <div
            key={i}
            className="aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-quicksand"
            style={{
              backgroundColor: cell.mood ? `${getMoodColor(cell.mood)}30` : undefined,
              color: cell.mood ? getMoodColor(cell.mood) : "var(--text-muted)",
            }}
          >
            {cell.day && (
              <>
                <span className="text-[10px] leading-none font-medium">{cell.day}</span>
                <span className="text-[11px] leading-none mt-0.5">{cell.moonEmoji}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: `${getMoodColor(level)}50` }}
            />
            <span className="text-[10px] text-text-muted font-quicksand">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
