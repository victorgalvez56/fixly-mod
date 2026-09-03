import { StyleSheet, View } from 'react-native';

import { StatusMeta, type StatusKey } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

/** Status is never color-only — the word always ships with the color. */
export function StatusChip({ status }: { status: StatusKey }) {
  const meta = StatusMeta[status];
  return (
    <View accessible accessibilityLabel={meta.label} style={[styles.chip, { backgroundColor: meta.soft }]}>
      <Txt variant="label" color={meta.color}>
        {meta.label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
});
