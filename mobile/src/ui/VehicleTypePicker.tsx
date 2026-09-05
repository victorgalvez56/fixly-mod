import { Pressable, StyleSheet, View } from 'react-native';

import { VEHICLE_COPY, VEHICLE_TYPES } from '@/lib/vehicle';
import type { VehicleType } from '@/lib/wear/types';
import { BorderWidth, Colors, Radius, Spacing, TouchTarget } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';
import { VehicleSilhouette } from '@/ui/VehicleSilhouette';

type Props = {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
  /** 'cards' for onboarding, 'segmented' for the compact control above the plate. */
  variant?: 'cards' | 'segmented';
};

/**
 * "¿Qué manejas?" — the first thing Fixly needs to know, because it decides the
 * manual, the map and half the vocabulary. Each option is drawn with the same
 * geometry the maintenance map uses, so the choice previews what comes next.
 */
export function VehicleTypePicker({ value, onChange, variant = 'cards' }: Props) {
  if (variant === 'segmented') {
    return (
      <View style={styles.segment} accessibilityRole="radiogroup">
        {VEHICLE_TYPES.map((type) => {
          const copy = VEHICLE_COPY[type];
          const on = value === type;
          return (
            <Pressable
              key={type}
              onPress={() => onChange(type)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={copy.plural}
              style={({ pressed }) => [styles.segmentItem, on && styles.segmentItemOn, pressed && styles.pressed]}>
              <VehicleSilhouette type={type} width={type === 'moto' ? 46 : 26} color={on ? Colors.accent : Colors.textTertiary} strokeScale={2} />
              <Txt variant="bodyBold" color={on ? Colors.textPrimary : Colors.textTertiary}>
                {copy.plural}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.cards} accessibilityRole="radiogroup">
      {VEHICLE_TYPES.map((type) => {
        const copy = VEHICLE_COPY[type];
        const on = value === type;
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${copy.plural}. ${copy.pickerHint}`}
            style={({ pressed }) => [styles.card, on && styles.cardOn, pressed && styles.pressed]}>
            <View style={styles.art}>
              <VehicleSilhouette type={type} width={type === 'moto' ? 132 : 74} color={on ? Colors.accent : Colors.textTertiary} />
            </View>
            <View style={styles.cardText}>
              <Txt variant="cardTitle">{copy.plural}</Txt>
              <Txt variant="bodySmall" color={Colors.textSecondary}>
                {copy.pickerHint}
              </Txt>
            </View>
            <View style={[styles.radio, on && styles.radioOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: 104,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: BorderWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cardOn: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  art: { width: 140, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: BorderWidth, borderColor: Colors.border },
  radioOn: { borderColor: Colors.accent, borderWidth: 7 },
  segment: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  segmentItem: {
    flex: 1,
    minHeight: TouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.sm,
  },
  segmentItemOn: { backgroundColor: Colors.background, borderWidth: BorderWidth, borderColor: Colors.accent },
  pressed: { opacity: 0.85 },
});
