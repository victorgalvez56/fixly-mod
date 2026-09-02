import { StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { Txt } from '@/ui/Txt';

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'expired' | 'warn';
};

/** The urgent, full-width tinted card — the "recall notice" treatment for the single worst thing on screen. */
export function AlertBanner({ title, description, actionLabel, onAction, tone = 'expired' }: Props) {
  const color = tone === 'expired' ? Colors.statusExpired : Colors.statusWarn;
  const soft = tone === 'expired' ? Colors.statusExpiredSoft : Colors.statusWarnSoft;

  return (
    <View style={[styles.card, { backgroundColor: soft }]}>
      <View style={styles.text}>
        <Txt variant="label" color={color}>
          {title}
        </Txt>
        <Txt variant="bodySmall" color={Colors.textSecondary}>
          {description}
        </Txt>
      </View>
      {actionLabel ? (
        <Button label={actionLabel} variant="tertiary" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  text: { flex: 1, gap: 4 },
});
