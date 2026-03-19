"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, BookOpen, Sparkles, ChevronRight } from "lucide-react";
import { useCycleData } from "@/hooks/use-cycle-data";
import { phaseInfo, moonPhaseInfo } from "@/lib/cycle/data";
import type { CyclePhase } from "@/lib/cycle/types";
import type { MoonPhase } from "@/lib/cycle/types";

const phaseJournalPrompts: Record<CyclePhase, string[]> = {
  menstrual: [
    "What does my body need most right now?",
    "What am I ready to release and let go of?",
    "How can I honor my need for rest without guilt?",
    "What boundaries do I need to reinforce this cycle?",
    "Write a love letter to your body for all it does for you.",
  ],
  follicular: [
    "What new project or idea excites me most right now?",
    "What would I try if I knew I couldn't fail?",
    "How do I want to grow this cycle?",
    "What creative spark am I feeling today?",
    "List 5 things you are grateful for in this moment.",
  ],
  ovulatory: [
    "What relationships am I nurturing right now?",
    "How can I use my voice more powerfully today?",
    "What makes me feel most confident and alive?",
    "Who in my life could use encouragement today?",
    "Describe your ideal day from morning to night.",
  ],
  luteal: [
    "What tasks can I complete to feel a sense of accomplishment?",
    "How am I feeling, and what might be causing those feelings?",
    "What comfort rituals help me feel grounded?",
    "What can I simplify in my life right now?",
    "Write about something you are proud of this month.",
  ],
};

const phaseSelfCare: Record<CyclePhase, Array<{ title: string; description: string; emoji: string }>> = {
  menstrual: [
    { title: "Warm Bath Ritual", description: "Add Epsom salts and lavender essential oil for muscle relaxation and calm.", emoji: "🛁" },
    { title: "Cozy Reading", description: "Curl up with a comforting book and a cup of herbal tea.", emoji: "📖" },
    { title: "Gentle Skincare", description: "Double cleanse, hydrating mask, and facial oil massage.", emoji: "🧴" },
    { title: "Rest & Sleep", description: "Allow yourself extra sleep. Your body is doing important work.", emoji: "😴" },
    { title: "Comfort Cooking", description: "Prepare a warm, nourishing meal with love and intention.", emoji: "🍲" },
  ],
  follicular: [
    { title: "Creative Expression", description: "Paint, draw, write, or craft. Let your rising creativity flow.", emoji: "🎨" },
    { title: "Social Plans", description: "Schedule coffee dates, brunches, or group activities.", emoji: "🤝" },
    { title: "Declutter Space", description: "Fresh energy calls for fresh spaces. Tidy a room or closet.", emoji: "✨" },
    { title: "Try Something New", description: "Take a class, visit a new place, or cook a new recipe.", emoji: "🌱" },
    { title: "Vision Board", description: "Map out your goals and dreams for the cycle ahead.", emoji: "📋" },
  ],
  ovulatory: [
    { title: "Date Night", description: "Plan a special evening with your partner or yourself.", emoji: "💃" },
    { title: "Volunteer", description: "Channel your high social energy into community service.", emoji: "🤲" },
    { title: "Express Yourself", description: "Wear something that makes you feel powerful and radiant.", emoji: "👗" },
    { title: "Connect Deeply", description: "Have a meaningful conversation with someone you care about.", emoji: "💜" },
    { title: "Celebrate Wins", description: "Acknowledge your accomplishments, big and small.", emoji: "🎉" },
  ],
  luteal: [
    { title: "Digital Detox", description: "Take an evening off from screens. Journal, meditate, or nap.", emoji: "📵" },
    { title: "Aromatherapy", description: "Diffuse calming scents like chamomile, ylang ylang, or cedarwood.", emoji: "🕯️" },
    { title: "Organize & Plan", description: "Use your detail-oriented energy to plan the week ahead.", emoji: "📅" },
    { title: "Comfort Playlist", description: "Create or listen to a playlist that soothes and uplifts.", emoji: "🎵" },
    { title: "Boundaries Practice", description: "Say no to what drains you. Protect your energy.", emoji: "🛡️" },
  ],
};

const phaseAffirmations: Record<CyclePhase, string[]> = {
  menstrual: [
    "I deserve rest and restoration",
    "My body knows what it needs",
    "I honor my inner winter",
    "Slowing down is a strength",
    "I release what no longer serves me",
    "I am exactly where I need to be",
  ],
  follicular: [
    "I am open to new possibilities",
    "My creativity flows freely",
    "I embrace fresh beginnings",
    "I trust the seeds I am planting",
    "My energy is rising and expansive",
    "I welcome growth with open arms",
  ],
  ovulatory: [
    "I radiate confidence and warmth",
    "My voice deserves to be heard",
    "I am magnetic and powerful",
    "I connect deeply with others",
    "My light inspires those around me",
    "I celebrate my full expression",
  ],
  luteal: [
    "I honor my need for rest and space",
    "My feelings are valid and temporary",
    "I trust my inner wisdom",
    "I am productive at my own pace",
    "I give myself grace during this phase",
    "Completion brings me satisfaction",
  ],
};

