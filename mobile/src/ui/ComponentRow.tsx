import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { componentDef } from '@/data/catalog';
import { isPending, remainingLine, statusWord } from '@/lib/wear/selectors';
import type { WearEstimate } from '@/lib/wear/types';
import { CardShadow, Colors, ComponentStatusMeta, Radius } from '@/theme/tokens';
import { IntervalBar } from '@/ui/IntervalBar';
import { Txt } from '@/ui/Txt';

type Props = { estimate: WearEstimate; onPress?: () => void; showBar?: boolean; compact?: boolean };

/**
 * The reference's "Components status" row: icon tile, title, one-line status,
 * corner dot — plus the status word in the line and an interval bar, so the
 * dot is never the only signal.
 */
export function ComponentRow({ estimate, onPress, showBar = true, compact }: Props) {
  const def = componentDef(estimate.componentId);
  const meta = ComponentStatusMeta[estimate.status];
  const pending = isPending(estimate);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${def.label}: ${statusWord(estimate)}, ${remainingLine(estimate)}`}
      style={({ pressed }) => [styles.row, compact && styles.rowCompact, pressed && onPress ? styles.pressed : null]}>
      <View style={styles.tile}>
        <Feather name={def.icon} size={18} color={Colors.textPrimary} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleLine}>
          <Txt variant="cardTitle" numberOfLines={1} style={styles.title}>
            {def.label}
          </Txt>
          <Txt variant="label" color={meta.text}>
            {statusWord(estimate)}
          </Txt>
        </View>
        <Txt variant="bodySmall" color={Colors.textSecondary} numberOfLines={2}>
          {remainingLine(estimate)}
        </Txt>
        {showBar && estimate.status !== 'sin_datos' ? (
          <View style={styles.bar}>
            <IntervalBar estimate={estimate} />
          </View>
        ) : null}
      </View>
      {pending ? <View style={[styles.dot, { backgroundColor: meta.color }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    minHeight: 72,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    ...CardShadow,
  },
  rowCompact: { padding: 12, minHeight: 60 },
  pressed: { opacity: 0.9 },
  tile: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3 },
  titleLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 15, lineHeight: 20 },
  bar: { paddingTop: 6, paddingBottom: 2 },
  dot: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 4 },
});
