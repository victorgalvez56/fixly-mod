import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';

import { componentDef } from '@/data/catalog';
import { drawingFor, drawingHeight, unitScale, widthForCardHeight, zoneAnchor } from '@/data/drawing';
import { type ZoneId } from '@/data/zones';
import { formatKm } from '@/lib/format';
import { vehicleCopy } from '@/lib/vehicle';
import { COPY } from '@/lib/wear/copy';
import { freshnessLabel } from '@/lib/wear/selectors';
import { useMaintenance } from '@/state/use-maintenance';
import { useVehicle } from '@/state/vehicle-context';
import { BorderWidth, Colors, ComponentStatusMeta, Radius, Spacing } from '@/theme/tokens';
import { AlertBanner } from '@/ui/AlertBanner';
import { Button } from '@/ui/Button';
import { VehicleMap, type ZoneVisual } from '@/ui/VehicleMap';
import { KmPrompt } from '@/ui/KmPrompt';
import { Skeleton } from '@/ui/Skeleton';
import { StatTile } from '@/ui/StatTile';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';
import { WorstTile } from '@/ui/WorstTile';

/** How tall the visible slice of the drawing is in the card, whichever vehicle it is. */
const MAP_VISIBLE_H = 145;

/**
 * The home card that replaces the old "Mapa de mantenimiento" button: the
 * driver sees the worst component, the oil ring and the freshness of their
 * own odometer without tapping anything. Tap the vehicle (or a zone) to open
 * the map and its reveal.
 */
export function VehicleHealthCard() {
  const { hydrated, coldStart, zones, activeZones, worst, lastReading, vehicleType } = useMaintenance();
  const { vehicle, addReading } = useVehicle();
  const drawing = drawingFor(vehicleType);
  const copy = vehicleCopy(vehicleType);
  const MAP_W = Math.round(widthForCardHeight(drawing, MAP_VISIBLE_H));
  const [kmPrompt, setKmPrompt] = useState(false);
  const reveal = useSharedValue(0);
  const detail = useSharedValue(0);

  if (!hydrated) {
    return (
      <View style={styles.wrap}>
        <Surface size="lg" style={styles.mapCard}>
          <Skeleton width="100%" height={MAP_VISIBLE_H} radius={Radius.md} />
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
          Todavía no tenemos el manual de {copy.yours} {vehicle?.brand} {vehicle?.model} {vehicle?.year}
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

  const zoneVisuals: Partial<Record<ZoneId, ZoneVisual>> = {};
  activeZones.forEach((z) => {
    zoneVisuals[z] = { color: ComponentStatusMeta[zones[z].status].color, pending: zones[z].pending > 0 };
  });
  const k = unitScale(drawing, MAP_W);
  const mapH = drawingHeight(drawing, MAP_W);
  const stale = (worst?.lastReadingAgeDays ?? 0) > 45;
  const worstDef = worst ? componentDef(worst.componentId, vehicleType) : null;
  const worstMeta = worst ? ComponentStatusMeta[worst.status] : null;
  // Life left floors at 0: an item 2.3 intervals past due has none left, not -133 %.
  const lifeLeft = worst?.percentConsumed != null ? Math.max(0, Math.round((1 - worst.percentConsumed) * 100)) : null;
  const pendingCount = activeZones.reduce((sum, z) => sum + zones[z].pending, 0);

  return (
    <View style={styles.wrap}>
      <Surface size="lg" style={styles.mapCard}>
        <Pressable
          onPress={() => router.push('/mapa')}
          accessibilityRole="button"
          accessibilityLabel={`Ver el mapa de ${copy.yours}`}
          style={{ width: '100%', height: mapH * drawing.cardCrop, alignItems: 'center', overflow: 'hidden' }}>
          <View style={{ marginTop: -8 }}>
            <VehicleMap
              drawing={drawing}
              width={MAP_W}
              zones={zoneVisuals}
              selectedZone={null}
              reveal={reveal}
              detail={detail}
              plan={{ windows: {} }}
              resolvedColors={{}}
              onPressZone={(z) => router.push({ pathname: '/mapa', params: { zone: z } })}
            />
            {activeZones
              .filter((z) => zones[z].pending > 0)
              .map((z) => (
                <View
                  key={z}
                  pointerEvents="none"
                  style={[styles.zoneDot, { left: zoneAnchor(drawing, z).x * k - 5, top: zoneAnchor(drawing, z).y * k - 5, backgroundColor: ComponentStatusMeta[zones[z].status].color }]}
                />
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
