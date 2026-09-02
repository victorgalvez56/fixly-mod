import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { useVehicle } from '@/state/vehicle-context';
import { Colors } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { PlateField } from '@/ui/PlateField';
import { Screen } from '@/ui/Screen';
import { Txt } from '@/ui/Txt';

const PLATE_NOT_FOUND = 'ZZZ-999';
const PLATE_LENGTH = 7;

export default function PlateEntry() {
  const { setFound } = useVehicle();
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const canSubmit = plate.length === PLATE_LENGTH && status !== 'loading';

  function onSubmit() {
    if (!canSubmit) return;
    if (plate === PLATE_NOT_FOUND) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    setTimeout(() => {
      setFound(plate);
      router.replace('/estado');
    }, 500);
  }

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.brand}>
        <View style={styles.logoMark}>
          <View style={styles.logoStripe} />
          <Txt variant="cardTitle" style={styles.logoLetter}>
            F
          </Txt>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.halo} />
        <Txt variant="screenTitle" style={styles.headline}>
          ¿Qué le debes{'\n'}a tu auto?
        </Txt>

        <View style={styles.fieldBlock}>
          <PlateField value={plate} onChangeText={(v) => { setPlate(v); setStatus('idle'); }} onSubmit={onSubmit} />
          {status === 'error' ? (
            <Txt variant="bodySmall" color={Colors.statusExpired} style={styles.errorText}>
              No encontramos esa placa. Revisa que esté bien escrita.
            </Txt>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label={status === 'loading' ? 'Buscando tu auto…' : 'Consultar placa'}
          variant="primary"
          onPress={onSubmit}
          disabled={!canSubmit}
        />
        <Txt variant="monoSmall" color={Colors.textTertiary} style={styles.footnote}>
          No pedimos registro. Solo tu placa.
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  brand: { flexDirection: 'row' },
  logoMark: {
    height: 32,
    width: 56,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: Colors.accent },
  logoLetter: { color: Colors.textPrimary, fontSize: 16, lineHeight: 18 },
  hero: { gap: 32 },
  halo: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.accent,
    opacity: 0.06,
  },
  headline: { textAlign: 'left' },
  fieldBlock: { gap: 10 },
  errorText: { paddingHorizontal: 4 },
  footer: { gap: 14 },
  footnote: { textAlign: 'center' },
});
