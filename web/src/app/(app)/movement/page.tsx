"use client";

import { motion } from "framer-motion";
import { Dumbbell, Clock, Flame, Zap } from "lucide-react";
import { useCycleData } from "@/hooks/use-cycle-data";
import { phaseInfo, moonPhaseInfo } from "@/lib/cycle/data";
import type { CyclePhase } from "@/lib/cycle/types";
import type { MoonPhase } from "@/lib/cycle/types";

interface Exercise {
  name: string;
  description: string;
  duration: string;
  intensity: "Low" | "Moderate" | "High" | "Low-Moderate" | "Moderate-High";
}

const phaseExercises: Record<CyclePhase, { overview: string; exercises: Exercise[] }> = {
  menstrual: {
    overview:
      "Honor your body's need for rest. Gentle movement helps ease cramps and lift your mood without draining your reserves.",
    exercises: [
      {
        name: "Restorative Yoga",
        description:
          "Gentle poses focusing on hip openers and forward folds. Child's pose, supine twist, and legs up the wall.",
        duration: "20-30 min",
        intensity: "Low",
      },
      {
        name: "Gentle Stretching",
        description:
          "Full-body stretching sequence to relieve tension. Focus on lower back, hips, and shoulders.",
        duration: "15-20 min",
        intensity: "Low",
      },
      {
        name: "Leisurely Walks",
        description:
          "Slow-paced walks in nature. Fresh air and gentle movement boost circulation without overexertion.",
        duration: "20-40 min",
        intensity: "Low",
      },
      {
        name: "Breathwork & Meditation",
        description:
          "Deep breathing exercises and guided meditation. Box breathing or 4-7-8 technique for relaxation.",
        duration: "10-15 min",
        intensity: "Low",
      },
    ],
  },
  follicular: {
    overview:
      "Your energy is building! This is the perfect time to try new activities and challenge yourself with upbeat movement.",
    exercises: [
      {
        name: "Dance Cardio",
        description:
          "High-energy dance workouts that match your rising mood. Zumba, dance fitness, or freestyle dancing.",
        duration: "30-45 min",
        intensity: "Moderate",
      },
      {
        name: "Hiking",
        description:
          "Explore trails and connect with nature. Moderate inclines build endurance as your stamina increases.",
        duration: "45-90 min",
        intensity: "Moderate",
      },
      {
        name: "Pilates",
        description:
          "Core-strengthening and flexibility work. Mat or reformer Pilates to build foundational strength.",
        duration: "30-45 min",
        intensity: "Moderate",
      },
      {
        name: "Cycling",
        description:
          "Indoor or outdoor cycling at a moderate pace. Great for cardiovascular health and leg strength.",
        duration: "30-45 min",
        intensity: "Moderate",
      },
    ],
  },
  ovulatory: {
    overview:
      "You are at your peak performance window. Push your limits with high-intensity workouts and enjoy group activities.",
    exercises: [
      {
        name: "HIIT Training",
        description:
          "High-intensity interval training with bursts of effort. Tabata, circuit training, or bootcamp-style workouts.",
        duration: "25-40 min",
        intensity: "High",
      },
      {
        name: "Running",
        description:
          "Tempo runs, interval sprints, or longer distance runs. Your endurance and speed peak during ovulation.",
        duration: "30-60 min",
        intensity: "High",
      },
      {
        name: "Swimming",
        description:
          "Vigorous laps or water aerobics. Low-impact on joints while providing a full-body workout.",
        duration: "30-45 min",
        intensity: "High",
      },
      {
        name: "Group Sports",
        description:
          "Team activities like volleyball, basketball, or tennis. Social energy is high during this phase.",
        duration: "45-60 min",
        intensity: "High",
      },
    ],
  },
  luteal: {
    overview:
      "As energy begins to wind down, shift to strength training and moderate-intensity activities. Listen to your body in the second half.",
    exercises: [
      {
        name: "Strength Training",
        description:
          "Moderate weight lifting focusing on compound movements. Squats, deadlifts, rows, and presses.",
        duration: "30-45 min",
        intensity: "Moderate",
      },
      {
        name: "Moderate Cardio",
        description:
          "Steady-state cardio at a comfortable pace. Elliptical, brisk walking, or light jogging.",
        duration: "30-40 min",
        intensity: "Moderate",
      },
      {
        name: "Tai Chi",
        description:
          "Flowing, meditative movements that reduce stress and improve balance. Perfect for the winding-down phase.",
        duration: "20-30 min",
        intensity: "Low",
      },
      {
        name: "Yin Yoga",
        description:
          "Longer holds targeting connective tissue. Deep stretching and mental calm as your body prepares for menstruation.",
        duration: "30-45 min",
        intensity: "Low",
      },
    ],
  },
};

