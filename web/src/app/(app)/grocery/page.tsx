"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Trash2, Check } from "lucide-react";
import { useCycleStore, type GroceryItem } from "@/stores/cycle-store";
import { useCycleData } from "@/hooks/use-cycle-data";
import { phaseInfo } from "@/lib/cycle/data";
import { Button } from "@/components/ui/button";

const phaseGroceryDefaults: Record<string, Array<{ name: string; category: string }>> = {
  menstrual: [
    { name: "Spinach", category: "Iron-Rich Foods" },
    { name: "Lentils", category: "Iron-Rich Foods" },
    { name: "Dark chocolate 70%", category: "Iron-Rich Foods" },
    { name: "Turmeric", category: "Anti-Inflammatory" },
    { name: "Ginger", category: "Anti-Inflammatory" },
    { name: "Salmon", category: "Anti-Inflammatory" },
    { name: "Chamomile tea", category: "Comfort & Warmth" },
    { name: "Sweet potatoes", category: "Comfort & Warmth" },
    { name: "Oats", category: "Comfort & Warmth" },
  ],
  follicular: [
    { name: "Flaxseeds", category: "Estrogen-Supporting" },
    { name: "Sprouts", category: "Estrogen-Supporting" },
    { name: "Oranges", category: "Estrogen-Supporting" },
    { name: "Kimchi", category: "Estrogen-Supporting" },
    { name: "Chicken breast", category: "Energy Foods" },
    { name: "Avocado", category: "Energy Foods" },
    { name: "Pumpkin seeds", category: "Energy Foods" },
    { name: "Coconut water", category: "Hydration" },
    { name: "Green tea", category: "Hydration" },
  ],
  ovulatory: [
    { name: "Broccoli", category: "Fiber-Rich" },
    { name: "Quinoa", category: "Fiber-Rich" },
    { name: "Raspberries", category: "Fiber-Rich" },
    { name: "Chia seeds", category: "Fiber-Rich" },
    { name: "Eggs", category: "Light Proteins" },
    { name: "Chickpeas", category: "Light Proteins" },
    { name: "Bell peppers", category: "Antioxidant Boost" },
    { name: "Blueberries", category: "Antioxidant Boost" },
    { name: "Tomatoes", category: "Antioxidant Boost" },
  ],
  luteal: [
    { name: "Sweet potatoes", category: "Complex Carbs" },
    { name: "Brown rice", category: "Complex Carbs" },
    { name: "Butternut squash", category: "Complex Carbs" },
    { name: "Dark chocolate", category: "Magnesium-Rich" },
    { name: "Bananas", category: "Magnesium-Rich" },
    { name: "Cashews", category: "Magnesium-Rich" },
    { name: "Turkey", category: "Serotonin Support" },
    { name: "Sunflower seeds", category: "Serotonin Support" },
    { name: "Salmon", category: "Serotonin Support" },
  ],
};

export default function GroceryPage() {
  const { currentPhase } = useCycleData();
  const { groceryList, toggleGroceryItem, clearGroceryList, addPhaseGroceries } =
    useCycleStore();

  const info = phaseInfo[currentPhase];

  const groupedItems = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    groceryList.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [groceryList]);

  const checkedCount = groceryList.filter((i) => i.isChecked).length;
  const totalCount = groceryList.length;

  function handleAddPhaseItems() {
    const defaults = phaseGroceryDefaults[currentPhase] || [];
    addPhaseGroceries(currentPhase, defaults);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: `${info.color}20` }}
          >
            <ShoppingCart className="h-5 w-5" style={{ color: info.color }} />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Grocery List
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              {totalCount > 0
                ? `${checkedCount} of ${totalCount} items checked`
                : "Add items for your current phase"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3 mb-6"
      >
        <Button onClick={handleAddPhaseItems} size="sm">
          <Plus className="h-4 w-4" />
          Add Phase Items
        </Button>
        {totalCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearGroceryList}>
            <Trash2 className="h-4 w-4" />
            Clear List
          </Button>
        )}
      </motion.div>

      {/* Grocery List */}
      {totalCount === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <ShoppingCart className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted font-quicksand mb-1">
            Your grocery list is empty
          </p>
          <p className="text-xs text-text-muted font-quicksand">
            Add phase-specific items or visit the Nutrition page to add recommended foods.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {Object.entries(groupedItems).map(([category, items]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-2">
                  {category}
                </h2>
                <div className="rounded-[20px] border border-border-light bg-bg-card overflow-hidden">
                  {items.map((item, index) => (
                    <motion.button
                      key={item.id}
                      layout
                      onClick={() => toggleGroceryItem(item.id)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-bg-secondary/30 ${
                        index < items.length - 1 ? "border-b border-border-light" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-colors flex-shrink-0 ${
                          item.isChecked
                            ? "bg-accent-purple border-accent-purple"
                            : "border-border-medium"
                        }`}
                      >
                        {item.isChecked && (
                          <Check className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>
                      <span
                        className={`font-quicksand text-sm transition-all ${
                          item.isChecked
                            ? "text-text-muted line-through"
                            : "text-text-primary"
                        }`}
                      >
                        {item.name}
                      </span>
                      <span
                        className="ml-auto px-2 py-0.5 rounded-lg text-[10px] font-quicksand font-medium capitalize"
                        style={{
                          backgroundColor: `${phaseInfo[item.phase]?.color || info.color}15`,
                          color: phaseInfo[item.phase]?.color || info.color,
                        }}
                      >
                        {item.phase}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Progress */}
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-quicksand">Progress</span>
            <span className="text-xs text-text-accent font-quicksand font-semibold">
              {Math.round((checkedCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-rose to-accent-purple"
              initial={{ width: 0 }}
              animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
