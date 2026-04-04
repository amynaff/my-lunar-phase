"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Clock, Flame, Zap, ChevronDown, ChevronUp, Heart, Shield, Sparkles } from "lucide-react";
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

interface ExerciseCategory {
  title: string;
  priority: string;
  icon: React.ElementType;
  iconColor: string;
  description: string;
  frequency: string;
  exercises: Exercise[];
  note?: string;
}

interface WeeklyDay {
  day: string;
  activity: string;
}

interface LifeStageMovementData {
  title: string;
  subtitle: string;
  overview: string;
  categories: ExerciseCategory[];
  weeklyRoutine: WeeklyDay[];
  tips: string[];
}

/* ------------------------------------------------------------------ */
/*  LIFE STAGE EXERCISE DATA                                           */
/* ------------------------------------------------------------------ */

const lifeStageMovementData: Record<string, LifeStageMovementData> = {
  perimenopause: {
    title: "Perimenopause Movement",
    subtitle: "Strength, Balance & Relief",
    overview:
      "Your body is navigating a major hormonal shift — and movement is one of the most powerful tools you have. A balanced mix of strength, cardio, flexibility, and pelvic floor work can ease symptoms like hot flashes, mood swings, and sleep disruption while protecting your bones, muscles, and heart for the long run.",
    categories: [
      {
        title: "Strength Training",
        priority: "#1 Priority",
        icon: Dumbbell,
        iconColor: "#8b5cf6",
        description:
          "This is your most impactful exercise right now. Resistance training fights muscle loss, revs up metabolism, strengthens bones, and helps with weight and blood sugar balance. Focus on compound movements that work multiple muscles at once.",
        frequency: "2-3x per week, 30-45 min",
        exercises: [
          { name: "Squats & Goblet Squats", description: "Build leg and glute strength while engaging your core — use dumbbells or bodyweight", duration: "Part of routine", intensity: "Moderate" },
          { name: "Deadlifts", description: "Strengthen your entire posterior chain — start light and focus on form before adding weight", duration: "Part of routine", intensity: "Moderate-High" },
          { name: "Rows & Presses", description: "Bent-over rows for posture and upper back, overhead press for shoulders — resistance bands work great too", duration: "Part of routine", intensity: "Moderate" },
          { name: "Glute Bridges & Lunges", description: "Hip stability and lower body strength — add a resistance band for extra challenge", duration: "Part of routine", intensity: "Moderate" },
        ],
        note: "Aim for 8-12 reps with enough weight to feel challenged on the last few. Gradually increase weight or reps over time.",
      },
      {
        title: "Cardio & Heart Health",
        priority: "Essential",
        icon: Heart,
        iconColor: "#ef4444",
        description:
          "Moderate cardio supports your heart, helps manage weight, lifts your mood through endorphins, and may reduce the intensity of hot flashes. Prioritize weight-bearing options when possible for added bone benefits.",
        frequency: "30 min most days, 150+ min/week total",
        exercises: [
          { name: "Brisk Walking", description: "The most accessible and bone-friendly cardio — add hills or intervals to boost intensity", duration: "30-45 min", intensity: "Moderate" },
          { name: "Swimming & Water Aerobics", description: "Gentle on joints and naturally cooling — especially helpful on hot flash days", duration: "30-45 min", intensity: "Moderate" },
          { name: "Cycling", description: "Stationary or outdoor — builds leg endurance with minimal joint impact", duration: "30-40 min", intensity: "Moderate" },
          { name: "Dancing", description: "Zumba, ballroom, or freestyle — joyful movement that builds coordination and balance", duration: "30-45 min", intensity: "Moderate" },
        ],
        note: "A note on HIIT: short interval sessions (20-30 min, 2x/week max) can be effective, but may spike cortisol or trigger hot flashes. Use sparingly and prioritize recovery.",
      },
      {
        title: "Balance & Flexibility",
        priority: "Recovery & Stability",
        icon: Sparkles,
        iconColor: "#22c55e",
        description:
          "These practices reduce fall risk, ease joint stiffness, calm your nervous system, and can directly help with hot flashes, anxiety, and sleep quality. Think of this as your body's reset button.",
        frequency: "2-3x per week, or 10-20 min daily",
        exercises: [
          { name: "Yoga", description: "Gentle or restorative styles — child's pose, cat-cow, and legs-up-the-wall are especially soothing", duration: "25-40 min", intensity: "Low" },
          { name: "Tai Chi", description: "Slow, flowing sequences that improve balance, calm the mind, and support joint mobility", duration: "20-30 min", intensity: "Low" },
          { name: "Pilates", description: "Core strength and pelvic floor support — mat-based is perfect for home practice", duration: "30-40 min", intensity: "Low-Moderate" },
          { name: "Stretching & Foam Rolling", description: "Post-workout recovery for tight muscles — focus on hips, lower back, and shoulders", duration: "10-20 min", intensity: "Low" },
        ],
      },
      {
        title: "Pelvic Floor Work",
        priority: "Daily Practice",
        icon: Shield,
        iconColor: "#f59e0b",
        description:
          "Hormonal changes can weaken pelvic floor muscles, affecting bladder control and comfort. Consistent, gentle strengthening makes a real difference — and pairs beautifully with yoga and Pilates.",
        frequency: "Daily, several short sets",
        exercises: [
          { name: "Kegel Holds", description: "Contract the muscles you'd use to stop urine flow — hold 5-10 seconds, relax, repeat 10-15 times", duration: "5 min", intensity: "Low" },
          { name: "Pelvic Tilts", description: "Lying on your back, gently tilt your pelvis to engage deep core and pelvic floor muscles", duration: "5-10 min", intensity: "Low" },
        ],
      },
    ],
    weeklyRoutine: [
      { day: "Mon / Wed / Fri", activity: "30-45 min strength training (full body)" },
      { day: "Tue / Thu", activity: "30-45 min brisk walk or swim + 10 min yoga" },
      { day: "Saturday", activity: "Longer walk or dance class + balance work" },
      { day: "Sunday", activity: "Rest day — gentle yoga or tai chi + stretching" },
      { day: "Daily", activity: "Pelvic floor exercises + short walks when possible" },
    ],
    tips: [
      "Warm up for 5-10 minutes before every session and cool down with gentle stretching after",
      "Pair exercise with protein-rich meals afterward to support muscle repair",
      "On tough symptom days, lower the intensity — a gentle walk still counts",
      "Track your workouts — most women notice real improvements in energy and mood within 4-8 weeks",
      "Start with bodyweight or light resistance if you're new to strength training and build gradually",
      "Hydrate well before, during, and after movement — it helps with temperature regulation too",
    ],
  },
  menopause: {
    title: "Menopause Movement",
    subtitle: "Protect, Strengthen & Thrive",
    overview:
      "Movement after menopause isn't just about fitness — it's about protecting the bones, muscles, heart, and brain that serve you for decades to come. A consistent routine built around strength, weight-bearing cardio, and balance work is your best investment in long-term vitality and independence.",
    categories: [
      {
        title: "Strength Training",
        priority: "#1 Priority",
        icon: Dumbbell,
        iconColor: "#8b5cf6",
        description:
          "Muscle loss accelerates after menopause, which slows metabolism and weakens bones. Resistance training is the single best way to counter both. Focus on major muscle groups with compound exercises and progressively challenge yourself.",
        frequency: "2-3x per week, 30-45 min",
        exercises: [
          { name: "Squats & Step-Ups", description: "Functional lower body strength for daily life — use a chair or bench for step-ups if needed", duration: "Part of routine", intensity: "Moderate" },
          { name: "Deadlifts & Hip Hinges", description: "Build posterior chain strength — Romanian deadlifts with dumbbells are a great starting point", duration: "Part of routine", intensity: "Moderate" },
          { name: "Push-Ups & Overhead Press", description: "Upper body and shoulder strength — modify push-ups on knees or against a wall as needed", duration: "Part of routine", intensity: "Moderate" },
          { name: "Rows & Resistance Band Work", description: "Upper back strength for posture — seated rows or banded pull-aparts are joint-friendly options", duration: "Part of routine", intensity: "Moderate" },
        ],
        note: "Aim for 8-12 reps where the last 2-3 feel challenging. Progressive overload — gradually adding weight or reps — is how you build real results.",
      },
      {
        title: "Weight-Bearing Cardio",
        priority: "Heart & Bone Health",
        icon: Heart,
        iconColor: "#ef4444",
        description:
          "Heart disease risk rises after menopause, making cardiovascular exercise essential. Choose weight-bearing activities whenever possible — they do double duty by supporting bone density too.",
        frequency: "30 min most days, 150+ min/week total",
        exercises: [
          { name: "Walking & Stair Climbing", description: "Weight-bearing and accessible — take the stairs, walk after meals, or try Nordic walking for extra upper body work", duration: "30-45 min", intensity: "Moderate" },
          { name: "Swimming & Water Exercise", description: "Full-body cardio that's gentle on joints — great if you have arthritis or joint discomfort", duration: "30-45 min", intensity: "Moderate" },
          { name: "Cycling", description: "Low-impact endurance builder — indoor classes or outdoor rides for fresh air and scenery", duration: "30-40 min", intensity: "Moderate" },
          { name: "Dancing & Group Classes", description: "Social, joyful movement that sharpens coordination and balance — try line dancing or low-impact aerobics", duration: "30-45 min", intensity: "Moderate" },
        ],
      },
      {
        title: "Balance & Flexibility",
        priority: "Fall Prevention & Comfort",
        icon: Sparkles,
        iconColor: "#22c55e",
        description:
          "Balance naturally declines with age, increasing fall and fracture risk. Regular practice keeps you steady, mobile, and confident. These activities also ease joint stiffness and support better sleep.",
        frequency: "2-3x per week, or 10-20 min daily",
        exercises: [
          { name: "Yoga", description: "Focus on standing balance poses, gentle twists, and hip openers — restorative styles are wonderful for stress relief", duration: "25-40 min", intensity: "Low" },
          { name: "Tai Chi & Qigong", description: "Evidence-based for fall prevention — slow, intentional movements that sharpen proprioception and calm the mind", duration: "20-30 min", intensity: "Low" },
          { name: "Balance Drills", description: "Single-leg stands, heel-to-toe walks, and stability ball work — practice near a wall or chair for safety", duration: "10-15 min", intensity: "Low" },
          { name: "Stretching & Foam Rolling", description: "Daily mobility work for hips, spine, and shoulders — helps with morning stiffness and post-workout recovery", duration: "10-20 min", intensity: "Low" },
        ],
      },
      {
        title: "Pelvic Floor Work",
        priority: "Daily Practice",
        icon: Shield,
        iconColor: "#f59e0b",
        description:
          "Pelvic floor strength supports bladder control, core stability, and comfort. It's a small daily practice with meaningful long-term payoff — especially when combined with Pilates or yoga.",
        frequency: "Daily, several short sets",
        exercises: [
          { name: "Kegel Holds", description: "Engage and hold pelvic floor muscles for 5-10 seconds, relax fully, repeat 10-15 times per set", duration: "5 min", intensity: "Low" },
          { name: "Pelvic Tilts & Bridges", description: "Lying on your back, combine pelvic floor engagement with gentle hip lifts for deeper core connection", duration: "5-10 min", intensity: "Low" },
        ],
      },
    ],
    weeklyRoutine: [
      { day: "Mon / Wed / Fri", activity: "30-45 min strength training (full body)" },
      { day: "Tue / Thu", activity: "30-45 min walking or swimming + 10 min yoga" },
      { day: "Saturday", activity: "Longer walk, hike, or dance class + balance drills" },
      { day: "Sunday", activity: "Rest day — gentle yoga, tai chi, or stretching" },
      { day: "Daily", activity: "Pelvic floor exercises + movement throughout the day" },
    ],
    tips: [
      "Always warm up with 5-10 minutes of light movement and cool down with stretching",
      "Pair workouts with protein and calcium-rich foods to support muscle and bone repair",
      "Consistency beats intensity — showing up regularly matters more than pushing hard",
      "Listen to your body and adjust on high-fatigue or joint-discomfort days",
      "Start where you are — bodyweight exercises and short walks are a powerful beginning",
      "Track your progress — strength, balance, and energy improvements often surprise you within weeks",
      "Stay hydrated and prioritize sleep — recovery is where the real benefits happen",
    ],
  },
};

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

