import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { getZoneStatus, ZONE_META } from '@/lib/zones';
import type { MaintenanceZone } from '@/mock/data';
import { Colors } from '@/theme/tokens';
import { CarDiagram } from '@/ui/CarDiagram';
import { DetailHeader } from '@/ui/DetailHeader';
import { IconRow } from '@/ui/IconRow';
import { Screen } from '@/ui/Screen';
import { StatusChip } from '@/ui/StatusChip';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

const ZONE_ICON: Record<MaintenanceZone, 'tool' | 'disc'> = {
  motor: 'tool',
  frenos: 'disc',
};

const ZONES: MaintenanceZone[] = ['motor', 'frenos'];

export default function MapaMantenimiento() {
  const statuses = Object.fromEntries(ZONES.map((zone) => [zone, getZoneStatus(zone)])) as Record<
    MaintenanceZone,
    ReturnType<typeof getZoneStatus>
  >;

  function goToZone(zone: MaintenanceZone) {
    router.push({ pathname: '/sistema/[zone]', params: { zone } });
  }

  return (
    <Screen>
      <DetailHeader title="Mapa de mantenimiento" />

      <Txt variant="body" color={Colors.textSecondary}>
        Toca una zona del auto para ver qué le toca.
      </Txt>

      <CarDiagram statuses={statuses} onPressZone={goToZone} />

      <Surface size="md" style={styles.card}>
        {ZONES.map((zone, index) => (
          <IconRow
            key={zone}
            icon={ZONE_ICON[zone]}
            title={ZONE_META[zone].label}
            trailing={<StatusChip status={statuses[zone]} />}
            onPress={() => goToZone(zone)}
            last={index === ZONES.length - 1}
          />
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16 },
});