/* ── Moon-phase data for perimenopause / menopause / postmenopause ── */

const moonJournalPrompts: Record<MoonPhase, string[]> = {
  new_moon: [
    "What new intention am I ready to set for this chapter of my life?",
    "What does a fresh start look like for me right now?",
    "What quiet wisdom is surfacing when I sit in stillness?",
    "What part of myself am I rediscovering?",
    "How can I create more space for inner reflection?",
  ],
  waxing_crescent: [
    "What hopes and dreams are stirring inside me?",
    "What small step can I take today to nurture my growth?",
    "Where in my life do I need more patience with myself?",
    "What new interest or passion is calling to me?",
    "How can I be gentle with myself as I begin something new?",
  ],
  first_quarter: [
    "What obstacle am I ready to face with courage today?",
    "What bold action have I been putting off?",
    "How can I advocate for my own needs and well-being?",
    "What strength have I gained from my life experiences?",
    "What does bravery look like in my daily life right now?",
  ],
  waxing_gibbous: [
    "What goals need refining or adjusting at this stage?",
    "How can I trust the process even when things feel uncertain?",
    "What am I learning about myself through this transition?",
    "Where can I give myself more grace as I evolve?",
    "What adjustments would bring me closer to inner peace?",
  ],
  full_moon: [
    "What achievement am I most proud of in my life so far?",
    "What fills my heart with gratitude today?",
    "What truth has been illuminated for me recently?",
    "How has my journey made me the woman I am today?",
    "What would I celebrate about myself if no one were watching?",
  ],
  waning_gibbous: [
    "What wisdom have I earned that I want to share with others?",
    "Who in my life could benefit from my experience and guidance?",
    "How can I practice generosity toward myself today?",
    "What lessons from my past can light the way forward?",
    "How can I mentor or support someone on their journey?",
  ],
  last_quarter: [
    "What am I ready to let go of that no longer serves me?",
    "Who or what do I need to forgive, including myself?",
    "How can I simplify my life to make room for what matters?",
    "What old story about myself am I ready to release?",
    "What would feel lighter if I stopped carrying it?",
  ],
  waning_crescent: [
    "How can I honor my need for deep rest right now?",
    "What does surrender look like for me in this season?",
    "How am I preparing myself for renewal and new beginnings?",
    "What comforts and nourishes my spirit when I slow down?",
    "What beautiful thing can I notice in this quiet moment?",
  ],
};

