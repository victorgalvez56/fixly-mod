import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { vehicleCopy } from '@/lib/vehicle';
import type { VehicleType } from '@/lib/wear/types';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { InputsArt, SourceArt, VerdictArt } from '@/ui/OnboardingArt';
import { Screen } from '@/ui/Screen';
import { Txt } from '@/ui/Txt';
import { VehicleTypePicker } from '@/ui/VehicleTypePicker';

type Step = { kicker: string; title: string; body?: string; art: ReactNode };

/**
 * Four steps, each answering one question a driver actually asks — what do you
 * want from me, what do I get, what do you need, and where do the numbers come
 * from. Every step shows a real piece of the app instead of describing it: the
 * previous version was three taglines over an empty panel with a stock icon,
 * and it never said what Fixly does or where its data comes from.
 */
function stepsFor(type: VehicleType): Step[] {
  const c = vehicleCopy(type);
  return [
    {
      kicker: 'QUÉ TE DICE',
      title: `Qué le toca a ${c.yours}, y cuándo.`,
      body: `Cada pieza tiene un intervalo en el manual. Fixly lo compara con tu kilometraje y te dice cuál ya se pasó y cuál todavía aguanta.`,
      art: <VerdictArt type={type} />,
    },
    {
      kicker: 'QUÉ NECESITA DE TI',
      title: 'Tres datos, y nada más.',
      art: <InputsArt type={type} />,
    },
    {
      kicker: 'DE DÓNDE SALE',
      title: 'No adivina nada.',
      art: <SourceArt type={type} />,
    },
  ];
}

export default function Onboarding() {
  const { vehicleType, setVehicleType } = useVehicle();
  const [index, setIndex] = useState(0); // 0 = vehicle type, then one per step
  const steps = stepsFor(vehicleType);
  const total = steps.length + 1;
  const step = index > 0 ? steps[index - 1] : null;
  const last = index === total - 1;
  const copy = vehicleCopy(vehicleType);

  function next() {
    if (last) {
      router.replace('/');
      return;
    }
    setIndex((current) => current + 1);
  }

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.top}>
        <View style={styles.brandLockup}>
          <View style={styles.logoMark}>
            <View style={styles.logoStripe} />
            <Txt variant="cardTitle" color={Colors.onAccent}>F</Txt>
          </View>
          <Txt variant="label" color={Colors.textMuted}>FIXLY</Txt>
        </View>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Saltar introducción" style={styles.skip}>
          <Txt variant="bodySmall" color={Colors.textMuted}>Saltar</Txt>
        </Pressable>
      </View>

      <View style={styles.body}>
        {step ? (
          <>
            <Txt variant="label" color={Colors.accentLight}>{step.kicker}</Txt>
            <Txt variant="screenTitle">{step.title}</Txt>
            {step.body ? (
              <Txt variant="body" color={Colors.textSecondary}>{step.body}</Txt>
            ) : null}
            <View style={styles.art}>{step.art}</View>
          </>
        ) : (
          <>
            <Txt variant="label" color={Colors.accentLight}>PARA EMPEZAR</Txt>
            <Txt variant="screenTitle">¿Qué manejas?</Txt>
            <Txt variant="body" color={Colors.textSecondary}>
              El plan sale del manual de tu vehículo, y un auto y una moto no piden lo mismo ni con la misma frecuencia.
            </Txt>
            <View style={styles.art}>
              <VehicleTypePicker value={vehicleType} onChange={setVehicleType} />
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={`Paso ${index + 1} de ${total}`}>
          {Array.from({ length: total }, (_, dot) => (
            <View key={dot} style={[styles.dot, dot === index && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={last ? 'Empezar con mi placa' : index === 0 ? `Continuar con ${copy.noun}` : 'Siguiente'}
          variant="primary"
          onPress={next}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: Spacing.xl },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark: { height: 40, width: 64, borderRadius: 11, backgroundColor: Colors.accent, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, backgroundColor: Colors.paper },
  skip: { minHeight: 56, justifyContent: 'center' },
  body: { flex: 1, gap: 14, paddingTop: Spacing.xxl },
  art: { paddingTop: Spacing.sm },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 20, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surfaceAlt },
  dotActive: { width: 32, backgroundColor: Colors.accent },
  footer: { gap: 18 },
});
