import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { formatKm } from '@/lib/format';
import { getZoneItems, ZONE_META } from '@/lib/zones';
import type { MaintenanceItem, MaintenanceZone } from '@/mock/data';
import type { StatusKey } from '@/theme/tokens';
import { DetailHeader } from '@/ui/DetailHeader';
import { IconRow } from '@/ui/IconRow';
import { Screen } from '@/ui/Screen';
import { StatusChip } from '@/ui/StatusChip';
import { Surface } from '@/ui/Surface';

function statusFor(item: MaintenanceItem): StatusKey {
  if (item.next) return 'warn';
  return 'ok';
}

export default function Sistema() {
  const { zone } = useLocalSearchParams<{ zone: MaintenanceZone }>();
  const meta = ZONE_META[zone];
  const items = getZoneItems(zone);

  if (!meta) return null;

  return (
    <Screen>
      <DetailHeader title={`Sistema: ${meta.label}`} />

      <Surface size="md" style={styles.card}>
        {items.map((item, index) => (
          <IconRow
            key={item.id}
            icon="tool"
            title={item.service}
            subtitle={`${formatKm(item.km)} · ${item.done ? 'Hecho' : 'Pendiente'}`}
            trailing={<StatusChip status={statusFor(item)} />}
            onPress={() => router.push({ pathname: '/servicio/[id]', params: { id: item.id } })}
            last={index === items.length - 1}
          />
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16 },
});
