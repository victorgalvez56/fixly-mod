import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BorderWidth, Colors, Radius, TouchTarget } from '@/theme/tokens';
import { ChunkyPressable } from '@/ui/ChunkyPressable';
import { Txt } from '@/ui/Txt';

type Variant = 'primary' | 'secondary' | 'tertiary';
type Props = { label: string; onPress?: () => void; variant?: Variant; disabled?: boolean; icon?: ReactNode; accessibilityHint?: string };

const FACE = {
  primary: { backgroundColor: Colors.accent, shadow: Colors.accentShadow, label: Colors.onAccent },
  secondary: { backgroundColor: Colors.surface, shadow: Colors.border, label: Colors.link },
} as const;

export function Button({ label, onPress, variant = 'secondary', disabled, icon, accessibilityHint }: Props) {
  if (variant === 'tertiary') {
    return (
      <ChunkyPressable height={TouchTarget} depth={0} radius={Radius.md} shadowColor="transparent" onPress={onPress} disabled={disabled} accessibilityLabel={label} accessibilityHint={accessibilityHint} faceStyle={styles.tertiaryFace}>
        <View style={styles.content}>
          {icon}
          <Txt variant="buttonLabel" color={disabled ? Colors.textTertiary : Colors.link} style={styles.tertiaryLabel}>
            {label}
          </Txt>
        </View>
      </ChunkyPressable>
    );
  }

  const tone = FACE[variant];
  const depth = disabled ? 0 : variant === 'primary' ? 4 : 2;

  return (
    <ChunkyPressable
      height={TouchTarget - depth}
      depth={depth}
      radius={Radius.lg}
      shadowColor={disabled ? Colors.border : tone.shadow}
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      faceStyle={[styles.face, { backgroundColor: disabled ? Colors.border : tone.backgroundColor }, variant === 'secondary' && !disabled ? styles.outlined : null]}>
      <View style={styles.content}>
        {icon}
        <Txt variant="buttonLabel" color={disabled ? Colors.textTertiary : tone.label}>
          {label}
        </Txt>
      </View>
    </ChunkyPressable>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center' },
  outlined: { borderWidth: BorderWidth, borderColor: Colors.border },
  tertiaryFace: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  tertiaryLabel: { textDecorationLine: 'underline' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
