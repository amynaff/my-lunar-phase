"use client";

import { motion } from "framer-motion";
import { Apple, ShoppingCart, Leaf, Droplets, Flame, Egg } from "lucide-react";
import { useCycleData } from "@/hooks/use-cycle-data";
import { useCycleStore } from "@/stores/cycle-store";
import { phaseInfo, moonPhaseInfo } from "@/lib/cycle/data";
import type { CyclePhase } from "@/lib/cycle/types";
import type { MoonPhase } from "@/lib/cycle/types";

const phaseNutrition: Record<
  CyclePhase,
  {
    overview: string;
    categories: Array<{
      name: string;
      icon: React.ElementType;
      color: string;
      items: Array<{ name: string; description: string }>;
    }>;
  }
> = {
  menstrual: {
    overview:
      "Focus on iron-rich foods and warming, nourishing meals to replenish your body during menstruation.",
    categories: [
      {
        name: "Iron-Rich Foods",
        icon: Flame,
        color: "#be185d",
        items: [
          { name: "Dark leafy greens", description: "Spinach, kale, Swiss chard" },
          { name: "Lean red meat", description: "Grass-fed beef, lamb" },
          { name: "Lentils & beans", description: "Rich in iron and fiber" },
          { name: "Dark chocolate", description: "70%+ cacao, magnesium source" },
        ],
      },
      {
        name: "Anti-Inflammatory",
        icon: Droplets,
        color: "#ec4899",
        items: [
          { name: "Turmeric & ginger", description: "Ease cramps naturally" },
          { name: "Fatty fish", description: "Salmon, sardines for omega-3s" },
          { name: "Berries", description: "Antioxidant powerhouses" },
          { name: "Bone broth", description: "Warming and mineral-rich" },
        ],
      },
      {
        name: "Comfort & Warmth",
        icon: Leaf,
        color: "#f9a8d4",
        items: [
          { name: "Warm soups & stews", description: "Easy to digest, nourishing" },
          { name: "Herbal teas", description: "Chamomile, raspberry leaf" },
          { name: "Root vegetables", description: "Sweet potato, beets, carrots" },
          { name: "Whole grains", description: "Oats, quinoa, brown rice" },
        ],
      },
    ],
  },
  follicular: {
    overview:
      "Your energy is rising. Favor light, fresh foods that support estrogen metabolism and fuel your growing energy.",
    categories: [
      {
        name: "Estrogen-Supporting",
        icon: Leaf,
        color: "#ec4899",
        items: [
          { name: "Flaxseeds", description: "Lignans for estrogen balance" },
          { name: "Sprouts & microgreens", description: "Enzyme-rich living foods" },
          { name: "Citrus fruits", description: "Vitamin C for iron absorption" },
          { name: "Fermented foods", description: "Kimchi, sauerkraut, yogurt" },
        ],
      },
      {
        name: "Energy Foods",
        icon: Flame,
        color: "#f59e0b",
        items: [
          { name: "Lean proteins", description: "Chicken, turkey, tofu" },
          { name: "Fresh salads", description: "Mixed greens, light vinaigrettes" },
          { name: "Avocado", description: "Healthy fats for hormone production" },
          { name: "Nuts & seeds", description: "Pumpkin seeds, almonds" },
        ],
      },
      {
        name: "Hydration",
        icon: Droplets,
        color: "#06b6d4",
        items: [
          { name: "Green smoothies", description: "Blend greens with fruit" },
          { name: "Coconut water", description: "Natural electrolytes" },
          { name: "Cucumber & melon", description: "Hydrating fresh foods" },
          { name: "Green tea", description: "Light caffeine and antioxidants" },
        ],
      },
    ],
  },
  ovulatory: {
    overview:
      "You are at peak energy. Support your body with fiber-rich foods and lighter meals to aid estrogen detoxification.",
    categories: [
      {
        name: "Fiber-Rich",
        icon: Leaf,
        color: "#f9a8d4",
        items: [
          { name: "Raw vegetables", description: "Broccoli, cauliflower, Brussels sprouts" },
          { name: "Whole grains", description: "Quinoa, millet, amaranth" },
          { name: "Fruits", description: "Raspberries, pears, apples" },
          { name: "Chia seeds", description: "Omega-3s and soluble fiber" },
        ],
      },
      {
        name: "Light Proteins",
        icon: Egg,
        color: "#9333ea",
        items: [
          { name: "Wild-caught fish", description: "Lighter protein source" },
          { name: "Eggs", description: "Complete protein, choline" },
          { name: "Tempeh", description: "Fermented soy, gut-friendly" },
          { name: "Legumes", description: "Chickpeas, edamame" },
        ],
      },
      {
        name: "Antioxidant Boost",
        icon: Flame,
        color: "#ef4444",
        items: [
          { name: "Bell peppers", description: "Vitamin C powerhouse" },
          { name: "Tomatoes", description: "Lycopene for cellular health" },
          { name: "Watermelon", description: "Hydrating and refreshing" },
          { name: "Dark berries", description: "Blueberries, blackberries" },
        ],
      },
    ],
  },
  luteal: {
    overview:
      "Progesterone rises and your body craves more calories. Focus on complex carbs and magnesium-rich foods to ease PMS symptoms.",
    categories: [
      {
        name: "Complex Carbs",
        icon: Flame,
        color: "#9333ea",
        items: [
          { name: "Sweet potatoes", description: "Stabilize blood sugar" },
          { name: "Brown rice", description: "Sustained energy release" },
          { name: "Squash", description: "Butternut, acorn, delicata" },
          { name: "Oats", description: "Serotonin-boosting comfort" },
        ],
      },
      {
        name: "Magnesium-Rich",
        icon: Droplets,
        color: "#8b5cf6",
        items: [
          { name: "Dark chocolate", description: "Satisfies cravings, boosts mood" },
          { name: "Bananas", description: "Potassium and magnesium" },
          { name: "Cashews & walnuts", description: "Healthy fats and minerals" },
          { name: "Spinach", description: "Magnesium and iron" },
        ],
      },
      {
        name: "Serotonin Support",
        icon: Leaf,
        color: "#ec4899",
        items: [
          { name: "Turkey", description: "Tryptophan for serotonin" },
          { name: "Sunflower seeds", description: "Vitamin E and selenium" },
          { name: "Salmon", description: "Omega-3s reduce inflammation" },
          { name: "Warm spiced milk", description: "Calming evening ritual" },
        ],
      },
    ],
  },
};

