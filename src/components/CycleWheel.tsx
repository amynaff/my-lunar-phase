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
import { useEffect } from 'react';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.75;
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

  const currentPhase = getCurrentPhase();
  const dayOfCycle = getDayOfCycle();
  const info = phaseInfo[currentPhase];

  // Animation values
  const glowPulse = useSharedValue(0);
  const moonRotation = useSharedValue(0);
  const scaleIn = useSharedValue(0.8);

  useEffect(() => {
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    moonRotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false
    );
    scaleIn.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.4, 0.8]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.05]) }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleIn.value }],
  }));

  // Calculate position on wheel for current day
  const angle = ((dayOfCycle - 1) / cycleLength) * 360 - 90;
  const markerX = CENTER + (RADIUS - 10) * Math.cos((angle * Math.PI) / 180);
  const markerY = CENTER + (RADIUS - 10) * Math.sin((angle * Math.PI) / 180);

  const phaseColors: Record<CyclePhase, string[]> = {
    menstrual: ['#be185d', '#9d174d'],
    follicular: ['#ec4899', '#f472b6'],
    ovulatory: ['#f9a8d4', '#fbd0e8'],
    luteal: ['#9333ea', '#7c3aed'],
  };

  return (
    <AnimatedView style={[{ alignItems: 'center' }, containerStyle]}>
      {/* Glow effect behind wheel */}
      <AnimatedView
        style={[
          {
            position: 'absolute',
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
          },
          glowStyle,
        ]}
      >
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.3)', 'rgba(147, 51, 234, 0.3)', 'transparent']}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: (size + 40) / 2,
          }}
        />
      </AnimatedView>

      <Svg width={size} height={size} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
        <Defs>
          <SvgGradient id="menstrualGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#be185d" />
            <Stop offset="100%" stopColor="#9d174d" />
          </SvgGradient>
          <SvgGradient id="follicularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ec4899" />
            <Stop offset="100%" stopColor="#f472b6" />
          </SvgGradient>
          <SvgGradient id="ovulatoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#f9a8d4" />
            <Stop offset="100%" stopColor="#fbd0e8" />
          </SvgGradient>
          <SvgGradient id="lutealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#9333ea" />
            <Stop offset="100%" stopColor="#7c3aed" />
          </SvgGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="rgba(15, 7, 32, 0.6)"
          stroke="rgba(249, 168, 212, 0.2)"
          strokeWidth={1}
        />

        {/* Phase arcs */}
        {/* Menstrual: 0-18% (days 1-5 of 28) */}
        <Path
          d={describeArc(CENTER, CENTER, RADIUS - 5, -90, -90 + (5/28) * 360)}
          fill="none"
          stroke="url(#menstrualGrad)"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={currentPhase === 'menstrual' ? 1 : 0.5}
        />

        {/* Follicular: 18-46% (days 6-13) */}
        <Path
          d={describeArc(CENTER, CENTER, RADIUS - 5, -90 + (5/28) * 360, -90 + (13/28) * 360)}
          fill="none"
          stroke="url(#follicularGrad)"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={currentPhase === 'follicular' ? 1 : 0.5}
        />

        {/* Ovulatory: 46-61% (days 14-17) */}
        <Path
          d={describeArc(CENTER, CENTER, RADIUS - 5, -90 + (13/28) * 360, -90 + (17/28) * 360)}
          fill="none"
          stroke="url(#ovulatoryGrad)"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={currentPhase === 'ovulatory' ? 1 : 0.5}
        />

        {/* Luteal: 61-100% (days 18-28) */}
        <Path
          d={describeArc(CENTER, CENTER, RADIUS - 5, -90 + (17/28) * 360, -90 + 360)}
          fill="none"
          stroke="url(#lutealGrad)"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={currentPhase === 'luteal' ? 1 : 0.5}
        />

        {/* Inner circle */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={INNER_RADIUS}
          fill="rgba(30, 10, 60, 0.8)"
          stroke="rgba(249, 168, 212, 0.3)"
          strokeWidth={1}
        />

        {/* Current day marker */}
        <Circle
          cx={markerX}
          cy={markerY}
          r={8}
          fill="#fff"
          stroke={info.color}
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
        <Text className="text-white text-3xl font-light">{dayOfCycle}</Text>
        <Text className="text-luna-300 text-xs tracking-widest uppercase">Day of Cycle</Text>
        <View className="mt-2 px-3 py-1 rounded-full bg-luna-500/20">
          <Text className="text-luna-300 text-xs font-medium">{info.name}</Text>
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
