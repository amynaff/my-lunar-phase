"use client";

import { motion } from "framer-motion";
import type { CyclePhase } from "@/lib/cycle/types";

interface CycleWheelProps {
  currentPhase: CyclePhase;
  dayOfCycle: number;
  cycleLength: number;
  phaseProgress: number;
}

const phases: Array<{ phase: CyclePhase; color: string; label: string; startAngle: number; sweepAngle: number }> = [
  { phase: "menstrual", color: "#be185d", label: "Menstrual", startAngle: -90, sweepAngle: 64 },
  { phase: "follicular", color: "#ec4899", label: "Follicular", startAngle: -26, sweepAngle: 103 },
  { phase: "ovulatory", color: "#f9a8d4", label: "Ovulatory", startAngle: 77, sweepAngle: 51 },
  { phase: "luteal", color: "#9333ea", label: "Luteal", startAngle: 128, sweepAngle: 142 },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function CycleWheel({ currentPhase, dayOfCycle, cycleLength }: CycleWheelProps) {
  const cx = 120;
  const cy = 120;
  const r = 95;
  const strokeWidth = 18;

  const dayAngle = -90 + (dayOfCycle / cycleLength) * 360;
  const indicator = polarToCartesian(cx, cy, r, dayAngle);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center"
    >
      <svg width={240} height={240} viewBox="0 0 240 240">
        {phases.map(({ phase, color, startAngle, sweepAngle }) => (
          <path
            key={phase}
            d={describeArc(cx, cy, r, startAngle, startAngle + sweepAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={phase === currentPhase ? 1 : 0.35}
          />
        ))}

        {/* Day indicator */}
        <motion.circle
          cx={indicator.x}
          cy={indicator.y}
          r={12}
          fill="white"
          stroke={phases.find((p) => p.phase === currentPhase)?.color || "#9d84ed"}
          strokeWidth={3}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
        />

        {/* Center text */}
        <text x={cx} y={cy - 12} textAnchor="middle" fill="var(--text-primary)" fontSize="32" fontWeight="600" fontFamily="var(--font-cormorant)">
          Day {dayOfCycle}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-secondary)" fontSize="13" fontFamily="var(--font-quicksand)">
          of {cycleLength}
        </text>
      </svg>
    </motion.div>
  );
}
