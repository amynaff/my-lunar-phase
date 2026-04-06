"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMoonPhase, getMoonPhaseCycleEquivalent } from "@/lib/cycle/moon-phase";
import { moonPhaseInfo, moonEnergyLabels } from "@/lib/cycle/data";
import type { CyclePhase, LifeStage, MoonPhase } from "@/lib/cycle/types";
import { useMoodStore, getMoodColor } from "@/stores/mood-store";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

interface CycleDay {
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
}

interface MoonCalendarProps {
  isRegular: boolean;
  lifeStage?: LifeStage;
  lastPeriodStart: string | null;
  cycleLength: number;
  periodLength: number;
  onSetPeriodStart?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

function getMoonEmoji(phase: MoonPhase): string {
  return moonPhaseInfo[phase].emoji;
}

function getCycleDayInfo(
  date: Date,
  lastPeriodStart: string | null,
  cycleLength: number,
  periodLength: number
): CycleDay {
  if (!lastPeriodStart) return { isPeriod: false, isFertile: false, isOvulation: false };

  const start = new Date(lastPeriodStart);
  const diffMs = date.getTime() - start.getTime();
  const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const dayOfCycle = ((daysSince % cycleLength) + cycleLength) % cycleLength + 1;

  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay + 1;

  return {
    isPeriod: dayOfCycle <= periodLength,
    isFertile: dayOfCycle >= fertileStart && dayOfCycle <= fertileEnd,
    isOvulation: dayOfCycle === ovulationDay,
  };
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

const moonEnergyColors: Record<string, string> = {
  menstrual: "#1e1b4b",    // New Moon — deep indigo
  follicular: "#6d28d9",   // Waxing — violet
  ovulatory: "#f5f3ff",    // Full Moon — luminous
  luteal: "#a78bfa",       // Waning — soft purple
};

export function MoonCalendar({
  isRegular,
  lifeStage,
  lastPeriodStart,
  cycleLength,
  periodLength,
  onSetPeriodStart,
  onDayClick,
}: MoonCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const moodEntries = useMoodStore((s) => s.entries);

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });

  const isMoonOnly = lifeStage === "menopause" || lifeStage === "postmenopause";

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
    const days: Array<{
      date: Date | null;
      day: number;
      moonPhase: MoonPhase;
      moonEmoji: string;
      moonEnergy: CyclePhase;
      cycle: CycleDay;
      isToday: boolean;
    }> = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, day: 0, moonPhase: "new_moon", moonEmoji: "", moonEnergy: "menstrual", cycle: { isPeriod: false, isFertile: false, isOvulation: false }, isToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const moonPhase = getMoonPhase(date);
      const cycle = isRegular
        ? getCycleDayInfo(date, lastPeriodStart, cycleLength, periodLength)
        : { isPeriod: false, isFertile: false, isOvulation: false };
      const isToday =
        d === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      days.push({
        date,
        day: d,
        moonPhase,
        moonEmoji: getMoonEmoji(moonPhase),
        moonEnergy: getMoonPhaseCycleEquivalent(moonPhase) as CyclePhase,
        cycle,
        isToday,
      });
    }

    return days;
  }, [currentMonth, currentYear, isRegular, lastPeriodStart, cycleLength, periodLength, today]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleDayClick(date: Date | null) {
    if (!date) return;
    if (onDayClick) {
      onDayClick(date);
      return;
    }
    // Default: navigate to journal for that date
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    router.push(`/journal?date=${dateStr}`);
  }

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card shadow-sm p-5 sm:p-8">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={prevMonth}
          className="p-2.5 rounded-full hover:bg-bg-secondary transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-text-secondary" />
        </button>
        <h2 className="font-cormorant text-2xl font-semibold text-text-primary">
          {monthName} {currentYear}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2.5 rounded-full hover:bg-bg-secondary transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-text-secondary" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {WEEKDAYS.map((day, i) => (
          <div
            key={i}
            className="text-center text-sm font-quicksand font-semibold text-text-muted py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((cell, i) => {
          if (!cell.date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const isPeriod = cell.cycle.isPeriod;
          const isFertile = cell.cycle.isFertile && !isPeriod;
          const isOvulation = cell.cycle.isOvulation;
          const energyColor = isMoonOnly ? moonEnergyColors[cell.moonEnergy] : undefined;
          const dateStr = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, "0")}-${String(cell.date.getDate()).padStart(2, "0")}`;
          const logEntry = moodEntries[dateStr];
          const moodDotColor = logEntry ? getMoodColor(logEntry.mood) : null;

          return (
            <motion.button
              key={cell.day}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleDayClick(cell.date)}
              className={`
                relative flex flex-col items-center justify-center aspect-square rounded-full
                transition-colors text-sm font-quicksand cursor-pointer hover:bg-bg-secondary/60
                ${!isMoonOnly && isPeriod ? "bg-accent-pink/20" : ""}
                ${!isMoonOnly && isFertile ? "bg-accent-lavender/20" : ""}
                ${!isMoonOnly && isOvulation ? "ring-2 ring-accent-purple/40" : ""}
                ${cell.isToday ? "ring-2 ring-accent-purple" : ""}
              `}
              style={isMoonOnly ? { backgroundColor: `${energyColor}12` } : undefined}
            >
              <span
                className={`
                  text-sm font-medium leading-none
                  ${!isMoonOnly && isPeriod ? "text-accent-pink font-bold" : "text-text-secondary"}
                  ${cell.isToday ? "text-accent-purple font-bold" : ""}
                `}
              >
                {cell.day}
              </span>
              <span className="text-lg leading-none mt-0.5">{cell.moonEmoji}</span>
              {moodDotColor && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: moodDotColor }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-5 justify-center">
        {isRegular ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-accent-pink/30" />
              <span className="text-xs text-text-muted font-quicksand">Period</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-accent-lavender/30" />
              <span className="text-xs text-text-muted font-quicksand">Fertile</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full ring-2 ring-accent-purple/40" />
              <span className="text-xs text-text-muted font-quicksand">Ovulation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full ring-2 ring-accent-purple" />
              <span className="text-xs text-text-muted font-quicksand">Today</span>
            </div>
          </>
        ) : isMoonOnly ? (
          <>
            {(["menstrual", "follicular", "ovulatory", "luteal"] as CyclePhase[]).map((phase) => (
              <div key={phase} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moonEnergyColors[phase] }} />
                <span className="text-xs text-text-muted font-quicksand">{moonEnergyLabels[phase].name}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full ring-2 ring-accent-purple" />
              <span className="text-xs text-text-muted font-quicksand">Today</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full ring-2 ring-accent-purple" />
            <span className="text-xs text-text-muted font-quicksand">Today</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
        <span className="text-xs text-text-muted font-quicksand">Logged day</span>
      </div>
      <p className="text-center text-xs text-text-muted font-quicksand mt-2">
        Tap any date to open your journal
      </p>
      {!isRegular && (
        <p className="text-center text-xs text-text-muted font-quicksand mt-1 italic">
          Follow the moon&apos;s natural rhythm — new moons for intention, full moons for release
        </p>
      )}
    </div>
  );
}
