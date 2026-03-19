"use client";

import { motion } from "framer-motion";
import { lifeStageInfo } from "@/lib/cycle/data";
import type { LifeStage } from "@/lib/cycle/types";

interface LifeStagePickerProps {
  selected: LifeStage | null;
  onSelect: (stage: LifeStage) => void;
}

const stages: LifeStage[] = ["regular", "perimenopause", "menopause", "postmenopause"];

export function LifeStagePicker({ selected, onSelect }: LifeStagePickerProps) {
  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const info = lifeStageInfo[stage];
        const isSelected = selected === stage;
        return (
          <motion.button
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(stage)}
            className={`w-full flex items-center gap-4 p-4 rounded-[20px] border transition-colors text-left ${
              isSelected
                ? "border-accent-purple bg-accent-purple/10"
                : "border-border-light bg-bg-card hover:bg-bg-secondary/50"
            }`}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full text-2xl"
              style={{ backgroundColor: `${info.color}20` }}
            >
              {info.emoji}
            </div>
            <div className="flex-1">
              <h3 className="font-quicksand font-semibold text-text-primary">
                {info.name}
              </h3>
              <p className="text-xs text-text-muted font-quicksand mt-0.5">
                {info.ageRange}
              </p>
              <p className="text-sm text-text-secondary font-quicksand mt-1">
                {info.description}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
