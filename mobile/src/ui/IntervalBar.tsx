import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { COPY } from '@/lib/wear/copy';
import { gaugeParts } from '@/lib/wear/selectors';
import type { WearEstimate } from '@/lib/wear/types';
import { Colors, ComponentStatusMeta, Motion } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

/** The track spans 0–125 % of the interval so an overdue excess has room to show past the tick. */
const RANGE = 1.25;
const TICK = 1 / RANGE;

type Props = { estimate: WearEstimate; height?: number; delayMs?: number; durationMs?: number };

/** Compact interval gauge for list rows: same semantics as the ring's binding track, transform-only animation. */
export function IntervalBar({ estimate, height = 6, delayMs = 0, durationMs = Motion.duration.cardArrive }: Props) {
  const reduceMotion = useReducedMotion();
  const meta = ComponentStatusMeta[estimate.status];
  const parts = gaugeParts(estimate);
  const fillTarget = parts.fill / RANGE;
  const excessTarget = Math.min(0.25, parts.excess) / RANGE;

  const kmInterval = estimate.kmTrack?.interval ?? null;
  const dayInterval = estimate.timeTrack?.interval ?? null;
  const usesKm = estimate.binding === 'km' || !estimate.timeTrack;
  const warnWindow = usesKm
    ? kmInterval
      ? Math.min(1, Math.max(500, Math.min(5000, kmInterval * 0.2)) / kmInterval)
      : 0
    : dayInterval
      ? Math.min(1, Math.max(14, Math.min(60, dayInterval * 0.2)) / dayInterval)
      : 0;

  const fill = useSharedValue(0);
  const excess = useSharedValue(0);
  useEffect(() => {
    const timing = { duration: durationMs, easing: Motion.easing.arrive };
    fill.value = reduceMotion ? fillTarget : withDelay(delayMs, withTiming(fillTarget, timing));
    excess.value = reduceMotion ? excessTarget : withDelay(delayMs + 200, withTiming(excessTarget, timing));
  }, [fillTarget, excessTarget, reduceMotion, delayMs, durationMs, fill, excess]);

  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: fill.value }] }));
  const excessStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: excess.value }] }));

  if (estimate.status === 'sin_datos' && estimate.action === 'no_schedule') {
    return (
      <Txt variant="bodySmall" color={Colors.textTertiary}>
        {COPY.noSchedule}
      </Txt>
    );
  }

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      {warnWindow > 0 ? (
        <View style={[styles.band, { left: `${(1 - warnWindow) * TICK * 100}%`, width: `${warnWindow * TICK * 100}%`, borderRadius: height / 2 }]} />
      ) : null}
      <Animated.View style={[styles.fill, { backgroundColor: meta.color, borderRadius: height / 2 }, fillStyle]} />
      <Animated.View style={[styles.excess, { left: `${TICK * 100}%`, width: `${(1 - TICK) * 100}%`, borderRadius: height / 2 }, excessStyle]} />
      <View style={[styles.tick, { left: `${TICK * 100}%`, height: height + 6, top: -3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', backgroundColor: Colors.surfaceAlt, overflow: 'visible' },
  band: { position: 'absolute', top: 0, bottom: 0, backgroundColor: Colors.statusWarnSoft },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', transformOrigin: 'left' },
  excess: { position: 'absolute', top: 0, bottom: 0, backgroundColor: Colors.statusExpired, transformOrigin: 'left' },
  tick: { position: 'absolute', width: 2, backgroundColor: Colors.textPrimary, borderRadius: 1, marginLeft: -1 },
});
