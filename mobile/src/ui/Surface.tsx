import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { CardShadow, Colors, Radius } from '@/theme/tokens';

type Size = 'sm' | 'md' | 'lg';
type Props = { children: ReactNode; size?: Size; style?: StyleProp<ViewStyle>; accessibilityLabel?: string };
const radiusFor: Record<Size, number> = { sm: Radius.sm, md: Radius.md, lg: Radius.lg };

export function Surface({ children, size = 'md', style, accessibilityLabel }: Props) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={[styles.card, { borderRadius: radiusFor[size] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderSoft, ...CardShadow },
});
