import { memo } from 'react';
import Animated, { Extrapolation, interpolate, useAnimatedProps, useDerivedValue, type SharedValue } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import type { DrawingPath, VehicleDrawing } from '@/data/drawing';
import type { Zone } from '@/lib/wear/types';
import { Colors } from '@/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const STROKE_SILHOUETTE = Colors.textTertiary;
const STROKE_GLASS = Colors.border;
const STROKE_ZONE_MUTED = Colors.borderSoft;
const STROKE_COMPONENT = Colors.textSecondary;

export type ZoneVisual = { color: string; pending: boolean };

export type RevealPlan = {
  /** componentId -> [start, end] window inside the 0..1 reveal progress */
  windows: Record<string, [number, number]>;
};

type Props = {
  /** Which vehicle to draw. The component knows nothing else about the vehicle. */
  drawing: VehicleDrawing;
  width: number;
  zones: Partial<Record<Zone, ZoneVisual>>;
  selectedZone: Zone | null;
  /** 0..1 draw-in of the selected zone's components (strokeDashoffset). */
  reveal: SharedValue<number>;
  /** 0..1 visibility of the schematic detail layer over the plain wireframe. */
  detail: SharedValue<number>;
  plan: RevealPlan;
  /** componentId -> status color once the status has "resolved"; empty before that. */
  resolvedColors: Record<string, string>;
  onPressZone?: (zone: Zone) => void;
};

const isStatic = (p: DrawingPath) => p.layer === 'silhouette' || p.layer === 'glass' || p.layer === 'wheels';
const isDetail = (p: DrawingPath) => p.layer === 'enginebay' || p.layer === 'hoses';

/** The vehicle body, glass and wheels: never re-rendered by state changes. */
const StaticLayer = memo(function StaticLayer({ paths }: { paths: DrawingPath[] }) {
  return (
    <G>
      {paths.map((p) => (
        <Path
          key={p.id}
          d={p.d}
          stroke={p.layer === 'glass' ? STROKE_GLASS : STROKE_SILHOUETTE}
          strokeWidth={p.strokeWidth}
          fill={p.layer === 'silhouette' && p.id.includes('body') ? Colors.background : 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </G>
  );
});

function RevealPath({
  path,
  reveal,
  detail,
  window,
  active,
  color,
}: {
  path: DrawingPath;
  reveal: SharedValue<number>;
  detail: SharedValue<number>;
  window: [number, number] | null;
  active: boolean;
  color: string;
}) {
  const len = Math.max(1, path.length);
  const animatedProps = useAnimatedProps(() => {
    const local = window ? interpolate(reveal.value, [window[0], window[1]], [0, 1], Extrapolation.CLAMP) : 1;
    return {
      strokeDashoffset: active ? len * (1 - local) : 0,
      strokeOpacity: active ? detail.value : detail.value * 0.28,
    };
  });
  return (
    <AnimatedPath
      d={path.d}
      stroke={color}
      strokeWidth={active ? path.strokeWidth * 1.35 : path.strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={active ? [len, len] : undefined}
      animatedProps={animatedProps}
    />
  );
}

/**
 * A vehicle drawing as JSX SVG: a static wireframe, zone outlines colored by
 * status, and a schematic detail layer whose strokes draw in during the reveal
 * (the reference's "schematic over wireframe" effect). Zones are tapped through
 * invisible filled polygons that are >= 56 px on a phone. Cars and motorcycles
 * differ only in the drawing handed in.
 */
export function VehicleMap({ drawing, width, zones, selectedZone, reveal, detail, plan, resolvedColors, onPressZone }: Props) {
  const { viewBox, paths } = drawing;
  const height = (width * viewBox.h) / viewBox.w;
  const zoneOpacity = useDerivedValue(() => 1 - detail.value * 0.75);

  return (
    <Svg width={width} height={height} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}>
      <StaticLayer paths={paths.filter(isStatic)} />

      <ZoneLayer paths={paths.filter((p) => p.layer === 'zones')} zones={zones} selectedZone={selectedZone} opacity={zoneOpacity} />

      <G>
        {paths.filter(isDetail).map((p) => {
          const active = selectedZone !== null && p.zone === selectedZone;
          const window = p.componentId ? (plan.windows[p.componentId] ?? null) : active ? [0, 1] : null;
          const resolved = p.componentId ? resolvedColors[p.componentId] : undefined;
          const color = resolved ?? STROKE_COMPONENT;
          return <RevealPath key={p.id} path={p} reveal={reveal} detail={detail} window={window as [number, number] | null} active={active} color={color} />;
        })}
      </G>

      {onPressZone ? (
        <G>
          {paths
            .filter((p) => p.layer === 'hit')
            .map((p) => (
              <Path
                key={p.id}
                d={p.d}
                fill="transparent"
                stroke="none"
                onPress={() => p.zone && onPressZone(p.zone)}
                accessibilityLabel={p.zone ?? p.id}
              />
            ))}
        </G>
      ) : null}
    </Svg>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);

function ZoneLayer({
  paths,
  zones,
  selectedZone,
  opacity,
}: {
  paths: DrawingPath[];
  zones: Partial<Record<Zone, ZoneVisual>>;
  selectedZone: Zone | null;
  opacity: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({ opacity: opacity.value }));
  return (
    <AnimatedG animatedProps={animatedProps}>
      {paths.map((p) => {
        const zone = p.zone;
        const visual = zone ? zones[zone] : undefined;
        const dim = selectedZone !== null && zone !== selectedZone;
        const stroke = visual?.pending ? visual.color : STROKE_ZONE_MUTED;
        return (
          <Path
            key={p.id}
            d={p.d}
            stroke={stroke}
            strokeWidth={visual?.pending ? p.strokeWidth * 1.2 : p.strokeWidth}
            strokeOpacity={dim ? 0.3 : 1}
            fill={visual?.pending ? `${visual.color}14` : 'none'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </AnimatedG>
  );
}
