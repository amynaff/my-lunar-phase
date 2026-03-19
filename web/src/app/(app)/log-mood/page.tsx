"use client";

import { motion } from "framer-motion";
import { Smile, Calendar } from "lucide-react";
import { MoodEntryForm } from "@/components/mood/mood-entry-form";
import { MoodHeatmap } from "@/components/mood/mood-heatmap";

export default function LogMoodPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
            <Smile className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Log Mood
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              Track your mood and energy over time
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Smile className="h-4 w-4 text-accent-pink" />
            <h2 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
              Today&apos;s Entry
            </h2>
          </div>
          <MoodEntryForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-accent-purple" />
            <h2 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
              Mood Calendar
            </h2>
          </div>
          <MoodHeatmap />
        </motion.div>
      </div>
    </div>
  );
}
