import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Colors, Radius, Spacing } from '@/theme/tokens';
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
      <Txt variant="sectionTitle" color={valueColor ?? Colors.textPrimary}>
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
    padding: Spacing.lg,
    gap: 4,
  },
});
