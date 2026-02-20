import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import {
  ShoppingCart,
  Check,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCycleStore, GroceryItem } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
} from '@expo-google-fonts/quicksand';

// Category colors
const categoryColors: Record<string, string> = {
  Protein: '#ef4444',
  Vegetables: '#22c55e',
  Fruits: '#f97316',
  Seeds: '#eab308',
  Nuts: '#a16207',
  Grains: '#d97706',
  Dairy: '#3b82f6',
  Beverages: '#06b6d4',
  Pantry: '#8b5cf6',
  Oils: '#fbbf24',
  Produce: '#10b981',
  Supplements: '#ec4899',
  Fermented: '#14b8a6',
  Spices: '#f43f5e',
};

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggle: () => void;
  onRemove: () => void;
  theme: ReturnType<typeof getTheme>;
}

function GroceryItemRow({ item, onToggle, onRemove, theme }: GroceryItemRowProps) {
  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemove();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      layout={Layout.springify()}
      className="flex-row items-center py-3 px-4 border-b"
      style={{ borderColor: theme.border.light }}
    >
      <Pressable
        onPress={handleToggle}
        className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
        style={{
          borderColor: item.isChecked ? theme.accent.pink : theme.border.medium,
          backgroundColor: item.isChecked ? theme.accent.pink : 'transparent',
        }}
      >
        {item.isChecked && <Check size={14} color="#fff" strokeWidth={3} />}
      </Pressable>

      <View className="flex-1">
        <Text
          style={{
            fontFamily: 'Quicksand_500Medium',
            color: item.isChecked ? theme.text.muted : theme.text.primary,
            textDecorationLine: item.isChecked ? 'line-through' : 'none',
          }}
          className="text-base"
        >
          {item.name}
        </Text>
      </View>

      <View
        className="px-2 py-1 rounded-full mr-2"
        style={{ backgroundColor: `${categoryColors[item.category] || theme.accent.purple}15` }}
      >
        <Text
          style={{
            fontFamily: 'Quicksand_400Regular',
            color: categoryColors[item.category] || theme.accent.purple,
          }}
          className="text-xs"
        >
          {item.category}
        </Text>
      </View>

      <Pressable onPress={handleRemove} className="p-2 -mr-2">
        <Trash2 size={16} color={theme.text.muted} />
      </Pressable>
    </Animated.View>
  );
}

interface CategorySectionProps {
  category: string;
  items: GroceryItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  theme: ReturnType<typeof getTheme>;
}

