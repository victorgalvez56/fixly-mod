import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Radius } from '@/theme/tokens';

type Props = {
  width: number | `${number}%`;
  height: number;
  radius?: number;
};

/**
 * A shimmer block shaped exactly like the content it stands in for — never a
 * spinner, per DESIGN.md. Compose several per screen to match real layouts.
 */
export function Skeleton({ width, height, radius = Radius.sm }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const shift = useSharedValue(0);

  useEffect(() => {
    shift.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(shift);
  }, [shift]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (shift.value * 2 - 1) * trackWidth }],
  }));

  function onLayout(e: LayoutChangeEvent) {
    setTrackWidth(e.nativeEvent.layout.width);
  }

  return (
    <View
      onLayout={onLayout}
      style={[styles.track, { width, height, borderRadius: radius }]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.9)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: Colors.surface, overflow: 'hidden' },
});
