import { Pressable, StyleSheet, View } from 'react-native';

import { formatPEN } from '@/lib/format';
import { Colors, StatusMeta, type StatusKey } from '@/theme/tokens';
import { StatusChip } from '@/ui/StatusChip';
import { Txt } from '@/ui/Txt';

type Props = {
  title: string;
  status: StatusKey;
  detail: string;
  fineAmount?: number;
  onPress?: () => void;
};

/**
 * The central component of the app. Left color bar + status word + mono
 * detail line, and — only when overdue — the fine amount as the largest
 * element in the card, per DESIGN.md.
 */
export function StatusRow({ title, status, detail, fineAmount, onPress }: Props) {
  const meta = StatusMeta[status];
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}. ${meta.label}. ${detail}`}
      style={styles.row}>
      <View style={[styles.bar, { backgroundColor: meta.color }]} />
      <View style={styles.body}>
        <View style={styles.headerLine}>
          <Txt variant="cardTitle" style={styles.title} numberOfLines={1}>
            {title}
          </Txt>
          <StatusChip status={status} />
        </View>
        <Txt variant="mono" color={Colors.textSecondary}>
          {detail}
        </Txt>
        {status === 'expired' && fineAmount != null ? (
          <Txt variant="bigNumber" color={Colors.statusExpired} tabularNums style={styles.fine}>
            {formatPEN(fineAmount)}
          </Txt>
        ) : null}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  bar: { width: 4, borderRadius: 2, alignSelf: 'stretch' },
  body: { flex: 1, gap: 6 },
  headerLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { flex: 1 },
  fine: { marginTop: 2 },
});
