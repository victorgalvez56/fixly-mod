import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { componentDef } from '@/data/catalog';
import { formatKm, formatPEN, formatShortDate } from '@/lib/format';
import { useVehicle } from '@/state/vehicle-context';
import { Colors } from '@/theme/tokens';
import { DetailHeader } from '@/ui/DetailHeader';
import { HairlineRow } from '@/ui/HairlineRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

const KIND_LABEL = {
  replaced: 'Cambio',
  inspected_ok: 'Revisión',
  inspected_needs_replace: 'Revisión: hay que cambiar',
  unknown_before_purchase: 'No sé',
} as const;

export default function HistorialYear() {
  const { year } = useLocalSearchParams<{ year: string }>();
  const { records } = useVehicle();
  const entries = records.filter((r) => r.date.startsWith(`${year}-`)).sort((a, b) => b.date.localeCompare(a.date));

  if (entries.length === 0) return null;

  const total = entries.reduce((sum, e) => sum + (e.costPen ?? 0), 0);

  return (
    <Screen edges={['top']}>
      <DetailHeader title={year ?? ''} />

      <Txt variant="bodySmall" color={Colors.textSecondary}>
        {entries.length} servicios · {formatPEN(total)} en total
      </Txt>

      <Surface size="md" style={styles.card}>
        {entries.map((entry, index) => (
          <HairlineRow key={entry.id} last={index === entries.length - 1}>
            <View style={styles.row}>
              <Txt variant="mono" color={Colors.textTertiary} style={styles.date}>
                {formatShortDate(entry.date)}
              </Txt>
              <View style={styles.rowBody}>
                <Txt variant="cardTitle" style={styles.service}>
                  {KIND_LABEL[entry.kind]}: {entry.componentIds.map((id) => componentDef(id).shortLabel).join(', ')}
                </Txt>
                <Txt variant="bodySmall" color={Colors.textTertiary}>
                  {[entry.workshop, entry.odometerKm !== null ? formatKm(entry.odometerKm) : null, entry.note].filter(Boolean).join(' · ')}
                </Txt>
              </View>
              <Txt variant="mono" tabularNums color={Colors.textPrimary}>
                {entry.costPen != null ? formatPEN(entry.costPen) : ''}
              </Txt>
            </View>
          </HairlineRow>
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  date: { width: 52, paddingTop: 3 },
  rowBody: { flex: 1, gap: 3 },
  service: { fontSize: 16, lineHeight: 20 },
});
