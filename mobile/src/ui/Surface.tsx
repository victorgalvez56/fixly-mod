import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BorderWidth, CardShadow, Colors, Radius } from '@/theme/tokens';

type Size = 'sm' | 'md' | 'lg';
type Props = { children: ReactNode; size?: Size; style?: StyleProp<ViewStyle>; accessibilityLabel?: string };
const radiusFor: Record<Size, number> = { sm: Radius.sm, md: Radius.md, lg: Radius.lg };

export function Surface({ children, size = 'md', style, accessibilityLabel }: Props) {
  // iOS builds a shadow path from the layer's alpha channel when no explicit one
  // is set, so a card whose background a caller made translucent casts a shadow
  // of its own text — the content comes out embossed. Drop the shadow there; the
  // border still separates the card from the page.
  const background = (StyleSheet.flatten(style) as ViewStyle | undefined)?.backgroundColor;
  const translucent = typeof background === 'string' && /^(rgba|hsla)\(/i.test(background);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.card, { borderRadius: radiusFor[size] }, style, translucent ? styles.flat : null]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderWidth: BorderWidth, borderColor: Colors.borderSoft, ...CardShadow },
  flat: { shadowOpacity: 0, elevation: 0 },
});
