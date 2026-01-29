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
  Rect,
} from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useCycleStore } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 220;
const PADDING = { top: 45, bottom: 55, left: 15, right: 15 };
const CHART_WIDTH = GRAPH_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = GRAPH_HEIGHT - PADDING.top - PADDING.bottom;

// Phase colors - works for both light and dark mode
const getPhaseColors = (isDark: boolean) => ({
  menstrual: {
    main: '#be185d',
    light: isDark ? 'rgba(190, 24, 93, 0.2)' : 'rgba(190, 24, 93, 0.12)',
    text: '#be185d',
  },
  follicular: {
    main: '#ec4899',
    light: isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.12)',
    text: '#ec4899',
  },
  ovulatory: {
    main: '#f472b6',
    light: isDark ? 'rgba(244, 114, 182, 0.25)' : 'rgba(244, 114, 182, 0.15)',
    text: '#db2777',
  },
  luteal: {
    main: '#a855f7',
    light: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.12)',
    text: '#a855f7',
  },
});

// More accurate hormone curve data based on the chart
const generateHormoneData = (cycleLength: number) => {
  const points = 200;
  const estrogen: number[] = [];
  const progesterone: number[] = [];

  for (let i = 0; i <= points; i++) {
    const x = i / points;
    const dayOfCycle = x * cycleLength;

    // ESTROGEN curve - matches the chart more accurately
    // Low during menstrual, rises during follicular, PEAKS at ovulation (day 13-14),
    // drops sharply, then has a secondary smaller rise mid-luteal
    let estrogenVal = 0;

    if (dayOfCycle <= 5) {
      // Menstrual - low and slowly rising
      estrogenVal = 0.15 + (dayOfCycle / 5) * 0.1;
    } else if (dayOfCycle <= 13) {
      // Follicular - steadily rising to peak
      const progress = (dayOfCycle - 5) / 8;
      estrogenVal = 0.25 + progress * 0.7;
    } else if (dayOfCycle <= 14) {
      // Ovulation peak
      estrogenVal = 0.95 + Math.sin((dayOfCycle - 13) * Math.PI) * 0.05;
    } else if (dayOfCycle <= 17) {
      // Sharp drop after ovulation
      const dropProgress = (dayOfCycle - 14) / 3;
      estrogenVal = 1.0 - dropProgress * 0.55;
    } else if (dayOfCycle <= 24) {
      // Secondary rise in mid-luteal
      const riseProgress = (dayOfCycle - 17) / 7;
      estrogenVal = 0.45 + Math.sin(riseProgress * Math.PI) * 0.2;
    } else {
      // Drop before period
      const dropProgress = (dayOfCycle - 24) / (cycleLength - 24);
      estrogenVal = 0.45 - dropProgress * 0.3;
    }
    estrogen.push(Math.max(0.1, estrogenVal));

    // PROGESTERONE curve - matches the chart
    // Very low until ovulation, then rises dramatically, peaks around day 21-22, drops before period
    let progesteroneVal = 0;

    if (dayOfCycle <= 14) {
      // Low before ovulation (barely visible)
      progesteroneVal = 0.08 + Math.sin((dayOfCycle / 14) * Math.PI * 0.5) * 0.02;
    } else if (dayOfCycle <= 22) {
      // Rise after ovulation to peak
      const riseProgress = (dayOfCycle - 14) / 8;
      progesteroneVal = 0.1 + Math.pow(riseProgress, 0.7) * 0.85;
    } else {
      // Drop before period
      const dropProgress = (dayOfCycle - 22) / (cycleLength - 22);
      progesteroneVal = 0.95 - Math.pow(dropProgress, 0.8) * 0.85;
    }
    progesterone.push(Math.max(0.05, progesteroneVal));
  }

  return { estrogen, progesterone };
};

const createSmoothPath = (data: number[], width: number, height: number, yOffset: number = 0): string => {
  if (data.length < 2) return '';

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - val * height * 0.9 + yOffset,
  }));

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const tension = 0.25;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

// Create a filled area path under the curve
const createFilledPath = (data: number[], width: number, height: number, yOffset: number = 0): string => {
  const linePath = createSmoothPath(data, width, height, yOffset);
  if (!linePath) return '';

  return `${linePath} L ${width} ${height + yOffset} L 0 ${height + yOffset} Z`;
};

