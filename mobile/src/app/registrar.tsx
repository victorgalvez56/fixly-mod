import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { componentDef } from '@/data/catalog';
import { formatKm } from '@/lib/format';
import type { ServiceKind } from '@/lib/wear/types';
import { useMaintenance } from '@/state/use-maintenance';
import { todayISO, useVehicle } from '@/state/vehicle-context';
import { Colors, Radius, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { DetailHeader } from '@/ui/DetailHeader';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

const KINDS: { kind: ServiceKind; label: string }[] = [
  { kind: 'replaced', label: 'Lo cambiaron' },
  { kind: 'inspected_ok', label: 'Lo revisaron: bien' },
  { kind: 'inspected_needs_replace', label: 'Revisaron: hay que cambiar' },
];

/** "¿Qué te hicieron?" — the only way the driver feeds the model. Saves a record AND an odometer reading. */
export default function Registrar() {
  const { component } = useLocalSearchParams<{ component?: string }>();
  const { spec } = useMaintenance();
  const { addRecord, lastReading } = useVehicle();

  const [selected, setSelected] = useState<string[]>(component ? [component] : []);
  const [date, setDate] = useState(todayISO());
  const [km, setKm] = useState(lastReading ? String(lastReading.km) : '');
  const [cost, setCost] = useState('');
  const [workshop, setWorkshop] = useState('');
  const [kind, setKind] = useState<ServiceKind>('replaced');
  const [error, setError] = useState<string | null>(null);

  const components = spec?.components ?? [];
  const kmValue = parseInt(km.replace(/\D/g, ''), 10);
  const kmLower = lastReading && !Number.isNaN(kmValue) && kmValue < lastReading.km;

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    if (selected.length === 0) return setError('Elige al menos un componente.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('La fecha va como AAAA-MM-DD.');
    if (date > todayISO()) return setError('La fecha no puede ser futura.');
    const costValue = cost ? Number(cost.replace(/[^\d.]/g, '')) : undefined;
    addRecord({
      componentIds: selected,
      date,
      odometerKm: Number.isNaN(kmValue) ? null : kmValue,
      kind,
      costPen: costValue !== undefined && !Number.isNaN(costValue) ? costValue : undefined,
      workshop: workshop || undefined,
    });
    router.back();
  }

  const footer = <Button label="Guardar" variant="primary" onPress={save} disabled={selected.length === 0} />;

  return (
    <Screen footer={footer}>
      <DetailHeader title="¿Qué te hicieron?" />

      <View>
        <Txt variant="label" color={Colors.textTertiary} style={styles.label}>
          Componentes
        </Txt>
        <View style={styles.chips}>
          {components.map((c) => {
            const on = selected.includes(c.componentId);
            return (
              <Pressable
                key={c.componentId}
                onPress={() => toggle(c.componentId)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                style={[styles.chip, on && styles.chipOn]}>
                <Txt variant="bodyBold" color={on ? Colors.onAccent : Colors.textPrimary}>
                  {componentDef(c.componentId).shortLabel}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Txt variant="label" color={Colors.textTertiary} style={styles.label}>
          Qué hicieron
        </Txt>
        <Surface size="md" style={styles.kinds}>
          {KINDS.map((k) => (
            <Pressable key={k.kind} onPress={() => setKind(k.kind)} accessibilityRole="radio" accessibilityState={{ selected: kind === k.kind }} style={styles.kindRow}>
              <View style={[styles.radio, kind === k.kind && styles.radioOn]} />
              <Txt variant="body">{k.label}</Txt>
            </Pressable>
          ))}
        </Surface>
      </View>

      <Field label="Fecha (AAAA-MM-DD)" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" />
      <Field label="Kilometraje en ese momento" value={km} onChangeText={setKm} keyboardType="number-pad" />
      {kmLower && lastReading ? (
        <Txt variant="bodySmall" color="#b45309">
          Es menor que tu último registro de {formatKm(lastReading.km)}. Si está bien, sigue.
        </Txt>
      ) : null}
      <Field label="Costo (S/)" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
      <Field label="Taller" value={workshop} onChangeText={setWorkshop} />

      {error ? (
        <Txt variant="bodySmall" color={Colors.statusExpired} accessibilityLiveRegion="polite">
          {error}
        </Txt>
      ) : null}
    </Screen>
  );
}

function Field({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (v: string) => void; keyboardType?: 'number-pad' | 'decimal-pad' | 'numbers-and-punctuation' }) {
  return (
    <View style={styles.field}>
      <Txt variant="label" color={Colors.textTertiary}>
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        accessibilityLabel={label}
        style={styles.input}
        placeholderTextColor={Colors.textTertiary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 14, borderRadius: 999, backgroundColor: Colors.surface, justifyContent: 'center' },
  chipOn: { backgroundColor: Colors.dark },
  kinds: { paddingHorizontal: 16 },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border },
  radioOn: { borderColor: Colors.accent, borderWidth: 6 },
  field: { gap: 6 },
  input: { height: 56, borderRadius: Radius.sm, backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, fontSize: 17, color: Colors.textPrimary },
});
