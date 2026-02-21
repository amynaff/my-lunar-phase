import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, G, Path } from 'react-native-svg';
import { useCycleStore, phaseInfo, CyclePhase } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.7;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2 - 20;
const INNER_RADIUS = RADIUS * 0.6;

interface Props {
  size?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function CycleWheel({ size = WHEEL_SIZE }: Props) {
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);
  const cycleLength = useCycleStore(s => s.cycleLength);
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const currentPhase = getCurrentPhase();
  const dayOfCycle = getDayOfCycle();
  const info = phaseInfo[currentPhase];

  // Animation values
  const glowPulse = useSharedValue(0);
  const scaleIn = useSharedValue(0.8);

  useEffect(() => {
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    scaleIn.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.6]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.03]) }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleIn.value }],
  }));

  // Calculate position on wheel for current day
  const angle = ((dayOfCycle - 1) / cycleLength) * 360 - 90;
  const markerX = CENTER + (RADIUS - 10) * Math.cos((angle * Math.PI) / 180);
  const markerY = CENTER + (RADIUS - 10) * Math.sin((angle * Math.PI) / 180);

  const isDark = themeMode === 'dark';

  return (
    <AnimatedView style={[{ alignItems: 'center', width: size, height: size }, containerStyle]}>
      {/* Soft glow effect behind wheel */}
      <AnimatedView
        style={[
          {
            position: 'absolute',
            width: size + 50,
            height: size + 50,
            borderRadius: (size + 50) / 2,
          },
          glowStyle,
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ['rgba(167, 139, 250, 0.3)', 'rgba(196, 181, 253, 0.2)', 'transparent']
              : ['rgba(249, 168, 212, 0.4)', 'rgba(196, 181, 253, 0.3)', 'transparent']
          }
          style={{
            width: '100%',
            height: '100%',
            borderRadius: (size + 50) / 2,
          }}
        />
      </AnimatedView>

      <Svg width={size} height={size} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
        <Defs>
          {/* Softer, lighter gradients */}
          <SvgGradient id="menstrualGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ff8aa6" />
            <Stop offset="100%" stopColor="#ffb3c4" />
          </SvgGradient>
          <SvgGradient id="follicularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#f9a8d4" />
            <Stop offset="100%" stopColor="#fbcfe8" />
          </SvgGradient>
          <SvgGradient id="ovulatoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#c4b5fd" />
            <Stop offset="100%" stopColor="#ddd2fe" />
          </SvgGradient>
          <SvgGradient id="lutealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#b9a6f7" />
            <Stop offset="100%" stopColor="#d1c7ff" />
          </SvgGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill={isDark ? 'rgba(37, 29, 53, 0.9)' : 'rgba(255, 255, 255, 0.8)'}
          stroke={isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(209, 199, 255, 0.5)'}
          strokeWidth={1}
        />

        {/* Phase arcs */}
        {/* Menstrual: days 1-5 */}
        <Path
          d={describeArc(CENTER, CENTER, RADIUS - 5, -90, -90 + (5/28) * 360)}
          fill="none"
          stroke="url(#menstrualGrad)"
          strokeWidth={14}
          strokeLinecap="round"
          opacity={currentPhase === 'menstrual' ? 1 : 0.6}
        />

        {/* Follicular: days 6-13 */}
        <Path
          d={describeArc(CENTER, CENTER, RADIUS - 5, -90 + (5/28) * 360, -90 + (13/28) * 360)}
          fill="none"
          stroke="url(#follicularGrad)"
          strokeWidth={14}
          strokeLinecap="round"
          opacity={currentPhase === 'follicular' ? 1 : 0.6}
        />

        {/* Ovulatory: days 14-17 */}
        <Path
          d={describeArc(CENTER, CENTER, RADIUS - 5, -90 + (13/28) * 360, -90 + (17/28) * 360)}
          fill="none"
          stroke="url(#ovulatoryGrad)"
          strokeWidth={14}
          strokeLinecap="round"
          opacity={currentPhase === 'ovulatory' ? 1 : 0.6}
        />

        {/* Luteal: days 18-28 */}
        <Path
          d={describeArc(CENTER, CENTER, RADIUS - 5, -90 + (17/28) * 360, -90 + 360)}
          fill="none"
          stroke="url(#lutealGrad)"
          strokeWidth={14}
          strokeLinecap="round"
          opacity={currentPhase === 'luteal' ? 1 : 0.6}
        />

        {/* Inner circle */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={INNER_RADIUS}
          fill={isDark ? 'rgba(26, 20, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
          stroke={isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(249, 168, 212, 0.3)'}
          strokeWidth={1}
        />

        {/* Current day marker */}
        <Circle
          cx={markerX}
          cy={markerY}
          r={9}
          fill={isDark ? '#1a1428' : '#fff'}
          stroke="#ff6289"
          strokeWidth={3}
        />
      </Svg>

      {/* Center content */}
      <View
        className="absolute items-center justify-center"
        style={{
          width: INNER_RADIUS * 2 - 20,
          height: INNER_RADIUS * 2 - 20,
          top: (size - (INNER_RADIUS * 2 - 20)) / 2,
        }}
      >
        <Text className="text-4xl mb-1">{info.emoji}</Text>
        <Text style={{ fontFamily: 'Quicksand_600SemiBold', fontSize: 32, color: theme.text.primary }}>
          {dayOfCycle}
        </Text>
        <Text style={{ fontFamily: 'Quicksand_500Medium', fontSize: 10, color: theme.text.tertiary, letterSpacing: 1 }}>
          DAY OF CYCLE
        </Text>
        <View className="mt-2 px-4 py-1.5 rounded-full" style={{ backgroundColor: `${theme.accent.purple}20` }}>
          <Text style={{ fontFamily: 'Quicksand_600SemiBold', fontSize: 11, color: theme.text.secondary }}>
            {info.name}
          </Text>
        </View>
      </View>
    </AnimatedView>
  );
}

// Helper function to describe SVG arc
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}
