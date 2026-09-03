import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';

import { ZONE_ANCHORS, type CarZone } from '@/data/car-drawing';
import { componentDef } from '@/data/catalog';
import { type ZoneId } from '@/data/zones';
import { formatKm } from '@/lib/format';
import { COPY } from '@/lib/wear/copy';
import { confidenceLabel, freshnessLabel, remainingLine, statusWord } from '@/lib/wear/selectors';
import { useMaintenance } from '@/state/use-maintenance';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, ComponentStatusMeta, Radius, Spacing } from '@/theme/tokens';
import { AlertBanner } from '@/ui/AlertBanner';
import { Button } from '@/ui/Button';
import { CarMap, carMapHeight, unitScale, type ZoneVisual } from '@/ui/CarMap';
import { IntervalRing } from '@/ui/IntervalRing';
import { KmPrompt } from '@/ui/KmPrompt';
import { Skeleton } from '@/ui/Skeleton';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

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
      <Surface size="md" style={styles.card}>
        <View style={styles.row}>
          <Skeleton width={MAP_W} height={carMapHeight(MAP_W) * 0.7} />
          <View style={styles.ringCol}>
            <Skeleton width={112} height={112} radius={56} />
          </View>
        </View>
        <Skeleton width="80%" height={20} />
        <Skeleton width="55%" height={16} />
      </Surface>
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

  return (
    <Surface size="md" style={styles.card}>
      <View style={styles.row}>
        <Pressable onPress={() => router.push('/mapa')} accessibilityRole="button" accessibilityLabel="Ver el mapa del auto" style={{ width: MAP_W, height: mapH * 0.72, overflow: 'hidden' }}>
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
        <View style={styles.ringCol}>
          {worst ? <IntervalRing estimate={worst} size={116} /> : null}
          {worstDef ? (
            <Txt variant="bodySmall" color={Colors.textSecondary} style={styles.ringLabel} numberOfLines={1}>
              {worstDef.shortLabel}
            </Txt>
          ) : null}
        </View>
      </View>

      {worst && worstDef && worstMeta ? (
        <Pressable
          onPress={() => router.push({ pathname: '/mapa', params: { zone: worstDef.zone } })}
          accessibilityRole="button"
          accessibilityLabel={`${worstDef.label}: ${statusWord(worst)}, ${remainingLine(worst)}`}
          style={styles.worstRow}>
          <View style={[styles.bar, { backgroundColor: worstMeta.color }]} />
          <View style={styles.worstBody}>
            <View style={styles.worstTitle}>
              <Txt variant="cardTitle" numberOfLines={1} style={styles.flex}>
                {worstDef.label}
              </Txt>
              <View style={[styles.chip, { backgroundColor: worstMeta.soft }]}>
                <Txt variant="label" color={worstMeta.text}>
                  {statusWord(worst)}
                </Txt>
              </View>
            </View>
            <Txt variant="mono" color={Colors.textSecondary} numberOfLines={1}>
              {remainingLine(worst)}
            </Txt>
            {confidenceLabel(worst) ? (
              <Txt variant="bodySmall" color={Colors.textTertiary} numberOfLines={1}>
                {confidenceLabel(worst)}
              </Txt>
            ) : null}
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
        </Pressable>
      ) : null}

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
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  ringCol: { flex: 1, alignItems: 'center', gap: 4 },
  ringLabel: { textAlign: 'center' },
  zoneDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: Colors.background },
  worstRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  bar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  worstBody: { flex: 1, gap: 3 },
  worstTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  freshness: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 44 },
});
