import { drawingFor } from '@/data/drawing';
import type { VehicleType } from '@/lib/wear/types';
import { Colors } from '@/theme/tokens';
import Svg, { G, Path } from 'react-native-svg';

type Props = {
  type: VehicleType;
  width: number;
  color?: string;
  /** Thicker strokes read better at small sizes than the map's hairlines. */
  strokeScale?: number;
};

/**
 * The outline of a vehicle, with no zones, schematic or interaction: the same
 * generated geometry the map uses, so the shape the driver picks in onboarding
 * is literally the shape they will see later on the map.
 */
export function VehicleSilhouette({ type, width, color = Colors.textSecondary, strokeScale = 1.6 }: Props) {
  const drawing = drawingFor(type);
  const { viewBox } = drawing;
  const height = (width * viewBox.h) / viewBox.w;
  const paths = drawing.paths.filter((p) => p.layer === 'silhouette' || p.layer === 'wheels');

  return (
    <Svg width={width} height={height} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}>
      <G>
        {paths.map((p) => (
          <Path
            key={p.id}
            d={p.d}
            stroke={color}
            strokeWidth={p.strokeWidth * strokeScale}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </G>
    </Svg>
  );
}
