import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

export function DetailHeader({ title }: { title: string }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back} accessibilityLabel="Volver" accessibilityRole="button">
        <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
      </Pressable>
      <Txt variant="cardTitle" numberOfLines={1} style={styles.title}>{title}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderSoft },
  title: { flex: 1 },
});
