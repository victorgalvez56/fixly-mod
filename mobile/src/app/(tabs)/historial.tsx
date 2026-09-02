import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { formatPEN } from '@/lib/format';
import { history, historyTotals } from '@/mock/data';
import { Colors } from '@/theme/tokens';
import { EmptyState } from '@/ui/EmptyState';
import { FolderCard } from '@/ui/FolderCard';
import { Screen } from '@/ui/Screen';
import { Txt } from '@/ui/Txt';

export default function Historial() {
  if (history.length === 0) {
    return (
      <Screen edges={['top']}>
        <EmptyState
          icon="archive"
          title="Aún no hay historial"
          description="Cada servicio que registres aquí sube el valor de tu auto al venderlo."
        />
      </Screen>
    );
  }

  const [featured, ...rest] = history;

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Txt variant="label" color={Colors.textTertiary}>
          Gasto acumulado
        </Txt>
        <Txt variant="bigNumber" tabularNums>
          {formatPEN(historyTotals.totalSpent)}
        </Txt>
        <Txt variant="bodySmall" color={Colors.textSecondary}>
          En {historyTotals.serviceCount} servicios registrados
        </Txt>
      </View>

      <FolderCard
        title={String(featured.year)}
        subtitle={`${featured.entries.length} servicios registrados`}
        featured
        onPress={() => router.push({ pathname: '/historial/[year]', params: { year: String(featured.year) } })}
      />

      <View style={styles.grid}>
        {rest.map((group) => (
          <View key={group.year} style={styles.gridItem}>
            <FolderCard
              title={String(group.year)}
              subtitle={`${group.entries.length} servicios`}
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
