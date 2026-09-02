import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { TabTriggerSlotProps } from 'expo-router/ui';

import { Colors, TouchTarget } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

type Props = TabTriggerSlotProps & {
  icon: keyof typeof Feather.glyphMap;
  label: string;
};

/**
 * Rendered inside a headless `TabTrigger` (`expo-router/ui`) via `asChild` —
 * not `NativeTabs`, which would hand Android a stock Material bar and break
 * the single cross-platform brand look.
 */
export const TabButton = forwardRef<View, Props>(function TabButton(
  { icon, label, isFocused, ...props },
  ref,
) {
  const color = isFocused ? Colors.accent : Colors.textTertiary;

  return (
    <Pressable
      ref={ref}
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={styles.item}
      android_ripple={{ color: 'rgba(17,24,39,0.06)', borderless: true }}>
      <Feather name={icon} size={22} color={color} />
      <Txt style={[styles.label, { color }]}>{label}</Txt>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', gap: 4, minHeight: TouchTarget, justifyContent: 'flex-start' },
  label: { fontSize: 11, fontWeight: '600' },
});
