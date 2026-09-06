import { Pressable, StyleSheet, View } from 'react-native';

import { notificationSettings, type NotificationSetting } from '@/mock/data';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, Spacing } from '@/theme/tokens';
import { DetailHeader } from '@/ui/DetailHeader';
import { HairlineRow } from '@/ui/HairlineRow';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { Switch } from '@/ui/Switch';
import { Txt } from '@/ui/Txt';

const LEAD_TIMES = [7, 15, 30];

export default function Avisos() {
  // Preferences live in the persisted store: as component state they were lost
  // the moment the driver navigated away.
  const { notices, setNotice } = useVehicle();
  const settings: NotificationSetting[] = notificationSettings.map((setting) => ({
    ...setting,
    enabled: notices[setting.id]?.enabled ?? setting.enabled,
    leadTimeDays: notices[setting.id]?.leadTimeDays ?? setting.leadTimeDays,
  }));

  function toggle(setting: NotificationSetting) {
    setNotice(setting.id, { enabled: !setting.enabled, leadTimeDays: setting.leadTimeDays });
  }

  function advanceLeadTime(setting: NotificationSetting) {
    const currentIndex = Math.max(0, LEAD_TIMES.indexOf(setting.leadTimeDays ?? LEAD_TIMES[0]));
    setNotice(setting.id, { enabled: setting.enabled, leadTimeDays: LEAD_TIMES[(currentIndex + 1) % LEAD_TIMES.length] });
  }

  return (
    <Screen>
      <DetailHeader title="Avisos" />
      <View style={styles.intro}><Txt variant="label" color={Colors.accentLight}>RECORDATORIOS</Txt><Txt variant="screenTitle">Que no se te pase.</Txt><Txt variant="body" color={Colors.textSecondary}>Elige qué quieres recordar y con cuánta anticipación.</Txt></View>
      <Surface size="md" style={styles.card}>
        {settings.map((setting, index) => <NoticeRow key={setting.id} setting={setting} onToggle={() => toggle(setting)} onAdvance={() => advanceLeadTime(setting)} last={index === settings.length - 1} />)}
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
