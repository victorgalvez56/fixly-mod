import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { Colors } from '@/theme/tokens';
import { IconRow } from '@/ui/IconRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Txt } from '@/ui/Txt';

const ITEMS = [
  { icon: 'truck' as const, label: 'Ficha del vehículo', href: '/vehiculo' as const },
  { icon: 'bell' as const, label: 'Avisos', href: '/avisos' as const },
];

export default function Ajustes() {
  return (
    <Screen edges={['top']}>
      <Txt variant="screenTitle">Ajustes</Txt>

      <Surface size="md" style={styles.card}>
        {ITEMS.map((item, index) => (
          <IconRow
            key={item.href}
            icon={item.icon}
            title={item.label}
            onPress={() => router.push(item.href)}
            last={index === ITEMS.length - 1}
          />
        ))}
      </Surface>

      <Txt variant="monoSmall" color={Colors.textTertiary}>
        Fixly · versión 1.0.0
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16 },
});