const moonNutrition: Record<
  MoonPhase,
  {
    overview: string;
    categories: Array<{
      name: string;
      icon: React.ElementType;
      color: string;
      items: Array<{ name: string; description: string }>;
    }>;
  }
> = {
  new_moon: {
    overview:
      "The New Moon invites gentle cleansing. Support your body with light, detox-friendly foods that encourage renewal and rest.",
    categories: [
      {
        name: "Cleansing Foods",
        icon: Leaf,
        color: "#1e1b4b",
        items: [
          { name: "Leafy greens", description: "Kale, arugula, dandelion greens" },
          { name: "Lemon water", description: "Gentle morning detox support" },
          { name: "Celery & cucumber", description: "Hydrating and cleansing" },
          { name: "Sprouts", description: "Enzyme-rich renewal foods" },
        ],
      },
      {
        name: "Light Soups & Broths",
        icon: Flame,
        color: "#4c1d95",
        items: [
          { name: "Vegetable broth", description: "Mineral-rich and warming" },
          { name: "Miso soup", description: "Probiotic and soothing" },
          { name: "Light vegetable soup", description: "Easy to digest, nourishing" },
          { name: "Kitchari", description: "Ayurvedic cleansing stew" },
        ],
      },
      {
        name: "Herbal Support",
        icon: Droplets,
        color: "#6d28d9",
        items: [
          { name: "Peppermint tea", description: "Supports digestion and clarity" },
          { name: "Dandelion root tea", description: "Gentle liver support" },
          { name: "Ginger tea", description: "Warming and anti-inflammatory" },
          { name: "Nettle tea", description: "Mineral-rich herbal infusion" },
        ],
      },
    ],
  },
  waxing_crescent: {
    overview:
      "As energy begins to build, focus on nutrient-dense foods that strengthen bones, support vitamin D levels, and provide quality protein.",
    categories: [
      {
        name: "Calcium-Rich Foods",
        icon: Egg,
        color: "#4c1d95",
        items: [
          { name: "Yogurt & kefir", description: "Calcium plus probiotics" },
          { name: "Sardines with bones", description: "Excellent calcium source" },
          { name: "Broccoli & bok choy", description: "Plant-based calcium" },
          { name: "Fortified plant milk", description: "Almond, oat, or soy" },
        ],
      },
      {
        name: "Vitamin D Sources",
        icon: Flame,
        color: "#f59e0b",
        items: [
          { name: "Eggs", description: "Vitamin D in the yolks" },
          { name: "Fatty fish", description: "Salmon, mackerel, trout" },
          { name: "Mushrooms", description: "Sun-exposed for vitamin D" },
          { name: "Fortified foods", description: "Cereals, orange juice" },
        ],
      },
      {
        name: "Bone-Building Protein",
        icon: Leaf,
        color: "#7c3aed",
        items: [
          { name: "Chicken & turkey", description: "Lean protein for tissue repair" },
          { name: "Tofu & tempeh", description: "Plant protein plus isoflavones" },
          { name: "Collagen peptides", description: "Joint and bone support" },
          { name: "Greek yogurt", description: "High-protein dairy option" },
        ],
      },
    ],
  },
  first_quarter: {
    overview:
      "The First Quarter brings active energy. Fuel your body with complex carbohydrates, B vitamins, and iron-rich foods for sustained vitality.",
    categories: [
      {
        name: "Complex Carbohydrates",
        icon: Flame,
        color: "#6d28d9",
        items: [
          { name: "Sweet potatoes", description: "Steady energy and beta-carotene" },
          { name: "Quinoa", description: "Complete protein and complex carbs" },
          { name: "Brown rice", description: "B vitamins and sustained fuel" },
          { name: "Oats", description: "Fiber-rich energy source" },
        ],
      },
      {
        name: "B-Vitamin Foods",
        icon: Leaf,
        color: "#059669",
        items: [
          { name: "Nutritional yeast", description: "B12 and energy support" },
          { name: "Sunflower seeds", description: "B6, vitamin E, magnesium" },
          { name: "Avocado", description: "B5, B6, and healthy fats" },
          { name: "Lentils", description: "Folate and sustained energy" },
        ],
      },
      {
        name: "Iron-Rich Energizers",
        icon: Droplets,
        color: "#be185d",
        items: [
          { name: "Dark leafy greens", description: "Spinach, Swiss chard" },
          { name: "Pumpkin seeds", description: "Iron, zinc, and magnesium" },
          { name: "Lean red meat", description: "Highly absorbable iron" },
          { name: "Dried apricots", description: "Iron-rich snack option" },
        ],
      },
    ],
  },
  waxing_gibbous: {
    overview:
      "As energy builds toward its peak, nourish your hormonal balance with phytoestrogens, healthy fats, and adaptogenic herbs.",
    categories: [
      {
        name: "Phytoestrogen Foods",
        icon: Leaf,
        color: "#7c3aed",
        items: [
          { name: "Ground flaxseeds", description: "Lignans for hormone balance" },
          { name: "Organic soy foods", description: "Edamame, tofu, miso" },
          { name: "Sesame seeds", description: "Lignans and calcium combined" },
          { name: "Chickpeas", description: "Gentle phytoestrogen source" },
        ],
      },
      {
        name: "Healthy Fats",
        icon: Egg,
        color: "#f59e0b",
        items: [
          { name: "Extra virgin olive oil", description: "Anti-inflammatory fats" },
          { name: "Walnuts", description: "Omega-3s for brain and heart" },
          { name: "Avocado", description: "Monounsaturated fats" },
          { name: "Hemp seeds", description: "Balanced omega ratio" },
        ],
      },
      {
        name: "Adaptogenic Herbs",
        icon: Droplets,
        color: "#8b5cf6",
        items: [
          { name: "Ashwagandha", description: "Stress relief and hormone support" },
          { name: "Maca root", description: "Energy and hormonal balance" },
          { name: "Red clover tea", description: "Isoflavones for menopause" },
          { name: "Shatavari", description: "Traditional women's tonic" },
        ],
      },
    ],
  },
  full_moon: {
    overview:
      "The Full Moon is a time to celebrate and nourish fully. Enjoy antioxidant-rich, colorful foods and omega-3s to support radiant health.",
    categories: [
      {
        name: "Antioxidant-Rich Foods",
        icon: Flame,
        color: "#ef4444",
        items: [
          { name: "Dark berries", description: "Blueberries, blackberries, acai" },
          { name: "Pomegranate", description: "Polyphenols for heart health" },
          { name: "Red grapes", description: "Resveratrol and antioxidants" },
          { name: "Dark chocolate", description: "Flavonoids and joy" },
        ],
      },
      {
        name: "Colorful Produce",
        icon: Leaf,
        color: "#059669",
        items: [
          { name: "Rainbow salads", description: "Variety of colored vegetables" },
          { name: "Bell peppers", description: "Vitamin C in every color" },
          { name: "Beets & carrots", description: "Betalains and beta-carotene" },
          { name: "Purple cabbage", description: "Anthocyanins for vitality" },
        ],
      },
      {
        name: "Omega-3 Sources",
        icon: Droplets,
        color: "#0891b2",
        items: [
          { name: "Wild salmon", description: "EPA and DHA for brain health" },
          { name: "Sardines", description: "Omega-3s plus calcium" },
          { name: "Chia seeds", description: "Plant-based omega-3s" },
          { name: "Walnuts", description: "ALA and anti-inflammatory" },
        ],
      },
    ],
  },
  waning_gibbous: {
    overview:
      "As energy begins to ease, focus on heart-healthy foods. Nourish your cardiovascular system with olive oil, nuts, fatty fish, and whole grains.",
    categories: [
      {
        name: "Heart-Healthy Fats",
        icon: Droplets,
        color: "#8b5cf6",
        items: [
          { name: "Extra virgin olive oil", description: "Mediterranean staple for heart health" },
          { name: "Almonds & walnuts", description: "Lower cholesterol naturally" },
          { name: "Avocado", description: "Potassium and monounsaturated fats" },
          { name: "Flaxseed oil", description: "Plant-based omega-3s" },
        ],
      },
      {
        name: "Fatty Fish",
        icon: Egg,
        color: "#0891b2",
        items: [
          { name: "Salmon", description: "Omega-3s for heart and brain" },
          { name: "Mackerel", description: "Rich in EPA and DHA" },
          { name: "Herring", description: "Heart-protective fatty fish" },
          { name: "Trout", description: "Lean protein with omega-3s" },
        ],
      },
      {
        name: "Whole Grains",
        icon: Leaf,
        color: "#a78bfa",
        items: [
          { name: "Oats", description: "Beta-glucan for cholesterol" },
          { name: "Barley", description: "Soluble fiber for heart health" },
          { name: "Farro", description: "Ancient grain, rich in fiber" },
          { name: "Buckwheat", description: "Rutin for circulation" },
        ],
      },
    ],
  },
  last_quarter: {
    overview:
      "The Last Quarter supports release and digestion. Focus on fiber-rich foods, probiotics, and warming meals that soothe your gut.",
    categories: [
      {
        name: "Fiber-Rich Foods",
        icon: Leaf,
        color: "#a78bfa",
        items: [
          { name: "Lentils & beans", description: "Soluble and insoluble fiber" },
          { name: "Artichokes", description: "Prebiotic fiber for gut health" },
          { name: "Pears & apples", description: "Pectin for gentle digestion" },
          { name: "Chia & flax seeds", description: "Fiber plus healthy fats" },
        ],
      },
      {
        name: "Probiotic Foods",
        icon: Droplets,
        color: "#c4b5fd",
        items: [
          { name: "Yogurt & kefir", description: "Live cultures for gut balance" },
          { name: "Sauerkraut", description: "Fermented cabbage, probiotic-rich" },
          { name: "Kimchi", description: "Spicy fermented vegetables" },
          { name: "Kombucha", description: "Fermented tea for digestion" },
        ],
      },
      {
        name: "Warming Meals",
        icon: Flame,
        color: "#8b5cf6",
        items: [
          { name: "Bone broth", description: "Collagen and minerals for gut lining" },
          { name: "Slow-cooked stews", description: "Easy to digest, nourishing" },
          { name: "Roasted root vegetables", description: "Warming and grounding" },
          { name: "Congee or porridge", description: "Gentle on the digestive system" },
        ],
      },
    ],
  },
  waning_crescent: {
    overview:
      "The Waning Crescent is a time for deep rest. Choose magnesium-rich, calming foods and warm comfort meals that support restorative sleep.",
    categories: [
      {
        name: "Magnesium-Rich Foods",
        icon: Droplets,
        color: "#c4b5fd",
        items: [
          { name: "Dark chocolate", description: "Magnesium and gentle comfort" },
          { name: "Pumpkin seeds", description: "Magnesium and zinc" },
          { name: "Bananas", description: "Magnesium, potassium, tryptophan" },
          { name: "Spinach", description: "Magnesium and calming minerals" },
        ],
      },
      {
        name: "Calming Teas & Drinks",
        icon: Leaf,
        color: "#1e1b4b",
        items: [
          { name: "Chamomile tea", description: "Calming and sleep-promoting" },
          { name: "Valerian root tea", description: "Natural sleep support" },
          { name: "Warm golden milk", description: "Turmeric, cinnamon, warmth" },
          { name: "Tart cherry juice", description: "Natural melatonin source" },
        ],
      },
      {
        name: "Warm Comfort Foods",
        icon: Flame,
        color: "#4c1d95",
        items: [
          { name: "Warm oatmeal", description: "Serotonin-boosting comfort" },
          { name: "Sweet potato soup", description: "Nourishing and grounding" },
          { name: "Baked apples with cinnamon", description: "Gentle, warming dessert" },
          { name: "Warm nut butter toast", description: "Protein and healthy fats" },
        ],
      },
    ],
  },
};