interface Props {
  showLabels?: boolean;
}

export function CycleGraph({ showLabels = true }: Props) {
  const cycleLength = useCycleStore(s => s.cycleLength);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const dayOfCycle = getDayOfCycle();
  const isDark = themeMode === 'dark';

  const phaseColors = getPhaseColors(isDark);
  const { estrogen, progesterone } = generateHormoneData(cycleLength);

  const estrogenPath = createSmoothPath(estrogen, CHART_WIDTH, CHART_HEIGHT, PADDING.top);
  const progesteronePath = createSmoothPath(progesterone, CHART_WIDTH, CHART_HEIGHT, PADDING.top);
  const estrogenFilledPath = createFilledPath(estrogen, CHART_WIDTH, CHART_HEIGHT, PADDING.top);
  const progesteroneFilledPath = createFilledPath(progesterone, CHART_WIDTH, CHART_HEIGHT, PADDING.top);

  // Phase boundaries matching the chart (adjusted for Days 1-5, 6-13, 13-15, 16-28)
  const phases = [
    { name: 'Menstrual', shortName: 'Menstrual', days: '1-5', start: 0, end: 5 / cycleLength, color: phaseColors.menstrual },
    { name: 'Follicular', shortName: 'Follic.', days: '6-13', start: 5 / cycleLength, end: 13 / cycleLength, color: phaseColors.follicular },
    { name: 'Ovulatory', shortName: 'Ovul.', days: '13-15', start: 13 / cycleLength, end: 15 / cycleLength, color: phaseColors.ovulatory },
    { name: 'Luteal', shortName: 'Luteal', days: '16-28', start: 15 / cycleLength, end: 1, color: phaseColors.luteal },
  ];

  // Current day marker position
  const currentDayX = PADDING.left + ((dayOfCycle - 1) / cycleLength) * CHART_WIDTH;

  // Ovulation marker position (around day 14)
  const ovulationX = PADDING.left + (13.5 / cycleLength) * CHART_WIDTH;

  // Key day markers to show
  const keyDays = [1, 5, 13, 15, 21, cycleLength];

  return (
    <Animated.View entering={FadeIn.duration(800)}>
      <View
        className="rounded-3xl p-4 border"
        style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
      >
        <Text
          style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
          className="text-base mb-1 text-center"
        >
          Your Cycle Hormones
        </Text>
        <Text
          style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
          className="text-xs mb-3 text-center"
        >
          Estrogen & Progesterone throughout your cycle
        </Text>

        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
          <Defs>
            <SvgGradient id="estrogenGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
            </SvgGradient>
            <SvgGradient id="progesteroneGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
            </SvgGradient>
          </Defs>

          {/* Phase background regions */}
          {phases.map((phase) => (
            <G key={phase.name}>
              <Rect
                x={PADDING.left + phase.start * CHART_WIDTH}
                y={PADDING.top}
                width={(phase.end - phase.start) * CHART_WIDTH}
                height={CHART_HEIGHT}
                fill={phase.color.light}
              />
              {/* Phase divider line */}
              {phase.start > 0 && (
                <Line
                  x1={PADDING.left + phase.start * CHART_WIDTH}
                  y1={PADDING.top}
                  x2={PADDING.left + phase.start * CHART_WIDTH}
                  y2={PADDING.top + CHART_HEIGHT}
                  stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                  strokeWidth={1}
                />
              )}
            </G>
          ))}

          {/* Filled area under estrogen curve */}
          <Path
            d={estrogenFilledPath}
            fill="url(#estrogenGrad)"
          />

          {/* Filled area under progesterone curve */}
          <Path
            d={progesteroneFilledPath}
            fill="url(#progesteroneGrad)"
          />

          {/* Estrogen curve - solid pink line */}
          <Path
            d={estrogenPath}
            stroke="#ec4899"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />

          {/* Progesterone curve - solid purple line */}
          <Path
            d={progesteronePath}
            stroke="#a855f7"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />

          {/* Ovulation marker - egg symbol */}
          <Circle
            cx={ovulationX}
            cy={PADDING.top + 8}
            r={8}
            fill={isDark ? '#fbbf24' : '#fcd34d'}
            stroke="#f59e0b"
            strokeWidth={1.5}
          />
          <Circle
            cx={ovulationX}
            cy={PADDING.top + 8}
            r={3}
            fill="#f59e0b"
          />
          <SvgText
            x={ovulationX}
            y={PADDING.top - 8}
            fontSize={8}
            fill="#f59e0b"
            textAnchor="middle"
            fontWeight="600"
          >
            Ovulation
          </SvgText>

          {/* Fertile window indicator */}
          <Rect
            x={PADDING.left + (10 / cycleLength) * CHART_WIDTH}
            y={PADDING.top + CHART_HEIGHT - 4}
            width={(5 / cycleLength) * CHART_WIDTH}
            height={4}
            rx={2}
            fill="#f472b6"
            opacity={0.6}
          />

          {/* Current day indicator */}
          <Line
            x1={currentDayX}
            y1={PADDING.top}
            x2={currentDayX}
            y2={PADDING.top + CHART_HEIGHT}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="4,3"
          />
          <Circle
            cx={currentDayX}
            cy={PADDING.top - 12}
            r={10}
            fill="#ef4444"
          />
          <SvgText
            x={currentDayX}
            y={PADDING.top - 8}
            fontSize={9}
            fill="#ffffff"
            textAnchor="middle"
            fontWeight="700"
          >
            {dayOfCycle}
          </SvgText>

          {/* Day markers along bottom */}
          {keyDays.map((day) => {
            const x = PADDING.left + ((day - 1) / cycleLength) * CHART_WIDTH;
            return (
              <G key={day}>
                <Line
                  x1={x}
                  y1={PADDING.top + CHART_HEIGHT}
                  x2={x}
                  y2={PADDING.top + CHART_HEIGHT + 4}
                  stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
                  strokeWidth={1}
                />
                <SvgText
                  x={x}
                  y={PADDING.top + CHART_HEIGHT + 14}
                  fontSize={8}
                  fill={theme.text.tertiary}
                  textAnchor="middle"
                >
                  {day}
                </SvgText>
              </G>
            );
          })}

          {/* Phase labels at bottom */}
          {phases.map((phase) => {
            // Calculate if this is a narrow phase (less than 15% of the width)
            const phaseWidth = phase.end - phase.start;
            const isNarrow = phaseWidth < 0.15;
            const displayName = isNarrow ? phase.shortName : phase.name;

            return (
              <G key={`label-${phase.name}`}>
                <SvgText
                  x={PADDING.left + ((phase.start + phase.end) / 2) * CHART_WIDTH}
                  y={GRAPH_HEIGHT - 22}
                  fontSize={isNarrow ? 7 : 9}
                  fill={phase.color.text}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {displayName}
                </SvgText>
                <SvgText
                  x={PADDING.left + ((phase.start + phase.end) / 2) * CHART_WIDTH}
                  y={GRAPH_HEIGHT - 10}
                  fontSize={7}
                  fill={theme.text.tertiary}
                  textAnchor="middle"
                >
                  {phase.days}
                </SvgText>
              </G>
            );
          })}

          {/* Hormone labels on the curves */}
          <SvgText
            x={PADDING.left + (11 / cycleLength) * CHART_WIDTH}
            y={PADDING.top + 25}
            fontSize={8}
            fill="#ec4899"
            fontWeight="600"
          >
            Estrogen
          </SvgText>
          <SvgText
            x={PADDING.left + (20 / cycleLength) * CHART_WIDTH}
            y={PADDING.top + 25}
            fontSize={8}
            fill="#a855f7"
            fontWeight="600"
          >
            Progesterone
          </SvgText>
        </Svg>

        {/* Legend */}
        <View className="flex-row justify-center mt-1" style={{ gap: 20 }}>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: '#ec4899' }} />
            <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }} className="text-xs">
              Estrogen
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: '#a855f7' }} />
            <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }} className="text-xs">
              Progesterone
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: '#fcd34d', borderWidth: 1, borderColor: '#f59e0b' }} />
            <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }} className="text-xs">
              Ovulation
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
