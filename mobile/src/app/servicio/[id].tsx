import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { formatLongDate, formatPEN } from '@/lib/format';
import { maintenancePlan } from '@/mock/data';
import { Colors } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { DetailHeader } from '@/ui/DetailHeader';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

export default function ServicioDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = maintenancePlan.find((m) => m.id === id);

  if (!item) {
    return (
      <Screen>
        <DetailHeader title="Servicio" />
        <Txt variant="body" color={Colors.textSecondary}>
          No encontramos este servicio.
        </Txt>
      </Screen>
    );
  }

  const footer = <Button label="Agendar este servicio" variant="primary" />;

  return (
    <Screen footer={footer}>
      <DetailHeader title="Plan de mantenimiento" />

      <Txt variant="screenTitle">{item.service}</Txt>

      <Surface size="md" style={styles.factsCard}>
        <Fact label="Cada" value={`${(item.intervalKm / 1000).toLocaleString('es-PE')} mil km`} />
        <View style={styles.divider} />
        <Fact label="Última vez" value={item.lastDoneAt ? formatLongDate(item.lastDoneAt) : 'Sin registro'} />
        <View style={styles.divider} />
        <Fact
          label="Precio"
          value={`${formatPEN(item.priceRange[0])}–${formatPEN(item.priceRange[1])}`}
          mono
          wide
        />
      </Surface>

      <Txt variant="body">{item.description}</Txt>

      <View style={[styles.warnBlock, { backgroundColor: Colors.statusWarnSoft }]}>
        <Txt variant="label" color={Colors.statusWarn}>
          Si no lo haces
        </Txt>
        <Txt variant="body" color={Colors.textSecondary}>
          {item.whatIfSkipped}
        </Txt>
      </View>

      <View>
        <Txt variant="label" color={Colors.textTertiary} style={styles.checklistLabel}>
          Debería incluir
        </Txt>
        <Surface size="md" style={styles.checklistCard}>
          {item.checklist.map((line, index) => (
            <View
              key={line}
              style={[styles.checklistRow, index < item.checklist.length - 1 && styles.checklistDivider]}>
              <Txt variant="body">{line}</Txt>
            </View>
          ))}
        </Surface>
      </View>
    </Screen>
  );
}

function Fact({ label, value, mono, wide }: { label: string; value: string; mono?: boolean; wide?: boolean }) {
  return (
    <View style={[styles.fact, wide && styles.factWide]}>
      <Txt variant="label" color={Colors.textTertiary}>
        {label}
      </Txt>
      <Txt variant={mono ? 'mono' : 'body'} style={styles.factValue}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  factsCard: { flexDirection: 'row', alignItems: 'stretch', padding: 16 },
  fact: { flex: 1, gap: 4 },
  factWide: { flex: 1.4 },
  factValue: { fontSize: 14 },
  divider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 10 },
  warnBlock: { gap: 4, padding: 16, borderRadius: 20 },
  checklistLabel: { marginBottom: 8 },
  checklistCard: { paddingHorizontal: 16 },
  checklistRow: { paddingVertical: 12 },
  checklistDivider: { borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
});