/* ------------------------------------------------------------------ */
/*  COLLAPSIBLE CATEGORY COMPONENT                                     */
/* ------------------------------------------------------------------ */

function CategorySection({
  category,
  defaultOpen = false,
}: {
  category: ExerciseCategory;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = category.icon;

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: `${category.iconColor}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: category.iconColor }} />
          </div>
          <div>
            <p className="font-quicksand font-semibold text-sm text-text-primary">
              {category.title}
            </p>
            <p className="text-xs text-text-muted font-quicksand">
              {category.priority} · {category.frequency}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-muted" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
                {category.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.exercises.map((exercise) => (
                  <div
                    key={exercise.name}
                    className="rounded-xl border border-border-light bg-bg-secondary/30 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-quicksand font-semibold text-sm text-text-primary">
                        {exercise.name}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded-lg text-[10px] font-quicksand font-semibold shrink-0 ml-2"
                        style={{
                          backgroundColor: `${intensityColors[exercise.intensity]}15`,
                          color: intensityColors[exercise.intensity],
                        }}
                      >
                        {exercise.intensity}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted font-quicksand leading-relaxed">
                      {exercise.description}
                    </p>
                    {exercise.duration !== "Part of routine" && (
                      <div className="flex items-center gap-1.5 text-text-muted mt-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-[11px] font-quicksand">{exercise.duration}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {category.note && (
                <div className="rounded-xl bg-accent-purple/5 border border-accent-purple/15 p-4">
                  <p className="text-xs text-text-secondary font-quicksand leading-relaxed">
                    💡 {category.note}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function MovementPage() {
  const { currentPhase, currentPhaseInfo, isRegular, currentMoonPhase, currentMoonInfo, lifeStage } =
    useCycleData();

  const isLifeStageUser = !isRegular;
  const lifeStageData = isLifeStageUser
    ? lifeStageMovementData[lifeStage === "postmenopause" ? "menopause" : lifeStage] || lifeStageMovementData.menopause
    : null;

  const movement = isRegular
    ? phaseExercises[currentPhase]
    : moonExercises[currentMoonPhase];

  const displayColor = isRegular ? phaseInfo[currentPhase].color : currentMoonInfo.color;
  const displayEmoji = isRegular ? phaseInfo[currentPhase].emoji : currentMoonInfo.emoji;
  const displaySubtitle = isRegular
    ? `${currentPhaseInfo.name} Phase - ${phaseInfo[currentPhase].emoji} ${currentPhaseInfo.description}`
    : `${currentMoonInfo.name} - ${currentMoonInfo.emoji} ${currentMoonInfo.energy}`;

  // ---- LIFE STAGE VIEW (peri/menopause) ----
  if (isLifeStageUser && lifeStageData) {
    return (
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: `${displayColor}20` }}>
              <Dumbbell className="h-5 w-5" style={{ color: displayColor }} />
            </div>
            <div>
              <h1 className="font-cormorant text-3xl font-semibold text-text-primary">Movement</h1>
              <p className="text-sm text-text-secondary font-quicksand">{currentMoonInfo.name} - {currentMoonInfo.emoji} {currentMoonInfo.energy}</p>
            </div>
          </div>
        </motion.div>

        {/* Overview Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[20px] border border-border-light bg-bg-card p-6 mb-6">
          <h2 className="font-cormorant text-xl font-semibold text-text-primary">{lifeStageData.title}</h2>
          <p className="text-sm text-accent-purple font-quicksand font-medium mt-1">{lifeStageData.subtitle}</p>
          <p className="text-sm text-text-secondary font-quicksand leading-relaxed mt-3">{lifeStageData.overview}</p>
        </motion.div>

        {/* Exercise Categories */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6 space-y-4">
          {lifeStageData.categories.map((category, index) => (
            <CategorySection key={category.title} category={category} defaultOpen={index === 0} />
          ))}
        </motion.div>

        {/* Sample Weekly Routine */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">Sample Weekly Routine</h2>
          <div className="rounded-[20px] border border-border-light bg-bg-card p-5 space-y-3">
            {lifeStageData.weeklyRoutine.map((day) => (
              <div key={day.day} className="flex items-start gap-3">
                <span className="font-quicksand font-semibold text-sm text-accent-purple min-w-[120px] shrink-0">{day.day}</span>
                <p className="text-sm text-text-secondary font-quicksand">{day.activity}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
          <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">Tips for Success</h2>
          <div className="rounded-[20px] border border-border-light bg-bg-card p-5 space-y-3">
            {lifeStageData.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-accent-pink shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary font-quicksand">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's Moon Phase Movement */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">
            Today&apos;s Moon Energy: {currentMoonInfo.emoji} {currentMoonInfo.name}
          </h2>
          <div className="rounded-[20px] border border-border-light bg-bg-card p-6 mb-4">
            <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
              {movement.overview}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {movement.exercises.map((exercise, index) => (
              <motion.div
                key={exercise.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.08 }}
                className="rounded-[20px] border border-border-light bg-bg-card p-6 hover:bg-bg-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-cormorant text-lg font-semibold text-text-primary">{exercise.name}</h3>
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
                <p className="text-sm text-text-secondary font-quicksand leading-relaxed mb-4">{exercise.description}</p>
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
        </motion.div>
      </div>
    );
  }

  // ---- REGULAR CYCLE VIEW ----
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
