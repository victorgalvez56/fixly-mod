import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { formatKm, formatLongDate } from '@/lib/format';
import { useVehicle } from '@/state/vehicle-context';
import { Colors } from '@/theme/tokens';
import { DetailHeader } from '@/ui/DetailHeader';
import { HairlineRow } from '@/ui/HairlineRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Switch } from '@/ui/Switch';
import { Txt } from '@/ui/Txt';

export default function Vehiculo() {
  const { vehicle, profile, updateMileage, setUsage, reset } = useVehicle();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(vehicle?.mileage ?? ''));

  if (!vehicle || !profile) return null;

  const facts: [string, string][] = [
    ['Marca', vehicle.brand],
    ['Modelo', vehicle.model],
    ['Año', String(vehicle.year)],
    ['Motor', vehicle.engine],
    ['Caja', profile.transmission === 'MT' ? 'Manual' : profile.transmission === 'unknown' ? 'Sin dato' : 'Automática'],
    ['Color', vehicle.color],
    ['Combustible', vehicle.fuel],
  ];

  function commitMileage() {
    const km = parseInt(draft.replace(/\D/g, ''), 10);
    if (!Number.isNaN(km) && km > 0) updateMileage(km);
    setEditing(false);
  }

  const usageRows: { key: keyof typeof profile.usage; label: string; hint: string }[] = [
    { key: 'rideHailing', label: 'Manejo para aplicativo o taxi', hint: 'Aplica la tabla de uso intensivo del manual cuando existe.' },
    { key: 'mostlyCity', label: 'Mayormente ciudad', hint: 'Tráfico y paradas frecuentes.' },
    { key: 'dustyRoads', label: 'Calles de tierra o polvo', hint: 'Los filtros se tapan antes.' },
    { key: 'shortTrips', label: 'Viajes cortos', hint: 'Menos de 8 km seguidos.' },
  ];

  return (
    <Screen>
      <DetailHeader title="Ficha del vehículo" />

      <View style={styles.plateBlock}>
        <View style={styles.plateChip}>
          <View style={styles.plateStripe} />
          <Txt style={styles.plateText}>{vehicle.plate}</Txt>
        </View>
        <Txt variant="cardTitle">
          {vehicle.brand} {vehicle.model}
        </Txt>
      </View>

      <Surface size="md" style={styles.card}>
        {facts.map(([label, value], index) => (
          <HairlineRow key={label} last={index === facts.length - 1}>
            <View style={styles.factRow}>
              <Txt variant="body" color={Colors.textSecondary}>
                {label}
              </Txt>
              <Txt variant="body">{value}</Txt>
            </View>
          </HairlineRow>
        ))}
      </Surface>

      <Surface size="md" style={[styles.card, styles.mileageBlock]}>
        <Txt variant="label" color={Colors.textTertiary}>
          Kilometraje actual
        </Txt>
        {editing ? (
          <TextInput
            autoFocus
            selectTextOnFocus
            value={draft}
            onChangeText={setDraft}
            onBlur={commitMileage}
            onSubmitEditing={commitMileage}
            keyboardType="number-pad"
            style={styles.mileageInput}
          />
        ) : (
          <Pressable
            onPress={() => {
              setDraft(String(vehicle.mileage));
              setEditing(true);
            }}>
            <Txt variant="bigNumber" tabularNums color={Colors.accent}>
              {formatKm(vehicle.mileage)}
            </Txt>
          </Pressable>
        )}
        <Txt variant="mono" color={Colors.textTertiary}>
          Registrado el {formatLongDate(vehicle.mileageUpdatedAt)}
        </Txt>
        <Txt variant="bodySmall" color={Colors.textTertiary}>
          Cada lectura se guarda; con ellas estimamos cuántos km manejas por día.
        </Txt>
      </Surface>

      <View>
        <Txt variant="label" color={Colors.textTertiary} style={styles.sectionLabel}>
          Cómo usas tu auto
        </Txt>
        <Surface size="md" style={styles.card}>
          {usageRows.map((row, index) => (
            <HairlineRow key={row.key} last={index === usageRows.length - 1}>
              <View style={styles.usageRow}>
                <View style={styles.usageText}>
                  <Txt variant="body">{row.label}</Txt>
                  <Txt variant="bodySmall" color={Colors.textTertiary}>
                    {row.hint}
                  </Txt>
                </View>
                <Switch value={profile.usage[row.key]} onValueChange={(v) => setUsage({ ...profile.usage, [row.key]: v })} />
              </View>
            </HairlineRow>
          ))}
        </Surface>
      </View>

      <Pressable
        onPress={() => {
          reset();
          router.replace('/');
        }}>
        <Txt variant="bodySmall" color={Colors.accent} style={styles.changeVehicle}>
          Cambiar de vehículo
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  plateBlock: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  plateChip: {
    height: 48,
    width: 88,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  plateStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: Colors.accent },
  plateText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  card: { paddingHorizontal: 16 },
  factRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mileageBlock: { paddingVertical: 20, gap: 4 },
  mileageInput: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.accent,
    padding: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
  },
  sectionLabel: { marginBottom: 8 },
  usageRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  usageText: { flex: 1, gap: 2 },
  changeVehicle: { textDecorationLine: 'underline', textAlign: 'center', marginTop: 12 },
});
