import { StyleSheet, View } from 'react-native';

import { Colors } from '@/theme/tokens';

type Props = { percent: number; count?: number; color?: string; trackColor?: string; height?: number };

/** Discrete equalizer-style level indicator — the "battery bars" reference look, generalized to any 0-100 level. */
export function LevelBars({ percent, count = 12, color = Colors.accent, trackColor = Colors.border, height = 26 }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * count);
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.bar, { height, backgroundColor: i < filled ? color : trackColor }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { flex: 1, borderRadius: 2 },
});
