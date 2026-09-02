import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { CardShadow, Colors, Radius } from '@/theme/tokens';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: ReactNode;
  size?: Size;
  style?: StyleProp<ViewStyle>;
};

const radiusFor: Record<Size, number> = { sm: Radius.sm, md: Radius.md, lg: Radius.lg };

/** White card with a soft native-style shadow — the base container for grouped content. */
export function Surface({ children, size = 'md', style }: Props) {
  return <View style={[styles.card, { borderRadius: radiusFor[size] }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    ...CardShadow,
  },
});