const moonExercises: Record<MoonPhase, { overview: string; exercises: Exercise[] }> = {
  new_moon: {
    overview:
      "Rest and restore. The new moon invites deep stillness and renewal. Prioritize gentle movement that calms the nervous system and supports recovery.",
    exercises: [
      {
        name: "Gentle Stretching",
        description:
          "A slow, full-body stretching sequence to release tension. Focus on hips, shoulders, and spine with long, easy holds.",
        duration: "15-20 min",
        intensity: "Low",
      },
      {
        name: "Restorative Yoga",
        description:
          "Supported poses using bolsters and blankets. Legs up the wall, reclined butterfly, and supported child's pose.",
        duration: "20-30 min",
        intensity: "Low",
      },
      {
        name: "Meditation",
        description:
          "Guided meditation focused on intention-setting and deep relaxation. A quiet practice to center your mind.",
        duration: "10-20 min",
        intensity: "Low",
      },
      {
        name: "Breathwork",
        description:
          "Calming breathing exercises such as box breathing or 4-7-8 technique. Helps reduce stress and promote restful sleep.",
        duration: "10-15 min",
        intensity: "Low",
      },
    ],
  },
  waxing_crescent: {
    overview:
      "Gentle building energy. The waxing crescent encourages you to start moving with care. Ease into activity that builds strength and flexibility without strain.",
    exercises: [
      {
        name: "Walking",
        description:
          "A brisk but comfortable walk outdoors. Great for bone health, circulation, and clearing the mind.",
        duration: "20-30 min",
        intensity: "Low-Moderate",
      },
      {
        name: "Beginner Pilates",
        description:
          "Foundational Pilates exercises focusing on core stability, posture, and pelvic floor strength.",
        duration: "20-30 min",
        intensity: "Low-Moderate",
      },
      {
        name: "Gentle Yoga Flow",
        description:
          "A slow vinyasa sequence linking breath and movement. Sun salutations at an easy pace with modifications as needed.",
        duration: "25-35 min",
        intensity: "Low-Moderate",
      },
      {
        name: "Tai Chi",
        description:
          "Flowing, meditative movements that improve balance, joint mobility, and reduce stress. Perfect for easing into activity.",
        duration: "20-30 min",
        intensity: "Low-Moderate",
      },
    ],
  },
  first_quarter: {
    overview:
      "Active and determined. The first quarter moon supports taking action. Challenge yourself with moderate activities that build endurance and bone strength.",
    exercises: [
      {
        name: "Moderate Hiking",
        description:
          "Trail walks with gentle to moderate inclines. Weight-bearing activity that strengthens bones and improves cardiovascular health.",
        duration: "40-60 min",
        intensity: "Moderate",
      },
      {
        name: "Swimming",
        description:
          "Steady laps or water aerobics. Joint-friendly and excellent for cardiovascular fitness and full-body toning.",
        duration: "30-45 min",
        intensity: "Moderate",
      },
      {
        name: "Strength Training Basics",
        description:
          "Bodyweight or light weight exercises focusing on compound movements. Squats, lunges, rows, and presses for bone density.",
        duration: "25-35 min",
        intensity: "Moderate",
      },
      {
        name: "Dance",
        description:
          "Fun, rhythmic movement like ballroom, line dancing, or Zumba Gold. Builds coordination, balance, and lifts your mood.",
        duration: "30-45 min",
        intensity: "Moderate",
      },
    ],
  },
  waxing_gibbous: {
    overview:
      "Building momentum. Energy is growing as the moon fills. This is a great time to push a little further with activities that build strength and stamina.",
    exercises: [
      {
        name: "Weight Training",
        description:
          "Progressive resistance training with moderate weights. Focus on major muscle groups to support bone density and metabolism.",
        duration: "30-40 min",
        intensity: "Moderate",
      },
      {
        name: "Brisk Walking",
        description:
          "Purposeful, fast-paced walking that elevates your heart rate. Add hills or intervals for an extra challenge.",
        duration: "30-45 min",
        intensity: "Moderate",
      },
      {
        name: "Cycling",
        description:
          "Indoor stationary bike or outdoor cycling at a steady pace. Low-impact cardio that strengthens legs and improves endurance.",
        duration: "30-40 min",
        intensity: "Moderate",
      },
      {
        name: "Water Aerobics",
        description:
          "Group water exercises that provide resistance without joint impact. Builds strength, flexibility, and cardiovascular fitness.",
        duration: "30-45 min",
        intensity: "Moderate",
      },
    ],
  },
  full_moon: {
    overview:
      "Peak energy. The full moon brings heightened vitality. Enjoy more vigorous activities and the company of others. Celebrate what your body can do.",
    exercises: [
      {
        name: "Group Fitness",
        description:
          "Join a class like step aerobics, dance fitness, or circuit training. Social connection and motivation boost your workout.",
        duration: "45-60 min",
        intensity: "Moderate-High",
      },
      {
        name: "Longer Hikes",
        description:
          "Extended trail walks with varied terrain. Bring a friend and enjoy nature while building endurance and bone strength.",
        duration: "60-90 min",
        intensity: "Moderate-High",
      },
      {
        name: "Vigorous Swimming",
        description:
          "Continuous laps or high-energy water aerobics. Push your pace for a full-body, joint-friendly cardiovascular workout.",
        duration: "30-45 min",
        intensity: "Moderate-High",
      },
      {
        name: "Dance Cardio",
        description:
          "Upbeat dance sessions that get your heart pumping. Joyful movement that improves balance, coordination, and bone health.",
        duration: "30-45 min",
        intensity: "Moderate-High",
      },
    ],
  },
  waning_gibbous: {
    overview:
      "Sharing wisdom. As the moon begins to wane, enjoy movement with others. Social activities keep you motivated and connected while maintaining fitness.",
    exercises: [
      {
        name: "Partner Exercises",
        description:
          "Resistance band work, partner stretching, or buddy walking. Exercising together improves accountability and enjoyment.",
        duration: "30-40 min",
        intensity: "Moderate",
      },
      {
        name: "Group Yoga",
        description:
          "A community yoga class focused on strength, balance, and flexibility. Modifications available for all levels.",
        duration: "45-60 min",
        intensity: "Moderate",
      },
      {
        name: "Walking Clubs",
        description:
          "Join a group walk at a brisk, conversational pace. Social connection and consistent movement for heart and bone health.",
        duration: "30-45 min",
        intensity: "Moderate",
      },
      {
        name: "Recreational Sports",
        description:
          "Pickleball, golf, bowling, or doubles tennis. Fun, social activities that keep you active without high impact.",
        duration: "45-60 min",
        intensity: "Moderate",
      },
    ],
  },
  last_quarter: {
    overview:
      "Winding down. The last quarter moon invites you to slow your pace. Focus on flexibility, balance, and recovery to support your joints and well-being.",
    exercises: [
      {
        name: "Yin Yoga",
        description:
          "Long, passive holds that target connective tissue and improve joint flexibility. Deeply calming and restorative.",
        duration: "30-45 min",
        intensity: "Low-Moderate",
      },
      {
        name: "Gentle Stretching",
        description:
          "Easy stretches for the whole body with a focus on areas that hold tension. Hips, shoulders, and hamstrings.",
        duration: "15-20 min",
        intensity: "Low-Moderate",
      },
      {
        name: "Balance Exercises",
        description:
          "Single-leg stands, heel-to-toe walking, and stability ball work. Essential for fall prevention and core strength.",
        duration: "15-20 min",
        intensity: "Low-Moderate",
      },
      {
        name: "Foam Rolling",
        description:
          "Self-myofascial release to ease muscle tightness and improve circulation. Focus on legs, back, and hips.",
        duration: "15-20 min",
        intensity: "Low-Moderate",
      },
    ],
  },
  waning_crescent: {
    overview:
      "Deep rest. The waning crescent is a time of surrender before renewal. Honor your body with the gentlest forms of movement and mindful stillness.",
    exercises: [
      {
        name: "Restorative Yoga",
        description:
          "Fully supported poses with props for complete relaxation. Let gravity do the work while you rest and restore.",
        duration: "20-30 min",
        intensity: "Low",
      },
      {
        name: "Guided Meditation",
        description:
          "A calming guided practice focused on body awareness, gratitude, or visualization. Eases stress and promotes sleep.",
        duration: "10-20 min",
        intensity: "Low",
      },
      {
        name: "Gentle Walks",
        description:
          "Short, unhurried walks in a peaceful setting. Focus on your surroundings and your breath rather than pace.",
        duration: "15-25 min",
        intensity: "Low",
      },
      {
        name: "Body Scan",
        description:
          "A progressive relaxation technique moving attention through each body part. Releases tension and cultivates mindfulness.",
        duration: "10-15 min",
        intensity: "Low",
      },
    ],
  },
};

