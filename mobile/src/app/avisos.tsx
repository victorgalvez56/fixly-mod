import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { notificationSettings, type NotificationSetting } from '@/mock/data';
import { Colors, Spacing } from '@/theme/tokens';
import { DetailHeader } from '@/ui/DetailHeader';
import { HairlineRow } from '@/ui/HairlineRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Switch } from '@/ui/Switch';
import { Txt } from '@/ui/Txt';

export default function Avisos() {
  const [settings, setSettings] = useState(notificationSettings);

  function toggle(id: string) {
    setSettings((prev) => prev.map((setting) => setting.id === id ? { ...setting, enabled: !setting.enabled } : setting));
  }

  function advanceLeadTime(id: string) {
    setSettings((prev) => prev.map((setting) => {
      if (setting.id !== id) return setting;
      const options = [7, 15, 30];
      const currentIndex = Math.max(0, options.indexOf(setting.leadTimeDays ?? 7));
      return { ...setting, leadTimeDays: options[(currentIndex + 1) % options.length] };
    }));
  }

  return (
    <Screen>
      <DetailHeader title="Avisos" />
      <View style={styles.intro}><Txt variant="label" color={Colors.accentLight}>RECORDATORIOS</Txt><Txt variant="screenTitle">Que no se te pase.</Txt><Txt variant="body" color={Colors.textSecondary}>Elige qué quieres recordar y con cuánta anticipación.</Txt></View>
      <Surface size="md" style={styles.card}>
        {settings.map((setting, index) => <NoticeRow key={setting.id} setting={setting} onToggle={() => toggle(setting.id)} onAdvance={() => advanceLeadTime(setting.id)} last={index === settings.length - 1} />)}
      </Surface>
      <Txt variant="bodySmall" color={Colors.textTertiary} style={styles.note}>Los avisos llegan como notificación en tu celular. Puedes cambiarlos cuando quieras.</Txt>
    </Screen>
  );
}

function NoticeRow({ setting, onToggle, onAdvance, last }: { setting: NotificationSetting; onToggle: () => void; onAdvance: () => void; last: boolean }) {
  return (
    <HairlineRow last={last}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Txt variant="bodyBold">{setting.title}</Txt>
          <Txt variant="bodySmall" color={Colors.textTertiary}>{setting.description}</Txt>
          {setting.enabled && setting.leadTimeDays != null ? (
            <Pressable onPress={onAdvance} accessibilityRole="button" accessibilityLabel={setting.title + ', anticipación de ' + setting.leadTimeDays + ' días'} style={styles.leadTime}>
              <Txt variant="mono" color={Colors.accentLight}>Con {setting.leadTimeDays} días de anticipación · Cambiar</Txt>
            </Pressable>
          ) : null}
        </View>
        <Switch value={setting.enabled} onValueChange={onToggle} accessibilityLabel={setting.title} />
      </View>
    </HairlineRow>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 14, paddingTop: Spacing.lg },
  card: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rowText: { flex: 1, gap: 5 },
  leadTime: { minHeight: 44, justifyContent: 'center' },
  note: { textAlign: 'center' },
});
