import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Colors, Spacing } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

type Props = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  last?: boolean;
};

/** Icon-circle + title/subtitle + trailing content, grouped inside a card with hairlines between rows. */
export function IconRow({ icon, title, subtitle, trailing, onPress, chevron = true, last }: Props) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title} style={[styles.row, !last && styles.divider]}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={16} color={Colors.textPrimary} />
      </View>
      <View style={styles.text}>
        <Txt variant="cardTitle">{title}</Txt>
        {subtitle ? (
          <Txt variant="bodySmall" color={Colors.textSecondary}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {trailing}
      {chevron ? <Feather name="chevron-right" size={18} color={Colors.textTertiary} /> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, minHeight: 72 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
});
