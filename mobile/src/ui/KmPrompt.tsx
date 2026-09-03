import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { formatKm } from '@/lib/format';
import { Colors, Radius, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { Txt } from '@/ui/Txt';

type Props = {
  visible: boolean;
  lastKm: number | null;
  onClose: () => void;
  onSave: (km: number) => void;
};

/** "¿Cuántos km marca hoy?" — the single most valuable datum, asked in one field. */
export function KmPrompt({ visible, lastKm, onClose, onSave }: Props) {
  const [value, setValue] = useState('');
  const km = parseInt(value.replace(/\D/g, ''), 10);
  const valid = !Number.isNaN(km) && km > 0;
  const lower = valid && lastKm !== null && km < lastKm;

  function save() {
    if (!valid) return;
    onSave(km);
    setValue('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Txt variant="sectionTitle">¿Cuántos km marca hoy?</Txt>
          {lastKm !== null ? (
            <Txt variant="bodySmall" color={Colors.textSecondary}>
              Último registro: {formatKm(lastKm)}
            </Txt>
          ) : null}
          <TextInput
            autoFocus
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            placeholder={lastKm !== null ? String(lastKm) : '87400'}
            placeholderTextColor={Colors.textTertiary}
            onSubmitEditing={save}
            style={styles.input}
            accessibilityLabel="Kilometraje actual"
          />
          {lower ? (
            <Txt variant="bodySmall" color="#b45309">
              Es menor que tu último registro. Si está bien, guarda igual.
            </Txt>
          ) : null}
          <View style={styles.actions}>
            <Button label="Guardar" variant="primary" onPress={save} disabled={!valid} />
            <Button label="Ahora no" variant="tertiary" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(17,24,39,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: 24, gap: 12, paddingBottom: 36 },
  input: { height: 64, borderRadius: Radius.sm, backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, fontSize: 28, fontWeight: '700', color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  actions: { gap: Spacing.xs, marginTop: 4 },
});
