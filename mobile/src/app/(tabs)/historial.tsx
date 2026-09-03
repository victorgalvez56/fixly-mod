import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { formatPEN } from '@/lib/format';
import { useVehicle } from '@/state/vehicle-context';
import { Colors } from '@/theme/tokens';
import { EmptyState } from '@/ui/EmptyState';
import { FolderCard } from '@/ui/FolderCard';
import { Screen } from '@/ui/Screen';
import { Txt } from '@/ui/Txt';

export function groupRecordsByYear(records: { date: string; costPen?: number }[]) {
  const map = new Map<number, { count: number; total: number }>();
  records.forEach((r) => {
    const year = Number(r.date.slice(0, 4));
    const g = map.get(year) ?? { count: 0, total: 0 };
    g.count += 1;
    g.total += r.costPen ?? 0;
    map.set(year, g);
  });
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([year, g]) => ({ year, ...g }));
}

export default function Historial() {
  const { records } = useVehicle();
  const groups = groupRecordsByYear(records);

  if (groups.length === 0) {
    return (
      <Screen edges={['top']}>
        <EmptyState
          icon="archive"
          title="Aún no hay historial"
          description="Cada servicio que registres aquí sube el valor de tu auto al venderlo."
          actionLabel="Registrar un servicio"
          onAction={() => router.push('/registrar')}
        />
      </Screen>
    );
  }

  const totalSpent = records.reduce((sum, r) => sum + (r.costPen ?? 0), 0);
  const [featured, ...rest] = groups;

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Txt variant="label" color={Colors.textTertiary}>
          Gasto acumulado
        </Txt>
        <Txt variant="bigNumber" tabularNums>
          {formatPEN(totalSpent)}
        </Txt>
        <Txt variant="bodySmall" color={Colors.textSecondary}>
          En {records.length} servicios registrados
        </Txt>
      </View>

      <FolderCard
        title={String(featured.year)}
        subtitle={`${featured.count} servicios registrados`}
        featured
        onPress={() => router.push({ pathname: '/historial/[year]', params: { year: String(featured.year) } })}
      />

      <View style={styles.grid}>
        {rest.map((group) => (
          <View key={group.year} style={styles.gridItem}>
            <FolderCard
              title={String(group.year)}
              subtitle={`${group.count} servicios`}
              onPress={() => router.push({ pathname: '/historial/[year]', params: { year: String(group.year) } })}
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%' },
});
