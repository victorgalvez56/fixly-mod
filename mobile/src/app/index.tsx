import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useVehicle } from '@/state/vehicle-context';
import { Colors, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { PlateField } from '@/ui/PlateField';
import { Screen } from '@/ui/Screen';
import { Txt } from '@/ui/Txt';

const PLATE_NOT_FOUND = 'ZZZ-999';
const PLATE_LENGTH = 7;

export default function PlateEntry() {
  const { setFound, hydrated, vehicle } = useVehicle();
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hydrated && vehicle) router.replace('/estado');
  }, [hydrated, vehicle]);

  useEffect(() => () => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
  }, []);

  const canSubmit = plate.length === PLATE_LENGTH && status !== 'loading';

  function onSubmit() {
    if (!canSubmit) return;
    if (plate === PLATE_NOT_FOUND) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    lookupTimer.current = setTimeout(() => {
      setFound(plate);
      router.replace('/estado');
    }, 420);
  }

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.top}>
        <View style={styles.brandLockup}>
          <View style={styles.logoMark} accessibilityLabel="Fixly">
            <View style={styles.logoStripe} />
            <Txt variant="cardTitle" color={Colors.onAccent} style={styles.logoLetter}>F</Txt>
          </View>
          <Txt variant="label" color={Colors.textMuted}>FIXLY / TU AUTO, AL DÍA</Txt>
        </View>
        <Pressable onPress={() => router.push('/onboarding')} accessibilityRole="button" accessibilityLabel="Conocer Fixly" style={styles.infoButton}>
          <Feather name="help-circle" size={20} color={Colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.halo} />
        <Txt variant="label" color={Colors.accentLight}>CONSULTA RÁPIDA</Txt>
        <Txt variant="screenTitle" style={styles.headline}>¿Qué le debes{'\n'}a tu auto?</Txt>
        <Txt variant="body" color={Colors.textSecondary} style={styles.intro}>
          Revisa documentos, mantenimiento y gastos desde un solo lugar.
        </Txt>
        <View style={styles.fieldBlock}>
          <PlateField value={plate} onChangeText={(v) => { setPlate(v); setStatus('idle'); }} onSubmit={onSubmit} />
          {status === 'error' ? (
            <Txt variant="bodySmall" color={Colors.statusExpired} accessibilityLiveRegion="polite">
              No encontramos esa placa. Revisa que esté bien escrita o prueba con otra.
            </Txt>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label={status === 'loading' ? 'Buscando tu auto…' : 'Consultar placa'} variant="primary" onPress={onSubmit} disabled={!canSubmit} />
        <Txt variant="monoSmall" color={Colors.textTertiary} style={styles.footnote}>
          No pedimos registro. Solo tu placa.
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark: { height: 40, width: 64, borderRadius: 11, backgroundColor: Colors.accent, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, backgroundColor: Colors.paper },
  logoLetter: { fontSize: 22, lineHeight: 24 },
  infoButton: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  hero: { gap: 18 },
  halo: { position: 'absolute', top: -96, right: -52, width: 290, height: 290, borderRadius: 145, backgroundColor: Colors.accent, opacity: 0.08 },
  headline: { marginTop: 2 },
  intro: { maxWidth: 320 },
  fieldBlock: { gap: 10, marginTop: Spacing.md },
  footer: { gap: 10 },
  footnote: { textAlign: 'center' },
});
