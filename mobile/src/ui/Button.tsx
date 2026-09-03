import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors, Motion, Radius, TouchTarget } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

type Variant = 'primary' | 'secondary' | 'tertiary';
type Props = { label: string; onPress?: () => void; variant?: Variant; disabled?: boolean; icon?: ReactNode; accessibilityHint?: string };

export function Button({ label, onPress, variant = 'secondary', disabled, icon, accessibilityHint }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isPrimary = variant === 'primary';
  const isTertiary = variant === 'tertiary';

  return (
    <Animated.View style={isTertiary ? undefined : animatedStyle}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: Boolean(disabled) }}
        onPressIn={() => {
          if (!isTertiary) {
            // Reanimated shared values are mutable UI-thread refs by design.
            // eslint-disable-next-line react-hooks/immutability
            scale.value = withTiming(0.97, { duration: Motion.duration.tap, easing: Motion.easing.change });
          }
        }}
        onPressOut={() => {
          if (!isTertiary) {
            // eslint-disable-next-line react-hooks/immutability
            scale.value = withTiming(1, { duration: Motion.duration.tap, easing: Motion.easing.change });
          }
        }}
        android_ripple={isTertiary ? undefined : { color: 'rgba(244,246,244,0.12)', foreground: true }}
        style={[styles.base, isPrimary && styles.primary, variant === 'secondary' && styles.secondary, isTertiary && styles.tertiary, disabled && styles.disabled]}>
        <View style={styles.content}>
          {icon}
          <Txt variant="buttonLabel" color={isPrimary ? Colors.onAccent : isTertiary ? Colors.accentLight : Colors.textPrimary} style={isTertiary ? styles.tertiaryLabel : undefined}>
            {label}
          </Txt>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: TouchTarget, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, overflow: 'hidden' },
  primary: { backgroundColor: Colors.accent },
  secondary: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  tertiary: { minHeight: TouchTarget, paddingHorizontal: 0 },
  disabled: { opacity: 0.4 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tertiaryLabel: { textDecorationLine: 'underline' },
});
