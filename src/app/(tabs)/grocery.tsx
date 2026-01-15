import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  Sparkles,
  X,
  Moon,
} from 'lucide-react-native';
import { useCycleStore, phaseInfo, CyclePhase, getMoonPhase, moonPhaseInfo, getMoonPhaseCycleEquivalent, LifeStage } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import * as Haptics from 'expo-haptics';
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

const phaseColors: Record<CyclePhase, string> = {
  menstrual: '#be185d',
  follicular: '#ec4899',
  ovulatory: '#f9a8d4',
  luteal: '#9333ea',
};

const lifeStageAccentColors: Record<LifeStage, string> = {
  regular: '#ec4899',
  perimenopause: '#f59e0b',
  menopause: '#8b5cf6',
};

export default function GroceryScreen() {
  const insets = useSafeAreaInsets();
  const groceryList = useCycleStore(s => s.groceryList);
  const toggleGroceryItem = useCycleStore(s => s.toggleGroceryItem);
  const removeGroceryItem = useCycleStore(s => s.removeGroceryItem);
  const clearGroceryList = useCycleStore(s => s.clearGroceryList);
  const addGroceryItem = useCycleStore(s => s.addGroceryItem);
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const addPhaseGroceries = useCycleStore(s => s.addPhaseGroceries);
  const lifeStage = useCycleStore(s => s.lifeStage);
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const [newItemName, setNewItemName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  // Calculate moon phase and corresponding cycle phase for peri/menopause
  const moonPhaseData = useMemo(() => {
    const currentMoonPhase = getMoonPhase();
    const moonInfo = moonPhaseInfo[currentMoonPhase];
    const equivalentCyclePhase = getMoonPhaseCycleEquivalent(currentMoonPhase);
    return { moonPhase: currentMoonPhase, moonInfo, equivalentCyclePhase };
  }, []);

  const isUsingMoonPhase = lifeStage === 'perimenopause' || lifeStage === 'menopause';

  if (!fontsLoaded) return null;

  // For regular cycles, use the actual cycle phase
  // For peri/menopause, use moon phase equivalent
  const currentPhase = isUsingMoonPhase ? moonPhaseData.equivalentCyclePhase : getCurrentPhase();
  const info = phaseInfo[currentPhase];
  const accentColor = isUsingMoonPhase ? lifeStageAccentColors[lifeStage] : info.color;

  // Display info based on life stage
  const displayTitle = isUsingMoonPhase
    ? `Add ${moonPhaseData.moonInfo.name} Foods`
    : `Add ${info.name} Phase Foods`;

  const displaySubtitle = isUsingMoonPhase
    ? `${moonPhaseData.moonInfo.emoji} Aligned with today's moon`
    : 'Recommended for your current phase';

  const handleToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleGroceryItem(id);
  };

  const handleRemove = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeGroceryItem(id);
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addGroceryItem({
        name: newItemName.trim(),
        phase: currentPhase,
        category: 'Custom',
        isChecked: false,
      });
      setNewItemName('');
      setShowAddInput(false);
    }
  };

  const handleAddPhaseItems = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPhaseGroceries(currentPhase);
  };

  const uncheckedItems = groceryList.filter(item => !item.isChecked);
  const checkedItems = groceryList.filter(item => item.isChecked);

  // Group unchecked by category
  const groupedItems = uncheckedItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof uncheckedItems>);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <Text
              style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
              className="text-sm tracking-widest uppercase"
            >
              {isUsingMoonPhase ? 'Moon-Synced Shopping' : 'Shopping'}
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
              className="text-3xl mt-1"
            >
              Grocery List
            </Text>
          </Animated.View>

          {/* Quick Add Phase Foods */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-6"
          >
            <Pressable
              onPress={handleAddPhaseItems}
              className="overflow-hidden rounded-2xl"
            >
              <View
                className="p-4 flex-row items-center justify-between rounded-2xl border"
                style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}30` }}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    {isUsingMoonPhase ? (
                      <Moon size={20} color={accentColor} />
                    ) : (
                      <Sparkles size={20} color={accentColor} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-sm"
                    >
                      {displayTitle}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-xs"
                    >
                      {displaySubtitle}
                    </Text>
                  </View>
                </View>
                <Plus size={20} color={accentColor} />
              </View>
            </Pressable>
          </Animated.View>

          {/* Moon Phase Info Card - Only for peri/menopause */}
          {isUsingMoonPhase && (
            <Animated.View
              entering={FadeInUp.delay(220).duration(600)}
              className="mx-6 mt-3"
            >
              <View
                className="p-3 rounded-xl border"
                style={{ backgroundColor: `${accentColor}08`, borderColor: `${accentColor}20` }}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-2">{moonPhaseData.moonInfo.emoji}</Text>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: accentColor }}
                      className="text-xs"
                    >
                      {moonPhaseData.moonInfo.name} • {moonPhaseData.moonInfo.energy}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
                      className="text-xs mt-0.5"
                    >
                      Foods aligned with {info.name.toLowerCase()} phase energy
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Stats */}
          <Animated.View
            entering={FadeInUp.delay(250).duration(600)}
            className="mx-6 mt-4 flex-row"
          >
            <View
              className="flex-1 rounded-2xl p-4 mr-2 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-2xl"
              >
                {uncheckedItems.length}
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs"
              >
                Items to get
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4 ml-2 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-2xl"
              >
                {checkedItems.length}
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs"
              >
                Completed
              </Text>
            </View>
          </Animated.View>

          {/* Add Custom Item */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-6"
          >
            {showAddInput ? (
              <View
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View className="flex-row items-center">
                  <TextInput
                    value={newItemName}
                    onChangeText={setNewItemName}
                    placeholder="Add item..."
                    placeholderTextColor={theme.text.muted}
                    className="flex-1 text-base"
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.primary }}
                    autoFocus
                    onSubmitEditing={handleAddItem}
                  />
                  <Pressable
                    onPress={handleAddItem}
                    className="w-10 h-10 rounded-full items-center justify-center ml-2"
                    style={{ backgroundColor: `${theme.accent.pink}20` }}
                  >
                    <Check size={20} color={theme.accent.pink} />
                  </Pressable>
                  <Pressable
                    onPress={() => setShowAddInput(false)}
                    className="w-10 h-10 rounded-full items-center justify-center ml-2"
                    style={{ backgroundColor: `${theme.accent.purple}15` }}
                  >
                    <X size={20} color={theme.accent.purple} />
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowAddInput(true)}
                className="rounded-2xl p-4 border flex-row items-center justify-center"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <Plus size={18} color={theme.accent.pink} />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }}
                  className="text-sm ml-2"
                >
                  Add Custom Item
                </Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Grocery Items by Category */}
          {Object.keys(groupedItems).length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(400).duration(600)}
              className="mt-6"
            >
              {Object.entries(groupedItems).map(([category, items], catIndex) => (
                <View key={category} className="mb-4">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
                    className="text-xs uppercase tracking-wider mb-2 px-6"
                  >
                    {category}
                  </Text>
                  <View
                    className="mx-6 rounded-2xl border overflow-hidden"
                    style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                  >
                    {items.map((item, index) => (
                      <Animated.View
                        key={item.id}
                        entering={FadeInUp.delay(450 + index * 30).duration(400)}
                        exiting={FadeOut.duration(200)}
                        layout={Layout.springify()}
                      >
                        <Pressable
                          onPress={() => handleToggle(item.id)}
                          className={`flex-row items-center p-4 ${
                            index > 0 ? 'border-t' : ''
                          }`}
                          style={{ borderTopColor: theme.border.light }}
                        >
                          <View
                            className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3`}
                            style={{
                              backgroundColor: item.isChecked ? theme.accent.purple : 'transparent',
                              borderColor: item.isChecked ? theme.accent.purple : theme.text.muted,
                            }}
                          >
                            {item.isChecked && <Check size={14} color="#fff" />}
                          </View>
                          <View className="flex-1">
                            <Text
                              style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                              className="text-sm"
                            >
                              {item.name}
                            </Text>
                          </View>
                          <View
                            className="w-2 h-2 rounded-full mr-3"
                            style={{ backgroundColor: phaseColors[item.phase] }}
                          />
                          <Pressable
                            onPress={() => handleRemove(item.id)}
                            hitSlop={10}
                          >
                            <Trash2 size={16} color={theme.accent.blush} />
                          </Pressable>
                        </Pressable>
                      </Animated.View>
                    ))}
                  </View>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Checked Items */}
          {checkedItems.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(500).duration(600)}
              className="mt-4"
            >
              <View className="px-6 flex-row items-center justify-between mb-2">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.muted }}
                  className="text-xs uppercase tracking-wider"
                >
                  Completed ({checkedItems.length})
                </Text>
                <Pressable onPress={clearGroceryList}>
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.blush }}
                    className="text-xs"
                  >
                    Clear All
                  </Text>
                </Pressable>
              </View>
              <View
                className="mx-6 rounded-2xl border overflow-hidden"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light, opacity: 0.7 }}
              >
                {checkedItems.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    entering={FadeInUp.delay(550 + index * 20).duration(300)}
                    exiting={FadeOut.duration(200)}
                    layout={Layout.springify()}
                  >
                    <Pressable
                      onPress={() => handleToggle(item.id)}
                      className={`flex-row items-center p-4 ${
                        index > 0 ? 'border-t' : ''
                      }`}
                      style={{ borderTopColor: theme.border.light }}
                    >
                      <View
                        className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
                        style={{ backgroundColor: `${theme.accent.purple}30`, borderColor: `${theme.accent.purple}50` }}
                      >
                        <Check size={14} color={theme.accent.pink} />
                      </View>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted, textDecorationLine: 'line-through' }}
                        className="text-sm flex-1"
                      >
                        {item.name}
                      </Text>
                      <Pressable
                        onPress={() => handleRemove(item.id)}
                        hitSlop={10}
                      >
                        <Trash2 size={16} color={`${theme.accent.blush}80`} />
                      </Pressable>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Empty State */}
          {groceryList.length === 0 && (
            <Animated.View
              entering={FadeInUp.delay(400).duration(600)}
              className="mx-6 mt-12 items-center"
            >
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                {isUsingMoonPhase ? (
                  <Moon size={32} color={accentColor} />
                ) : (
                  <ShoppingCart size={32} color={accentColor} />
                )}
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-lg mb-2"
              >
                Your list is empty
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
                className="text-sm text-center"
              >
                {isUsingMoonPhase
                  ? `Add foods aligned with the ${moonPhaseData.moonInfo.name}\nor tap above to add moon-synced items`
                  : 'Add foods from the Nutrition tab or\ntap above to add phase-specific items'}
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
