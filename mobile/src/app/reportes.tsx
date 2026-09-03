import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { componentDef } from '@/data/catalog';
import { formatKm, formatPEN } from '@/lib/format';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { DetailHeader } from '@/ui/DetailHeader';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

export default function Reportes() {
  const { records, vehicle } = useVehicle();
  const total = records.reduce((sum, record) => sum + (record.costPen ?? 0), 0);
  const highest = records.reduce((highestRecord, record) => (record.costPen ?? 0) > (highestRecord?.costPen ?? 0) ? record : highestRecord, records[0]);
  const average = records.length ? total / records.length : 0;
  const months = [160, 230, 110, 290, 205, 340, 260];

  return (
    <Screen>
      <DetailHeader title="Reportes" />
      <View style={styles.intro}><Txt variant="label" color={Colors.accentLight}>LECTURA DE TU AUTO</Txt><Txt variant="screenTitle">Lo que cuesta mantenerlo.</Txt><Txt variant="body" color={Colors.textSecondary}>{vehicle ? vehicle.brand + ' ' + vehicle.model + ' · ' + formatKm(vehicle.mileage) : 'Tu historial se convierte en una vista simple.'}</Txt></View>

      <Surface size="lg" style={styles.totalCard}>
        <Txt variant="label" color={Colors.textMuted}>GASTO ACUMULADO</Txt>
        <Txt variant="bigNumber">{formatPEN(total)}</Txt>
        <Txt variant="bodySmall" color={Colors.textSecondary}>{records.length} servicios registrados · promedio {formatPEN(average)}</Txt>
      </Surface>

      <View style={styles.stats}>
        <Metric icon="tool" label="SERVICIOS" value={String(records.length).padStart(2, '0')} />
        <Metric icon="trending-up" label="MAYOR GASTO" value={formatPEN(highest?.costPen ?? 0)} />
      </View>

      <View style={styles.sectionHead}><Txt variant="sectionTitle">Gasto por mes</Txt><Txt variant="label" color={Colors.textTertiary}>ÚLTIMOS 7</Txt></View>
      <Surface size="md" style={styles.chart}>
        <View style={styles.bars}>{months.map((height, index) => <View key={String(index)} style={styles.barCol}><View style={[styles.bar, { height }]} /><Txt variant="monoSmall" color={Colors.textTertiary}>{['MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP'][index]}</Txt></View>)}</View>
      </Surface>

      <Surface size="md" style={styles.insight}>
        <Feather name="info" size={20} color={Colors.accent} />
        <View style={styles.flex}><Txt variant="bodyBold">Tu mejor registro es información de valor.</Txt><Txt variant="bodySmall" color={Colors.textSecondary}>{highest ? componentDef(highest.componentIds[0]).shortLabel + ' · ' + formatPEN(highest.costPen ?? 0) + ' en ' + (highest.workshop ?? 'taller no indicado') : 'Registra tu primer servicio para empezar.'}</Txt></View>
      </Surface>

      <Button label="Registrar un servicio" variant="primary" onPress={() => router.push('/registrar')} />
    </Screen>
  );
}

function Metric({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  return <Surface size="md" style={styles.metric}><Feather name={icon} size={18} color={Colors.accent} /><Txt variant="bigNumber">{value}</Txt><Txt variant="label" color={Colors.textTertiary}>{label}</Txt></Surface>;
}

const styles = StyleSheet.create({
  intro: { gap: 14, paddingTop: Spacing.lg },
  totalCard: { padding: Spacing.xxl, backgroundColor: Colors.accentSoft, borderColor: Colors.accent, gap: 8 },
  stats: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, minHeight: 120, padding: Spacing.lg, gap: 8 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chart: { padding: Spacing.lg },
  bars: { flexDirection: 'row', height: 240, alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  bar: { width: '72%', maxHeight: 180, minHeight: 26, borderRadius: 8, backgroundColor: Colors.accent },
  insight: { flexDirection: 'row', gap: 12, padding: Spacing.lg },
  flex: { flex: 1, gap: 4 },
});
