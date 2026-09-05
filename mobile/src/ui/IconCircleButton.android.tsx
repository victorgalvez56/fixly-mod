import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Host, OutlinedIconButton, RNHostView } from '@expo/ui/jetpack-compose';
import { clickable } from '@expo/ui/jetpack-compose/modifiers';

import { Colors } from '@/theme/tokens';

type Props = { icon: keyof typeof Feather.glyphMap; onPress: () => void; accessibilityLabel: string; badge?: boolean };

/**
 * Native Compose icon button — same Feather glyph set as the rest of the app, bridged in via
 * RNHostView instead of switching to Material Symbols XML assets, so icons stay visually
 * consistent with every other screen. Native ripple feedback via the clickable modifier.
 */
export function IconCircleButton({ icon, onPress, accessibilityLabel, badge }: Props) {
  return (
    <View accessible accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      <Host matchContents>
        <OutlinedIconButton colors={{ containerColor: Colors.surface }} modifiers={[clickable(onPress)]}>
          <RNHostView matchContents>
            <View>
              <Feather name={icon} size={19} color={Colors.textPrimary} />
              {badge ? <View style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.statusExpired }} /> : null}
            </View>
          </RNHostView>
        </OutlinedIconButton>
      </Host>
    </View>
  );
}
