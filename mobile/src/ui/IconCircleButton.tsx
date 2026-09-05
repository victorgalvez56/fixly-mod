import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BorderWidth, Colors } from '@/theme/tokens';

type Props = { icon: keyof typeof Feather.glyphMap; onPress: () => void; accessibilityLabel: string; badge?: boolean };

export function IconCircleButton({ icon, onPress, accessibilityLabel, badge }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.button} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      <Feather name={icon} size={19} color={Colors.textPrimary} />
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: BorderWidth, borderColor: Colors.borderSoft },
  badge: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.statusExpired },
});
