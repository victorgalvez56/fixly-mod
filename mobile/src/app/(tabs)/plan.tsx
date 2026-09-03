import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { componentDef } from '@/data/catalog';
import { formatKm } from '@/lib/format';
import { remainingLine, statusWord } from '@/lib/wear/selectors';
import type { WearEstimate } from '@/lib/wear/types';
import { useMaintenance } from '@/state/use-maintenance';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, ComponentStatusMeta, Spacing } from '@/theme/tokens';
import { HairlineRow } from '@/ui/HairlineRow';
import { IntervalBar } from '@/ui/IntervalBar';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

/** Timeline by kilometre: overdue items above "Hoy", the rest ordered by when they come due. */
export default function Plan() {
  const { vehicle } = useVehicle();
  const { estimates, worst } = useMaintenance();
  const odometer = vehicle?.mileage ?? 0;

  const withKm = estimates.filter((e) => e.dueAtKm !== null);
  const timeOnly = estimates.filter((e) => e.dueAtKm === null && e.status !== 'sin_datos');
  const unknown = estimates.filter((e) => e.dueAtKm === null && e.status === 'sin_datos');

  const past = withKm.filter((e) => (e.dueAtKm ?? 0) <= odometer).sort((a, b) => (a.dueAtKm ?? 0) - (b.dueAtKm ?? 0));
  const future = withKm.filter((e) => (e.dueAtKm ?? 0) > odometer).sort((a, b) => (a.dueAtKm ?? 0) - (b.dueAtKm ?? 0));

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Txt variant="label" color={Colors.textTertiary}>
          Kilometraje actual
        </Txt>
        <Txt variant="bigNumber" tabularNums>
          {vehicle ? formatKm(vehicle.mileage) : '—'}
        </Txt>
        {worst && worst.status !== 'sin_datos' ? (
          <Txt variant="mono" color={Colors.textSecondary}>
            {componentDef(worst.componentId).shortLabel}: {remainingLine(worst)}
          </Txt>
        ) : null}
      </View>

      <Surface size="md" style={styles.card}>
        {past.map((item, index) => (
          <Row key={item.componentId} item={item} last={false} muted={false} index={index} />
        ))}
        <View style={styles.todayMarker}>
          <View style={styles.todayLine} />
          <Txt variant="label" color={Colors.accent}>
            Hoy · {formatKm(odometer)}
          </Txt>
          <View style={styles.todayLine} />
        </View>
        {future.map((item, index) => (
          <Row key={item.componentId} item={item} last={index === future.length - 1 && timeOnly.length === 0 && unknown.length === 0} muted={false} index={past.length + index} />
        ))}
        {timeOnly.length > 0 ? (
          <Txt variant="label" color={Colors.textTertiary} style={styles.sectionLabel}>
            Por tiempo, no por kilómetros
          </Txt>
        ) : null}
        {timeOnly.map((item, index) => (
          <Row key={item.componentId} item={item} last={index === timeOnly.length - 1 && unknown.length === 0} muted={false} index={0} />
        ))}
        {unknown.length > 0 ? (
          <Txt variant="label" color={Colors.textTertiary} style={styles.sectionLabel}>
            Sin registro
          </Txt>
        ) : null}
        {unknown.map((item, index) => (
          <Row key={item.componentId} item={item} last={index === unknown.length - 1} muted index={0} />
        ))}
      </Surface>
    </Screen>
  );
}

function Row({ item, last, muted, index }: { item: WearEstimate; last: boolean; muted: boolean; index: number }) {
  const def = componentDef(item.componentId);
  const meta = ComponentStatusMeta[item.status];
  return (
    <Pressable onPress={() => router.push({ pathname: '/servicio/[id]', params: { id: item.componentId } })}>
      <HairlineRow last={last}>
        <View style={styles.row}>
          <View style={[styles.bar, { backgroundColor: muted ? Colors.borderSoft : meta.color }]} />
          <Txt variant="mono" tabularNums color={Colors.textSecondary} style={styles.km}>
            {item.dueAtKm !== null ? formatKm(item.dueAtKm) : item.projectedDueDate ? 'fecha' : '—'}
          </Txt>
          <View style={styles.rowBody}>
            <View style={styles.titleLine}>
              <Txt variant="cardTitle" color={muted ? Colors.textSecondary : Colors.textPrimary} style={styles.service} numberOfLines={1}>
                {def.label}
              </Txt>
              <Txt variant="label" color={meta.text}>
                {statusWord(item)}
              </Txt>
            </View>
            <Txt variant="bodySmall" color={Colors.textSecondary} numberOfLines={1}>
              {remainingLine(item)}
            </Txt>
            {item.status !== 'sin_datos' ? (
              <View style={styles.barWrap}>
                <IntervalBar estimate={item} delayMs={index * 40} />
              </View>
            ) : null}
          </View>
        </View>
      </HairlineRow>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  card: { paddingHorizontal: 16 },
  todayMarker: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: Spacing.sm },
  todayLine: { flex: 1, height: 1, backgroundColor: Colors.accent, opacity: 0.4 },
  sectionLabel: { paddingTop: Spacing.lg, paddingBottom: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  bar: { width: 4, alignSelf: 'stretch', borderRadius: 2, minHeight: 40 },
  km: { width: 72, paddingTop: 3 },
  rowBody: { flex: 1, gap: 4 },
  titleLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  service: { fontSize: 16, lineHeight: 21, flex: 1 },
  barWrap: { paddingTop: 4, paddingBottom: 2 },
});
