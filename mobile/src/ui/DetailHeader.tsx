import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

/** The header every pushed screen uses instead of the native Stack header. */
export function DetailHeader({ title }: { title: string }) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        style={styles.back}
        accessibilityLabel="Volver"
        accessibilityRole="button">
        <Feather name="chevron-left" size={22} color={Colors.textPrimary} />
      </Pressable>
      <Txt variant="cardTitle" numberOfLines={1} style={styles.title}>
        {title}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  title: { flex: 1 },
});
