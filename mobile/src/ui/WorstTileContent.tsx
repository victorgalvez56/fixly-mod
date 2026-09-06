import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { COPY } from '@/lib/wear/copy';
import { remainingLine } from '@/lib/wear/selectors';
import type { WearEstimate } from '@/lib/wear/types';
import { Colors, Radius } from '@/theme/tokens';
import { LevelBars } from '@/ui/LevelBars';
import { Txt } from '@/ui/Txt';

type WorstDef = { label: string; shortLabel: string; icon: keyof typeof Feather.glyphMap; zone: string };
type WorstMeta = { color: string; soft: string; text: string };
type Props = { worst: WearEstimate; worstDef: WorstDef; worstMeta: WorstMeta; lifeLeft: number; style?: StyleProp<ViewStyle> };

/**
 * The RN content shared by WorstTile.tsx and WorstTile.android.tsx — deliberately named so it
 * doesn't collide with either file's platform-suffix resolution (see IconCircleButton/StatTile
 * for the same pattern). `style` lets the Android variant add its own padding, since
 * OutlinedCard (unlike the RN Pressable in WorstTile.tsx) has no padding of its own.
 */
export function WorstTileContent({ worst, worstDef, worstMeta, lifeLeft, style }: Props) {
  return (
    <View style={[styles.content, style]}>
      <View style={styles.head}>
        <Feather name={worstDef.icon} size={16} color={Colors.textTertiary} />
        <Txt variant="bodySmall" color={Colors.textSecondary} numberOfLines={1} style={styles.flex}>
          {worstDef.shortLabel}
        </Txt>
        <View style={[styles.chip, { backgroundColor: worstMeta.soft }]}>
          {/* The short word: "Revisión vencida" would eat the whole row and crush the
              component name. WorstTile's accessibility label still reads the long form. */}
          <Txt variant="label" color={worstMeta.text} numberOfLines={1}>
            {COPY.statusWord[worst.status]}
          </Txt>
        </View>
      </View>
      <View style={styles.valueRow}>
        <Txt variant="sectionTitle" color={worstMeta.text}>
          {lifeLeft}%
        </Txt>
        <Txt variant="bodySmall" color={Colors.textTertiary} numberOfLines={1} style={styles.flex}>
          {remainingLine(worst)}
        </Txt>
      </View>
      <LevelBars percent={lifeLeft} color={worstMeta.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Fill the tile: the stats row is as tall as the two stacked tiles beside it,
  // and without this the content bunched at the top over a large empty area.
  content: { flex: 1, gap: 10, justifyContent: 'space-between' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  flex: { flex: 1 },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
});