export default function NutritionPage() {
  const { currentPhase, currentPhaseInfo, isRegular, currentMoonPhase, currentMoonInfo } =
    useCycleData();
  const addPhaseGroceries = useCycleStore((s) => s.addPhaseGroceries);

  const nutrition = isRegular ? phaseNutrition[currentPhase] : moonNutrition[currentMoonPhase];
  const info = isRegular ? phaseInfo[currentPhase] : moonPhaseInfo[currentMoonPhase];

  const subtitle = isRegular
    ? `${currentPhaseInfo.name} Phase - ${info.emoji} ${currentPhaseInfo.description}`
    : `${currentMoonInfo.name} - ${currentMoonInfo.emoji} ${currentMoonInfo.energy}`;

  function handleAddToGroceryList() {
    const items = nutrition.categories.flatMap((cat) =>
      cat.items.map((item) => ({
        name: item.name,
        category: cat.name,
      }))
    );
    addPhaseGroceries(currentPhase, items);
  }

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
            style={{ backgroundColor: `${info.color}20` }}
          >
            <Apple className="h-5 w-5" style={{ color: info.color }} />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Nutrition
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              {subtitle}
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
          {nutrition.overview}
        </p>
        <button
          onClick={handleAddToGroceryList}
          className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Grocery List
        </button>
      </motion.div>

      {/* Categories */}
      <div className="space-y-6">
        {nutrition.categories.map((category, catIndex) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + catIndex * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4" style={{ color: category.color }} />
                <h2 className="font-cormorant text-xl font-semibold text-text-primary">
                  {category.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-[16px] border border-border-light bg-bg-card p-4 hover:bg-bg-secondary/50 transition-colors"
                  >
                    <h3 className="font-quicksand font-semibold text-sm text-text-primary">
                      {item.name}
                    </h3>
                    <p className="text-xs text-text-muted font-quicksand mt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