const moonSelfCare: Record<MoonPhase, Array<{ title: string; description: string; emoji: string }>> = {
  new_moon: [
    { title: "Intention Setting Meditation", description: "Light a candle and spend 10 minutes setting clear intentions for the lunar cycle ahead.", emoji: "🕯️" },
    { title: "Restorative Skincare", description: "Apply a nourishing overnight mask and give yourself a gentle facial massage.", emoji: "🧴" },
    { title: "Journaling by Candlelight", description: "Write freely about your dreams and desires in a quiet, dimly lit space.", emoji: "📓" },
    { title: "Herbal Tea Ceremony", description: "Brew a calming blend of chamomile and lavender. Sip slowly and mindfully.", emoji: "🍵" },
    { title: "Gentle Nature Walk", description: "Take a slow, meditative walk outdoors and notice the quiet beauty around you.", emoji: "🌿" },
  ],
  waxing_crescent: [
    { title: "Vision Board Creation", description: "Gather images and words that represent your hopes for this new chapter.", emoji: "🎨" },
    { title: "Plant Something New", description: "Start a herb garden or repot a houseplant. Nurture growth alongside your own.", emoji: "🌱" },
    { title: "Aromatherapy Shower", description: "Hang eucalyptus in your shower or use uplifting citrus essential oils.", emoji: "🚿" },
    { title: "Inspiring Reading", description: "Read a chapter from a book about women thriving in their wisdom years.", emoji: "📖" },
    { title: "Gratitude Letter", description: "Write a heartfelt letter of gratitude to yourself or someone who inspires you.", emoji: "💌" },
  ],
  first_quarter: [
    { title: "Power Walk", description: "Take a brisk, energizing walk. Feel your strength and vitality with every step.", emoji: "🚶‍♀️" },
    { title: "Declutter a Space", description: "Clear out a drawer, shelf, or closet. Create physical space that mirrors inner clarity.", emoji: "✨" },
    { title: "Cook a Bold Recipe", description: "Try a new, adventurous recipe. Nourish your body with vibrant flavors.", emoji: "🍳" },
    { title: "Creative Writing", description: "Write a short story, poem, or letter. Let your voice be heard on the page.", emoji: "✍️" },
    { title: "Strength & Stretch", description: "Do a gentle strength routine followed by deep stretching. Honor your body's power.", emoji: "💪" },
  ],
  waxing_gibbous: [
    { title: "Mindful Meditation", description: "Practice a 15-minute guided meditation focused on trust and patience.", emoji: "🧘" },
    { title: "Skin Glow Routine", description: "Exfoliate, hydrate, and apply a brightening serum. Celebrate your radiance.", emoji: "✨" },
    { title: "Garden Tending", description: "Spend time tending to your garden or indoor plants. Observe how they grow.", emoji: "🌺" },
    { title: "Music & Movement", description: "Put on your favorite music and dance freely in your living room.", emoji: "🎶" },
    { title: "Nourishing Meal Prep", description: "Prepare balanced, colorful meals for the days ahead with care and intention.", emoji: "🥗" },
  ],
  full_moon: [
    { title: "Moonlight Ritual", description: "Spend a few minutes outside under the full moon. Breathe deeply and feel its energy.", emoji: "🌕" },
    { title: "Celebration Dinner", description: "Prepare a special meal to celebrate yourself and your journey.", emoji: "🍷" },
    { title: "Gratitude Practice", description: "Write down 10 things you are deeply grateful for in this season of life.", emoji: "🙏" },
    { title: "Connect with a Friend", description: "Call or visit someone who lights you up. Share laughter and stories.", emoji: "💛" },
    { title: "Luxurious Self-Care", description: "Take a long bath, use your best products, and treat yourself like royalty.", emoji: "👑" },
  ],
  waning_gibbous: [
    { title: "Mentoring Moment", description: "Reach out to someone younger who could benefit from your wisdom and experience.", emoji: "🤝" },
    { title: "Cooking for Others", description: "Prepare a meal or baked goods to share with neighbors, friends, or family.", emoji: "🍰" },
    { title: "Guided Gratitude Meditation", description: "Listen to a gratitude meditation and let thankfulness wash over you.", emoji: "🧘" },
    { title: "Memory Journaling", description: "Write about a cherished memory. Revisit the joy and lessons it holds.", emoji: "📖" },
    { title: "Nature Photography", description: "Take your phone or camera outdoors and capture the beauty you see.", emoji: "📸" },
  ],
  last_quarter: [
    { title: "Letting Go Ritual", description: "Write down what you want to release on paper, then safely tear it up or burn it.", emoji: "🔥" },
    { title: "Closet Edit", description: "Donate clothes that no longer reflect who you are becoming.", emoji: "👗" },
    { title: "Forgiveness Journaling", description: "Write a letter of forgiveness to yourself or someone else. You don't have to send it.", emoji: "💜" },
    { title: "Simplify Your Space", description: "Choose one area of your home to simplify. Less clutter, more peace.", emoji: "🏡" },
    { title: "Gentle Yoga", description: "Flow through a slow, restorative yoga session focused on release and surrender.", emoji: "🧘‍♀️" },
  ],
  waning_crescent: [
    { title: "Deep Rest", description: "Give yourself permission to nap, sleep in, or simply do nothing at all.", emoji: "😴" },
    { title: "Warm Bath with Essential Oils", description: "Soak in a warm bath with lavender and ylang ylang. Let tension dissolve.", emoji: "🛁" },
    { title: "Soothing Music", description: "Listen to calm, ambient music or nature sounds. Let your mind drift.", emoji: "🎵" },
    { title: "Comfort Reading", description: "Revisit a favorite book or discover a gentle new story.", emoji: "📚" },
    { title: "Nourishing Soup", description: "Prepare a warm, comforting soup. Let the act of cooking be a form of self-care.", emoji: "🍲" },
  ],
};

