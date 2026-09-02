import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/theme/tokens';

/** A 1px-divided row — the "no cards" list style used on P3, P5, P7, P8. */
export function HairlineRow({ children, last = false }: { children: ReactNode; last?: boolean }) {
  return <View style={[styles.row, !last && styles.divider]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { paddingVertical: Spacing.lg, minHeight: 56, justifyContent: 'center' },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
});
