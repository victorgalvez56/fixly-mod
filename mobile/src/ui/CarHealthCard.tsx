import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';

import { ZONE_ANCHORS, type CarZone } from '@/data/car-drawing';
import { componentDef } from '@/data/catalog';
import { type ZoneId } from '@/data/zones';
import { formatKm } from '@/lib/format';
import { COPY } from '@/lib/wear/copy';
import { freshnessLabel } from '@/lib/wear/selectors';
import { useMaintenance } from '@/state/use-maintenance';
import { useVehicle } from '@/state/vehicle-context';
import { BorderWidth, Colors, ComponentStatusMeta, Radius, Spacing } from '@/theme/tokens';
import { AlertBanner } from '@/ui/AlertBanner';
import { Button } from '@/ui/Button';
import { CarMap, carMapHeight, unitScale, type ZoneVisual } from '@/ui/CarMap';
import { KmPrompt } from '@/ui/KmPrompt';
import { Skeleton } from '@/ui/Skeleton';
import { StatTile } from '@/ui/StatTile';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';
import { WorstTile } from '@/ui/WorstTile';

const MAP_W = 132;

/**
 * The home card that replaces the old "Mapa de mantenimiento" button: the
 * driver sees the worst component, the oil ring and the freshness of their
 * own odometer without tapping anything. Tap the car (or a zone) to open the
 * map and its reveal.
 */
export function CarHealthCard() {
  const { hydrated, coldStart, zones, worst, lastReading } = useMaintenance();
  const { vehicle, addReading } = useVehicle();
  const [kmPrompt, setKmPrompt] = useState(false);
  const reveal = useSharedValue(0);
  const detail = useSharedValue(0);

  if (!hydrated) {
    return (
      <View style={styles.wrap}>
        <Surface size="lg" style={styles.mapCard}>
          <Skeleton width="100%" height={carMapHeight(MAP_W) * 0.9} radius={Radius.md} />
        </Surface>
        <View style={styles.statsGrid}>
          <Surface size="md" style={styles.bigTile}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={30} />
            <Skeleton width="100%" height={26} />
          </Surface>
          <View style={styles.smallCol}>
            <Skeleton width="100%" height={78} radius={Radius.md} />
            <Skeleton width="100%" height={78} radius={Radius.md} />
          </View>
        </View>
      </View>
    );
  }

  if (coldStart) {
    return (
      <Surface size="md" style={styles.card}>
        <Txt variant="cardTitle">
          Todavía no tenemos el manual de tu {vehicle?.brand} {vehicle?.model} {vehicle?.year}
        </Txt>
        <Txt variant="body" color={Colors.textSecondary}>
          Sin el manual no mostramos intervalos. Fotografía las páginas de mantenimiento o escribe los de tu libreta.
        </Txt>
        <Button label="Fotografiar mi manual" variant="secondary" onPress={() => {}} />
      </Surface>
    );
  }

  if (!lastReading) {
    return (
      <Surface size="md" style={styles.card}>
        <Txt variant="cardTitle">¿Cuántos km marca hoy?</Txt>
        <Txt variant="body" color={Colors.textSecondary}>
          Con tu kilometraje calculamos cuánto falta para cada cambio según el manual.
        </Txt>
        <Button label="Escribir kilometraje" variant="primary" onPress={() => setKmPrompt(true)} />
        <KmPrompt visible={kmPrompt} lastKm={null} onClose={() => setKmPrompt(false)} onSave={(km) => addReading(km)} />
      </Surface>
    );
  }

  const zoneVisuals: Partial<Record<CarZone, ZoneVisual>> = {};
  (Object.keys(zones) as ZoneId[]).forEach((z) => {
    zoneVisuals[z] = { color: ComponentStatusMeta[zones[z].status].color, pending: zones[z].pending > 0 };
  });
  const k = unitScale(MAP_W);
  const mapH = carMapHeight(MAP_W);
  const stale = (worst?.lastReadingAgeDays ?? 0) > 45;
  const worstDef = worst ? componentDef(worst.componentId) : null;
  const worstMeta = worst ? ComponentStatusMeta[worst.status] : null;
  const lifeLeft = worst?.percentConsumed != null ? Math.round((1 - worst.percentConsumed) * 100) : null;
  const pendingCount = (Object.keys(zones) as ZoneId[]).reduce((sum, z) => sum + zones[z].pending, 0);

  return (
    <View style={styles.wrap}>
      <Surface size="lg" style={styles.mapCard}>
        <Pressable onPress={() => router.push('/mapa')} accessibilityRole="button" accessibilityLabel="Ver el mapa del auto" style={{ width: '100%', height: mapH * 0.66, alignItems: 'center', overflow: 'hidden' }}>
          <View style={{ marginTop: -8 }}>
            <CarMap
              width={MAP_W}
              zones={zoneVisuals}
              selectedZone={null}
              reveal={reveal}
              detail={detail}
              plan={{ windows: {} }}
              resolvedColors={{}}
              onPressZone={(z) => router.push({ pathname: '/mapa', params: { zone: z } })}
            />
            {(Object.keys(zones) as ZoneId[])
              .filter((z) => zones[z].pending > 0)
              .map((z) => (
                <View key={z} pointerEvents="none" style={[styles.zoneDot, { left: ZONE_ANCHORS[z].x * k - 5, top: ZONE_ANCHORS[z].y * k - 5, backgroundColor: ComponentStatusMeta[zones[z].status].color }]} />
              ))}
          </View>
        </Pressable>
      </Surface>

      <View style={styles.statsGrid}>
        {worst && worstDef && worstMeta && lifeLeft !== null ? (
          <WorstTile worst={worst} worstDef={worstDef} worstMeta={worstMeta} lifeLeft={lifeLeft} onPress={() => router.push({ pathname: '/mapa', params: { zone: worstDef.zone } })} />
        ) : null}

        <View style={styles.smallCol}>
          <StatTile icon="activity" label="Kilometraje actual" value={formatKm(lastReading.km)} />
          <StatTile icon="alert-circle" label="Pendientes" value={String(pendingCount)} valueColor={pendingCount > 0 ? Colors.statusWarn : Colors.statusOk} />
        </View>
      </View>

      {stale ? (
        <AlertBanner title="Kilometraje desactualizado" description={COPY.staleKm} tone="warn" actionLabel="Actualizar" onAction={() => setKmPrompt(true)} />
      ) : (
        <View style={styles.freshness}>
          <Txt variant="mono" color={Colors.textSecondary}>
            {worst ? freshnessLabel(worst, lastReading.km) : formatKm(lastReading.km)}
          </Txt>
          <Button label="Actualizar km" variant="tertiary" onPress={() => setKmPrompt(true)} />
        </View>
      )}

      <KmPrompt visible={kmPrompt} lastKm={lastReading.km} onClose={() => setKmPrompt(false)} onSave={(km) => addReading(km)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, gap: Spacing.md },
  wrap: { gap: Spacing.md },
  mapCard: { alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: 0 },
  zoneDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: Colors.background },
  statsGrid: { flexDirection: 'row', gap: Spacing.md },
  bigTile: { flex: 1.3, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: BorderWidth, borderColor: Colors.borderSoft, padding: Spacing.lg, gap: 10 },
  smallCol: { flex: 1, gap: Spacing.md },
  freshness: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 44 },
});
