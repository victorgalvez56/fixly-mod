import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { componentDef } from '@/data/catalog';
import { formatKm } from '@/lib/format';
import { vehicleCopy } from '@/lib/vehicle';
import type { VehicleType } from '@/lib/wear/types';
import { BorderWidth, Colors, ComponentStatusMeta, Radius, Spacing } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

/**
 * The pictures the onboarding explains itself with. Each one is a real piece of
 * the app rendered with real vocabulary from the catalog, rather than a stock
 * icon in an empty panel: the driver should recognise these screens once they
 * are inside, and the words on them should be the words the app actually uses.
 *
 * The numbers here are illustrative and say so — nothing derives from them.
 */

/** What the app gives back: two component rows, one overdue and one fine. */
export function VerdictArt({ type }: { type: VehicleType }) {
  const overdueId = type === 'moto' ? 'lubricacion_cadena' : 'aceite_motor';
  const overdue = componentDef(overdueId, type);
  const fine = componentDef('pastillas_freno', type);

  return (
    <View style={styles.stack}>
      <PreviewRow def={overdue} status="vencido" detail={`Se pasó ~${formatKm(type === 'moto' ? 700 : 600)}`} fill={1} />
      <PreviewRow def={fine} status="ok" detail="Faltan ~2,100 km · aprox. 45 días" fill={0.42} />
    </View>
  );
}

function PreviewRow({
  def,
  status,
  detail,
  fill,
}: {
  def: ReturnType<typeof componentDef>;
  status: 'vencido' | 'ok';
  detail: string;
  fill: number;
}) {
  const meta = ComponentStatusMeta[status];
  return (
    <View style={styles.row}>
      <View style={styles.tile}>
        <Feather name={def.icon} size={16} color={Colors.textPrimary} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Txt variant="bodyBold" numberOfLines={2} style={styles.rowTitle}>
            {def.shortLabel}
          </Txt>
          <Txt variant="label" color={meta.text} numberOfLines={1}>
            {meta.label}
          </Txt>
        </View>
        <Txt variant="bodySmall" color={Colors.textSecondary} numberOfLines={1}>
          {detail}
        </Txt>
        <View style={styles.track}>
          <View style={[styles.fill, { backgroundColor: meta.color, width: `${Math.round(fill * 100)}%` }]} />
        </View>
      </View>
    </View>
  );
}

/** What the app needs from the driver: the three inputs, in the order they are asked. */
export function InputsArt({ type }: { type: VehicleType }) {
  const c = vehicleCopy(type);
  const steps: { icon: keyof typeof Feather.glyphMap; title: string; body: string }[] = [
    { icon: 'hash', title: 'Tu placa', body: `Con ella traemos marca, modelo y año ${c.ofThe}.` },
    { icon: 'activity', title: 'Tu kilometraje', body: 'Cada lectura nos dice cuántos km manejas por día.' },
    { icon: 'tool', title: 'Lo que te hacen en el taller', body: 'Desde ahí empieza a contar el siguiente intervalo.' },
  ];

  return (
    <View style={styles.stack}>
      {steps.map((step, index) => (
        <View key={step.title} style={styles.step}>
          <View style={styles.stepNumber}>
            <Txt variant="label" color={Colors.accent}>
              {index + 1}
            </Txt>
          </View>
          <View style={styles.stepBody}>
            <Txt variant="bodyBold">{step.title}</Txt>
            <Txt variant="bodySmall" color={Colors.textSecondary}>
              {step.body}
            </Txt>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Where the numbers come from — and, just as importantly, where they do not. */
export function SourceArt({ type }: { type: VehicleType }) {
  const c = vehicleCopy(type);
  const lines: { icon: keyof typeof Feather.glyphMap; text: string; on: boolean }[] = [
    { icon: 'book-open', text: `Los intervalos salen del manual del propietario ${c.ofThe}.`, on: true },
    { icon: 'smartphone', text: 'Todo se guarda en este teléfono. Sin cuenta y sin servidor.', on: true },
    { icon: 'wifi-off', text: `Fixly no se conecta ${c.toThe} ni tiene sensores: no mide nada.`, on: false },
  ];

  return (
    <View style={styles.stack}>
      {lines.map((line) => (
        <View key={line.text} style={styles.claim}>
          <View style={[styles.claimIcon, { backgroundColor: line.on ? Colors.accentSoft : Colors.surfaceAlt }]}>
            <Feather name={line.icon} size={16} color={line.on ? Colors.accent : Colors.textTertiary} />
          </View>
          <Txt variant="bodySmall" color={Colors.textSecondary} style={styles.claimText}>
            {line.text}
          </Txt>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth,
    borderColor: Colors.borderSoft,
    backgroundColor: Colors.background,
  },
  tile: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, gap: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  rowTitle: { flex: 1 },
  track: { height: 6, borderRadius: 3, backgroundColor: Colors.borderSoft, overflow: 'hidden', marginTop: 2 },
  fill: { height: 6, borderRadius: 3 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBody: { flex: 1, gap: 2 },
  claim: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  claimIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  claimText: { flex: 1 },
});
