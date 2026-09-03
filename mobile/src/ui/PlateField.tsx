import { StyleSheet, TextInput, View } from 'react-native';

import { CardShadow, Colors, Radius } from '@/theme/tokens';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
};

function formatPlate(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const letters = clean.slice(0, 3);
  const digits = clean.slice(3, 6);
  return digits ? `${letters}-${digits}` : letters;
}

/**
 * The product's entry gesture. Styled to read as a real plate: pale face,
 * gold stripe fixed to the left edge, heavy uppercase text. The placeholder
 * shows the pattern (ABC-123), not an instruction.
 */
export function PlateField({ value, onChangeText, onSubmit }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.stripe} />
      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(formatPlate(text))}
        onSubmitEditing={onSubmit}
        placeholder="ABC-123"
        placeholderTextColor={Colors.textTertiary}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={7}
        returnKeyType="go"
        accessibilityLabel="Placa del vehículo"
        accessibilityHint="Escribe seis caracteres, por ejemplo ABC-123"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 76,
    borderRadius: Radius.md,
    backgroundColor: Colors.paper,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
    ...CardShadow,
  },
  stripe: { width: 12, backgroundColor: Colors.accent },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 3.6,
    color: Colors.dark,
    textAlign: 'center',
  },
});
