import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { formatKm } from '@/lib/format';
import { maintenancePlan } from '@/mock/data';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, Spacing } from '@/theme/tokens';
import { HairlineRow } from '@/ui/HairlineRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

export default function Plan() {
  const { vehicle } = useVehicle();
  const nextService = maintenancePlan.find((item) => !item.done);
  const todayIndex = maintenancePlan.findIndex((item) => !item.done);

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Txt variant="label" color={Colors.textTertiary}>
          Kilometraje actual
        </Txt>
        <Txt variant="bigNumber" tabularNums>
          {vehicle ? formatKm(vehicle.mileage) : '—'}
        </Txt>
        {nextService ? (
          <Txt variant="mono" color={Colors.textSecondary}>
            Próximo servicio a los {formatKm(nextService.km)}
          </Txt>
        ) : null}
      </View>

      <Surface size="md" style={styles.card}>
        {maintenancePlan.map((item, index) => (
          <View key={item.id}>
            {index === todayIndex ? (
              <View style={styles.todayMarker}>
                <View style={styles.todayLine} />
                <Txt variant="label" color={Colors.accent}>
                  Hoy
                </Txt>
                <View style={styles.todayLine} />
              </View>
            ) : null}
            <Pressable onPress={() => router.push(`/servicio/${item.id}`)}>
              <HairlineRow last={index === maintenancePlan.length - 1}>
                <View style={styles.row}>
                  {item.next ? <View style={styles.nextBar} /> : <View style={styles.nextBarSpacer} />}
                  <Txt variant="mono" color={item.done ? Colors.textTertiary : Colors.textSecondary} style={styles.km}>
                    {formatKm(item.km)}
                  </Txt>
                  <View style={styles.rowBody}>
                    <Txt
                      variant="cardTitle"
                      color={item.done ? Colors.textTertiary : Colors.textPrimary}
                      style={styles.service}>
                      {item.service}
                    </Txt>
                    <Txt variant="bodySmall" color={Colors.textTertiary} numberOfLines={1}>
                      {item.parts}
                    </Txt>
                  </View>
                </View>
              </HairlineRow>
            </Pressable>
          </View>
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  card: { paddingHorizontal: 16 },
  todayMarker: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: Spacing.sm },
  todayLine: { flex: 1, height: 1, backgroundColor: Colors.accent, opacity: 0.4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  nextBar: { width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: Colors.accent, minHeight: 40 },
  nextBarSpacer: { width: 4 },
  km: { width: 70, paddingTop: 3 },
  rowBody: { flex: 1, gap: 3 },
  service: { fontSize: 16, lineHeight: 21 },
});
