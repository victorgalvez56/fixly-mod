import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { plural } from '@/lib/format';
import { vehicleCopy } from '@/lib/vehicle';
import { notificationSettings } from '@/mock/data';
import { useVehicle } from '@/state/vehicle-context';
import type { VehicleType } from '@/lib/wear/types';
import { BorderWidth, Colors, Radius, Spacing, TouchTarget } from '@/theme/tokens';
import { IconRow } from '@/ui/IconRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';
import { VehicleTypePicker } from '@/ui/VehicleTypePicker';

/**
 * The real settings screen: what the driver can actually change, grouped by what
 * it affects. Everything here is local to the device — Fixly has no account —
 * so the destructive action at the bottom is the only way data ever leaves.
 */
export default function Ajustes() {
  const { vehicleType, vehicle, profile, records, readings, notices, setVehicleType, clearAll } = useVehicle();
  const copy = vehicleCopy(vehicleType);

  const activeNotices = notificationSettings.filter((s) => notices[s.id]?.enabled ?? s.enabled).length;

  function changeType(next: VehicleType) {
    if (next === vehicleType) return;
    // Switching vehicles invalidates the manual, the map and every record, so
    // never do it silently on a profile the driver has been feeding.
    if (!profile) {
      setVehicleType(next);
      return;
    }
    const other = vehicleCopy(next);
    Alert.alert(
      `¿Cambiar a ${other.noun}?`,
      `Se borrarán la ficha de ${copy.yours} y ${plural(records.length, 'su servicio registrado', 'sus servicios registrados')}. Esto no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: `Cambiar a ${other.noun}`, style: 'destructive', onPress: () => { setVehicleType(next); router.replace('/'); } },
      ],
    );
  }

  function confirmClear() {
    Alert.alert(
      '¿Borrar todos tus datos?',
      'Se elimina la ficha, el kilometraje, los servicios y tus avisos. Como todo se guarda solo en este teléfono, no hay forma de recuperarlo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar todo', style: 'destructive', onPress: () => { clearAll(); router.replace('/'); } },
      ],
    );
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.heading}>
        <Txt variant="label" color={Colors.accentLight}>TU CUENTA LOCAL</Txt>
        <Txt variant="screenTitle">Ajustes</Txt>
      </View>

      <Section title="Qué manejas">
        <VehicleTypePicker value={vehicleType} onChange={changeType} variant="segmented" />
        {profile ? (
          <Txt variant="bodySmall" color={Colors.textTertiary}>
            Cambiar de tipo borra la ficha actual y su historial.
          </Txt>
        ) : null}
      </Section>

      <Section title={copy.nounCap}>
        <Surface size="md" style={styles.card}>
          <IconRow
            icon="truck"
            title="Ficha del vehículo"
            subtitle={vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}` : 'Datos, kilometraje y uso'}
            onPress={() => router.push('/vehiculo')}
          />
          <IconRow icon="file-text" title="Documentos" subtitle="SOAT, licencia y certificados" onPress={() => router.push('/documentos')} />
          <IconRow icon="book-open" title={`Manual ${copy.ofThe}`} subtitle="La fuente del plan" onPress={() => router.push('/manual')} last />
        </Surface>
      </Section>

      <Section title="Avisos">
        <Surface size="md" style={styles.card}>
          <IconRow
            icon="bell"
            title="Recordatorios"
            subtitle={`${activeNotices} de ${notificationSettings.length} activos`}
            onPress={() => router.push('/avisos')}
            last
          />
        </Surface>
      </Section>

      <Section title="Herramientas">
        <Surface size="md" style={styles.card}>
          <IconRow icon="message-circle" title="Chatbot Fixly" subtitle={`Pregunta sobre ${copy.yours}`} onPress={() => router.push('/chatbot')} />
          <IconRow icon="bar-chart-2" title="Reportes" subtitle="Gasto y servicios" onPress={() => router.push('/reportes')} last />
        </Surface>
      </Section>

      <Section title="Tus datos">
        <Surface size="md" style={styles.dataCard}>
          <Txt variant="bodySmall" color={Colors.textSecondary}>
            Todo se guarda en este teléfono: {plural(records.length, 'servicio', 'servicios')} y{' '}
            {plural(readings.length, 'lectura de kilometraje', 'lecturas de kilometraje')}. Fixly no tiene cuenta ni servidor
            donde copiarlos.
          </Txt>
          <Pressable
            onPress={confirmClear}
            accessibilityRole="button"
            accessibilityLabel="Borrar todos mis datos"
            accessibilityHint="Pide confirmación antes de borrar"
            style={({ pressed }) => [styles.danger, pressed && styles.pressed]}>
            <Txt variant="buttonLabel" color={Colors.statusExpired}>
              Borrar todos mis datos
            </Txt>
          </Pressable>
        </Surface>
      </Section>

      <Txt variant="monoSmall" color={Colors.textTertiary} style={styles.version}>
        Fixly · versión 1.0.0
      </Txt>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="label" color={Colors.textTertiary}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 12, paddingTop: Spacing.lg },
  section: { gap: Spacing.sm },
  card: { paddingHorizontal: Spacing.lg },
  dataCard: { padding: Spacing.lg, gap: Spacing.md },
  danger: {
    minHeight: TouchTarget,
    borderRadius: Radius.md,
    borderWidth: BorderWidth,
    borderColor: Colors.statusExpiredSoft,
    backgroundColor: Colors.statusExpiredSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  version: { textAlign: 'center', marginTop: Spacing.sm },
});
