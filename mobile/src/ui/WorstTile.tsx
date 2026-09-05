import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { remainingLine, statusWord } from '@/lib/wear/selectors';
import type { WearEstimate } from '@/lib/wear/types';
import { BorderWidth, Colors, Radius, Spacing } from '@/theme/tokens';
import { WorstTileContent } from '@/ui/WorstTileContent';

type WorstDef = { label: string; shortLabel: string; icon: keyof typeof Feather.glyphMap; zone: string };
type WorstMeta = { color: string; soft: string; text: string };
type Props = { worst: WearEstimate; worstDef: WorstDef; worstMeta: WorstMeta; lifeLeft: number; onPress: () => void };

/** The bento-grid "worst component" tile — icon, label, status chip, life-left %, level bars. */
export function WorstTile({ worst, worstDef, worstMeta, lifeLeft, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${worstDef.label}: ${statusWord(worst)}, ${remainingLine(worst)}`} style={styles.tile}>
      <WorstTileContent worst={worst} worstDef={worstDef} worstMeta={worstMeta} lifeLeft={lifeLeft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1.3, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: BorderWidth, borderColor: Colors.borderSoft, padding: Spacing.lg, justifyContent: 'space-between' },
});
