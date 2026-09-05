import { View } from 'react-native';
import { Host, Switch as ComposeSwitch } from '@expo/ui/jetpack-compose';

import { Colors } from '@/theme/tokens';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
};

/**
 * Native Jetpack Compose Switch — replaces the hand-rolled Reanimated switch on Android
 * for native drag-gesture and haptic feedback, tinted to the app's accent green via
 * `colors`. @expo/ui/jetpack-compose has no JS-exposed content-description modifier, so
 * the accessibility label is set on the wrapping RN View instead — that still reaches
 * TalkBack, it just isn't routed through Compose's own semantics tree.
 */
export function Switch({ value, onValueChange, accessibilityLabel }: Props) {
  return (
    <View accessible accessibilityRole="switch" accessibilityLabel={accessibilityLabel} accessibilityState={{ checked: value }}>
      <Host matchContents>
        <ComposeSwitch
          value={value}
          onCheckedChange={onValueChange}
          colors={{
            checkedTrackColor: Colors.accent,
            checkedThumbColor: Colors.onAccent,
            uncheckedTrackColor: Colors.border,
            uncheckedThumbColor: Colors.surface,
          }}
        />
      </Host>
    </View>
  );
}
