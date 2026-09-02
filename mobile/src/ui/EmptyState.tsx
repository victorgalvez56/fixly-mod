import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Colors, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { Txt } from '@/ui/Txt';

type Props = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Explains how to fill the screen — never a bare "no data" message. */
export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRing}>
        <Feather name={icon} size={26} color={Colors.accent} />
      </View>
      <Txt variant="cardTitle" style={styles.title}>
        {title}
      </Txt>
      <Txt variant="body" color={Colors.textSecondary} style={styles.description}>
        {description}
      </Txt>
      {actionLabel ? (
        <View style={styles.action}>
          <Button label={actionLabel} variant="secondary" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: Spacing.huge, paddingHorizontal: Spacing.xl, gap: Spacing.md },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { textAlign: 'center' },
  description: { textAlign: 'center' },
  action: { marginTop: Spacing.md, alignSelf: 'stretch' },
});
