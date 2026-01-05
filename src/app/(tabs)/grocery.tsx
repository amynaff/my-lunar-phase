import React, { useState } from 'react';
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
} from 'lucide-react-native';
import { useCycleStore, phaseInfo, CyclePhase } from '@/lib/cycle-store';
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

export default function GroceryScreen() {
  const insets = useSafeAreaInsets();
  const groceryList = useCycleStore(s => s.groceryList);
  const toggleGroceryItem = useCycleStore(s => s.toggleGroceryItem);
  const removeGroceryItem = useCycleStore(s => s.removeGroceryItem);
  const clearGroceryList = useCycleStore(s => s.clearGroceryList);
  const addGroceryItem = useCycleStore(s => s.addGroceryItem);
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const addPhaseGroceries = useCycleStore(s => s.addPhaseGroceries);

  const [newItemName, setNewItemName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const currentPhase = getCurrentPhase();
  const info = phaseInfo[currentPhase];

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
        colors={['#0f0720', '#1e0a3c', '#2d1050', '#1e0a3c', '#0f0720']}
        locations={[0, 0.3, 0.5, 0.7, 1]}
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
              style={{ fontFamily: 'CormorantGaramond_400Regular' }}
              className="text-luna-300/60 text-sm tracking-widest uppercase"
            >
              Shopping
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
              className="text-white text-3xl mt-1"
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
              <LinearGradient
                colors={[`${info.color}30`, `${info.color}10`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${info.color}40` }}
                  >
                    <Sparkles size={20} color={info.color} />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold' }}
                      className="text-white text-sm"
                    >
                      Add {info.name} Phase Foods
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular' }}
                      className="text-luna-300/70 text-xs"
                    >
                      Recommended for your current phase
                    </Text>
                  </View>
                </View>
                <Plus size={20} color="#fff" />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Stats */}
          <Animated.View
            entering={FadeInUp.delay(250).duration(600)}
            className="mx-6 mt-4 flex-row"
          >
            <View className="flex-1 bg-white/5 rounded-2xl p-4 mr-2 border border-white/10">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold' }}
                className="text-white text-2xl"
              >
                {uncheckedItems.length}
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular' }}
                className="text-luna-300/70 text-xs"
              >
                Items to get
              </Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-2xl p-4 ml-2 border border-white/10">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold' }}
                className="text-white text-2xl"
              >
                {checkedItems.length}
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular' }}
                className="text-luna-300/70 text-xs"
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
              <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <View className="flex-row items-center">
                  <TextInput
                    value={newItemName}
                    onChangeText={setNewItemName}
                    placeholder="Add item..."
                    placeholderTextColor="rgba(249, 168, 212, 0.4)"
                    className="flex-1 text-white text-base"
                    style={{ fontFamily: 'Quicksand_400Regular' }}
                    autoFocus
                    onSubmitEditing={handleAddItem}
                  />
                  <Pressable
                    onPress={handleAddItem}
                    className="w-10 h-10 rounded-full bg-luna-500/30 items-center justify-center ml-2"
                  >
                    <Check size={20} color="#f472b6" />
                  </Pressable>
                  <Pressable
                    onPress={() => setShowAddInput(false)}
                    className="w-10 h-10 rounded-full bg-white/10 items-center justify-center ml-2"
                  >
                    <X size={20} color="#a78bfa" />
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowAddInput(true)}
                className="bg-white/5 rounded-2xl p-4 border border-white/10 flex-row items-center justify-center"
              >
                <Plus size={18} color="#f472b6" />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium' }}
                  className="text-luna-300 text-sm ml-2"
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
                    style={{ fontFamily: 'Quicksand_600SemiBold' }}
                    className="text-luna-400 text-xs uppercase tracking-wider mb-2 px-6"
                  >
                    {category}
                  </Text>
                  <View className="mx-6 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
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
                            index > 0 ? 'border-t border-white/10' : ''
                          }`}
                        >
                          <View
                            className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                              item.isChecked
                                ? 'bg-luna-500 border-luna-500'
                                : 'border-luna-400/50'
                            }`}
                          >
                            {item.isChecked && <Check size={14} color="#fff" />}
                          </View>
                          <View className="flex-1">
                            <Text
                              style={{ fontFamily: 'Quicksand_500Medium' }}
                              className="text-white text-sm"
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
                            <Trash2 size={16} color="#fb7185" />
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
                  style={{ fontFamily: 'Quicksand_600SemiBold' }}
                  className="text-luna-400/60 text-xs uppercase tracking-wider"
                >
                  Completed ({checkedItems.length})
                </Text>
                <Pressable onPress={clearGroceryList}>
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium' }}
                    className="text-blush-400 text-xs"
                  >
                    Clear All
                  </Text>
                </Pressable>
              </View>
              <View className="mx-6 bg-white/3 rounded-2xl border border-white/5 overflow-hidden">
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
                        index > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <View className="w-6 h-6 rounded-full bg-luna-500/30 border-2 border-luna-500/50 items-center justify-center mr-3">
                        <Check size={14} color="#f472b6" />
                      </View>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular' }}
                        className="text-luna-300/50 text-sm flex-1 line-through"
                      >
                        {item.name}
                      </Text>
                      <Pressable
                        onPress={() => handleRemove(item.id)}
                        hitSlop={10}
                      >
                        <Trash2 size={16} color="rgba(251, 113, 133, 0.5)" />
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
              <View className="w-20 h-20 rounded-full bg-luna-500/10 items-center justify-center mb-4">
                <ShoppingCart size={32} color="#f472b6" />
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold' }}
                className="text-white text-lg mb-2"
              >
                Your list is empty
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular' }}
                className="text-luna-300/60 text-sm text-center"
              >
                Add foods from the Nutrition tab or{'\n'}tap above to add phase-specific items
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
