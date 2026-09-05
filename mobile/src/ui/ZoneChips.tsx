import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { zoneMeta, type ZoneId } from '@/data/zones';
import { COPY } from '@/lib/wear/copy';
import { statusWord } from '@/lib/wear/selectors';
import type { VehicleType } from '@/lib/wear/types';
import type { ZoneState } from '@/state/use-maintenance';
import { CardShadow, Colors, ComponentStatusMeta, Radius } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

type Props = {
  zones: Record<ZoneId, ZoneState>;
  /** Which zones to show and in what order — a bike's list is not a car's. */
  order: ZoneId[];
  vehicleType: VehicleType;
  onPress: (zone: ZoneId) => void;
  limit?: number;
};

/**
 * The reference's row of square system chips (icon + label + attention dot),
 * with the status WORD added under the label so the dot is never the only cue.
 */
export function ZoneChips({ zones, order, vehicleType, onPress, limit }: Props) {
  const list = limit ? order.slice(0, limit) : order;
  return (
    <View style={styles.grid}>
      {list.map((zone) => {
        const z = zones[zone];
        const info = zoneMeta(vehicleType, zone);
        const meta = ComponentStatusMeta[z.status];
        const pending = z.pending > 0;
        const word = z.worst ? COPY.statusWord[z.worst.status] : 'Sin datos';
        const longWord = z.worst ? statusWord(z.worst) : 'Sin datos';
        return (
          <Pressable
            key={zone}
            onPress={() => onPress(zone)}
            accessibilityRole="button"
            accessibilityLabel={`${info.label}: ${longWord}${pending ? `, ${z.pending} pendientes` : ''}`}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
            {pending ? <View style={[styles.dot, { backgroundColor: meta.color }]} /> : null}
            <Feather name={info.icon} size={22} color={Colors.textPrimary} />
            <Txt color={Colors.textPrimary} numberOfLines={1} style={styles.label}>
              {info.shortLabel}
            </Txt>
            <Txt variant="label" color={pending ? meta.text : Colors.textTertiary} numberOfLines={1} style={styles.word}>
              {word}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    width: '22.5%',
    flexGrow: 1,
    minHeight: 88,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 4,
    paddingVertical: 8,
    ...CardShadow,
  },
  pressed: { opacity: 0.85 },
  dot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4 },
  label: { fontSize: 13, lineHeight: 16, fontWeight: '600', textAlign: 'center' },
  word: { fontSize: 10, lineHeight: 12 },
});
