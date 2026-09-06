import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { BorderWidth, CardShadow, Colors, Radius, Spacing, TouchTarget } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { DetailHeader } from '@/ui/DetailHeader';
import { Screen } from '@/ui/Screen';
import { Txt } from '@/ui/Txt';

/**
 * MOCKUP — nothing here authenticates. No request is made, no credential is
 * stored and no state changes; the buttons only move between the two steps so
 * the flow can be judged before the architecture is decided.
 *
 * Framed as an optional account on purpose. Fixly's whole promise is "no
 * pedimos registro, solo tu placa", and the app repeats it on the plate screen,
 * in onboarding and in settings. A login that blocks entry would contradict all
 * three; one that only offers to back up the history does not.
 *
 * Phone-first because the drivers this is for (reparto, mototaxi) reach for a
 * number before an email, and SMS codes are the norm in the market.
 */
const CODE_LENGTH = 6;

export default function Cuenta() {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const codeInput = useRef<TextInput>(null);

  const phoneReady = phone.replace(/\D/g, '').length === 9;
  const codeReady = code.length === CODE_LENGTH;

  if (step === 'code') {
    return (
      <Screen>
        <DetailHeader title="Confirma tu número" />

        <View style={styles.intro}>
          <Txt variant="label" color={Colors.accentLight}>PASO 2 DE 2</Txt>
          <Txt variant="screenTitle">Te enviamos un código.</Txt>
          <Txt variant="body" color={Colors.textSecondary}>
            Escribe los {CODE_LENGTH} dígitos que llegaron al +51 {phone}.
          </Txt>
        </View>

        <Pressable onPress={() => codeInput.current?.focus()} accessibilityRole="button" accessibilityLabel="Código de verificación">
          <View style={styles.codeRow} pointerEvents="none">
            {Array.from({ length: CODE_LENGTH }, (_, i) => (
              <View key={i} style={[styles.codeBox, i === code.length && styles.codeBoxActive]}>
                <Txt variant="sectionTitle" tabularNums>
                  {code[i] ?? ''}
                </Txt>
              </View>
            ))}
          </View>
          <TextInput
            ref={codeInput}
            autoFocus
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            style={styles.hiddenInput}
            accessibilityLabel={`Código de ${CODE_LENGTH} dígitos`}
          />
        </Pressable>

        <View style={styles.actions}>
          <Button label="Confirmar" variant="primary" onPress={() => router.back()} disabled={!codeReady} />
          <Button label="Reenviar código" variant="tertiary" onPress={() => {}} />
          <Button label="Usar otro número" variant="tertiary" onPress={() => setStep('phone')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <DetailHeader title="Cuenta" />

      <View style={styles.intro}>
        <Txt variant="label" color={Colors.accentLight}>OPCIONAL</Txt>
        <Txt variant="screenTitle">Guarda tu historial fuera del teléfono.</Txt>
        <Txt variant="body" color={Colors.textSecondary}>
          Fixly funciona sin cuenta y así seguirá. Crea una solo si quieres respaldar tus servicios o pasarlos a otro
          teléfono si cambias de equipo.
        </Txt>
      </View>

      <View style={styles.field}>
        <Txt variant="label" color={Colors.textTertiary}>
          Tu número
        </Txt>
        <View style={styles.phoneWrap}>
          <View style={styles.prefix}>
            <Txt variant="bodyBold" color={Colors.textSecondary}>
              +51
            </Txt>
          </View>
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 9))}
            keyboardType="number-pad"
            placeholder="987 654 321"
            placeholderTextColor={Colors.textTertiary}
            maxLength={9}
            style={styles.phoneInput}
            accessibilityLabel="Número de celular"
          />
        </View>
      </View>

      <Button label="Enviarme el código" variant="primary" onPress={() => setStep('code')} disabled={!phoneReady} />

      <View style={styles.divider}>
        <View style={styles.line} />
        <Txt variant="bodySmall" color={Colors.textTertiary}>
          o
        </Txt>
        <View style={styles.line} />
      </View>

      <View style={styles.providers}>
        <Provider icon="chrome" label="Continuar con Google" />
        <Provider icon="command" label="Continuar con Apple" />
      </View>

      <Button label="Seguir sin cuenta" variant="tertiary" onPress={() => router.back()} />

      <Txt variant="monoSmall" color={Colors.textTertiary} style={styles.note}>
        Guardaríamos tus servicios y kilometraje. Nunca la ubicación ni datos del vehículo en marcha.
      </Txt>
    </Screen>
  );
}

function Provider({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <Pressable
      onPress={() => {}}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.provider, pressed && styles.pressed]}>
      <Feather name={icon} size={18} color={Colors.textPrimary} />
      <Txt variant="bodyBold">{label}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 14, paddingTop: Spacing.lg },
  field: { gap: Spacing.sm },
  phoneWrap: { flexDirection: 'row', alignItems: 'center', height: 64, borderRadius: Radius.md, backgroundColor: Colors.surface, overflow: 'hidden', ...CardShadow },
  prefix: { paddingHorizontal: Spacing.lg, height: '100%', justifyContent: 'center', borderRightWidth: BorderWidth, borderRightColor: Colors.borderSoft },
  phoneInput: { flex: 1, paddingHorizontal: Spacing.lg, fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 1, fontVariant: ['tabular-nums'] },
  codeRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  codeBox: {
    flex: 1,
    height: 64,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxActive: { borderColor: Colors.accent },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  actions: { gap: Spacing.xs },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  line: { flex: 1, height: BorderWidth, backgroundColor: Colors.borderSoft },
  providers: { gap: Spacing.md },
  provider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    minHeight: TouchTarget,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pressed: { opacity: 0.85 },
  note: { textAlign: 'center' },
});
