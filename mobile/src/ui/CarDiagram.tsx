import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ZONE_META } from '@/lib/zones';
import { Colors, StatusMeta, type StatusKey } from '@/theme/tokens';
import type { MaintenanceZone } from '@/mock/data';
import { CAR_SVG, CAR_SVG_HEIGHT, CAR_SVG_WIDTH } from '@/ui/car-svg';

type Props = {
  statuses: Record<MaintenanceZone, StatusKey>;
  onPressZone: (zone: MaintenanceZone) => void;
};

/**
 * A top-down car line drawing (see car-svg.ts), styled like the reference
 * diagnostic screens: thin gray technical lines on a light surface, with
 * small status dots marking the zones. The dots map to real maintenance
 * data, never invented telemetry.
 */
export function CarDiagram({ statuses, onPressZone }: Props) {
  return (
    <View style={styles.wrap}>
      <SvgXml xml={CAR_SVG} width={CAR_SVG_WIDTH} height={CAR_SVG_HEIGHT} />

      {(Object.keys(ZONE_META) as MaintenanceZone[]).map((zone) => {
        const meta = ZONE_META[zone];
        const color = StatusMeta[statuses[zone]].color;
        return (
          <Pressable
            key={zone}
            onPress={() => onPressZone(zone)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={meta.label}
            style={[styles.marker, { top: `${meta.top}%`, left: `${meta.left}%` }]}>
            <View style={[styles.markerGlow, { backgroundColor: `${color}33` }]}>
              <View style={[styles.markerDot, { backgroundColor: color }]} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: CAR_SVG_WIDTH, height: CAR_SVG_HEIGHT, alignSelf: 'center' },
  marker: { position: 'absolute', transform: [{ translateX: -14 }, { translateY: -14 }] },
  markerGlow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.background,
  },
});
