import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Motion } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  /** Height of the visible face. The touch target grows by `depth`. */
  height: number;
  /** Solid colour revealed under the face when pressed. */
  shadowColor: string;
  /** How far the face sits above the shadow: 2 for surfaces, 4 for primary buttons. */
  depth: number;
  radius: number;
  faceStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  selected?: boolean;
};

/**
 * The primitive behind every raised, pressable surface in the app: a solid colour block
 * with the face floating `depth` pixels above it. Pressing pushes the face down onto the
 * block. Built as a real view rather than a `boxShadow` / native shadow prop, because
 * neither renders a crisp zero-blur offset consistently across iOS and Android.
 */
export function ChunkyPressable({ children, height, shadowColor, depth, radius, faceStyle, onPress, disabled, accessibilityLabel, accessibilityHint, selected }: Props) {
  const press = useSharedValue(0);
  const faceAnim = useAnimatedStyle(() => ({ transform: [{ translateY: press.value * depth }] }));

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled), selected: Boolean(selected) }}
      onPressIn={() => {
        // Reanimated shared values are mutable UI-thread refs by design.
        press.value = withTiming(1, { duration: Motion.duration.tap });
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: Motion.duration.tap });
      }}>
      <View style={[styles.block, { height: height + depth, borderRadius: radius, backgroundColor: shadowColor }]}>
        <Animated.View style={[styles.face, { height, borderRadius: radius }, faceStyle, faceAnim]}>{children}</Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: { width: '100%' },
  face: { width: '100%', overflow: 'hidden' },
});
