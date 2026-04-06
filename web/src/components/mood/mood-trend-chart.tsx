"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { useMoodStore } from "@/stores/mood-store";

const W = 560;
const H = 160;
const PAD = { top: 16, right: 16, bottom: 28, left: 28 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

function toX(i: number, total: number) {
  return PAD.left + (i / (total - 1)) * IW;
}
function toY(val: number) {
  // val 1–5 → IH → 0
  return PAD.top + IH - ((val - 1) / 4) * IH;
}
function buildPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

export function MoodTrendChart() {
  const { entries } = useMoodStore();

  const days = useMemo(() => {
    const result: Array<{
      label: string;
      dayLabel: string;
      mood: number | null;
      energy: number | null;
    }> = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split("T")[0];
      const entry = entries[str];
      result.push({
        label: str,
        dayLabel: d.getDate().toString(),
        mood: entry?.mood ?? null,
        energy: entry?.energy ?? null,
      });
    }
    return result;
  }, [entries]);

  const moodPoints = days
    .map((d, i) => (d.mood !== null ? { x: toX(i, 30), y: toY(d.mood) } : null))
    .filter(Boolean) as Array<{ x: number; y: number }>;

  const energyPoints = days
    .map((d, i) => (d.energy !== null ? { x: toX(i, 30), y: toY(d.energy) } : null))
    .filter(Boolean) as Array<{ x: number; y: number }>;

  const avgMood =
    moodPoints.length > 0
      ? moodPoints.reduce((s, p) => s + p.y, 0) / moodPoints.length
      : null;

  // X-axis tick indices: 0, 7, 14, 21, 29
  const xTicks = [0, 7, 14, 21, 29];

  const hasSomeData = moodPoints.length > 0 || energyPoints.length > 0;

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-accent-purple" />
        <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          30-Day Trend
        </h3>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full bg-accent-pink" />
            <span className="text-[10px] text-text-muted font-quicksand">Mood</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full bg-accent-purple" />
            <span className="text-[10px] text-text-muted font-quicksand">Energy</span>
          </div>
        </div>
      </div>

      {!hasSomeData ? (
        <div className="flex items-center justify-center h-24 text-text-muted text-xs font-quicksand">
          Start logging to see your trends here
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: H }}
          aria-hidden="true"
        >
          {/* Y-axis gridlines + labels */}
          {[1, 2, 3, 4, 5].map((val) => {
            const y = toY(val);
            return (
              <g key={val}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={W - PAD.right}
                  y2={y}
                  stroke="var(--border-light)"
                  strokeWidth={1}
                  strokeDasharray={val === 3 ? "none" : "3 3"}
                />
                <text
                  x={PAD.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={9}
                  fill="var(--text-muted)"
                  fontFamily="var(--font-quicksand)"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X-axis tick labels */}
          {xTicks.map((idx) => (
            <text
              key={idx}
              x={toX(idx, 30)}
              y={H - 4}
              textAnchor="middle"
              fontSize={9}
              fill="var(--text-muted)"
              fontFamily="var(--font-quicksand)"
            >
              {days[idx]?.dayLabel}
            </text>
          ))}

          {/* Average mood line */}
          {avgMood !== null && (
            <line
              x1={PAD.left}
              y1={avgMood}
              x2={W - PAD.right}
              y2={avgMood}
              stroke="#ec4899"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.35}
            />
          )}

          {/* Mood line */}
          {moodPoints.length > 1 && (
            <path
              d={buildPath(moodPoints)}
              fill="none"
              stroke="#ec4899"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Energy line */}
          {energyPoints.length > 1 && (
            <path
              d={buildPath(energyPoints)}
              fill="none"
              stroke="#9333ea"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Mood dots */}
          {moodPoints.map((p, i) => (
            <circle key={`m${i}`} cx={p.x} cy={p.y} r={3} fill="#ec4899" />
          ))}

          {/* Energy dots */}
          {energyPoints.map((p, i) => (
            <circle key={`e${i}`} cx={p.x} cy={p.y} r={3} fill="#9333ea" />
          ))}
        </svg>
      )}
    </div>
  );
}
