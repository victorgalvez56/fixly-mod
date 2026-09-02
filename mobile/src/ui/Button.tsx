import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors, Motion, Radius, TouchTarget } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

type Variant = 'primary' | 'secondary' | 'tertiary';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  icon?: ReactNode;
};

export function Button({ label, onPress, variant = 'secondary', disabled, icon }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === 'primary';
  const isTertiary = variant === 'tertiary';

  return (
    <Animated.View style={isTertiary ? undefined : animatedStyle}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        onPressIn={() => {
          if (isTertiary) return;
          // Reanimated shared values are mutated by design (UI-thread refs, not React state).
          // eslint-disable-next-line react-hooks/immutability
          scale.value = withTiming(0.97, { duration: Motion.duration.tap, easing: Motion.easing.change });
        }}
        onPressOut={() => {
          if (isTertiary) return;
          // eslint-disable-next-line react-hooks/immutability
          scale.value = withTiming(1, { duration: Motion.duration.tap, easing: Motion.easing.change });
        }}
        android_ripple={
          isTertiary ? undefined : { color: 'rgba(17,24,39,0.08)', foreground: true }
        }
        style={[
          styles.base,
          isPrimary && styles.primary,
          variant === 'secondary' && styles.secondary,
          isTertiary && styles.tertiary,
          disabled && styles.disabled,
        ]}>
        <View style={styles.content}>
          {icon}
          <Txt
            variant="buttonLabel"
            style={isTertiary ? styles.tertiaryLabel : undefined}
            color={isPrimary ? Colors.onAccent : isTertiary ? Colors.accent : Colors.textPrimary}>
            {label}
          </Txt>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: TouchTarget,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  primary: { backgroundColor: Colors.accent },
  secondary: { backgroundColor: Colors.surface },
  tertiary: { height: 'auto', paddingVertical: 8, paddingHorizontal: 0 },
  disabled: { opacity: 0.4 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tertiaryLabel: { textDecorationLine: 'underline' },
});
