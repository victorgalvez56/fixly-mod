import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { formatPEN, formatShortDate } from '@/lib/format';
import { history } from '@/mock/data';
import { Colors } from '@/theme/tokens';
import { DetailHeader } from '@/ui/DetailHeader';
import { HairlineRow } from '@/ui/HairlineRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

export default function HistorialYear() {
  const { year } = useLocalSearchParams<{ year: string }>();
  const group = history.find((g) => String(g.year) === year);

  if (!group) return null;

  const total = group.entries.reduce((sum, e) => sum + e.cost, 0);

  return (
    <Screen edges={['top']}>
      <DetailHeader title={year} />

      <Txt variant="bodySmall" color={Colors.textSecondary}>
        {group.entries.length} servicios · {formatPEN(total)} en total
      </Txt>

      <Surface size="md" style={styles.card}>
        {group.entries.map((entry, index) => (
          <HairlineRow key={entry.id} last={index === group.entries.length - 1}>
            <View style={styles.row}>
              <Txt variant="mono" color={Colors.textTertiary} style={styles.date}>
                {formatShortDate(entry.date)}
              </Txt>
              <View style={styles.rowBody}>
                <Txt variant="cardTitle" style={styles.service}>
                  {entry.service}
                </Txt>
                <Txt variant="bodySmall" color={Colors.textTertiary}>
                  {entry.workshop}
                </Txt>
              </View>
              <Txt variant="mono" tabularNums color={Colors.textPrimary}>
                {formatPEN(entry.cost)}
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
