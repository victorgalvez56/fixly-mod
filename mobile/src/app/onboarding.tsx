import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors, Radius, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Txt } from '@/ui/Txt';

const SLIDES = [
  { kicker: 'QUÉ ES', title: 'Una ficha clara para tu auto.', body: 'Fixly junta lo que normalmente está repartido: documentos, servicios y el gasto real de mantenerlo.', icon: 'clipboard' as const },
  { kicker: 'QUÉ RESUELVE', title: 'Saber qué toca antes de que se vuelva caro.', body: 'Te dice qué está vencido, qué viene después y qué deberías revisar en el taller.', icon: 'shield' as const },
  { kicker: 'CÓMO SE USA', title: 'Placa primero. Decisiones después.', body: 'Escribes tu placa, confirmas los datos de tu auto y guardas cada servicio. Lo demás se ordena solo.', icon: 'arrow-right-circle' as const },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

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
          <View style={styles.logoMark}><View style={styles.logoStripe} /><Txt variant="cardTitle" color={Colors.onAccent}>F</Txt></View>
          <Txt variant="label" color={Colors.textMuted}>FIXLY</Txt>
        </View>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Saltar introducción" style={styles.skip}>
          <Txt variant="bodySmall" color={Colors.textMuted}>Saltar</Txt>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.iconPanel} accessibilityLabel={slide.kicker}>
          <Feather name={slide.icon} size={42} color={Colors.accent} />
          <View style={styles.rule} />
          <Txt variant="mono" color={Colors.textTertiary}>0{index + 1} / 03</Txt>
        </View>
        <Txt variant="label" color={Colors.accentLight}>{slide.kicker}</Txt>
        <Txt variant="screenTitle">{slide.title}</Txt>
        <Txt variant="body" color={Colors.textSecondary}>{slide.body}</Txt>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={`Página ${index + 1} de ${SLIDES.length}`}>
          {SLIDES.map((item, dotIndex) => <View key={item.kicker} style={[styles.dot, dotIndex === index && styles.dotActive]} />)}
        </View>
        <Button label={last ? 'Empezar con mi placa' : 'Siguiente'} variant="primary" onPress={next} />
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
