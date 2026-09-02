import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { notificationSettings } from '@/mock/data';
import { Colors } from '@/theme/tokens';
import { DetailHeader } from '@/ui/DetailHeader';
import { HairlineRow } from '@/ui/HairlineRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Switch } from '@/ui/Switch';
import { Txt } from '@/ui/Txt';

export default function Avisos() {
  const [settings, setSettings] = useState(notificationSettings);

  function toggle(id: string) {
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  }

  return (
    <Screen>
      <DetailHeader title="Avisos" />

      <Surface size="md" style={styles.card}>
        {settings.map((setting, index) => (
          <HairlineRow key={setting.id} last={index === settings.length - 1}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Txt variant="body">{setting.title}</Txt>
                <Txt variant="bodySmall" color={Colors.textTertiary}>
                  {setting.description}
                </Txt>
                {setting.enabled && setting.leadTimeDays != null ? (
                  <Txt variant="mono" color={Colors.textSecondary} style={styles.leadTime}>
                    Con {setting.leadTimeDays} días de anticipación
                  </Txt>
                ) : null}
              </View>
              <Switch value={setting.enabled} onValueChange={() => toggle(setting.id)} />
            </View>
          </HairlineRow>
        ))}
      </Surface>

      <Txt variant="bodySmall" color={Colors.textTertiary} style={styles.note}>
        Los avisos llegan por notificación push y, si lo activas, por WhatsApp.
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rowText: { flex: 1, gap: 4 },
  leadTime: { marginTop: 2 },
  note: { textAlign: 'center' },
});
