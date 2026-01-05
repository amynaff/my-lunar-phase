import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Line,
  G,
  Text as SvgText,
} from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useCycleStore } from '@/lib/cycle-store';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 180;
const PADDING = { top: 30, bottom: 40, left: 10, right: 10 };
const CHART_WIDTH = GRAPH_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = GRAPH_HEIGHT - PADDING.top - PADDING.bottom;

// Phase colors - softer, lighter tones
const phaseColors = {
  menstrual: { main: '#ff8aa6', light: '#ffd6df', gradient: ['#ffb3c4', '#ff8aa6'] },
  follicular: { main: '#f9a8d4', light: '#fce7f3', gradient: ['#fbcfe8', '#f9a8d4'] },
  ovulatory: { main: '#c4b5fd', light: '#ede5ff', gradient: ['#ddd2fe', '#c4b5fd'] },
  luteal: { main: '#b9a6f7', light: '#e4deff', gradient: ['#d1c7ff', '#b9a6f7'] },
};

// Hormone curve data points (simplified representation)
// Estrogen peaks at ovulation, Progesterone peaks in luteal phase
const generateHormoneData = (cycleLength: number) => {
  const points = 100;
  const estrogen: number[] = [];
  const progesterone: number[] = [];

  for (let i = 0; i <= points; i++) {
    const x = i / points;
    const dayOfCycle = x * cycleLength;

    // Estrogen: low during menstrual, rises in follicular, peaks at ovulation, drops then slight rise in luteal
    let estrogenVal = 0;
    if (dayOfCycle <= 5) {
      // Menstrual - low
      estrogenVal = 0.2 + (dayOfCycle / 5) * 0.1;
    } else if (dayOfCycle <= 13) {
      // Follicular - rising
      estrogenVal = 0.3 + ((dayOfCycle - 5) / 8) * 0.6;
    } else if (dayOfCycle <= 16) {
      // Ovulatory - peak then drop
      const ovProgress = (dayOfCycle - 13) / 3;
      estrogenVal = ovProgress < 0.5 ? 0.9 + ovProgress * 0.2 : 1.0 - (ovProgress - 0.5) * 0.6;
    } else {
      // Luteal - moderate with slight rise
      const lutealProgress = (dayOfCycle - 16) / (cycleLength - 16);
      estrogenVal = 0.5 + Math.sin(lutealProgress * Math.PI) * 0.15;
    }
    estrogen.push(estrogenVal);

    // Progesterone: very low until ovulation, then rises and peaks mid-luteal, drops before period
    let progesteroneVal = 0;
    if (dayOfCycle <= 14) {
      // Low before ovulation
      progesteroneVal = 0.1;
    } else {
      // Rise after ovulation, peak mid-luteal, drop before period
      const lutealProgress = (dayOfCycle - 14) / (cycleLength - 14);
      progesteroneVal = 0.1 + Math.sin(lutealProgress * Math.PI) * 0.8;
    }
    progesterone.push(progesteroneVal);
  }

  return { estrogen, progesterone };
};

const createSmoothPath = (data: number[], width: number, height: number, yOffset: number = 0): string => {
  if (data.length < 2) return '';

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - val * height * 0.85 + yOffset,
  }));

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

interface Props {
  showLabels?: boolean;
}

export function CycleGraph({ showLabels = true }: Props) {
  const cycleLength = useCycleStore(s => s.cycleLength);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);
  const dayOfCycle = getDayOfCycle();

  const { estrogen, progesterone } = generateHormoneData(cycleLength);

  const estrogenPath = createSmoothPath(estrogen, CHART_WIDTH, CHART_HEIGHT, PADDING.top);
  const progesteronePath = createSmoothPath(progesterone, CHART_WIDTH, CHART_HEIGHT, PADDING.top);

  // Phase boundaries (as percentages)
  const phases = [
    { name: 'Menstrual', start: 0, end: 5 / cycleLength, color: phaseColors.menstrual },
    { name: 'Follicular', start: 5 / cycleLength, end: 13 / cycleLength, color: phaseColors.follicular },
    { name: 'Ovulatory', start: 13 / cycleLength, end: 17 / cycleLength, color: phaseColors.ovulatory },
    { name: 'Luteal', start: 17 / cycleLength, end: 1, color: phaseColors.luteal },
  ];

  // Current day marker position
  const currentDayX = PADDING.left + ((dayOfCycle - 1) / cycleLength) * CHART_WIDTH;

  return (
    <Animated.View entering={FadeIn.duration(800)}>
      <View className="bg-white/80 rounded-3xl p-4 border border-moon-200/50">
        <Text
          style={{ fontFamily: 'Quicksand_600SemiBold' }}
          className="text-night-800 text-base mb-3 text-center"
        >
          Your Cycle Hormones
        </Text>

        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
          <Defs>
            <SvgGradient id="estrogenGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#f9a8d4" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#f9a8d4" stopOpacity="0" />
            </SvgGradient>
            <SvgGradient id="progesteroneGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
            </SvgGradient>
          </Defs>

          {/* Phase background regions */}
          {phases.map((phase, i) => (
            <G key={phase.name}>
              <Path
                d={`M ${PADDING.left + phase.start * CHART_WIDTH} ${PADDING.top}
                    L ${PADDING.left + phase.end * CHART_WIDTH} ${PADDING.top}
                    L ${PADDING.left + phase.end * CHART_WIDTH} ${PADDING.top + CHART_HEIGHT}
                    L ${PADDING.left + phase.start * CHART_WIDTH} ${PADDING.top + CHART_HEIGHT} Z`}
                fill={phase.color.light}
                opacity={0.5}
              />
              {/* Phase label at bottom */}
              <SvgText
                x={PADDING.left + ((phase.start + phase.end) / 2) * CHART_WIDTH}
                y={GRAPH_HEIGHT - 8}
                fontSize={9}
                fill="#6d4fc4"
                textAnchor="middle"
                fontWeight="500"
              >
                {phase.name}
              </SvgText>
            </G>
          ))}

          {/* Estrogen curve */}
          <Path
            d={estrogenPath}
            stroke="#f472b6"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />

          {/* Progesterone curve */}
          <Path
            d={progesteronePath}
            stroke="#a78bfa"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="6,4"
          />

          {/* Current day indicator */}
          <Line
            x1={currentDayX}
            y1={PADDING.top}
            x2={currentDayX}
            y2={PADDING.top + CHART_HEIGHT}
            stroke="#ff6289"
            strokeWidth={2}
            strokeDasharray="4,4"
          />
          <Circle
            cx={currentDayX}
            cy={PADDING.top - 8}
            r={6}
            fill="#ff6289"
          />
          <SvgText
            x={currentDayX}
            y={PADDING.top - 18}
            fontSize={10}
            fill="#ff6289"
            textAnchor="middle"
            fontWeight="600"
          >
            Day {dayOfCycle}
          </SvgText>
        </Svg>

        {/* Legend */}
        <View className="flex-row justify-center mt-2" style={{ gap: 16 }}>
          <View className="flex-row items-center">
            <View className="w-4 h-1 bg-luna-500 rounded-full mr-2" />
            <Text className="text-night-700 text-xs" style={{ fontFamily: 'Quicksand_500Medium' }}>
              Estrogen
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-1 bg-cosmic-500 rounded-full mr-2" style={{ borderStyle: 'dashed' }} />
            <Text className="text-night-700 text-xs" style={{ fontFamily: 'Quicksand_500Medium' }}>
              Progesterone
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
