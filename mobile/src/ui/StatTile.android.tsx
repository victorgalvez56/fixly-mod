import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Host, OutlinedCard, RNHostView } from '@expo/ui/jetpack-compose';

import { Colors } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  caption?: string;
};

/**
 * Native Compose card for the container (border/elevation match the app's 2px BorderWidth
 * token exactly, via Card's own `border` prop) — the icon/label/value content stays RN,
 * bridged in via RNHostView, since Compose Text has no access to the app's Inter font files.
 */
export function StatTile({ icon, label, value, valueColor, caption }: Props) {
  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <OutlinedCard colors={{ containerColor: Colors.surface }} border={{ width: 2, color: Colors.borderSoft }}>
        <RNHostView matchContents>
          <View style={{ padding: 16, gap: 4 }}>
            <Feather name={icon} size={18} color={Colors.textTertiary} />
            <Txt variant="bodySmall" color={Colors.textSecondary}>
              {label}
            </Txt>
            <Txt variant="sectionTitle" color={valueColor ?? Colors.textPrimary}>
              {value}
            </Txt>
            {caption ? (
              <Txt variant="bodySmall" color={Colors.textTertiary}>
                {caption}
              </Txt>
            ) : null}
          </View>
        </RNHostView>
      </OutlinedCard>
    </Host>
  );
}
