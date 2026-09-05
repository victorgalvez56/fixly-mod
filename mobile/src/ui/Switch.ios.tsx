import { Host, Toggle } from '@expo/ui/swift-ui';
import { accessibilityLabel as accessibilityLabelModifier, labelsHidden } from '@expo/ui/swift-ui/modifiers';

import { Colors } from '@/theme/tokens';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
};

/**
 * Native SwiftUI Toggle — replaces the hand-rolled Reanimated switch on iOS for native
 * drag-gesture and haptic feedback. `seedColor` tints the toggle's on-state to the app's
 * accent green instead of the default iOS system green. No `label` is passed to Toggle
 * (callers already render their own label text alongside it) — `labelsHidden()` collapses
 * the space SwiftUI would otherwise reserve for one, and the accessibility label is set
 * separately via the modifier so VoiceOver still announces it.
 */
export function Switch({ value, onValueChange, accessibilityLabel }: Props) {
  return (
    <Host matchContents seedColor={Colors.accent}>
      <Toggle
        isOn={value}
        onIsOnChange={onValueChange}
        modifiers={accessibilityLabel ? [labelsHidden(), accessibilityLabelModifier(accessibilityLabel)] : [labelsHidden()]}
      />
    </Host>
  );
}