function CategorySection({ category, items, onToggle, onRemove, theme }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const checkedCount = items.filter(i => i.isChecked).length;
  const categoryColor = categoryColors[category] || theme.accent.purple;

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded(!expanded);
        }}
        className="flex-row items-center justify-between py-3 px-4 rounded-xl"
        style={{ backgroundColor: `${categoryColor}10` }}
      >
        <View className="flex-row items-center">
          <View
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: categoryColor }}
          />
          <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
            {category}
          </Text>
          <View
            className="ml-2 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: theme.bg.tertiary }}
          >
            <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }} className="text-xs">
              {checkedCount}/{items.length}
            </Text>
          </View>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={theme.text.tertiary} />
        ) : (
          <ChevronDown size={18} color={theme.text.tertiary} />
        )}
      </Pressable>

      {expanded && (
        <View
          className="mt-2 rounded-xl overflow-hidden border"
          style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
        >
          {items.map((item) => (
            <GroceryItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggle(item.id)}
              onRemove={() => onRemove(item.id)}
              theme={theme}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function GroceryScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const groceryList = useCycleStore(s => s.groceryList);
  const toggleGroceryItem = useCycleStore(s => s.toggleGroceryItem);
  const removeGroceryItem = useCycleStore(s => s.removeGroceryItem);
  const clearGroceryList = useCycleStore(s => s.clearGroceryList);
  const addGroceryItem = useCycleStore(s => s.addGroceryItem);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Pantry');

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    groceryList.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [groceryList]);

  const totalItems = groceryList.length;
  const checkedItems = groceryList.filter(i => i.isChecked).length;

  const handleAddItem = () => {
    if (newItemName.trim()) {
      addGroceryItem({
        name: newItemName.trim(),
        phase: 'follicular',
        category: newItemCategory,
        isChecked: false,
      });
      setNewItemName('');
      setShowAddForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    clearGroceryList();
  };

  const handleClearChecked = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    groceryList.filter(i => i.isChecked).forEach(i => removeGroceryItem(i.id));
  };

  if (!fontsLoaded) return null;

  return (
    <View className="flex-1">
      <LinearGradient colors={theme.gradient} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={{ paddingTop: insets.top + 16 }} className="px-6">
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }} className="text-sm tracking-widest uppercase">
              Shopping List
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }} className="text-3xl mt-1">
              Grocery List
            </Text>
          </Animated.View>

          {/* Stats Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <View
              className="rounded-2xl p-4 border flex-row items-center justify-between"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${theme.accent.pink}15` }}
                >
                  <ShoppingCart size={24} color={theme.accent.pink} />
                </View>
                <View className="ml-3">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                    {checkedItems} of {totalItems}
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-sm">
                    items checked
                  </Text>
                </View>
              </View>

              {totalItems > 0 && (
                <View className="flex-row">
                  {checkedItems > 0 && (
                    <Pressable
                      onPress={handleClearChecked}
                      className="px-3 py-2 rounded-full mr-2"
                      style={{ backgroundColor: `${theme.accent.purple}15` }}
                    >
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }} className="text-xs">
                        Clear Done
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={handleClearAll}
                    className="px-3 py-2 rounded-full"
                    style={{ backgroundColor: `${theme.accent.blush}15` }}
                  >
                    <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.blush }} className="text-xs">
                      Clear All
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Add Item Button/Form */}
          <Animated.View entering={FadeInUp.delay(250).duration(600)} className="mx-6 mt-4">
            {showAddForm ? (
              <View
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View className="flex-row items-center mb-3">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="flex-1">
                    Add Item
                  </Text>
                  <Pressable onPress={() => setShowAddForm(false)}>
                    <X size={20} color={theme.text.muted} />
                  </Pressable>
                </View>
                <TextInput
                  value={newItemName}
                  onChangeText={setNewItemName}
                  placeholder="Item name..."
                  placeholderTextColor={theme.text.muted}
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    color: theme.text.primary,
                    backgroundColor: theme.bg.tertiary,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                  }}
                  autoFocus
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  {Object.keys(categoryColors).map(cat => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewItemCategory(cat)}
                      className="px-3 py-2 rounded-full mr-2"
                      style={{
                        backgroundColor: newItemCategory === cat ? categoryColors[cat] : `${categoryColors[cat]}15`,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Quicksand_500Medium',
                          color: newItemCategory === cat ? '#fff' : categoryColors[cat],
                        }}
                        className="text-xs"
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable
                  onPress={handleAddItem}
                  className="rounded-xl py-3 items-center"
                  style={{ backgroundColor: theme.accent.pink }}
                >
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold' }} className="text-white">
                    Add to List
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAddForm(true);
                }}
                className="flex-row items-center justify-center py-3 rounded-xl border border-dashed"
                style={{ borderColor: theme.border.medium }}
              >
                <Plus size={18} color={theme.text.tertiary} />
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }} className="ml-2">
                  Add Custom Item
                </Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Grocery List */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mx-6 mt-6">
            {totalItems === 0 ? (
              <View className="items-center py-12">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: `${theme.accent.pink}10` }}
                >
                  <ShoppingCart size={36} color={theme.accent.pink} />
                </View>
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-2">
                  Your list is empty
                </Text>
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-center px-8">
                  Add items from the Nutrition tab or create custom items above
                </Text>
              </View>
            ) : (
              Object.entries(groupedItems)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, items]) => (
                  <CategorySection
                    key={category}
                    category={category}
                    items={items}
                    onToggle={toggleGroceryItem}
                    onRemove={removeGroceryItem}
                    theme={theme}
                  />
                ))
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
