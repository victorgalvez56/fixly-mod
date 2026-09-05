import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { vehicleCopy } from '@/lib/vehicle';
import type { VehicleType } from '@/lib/wear/types';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, Radius, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Txt } from '@/ui/Txt';
import { VehicleTypePicker } from '@/ui/VehicleTypePicker';

type Slide = { kicker: string; title: string; body: string; icon: keyof typeof Feather.glyphMap };

/**
 * Step 0 asks what the driver rides, because it decides the manual, the map and
 * the vocabulary of everything after it; the three slides that follow are then
 * written about that vehicle instead of a generic one.
 */
function slidesFor(type: VehicleType): Slide[] {
  const c = vehicleCopy(type);
  return [
    {
      kicker: 'QUÉ ES',
      title: `Una ficha clara para ${c.yours}.`,
      body: `Fixly junta lo que normalmente está repartido: documentos, servicios y el gasto real de ${type === 'moto' ? 'mantenerla' : 'mantenerlo'}.`,
      icon: 'clipboard',
    },
    {
      kicker: 'QUÉ RESUELVE',
      title: 'Saber qué toca antes de que se vuelva caro.',
      body: 'Te dice qué está vencido, qué viene después y qué deberías revisar en el taller.',
      icon: 'shield',
    },
    {
      kicker: 'CÓMO SE USA',
      title: 'Placa primero. Decisiones después.',
      body: `Escribes tu placa, confirmas los datos de ${c.yours} y guardas cada servicio. Lo demás se ordena solo.`,
      icon: 'arrow-right-circle',
    },
  ];
}

export default function Onboarding() {
  const { vehicleType, setVehicleType } = useVehicle();
  const [step, setStep] = useState(0); // 0 = vehicle type, 1..3 = slides
  const slides = slidesFor(vehicleType);
  const total = slides.length + 1;
  const slide = step > 0 ? slides[step - 1] : null;
  const last = step === total - 1;

  function next() {
    if (last) {
      router.replace('/');
      return;
    }
    setStep((current) => current + 1);
  }

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.top}>
        <View style={styles.brandLockup}>
          <View style={styles.logoMark}><View style={styles.logoStripe} /><Txt variant="cardTitle" color={Colors.onAccent}>F</Txt></View>
          <Txt variant="label" color={Colors.textMuted}>FIXLY</Txt>
        </View>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Saltar introducción" style={styles.skip}>
          <Txt variant="bodySmall" color={Colors.textMuted}>Saltar</Txt>
        </Pressable>
      </View>

      {slide ? (
        <View style={styles.body}>
          <View style={styles.iconPanel} accessibilityLabel={slide.kicker}>
            <Feather name={slide.icon} size={42} color={Colors.accent} />
            <View style={styles.rule} />
            <Txt variant="mono" color={Colors.textTertiary}>0{step + 1} / 0{total}</Txt>
          </View>
          <Txt variant="label" color={Colors.accentLight}>{slide.kicker}</Txt>
          <Txt variant="screenTitle">{slide.title}</Txt>
          <Txt variant="body" color={Colors.textSecondary}>{slide.body}</Txt>
        </View>
      ) : (
        <View style={styles.body}>
          <Txt variant="label" color={Colors.accentLight}>PARA EMPEZAR</Txt>
          <Txt variant="screenTitle">¿Qué manejas?</Txt>
          <Txt variant="body" color={Colors.textSecondary}>
            El plan sale del manual de tu vehículo, y un auto y una moto no piden lo mismo ni con la misma frecuencia.
          </Txt>
          <VehicleTypePicker value={vehicleType} onChange={setVehicleType} />
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={`Página ${step + 1} de ${total}`}>
          {Array.from({ length: total }, (_, dotIndex) => (
            <View key={dotIndex} style={[styles.dot, dotIndex === step && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={last ? 'Empezar con mi placa' : step === 0 ? `Continuar con ${vehicleCopy(vehicleType).noun}` : 'Siguiente'}
          variant="primary"
          onPress={next}
        />
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
  skip: { minHeight: 56, justifyContent: 'center' },
  body: { gap: 18 },
  iconPanel: { minHeight: 190, borderRadius: Radius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderSoft, padding: Spacing.xxl, justifyContent: 'space-between' },
  rule: { height: 1, backgroundColor: Colors.border },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 20, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surfaceAlt },
  dotActive: { width: 32, backgroundColor: Colors.accent },
  footer: { gap: 18 },
});
