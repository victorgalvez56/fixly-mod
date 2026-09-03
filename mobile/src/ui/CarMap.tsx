import { memo } from 'react';
import Animated, { Extrapolation, interpolate, useAnimatedProps, useDerivedValue, type SharedValue } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { CAR_PATHS, CAR_VIEWBOX, type CarPath, type CarZone } from '@/data/car-drawing';
import { Colors } from '@/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const STROKE_SILHOUETTE = '#9aa3ad';
const STROKE_GLASS = '#b9c0c8';
const STROKE_ZONE_MUTED = '#c3c9d1';
const STROKE_COMPONENT = '#4b5563';

export type ZoneVisual = { color: string; pending: boolean };

export type RevealPlan = {
  /** componentId -> [start, end] window inside the 0..1 reveal progress */
  windows: Record<string, [number, number]>;
};

type Props = {
  width: number;
  zones: Partial<Record<CarZone, ZoneVisual>>;
  selectedZone: CarZone | null;
  /** 0..1 draw-in of the selected zone's components (strokeDashoffset). */
  reveal: SharedValue<number>;
  /** 0..1 visibility of the engine-bay detail layer over the plain wireframe. */
  detail: SharedValue<number>;
  plan: RevealPlan;
  /** componentId -> status color once the status has "resolved"; empty before that. */
  resolvedColors: Record<string, string>;
  onPressZone?: (zone: CarZone) => void;
};

export function carMapHeight(width: number): number {
  return (width * CAR_VIEWBOX.h) / CAR_VIEWBOX.w;
}

/** viewBox units -> rendered pixels for a map of the given width. */
export function unitScale(width: number): number {
  return width / CAR_VIEWBOX.w;
}

const STATIC = CAR_PATHS.filter((p) => p.layer === 'silhouette' || p.layer === 'glass' || p.layer === 'wheels');
const ZONES = CAR_PATHS.filter((p) => p.layer === 'zones');
const DETAIL = CAR_PATHS.filter((p) => p.layer === 'enginebay' || p.layer === 'hoses');
const HIT = CAR_PATHS.filter((p) => p.layer === 'hit');

/** The car body, glass and wheels: never re-rendered by state changes. */
const StaticLayer = memo(function StaticLayer() {
  return (
    <G>
      {STATIC.map((p) => (
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
  path: CarPath;
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
 * The car drawing as JSX SVG: a static wireframe, zone outlines colored by
 * status, and an engine-bay detail layer whose strokes draw in during the
 * reveal (exactly the reference's "schematic over wireframe" effect). Zones
 * are tapped through invisible filled polygons that are >= 56 px on a phone.
 */
export function CarMap({ width, zones, selectedZone, reveal, detail, plan, resolvedColors, onPressZone }: Props) {
  const height = carMapHeight(width);
  const zoneOpacity = useDerivedValue(() => 1 - detail.value * 0.75);

  return (
    <Svg width={width} height={height} viewBox={`${CAR_VIEWBOX.x} ${CAR_VIEWBOX.y} ${CAR_VIEWBOX.w} ${CAR_VIEWBOX.h}`}>
      <StaticLayer />

      <ZoneLayer zones={zones} selectedZone={selectedZone} opacity={zoneOpacity} />

      <G>
        {DETAIL.map((p) => {
          const active = selectedZone !== null && p.zone === selectedZone;
          const window = p.componentId ? (plan.windows[p.componentId] ?? null) : active ? [0, 1] : null;
          const resolved = p.componentId ? resolvedColors[p.componentId] : undefined;
          const color = resolved ?? STROKE_COMPONENT;
          return <RevealPath key={p.id} path={p} reveal={reveal} detail={detail} window={window as [number, number] | null} active={active} color={color} />;
        })}
      </G>

      {onPressZone ? (
        <G>
          {HIT.map((p) => (
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

function ZoneLayer({ zones, selectedZone, opacity }: { zones: Partial<Record<CarZone, ZoneVisual>>; selectedZone: CarZone | null; opacity: SharedValue<number> }) {
  const animatedProps = useAnimatedProps(() => ({ opacity: opacity.value }));
  return (
    <AnimatedG animatedProps={animatedProps}>
      {ZONES.map((p) => {
        const zone = p.zone as CarZone | undefined;
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

/** Component paths of a zone, worst-first order is decided by the caller. */
export function componentPathsFor(zone: CarZone): CarPath[] {
  return DETAIL.filter((p) => p.zone === zone && p.componentId);
}

export function anchorFor(componentId: string): { x: number; y: number } | null {
  const p = DETAIL.find((q) => q.componentId === componentId);
  return p ? p.anchor : null;
}
