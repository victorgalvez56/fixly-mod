import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Colors, Spacing } from '@/theme/tokens';
import { IconRow } from '@/ui/IconRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

const ITEMS = [
  { icon: 'truck' as const, label: 'Ficha del vehículo', subtitle: 'Datos, kilometraje y uso', href: '/vehiculo' as const },
  { icon: 'file-text' as const, label: 'Documentos', subtitle: 'SOAT, licencia y certificados', href: '/documentos' as const },
  { icon: 'bell' as const, label: 'Avisos', subtitle: 'Cuándo quieres enterarte', href: '/avisos' as const },
  { icon: 'book-open' as const, label: 'Manual del auto', subtitle: 'La fuente del plan', href: '/manual' as const },
];

export default function Ajustes() {
  return (
    <Screen edges={['top']}>
      <View style={styles.heading}><Txt variant="label" color={Colors.accentLight}>TU CUENTA LOCAL</Txt><Txt variant="screenTitle">Ajustes</Txt></View>
      <Surface size="md" style={styles.card}>
        {ITEMS.map((item, index) => <IconRow key={item.href} icon={item.icon} title={item.label} subtitle={item.subtitle} onPress={() => router.push(item.href)} last={index === ITEMS.length - 1} />)}
      </Surface>
      <View style={styles.tools}>
        <IconRow icon="message-circle" title="Chatbot Fixly" subtitle="Pregunta sobre tu auto" onPress={() => router.push('/chatbot')} />
        <IconRow icon="bar-chart-2" title="Reportes" subtitle="Gasto y servicios" onPress={() => router.push('/reportes')} />
      </View>
      <Txt variant="monoSmall" color={Colors.textTertiary} style={styles.version}>Fixly · versión 1.0.0 · datos guardados en este dispositivo</Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 12, paddingTop: Spacing.lg },
  card: { paddingHorizontal: 16 },
  tools: { gap: 12 },
  version: { textAlign: 'center', marginTop: Spacing.md },
});