const intensityColors: Record<string, string> = {
  Low: "#22c55e",
  "Low-Moderate": "#84cc16",
  Moderate: "#f59e0b",
  "Moderate-High": "#f97316",
  High: "#ef4444",
};

export default function MovementPage() {
  const { currentPhase, currentPhaseInfo, isRegular, currentMoonPhase, currentMoonInfo } =
    useCycleData();

  const movement = isRegular
    ? phaseExercises[currentPhase]
    : moonExercises[currentMoonPhase];

  const displayColor = isRegular ? phaseInfo[currentPhase].color : currentMoonInfo.color;
  const displayEmoji = isRegular ? phaseInfo[currentPhase].emoji : currentMoonInfo.emoji;
  const displaySubtitle = isRegular
    ? `${currentPhaseInfo.name} Phase - ${phaseInfo[currentPhase].emoji} ${currentPhaseInfo.description}`
    : `${currentMoonInfo.name} - ${currentMoonInfo.emoji} ${currentMoonInfo.energy}`;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: `${displayColor}20` }}
          >
            <Dumbbell className="h-5 w-5" style={{ color: displayColor }} />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Movement
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              {displaySubtitle}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[20px] border border-border-light bg-bg-card p-6 mb-6"
      >
        <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
          {movement.overview}
        </p>
      </motion.div>

      {/* Exercise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {movement.exercises.map((exercise, index) => (
          <motion.div
            key={exercise.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.08 }}
            className="rounded-[20px] border border-border-light bg-bg-card p-6 hover:bg-bg-secondary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-cormorant text-xl font-semibold text-text-primary">
                {exercise.name}
              </h3>
              <span
                className="px-2.5 py-1 rounded-xl text-[10px] font-quicksand font-semibold"
                style={{
                  backgroundColor: `${intensityColors[exercise.intensity]}15`,
                  color: intensityColors[exercise.intensity],
                }}
              >
                {exercise.intensity}
              </span>
            </div>

            <p className="text-sm text-text-secondary font-quicksand leading-relaxed mb-4">
              {exercise.description}
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-quicksand">{exercise.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted">
                <Zap className="h-3.5 w-3.5" />
                <span className="text-xs font-quicksand">{exercise.intensity} Intensity</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
