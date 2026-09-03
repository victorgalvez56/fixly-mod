import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Colors, Radius, Spacing } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

type Props = {
  title: string;
  subtitle: string;
  onPress?: () => void;
  featured?: boolean;
};

/** Vault-style folder card — used for the year-grouped history, one row per year. */
export function FolderCard({ title, subtitle, onPress, featured }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={`${title}. ${subtitle}`} style={[styles.card, featured && styles.featured]}>
      <View style={[styles.iconBox, featured && styles.iconBoxFeatured]}>
        <Feather name="folder" size={20} color={featured ? Colors.accent : Colors.textPrimary} />
      </View>
      <View style={styles.text}>
        <Txt variant="cardTitle">{title}</Txt>
        <Txt variant="bodySmall" color={Colors.textSecondary}>
          {subtitle}
        </Txt>
      </View>
      {featured ? <Feather name="chevron-right" size={18} color={Colors.textTertiary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    minHeight: 72,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  featured: { backgroundColor: Colors.accentSoft },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxFeatured: { backgroundColor: Colors.background },
  text: { flex: 1, gap: 2 },
});