const moonAffirmations: Record<MoonPhase, string[]> = {
  new_moon: [
    "Every new beginning carries the wisdom of my past",
    "I am worthy of rest and quiet reflection",
    "My inner world is rich and full of possibility",
    "I plant seeds of intention with love and trust",
    "This chapter of my life is filled with promise",
    "I embrace stillness as a source of strength",
  ],
  waxing_crescent: [
    "My dreams are valid at every age",
    "I nurture my growth with patience and grace",
    "New passions and joys are always available to me",
    "I am becoming more authentically myself every day",
    "Hope is a light that never dims within me",
    "I trust the timing of my unfolding",
  ],
  first_quarter: [
    "I have the courage to create the life I desire",
    "My life experience is my greatest asset",
    "I take bold steps forward with confidence",
    "Obstacles are opportunities for me to grow stronger",
    "I advocate for myself with clarity and grace",
    "My strength has been forged through every season of my life",
  ],
  waxing_gibbous: [
    "I trust the process of my transformation",
    "I am evolving into the most radiant version of myself",
    "Adjustments are not setbacks, they are wisdom in action",
    "I give myself grace as I refine my path",
    "My journey is unfolding exactly as it should",
    "I am beautiful in every stage of becoming",
  ],
  full_moon: [
    "I celebrate all that I have achieved and overcome",
    "My light shines brightly for all to see",
    "I am grateful for the richness of my life",
    "I stand in my full power and radiance",
    "Every year adds depth and beauty to who I am",
    "I am illuminated by gratitude and self-love",
  ],
  waning_gibbous: [
    "My wisdom is a gift to those around me",
    "Sharing my story helps light the way for others",
    "Generosity of spirit fills my heart with joy",
    "I am grateful for every lesson that brought me here",
    "My experience has given me a perspective worth sharing",
    "I give freely and receive abundantly",
  ],
  last_quarter: [
    "I release what no longer serves my highest good",
    "Forgiveness sets me free to live fully",
    "I simplify my life to make room for peace",
    "Letting go is an act of self-love",
    "I am lighter with every burden I set down",
    "I honor my need for space and simplicity",
  ],
  waning_crescent: [
    "Rest is sacred and I deserve it fully",
    "I surrender to the natural rhythm of renewal",
    "Quiet moments are when my soul speaks loudest",
    "I prepare for new beginnings with an open heart",
    "I am at peace with where I am right now",
    "In stillness, I find my deepest strength",
  ],
};

export default function SelfCarePage() {
  const { currentPhase, currentPhaseInfo, isRegular, currentMoonPhase, currentMoonInfo } = useCycleData();

  const moonInfo = moonPhaseInfo[currentMoonPhase];

  const activeColor = isRegular ? phaseInfo[currentPhase].color : moonInfo.color;
  const activeName = isRegular ? currentPhaseInfo.name + " Phase" : currentMoonInfo.name;
  const prompts = isRegular ? phaseJournalPrompts[currentPhase] : moonJournalPrompts[currentMoonPhase];
  const activities = isRegular ? phaseSelfCare[currentPhase] : moonSelfCare[currentMoonPhase];
  const affirmations = isRegular ? phaseAffirmations[currentPhase] : moonAffirmations[currentMoonPhase];

  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);

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
            style={{ backgroundColor: `${activeColor}20` }}
          >
            <Heart className="h-5 w-5" style={{ color: activeColor }} />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Self-Care
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              {activeName} - Nurture your mind, body & spirit
            </p>
          </div>
        </div>
      </motion.div>

      {/* Journal Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-accent-purple" />
          <h2 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
            Journal Prompts
          </h2>
        </div>
        <div className="space-y-2">
          {prompts.map((prompt, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              onClick={() => setExpandedPrompt(expandedPrompt === index ? null : index)}
              className="w-full flex items-center gap-3 p-4 rounded-[16px] border border-border-light bg-bg-card hover:bg-bg-secondary/50 transition-colors text-left"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-sm font-quicksand font-semibold"
                style={{ backgroundColor: `${activeColor}15`, color: activeColor }}
              >
                {index + 1}
              </div>
              <p className="flex-1 text-sm text-text-primary font-quicksand">
                {prompt}
              </p>
              <ChevronRight
                className={`h-4 w-4 text-text-muted transition-transform ${
                  expandedPrompt === index ? "rotate-90" : ""
                }`}
              />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Self-Care Activities */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-accent-pink" />
          <h2 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
            Self-Care Activities
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.06 }}
              className="rounded-[16px] border border-border-light bg-bg-card p-5 hover:bg-bg-secondary/30 transition-colors"
            >
              <div className="text-2xl mb-2">{activity.emoji}</div>
              <h3 className="font-quicksand font-semibold text-sm text-text-primary mb-1">
                {activity.title}
              </h3>
              <p className="text-xs text-text-muted font-quicksand leading-relaxed">
                {activity.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Affirmation Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-4 w-4 text-accent-rose" />
          <h2 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
            Affirmations
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {affirmations.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="flex-shrink-0 w-60 p-5 rounded-[20px] border border-border-light"
              style={{
                background: `linear-gradient(135deg, ${activeColor}10, ${activeColor}05)`,
              }}
            >
              <Sparkles className="h-4 w-4 text-text-accent mb-3" />
              <p className="font-cormorant text-base text-text-primary italic leading-relaxed">
                &ldquo;{text}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
