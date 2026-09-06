import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BorderWidth, Colors, Radius, Spacing } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  caption?: string;
};

/** The "Power" / "Fuel"-style stat card: icon, label, big value, optional caption. */
export function StatTile({ icon, label, value, valueColor, caption }: Props) {
  return (
    <View style={styles.tile}>
      <Feather name={icon} size={18} color={Colors.textTertiary} />
      <Txt variant="bodySmall" color={Colors.textSecondary}>
        {label}
      </Txt>
      {/* One line always: a six-figure odometer wrapped here and stretched the row. */}
      <Txt variant="sectionTitle" color={valueColor ?? Colors.textPrimary} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Txt>
      {caption ? (
        <Txt variant="bodySmall" color={Colors.textTertiary}>
          {caption}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: BorderWidth,
    borderColor: Colors.borderSoft,
    padding: Spacing.lg,
    gap: 4,
  },
});
