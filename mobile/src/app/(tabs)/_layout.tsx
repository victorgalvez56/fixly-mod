import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';

import { Colors } from '@/theme/tokens';
import { TabButton } from '@/ui/TabButton';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TabTrigger name="estado" href="/estado" asChild>
          <TabButton icon="activity" label="Estado" />
        </TabTrigger>
        <TabTrigger name="plan" href="/plan" asChild>
          <TabButton icon="calendar" label="Plan" />
        </TabTrigger>
        <TabTrigger name="historial" href="/historial" asChild>
          <TabButton icon="archive" label="Historial" />
        </TabTrigger>
        <TabTrigger name="ajustes" href="/ajustes" asChild>
          <TabButton icon="settings" label="Ajustes" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    paddingTop: 10,
  },
});
