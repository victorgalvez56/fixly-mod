import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Stop } from 'react-native-svg';

import { formatKm } from '@/lib/format';
import { COPY } from '@/lib/wear/copy';
import { daysLabel, gaugeParts, isInspect, statusWord } from '@/lib/wear/selectors';
import type { WearEstimate } from '@/lib/wear/types';
import { Colors, ComponentStatusMeta, Motion } from '@/theme/tokens';
import { Txt } from '@/ui/Txt';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  estimate: WearEstimate;
  size?: number;
  /** Delay before the fill animates in (used by the reveal choreography). */
  delayMs?: number;
  durationMs?: number;
  caption?: string;
  confidence?: string | null;
  onPressHelp?: () => void;
};

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * The oil gauge. Two concentric tracks — km outside, time inside — with the
 * BINDING track drawn thick in the status color, a tick at 12 o'clock for
 * the manual's interval (100 %), a soft band for the "pronto" window, and an
 * excess arc past the tick when overdue. It measures the consumed INTERVAL,
 * never the oil itself: the caption says "Intervalo", not "nivel".
 */
export function IntervalRing({ estimate, size = 132, delayMs = 0, durationMs = 600, caption, confidence, onPressHelp }: Props) {
  const reduceMotion = useReducedMotion();
  const meta = ComponentStatusMeta[estimate.status];
  const parts = gaugeParts(estimate);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 8;
  const rInner = size / 2 - 21;
  const cOuter = 2 * Math.PI * rOuter;
  const cInner = 2 * Math.PI * rInner;

  const hasKm = parts.km !== null;
  const hasTime = parts.time !== null;
  const bindingOuter = !hasTime || estimate.binding === 'km' || !hasKm;
  const activeR = bindingOuter ? rOuter : rInner;
  const activeC = bindingOuter ? cOuter : cInner;
  const secondaryR = bindingOuter ? rInner : rOuter;
  const secondaryC = bindingOuter ? cInner : cOuter;
  const secondaryPct = bindingOuter ? parts.time : parts.km;
  const showSecondary = hasKm && hasTime;

  const kmInterval = estimate.kmTrack?.interval ?? null;
  const dayInterval = estimate.timeTrack?.interval ?? null;
  const warnWindow = bindingOuter
    ? kmInterval
      ? Math.min(1, Math.max(500, Math.min(5000, kmInterval * 0.2)) / kmInterval)
      : 0
    : dayInterval
      ? Math.min(1, Math.max(14, Math.min(60, dayInterval * 0.2)) / dayInterval)
      : 0;

  const fill = useSharedValue(0);
  const excess = useSharedValue(0);

  useEffect(() => {
    const timing = { duration: durationMs, easing: Easing.bezier(0.22, 1, 0.36, 1) };
    fill.value = reduceMotion ? parts.fill : withDelay(delayMs, withTiming(parts.fill, timing));
    excess.value = reduceMotion ? parts.excess : withDelay(delayMs + durationMs, withTiming(parts.excess, { duration: Motion.duration.colorChange }));
  }, [parts.fill, parts.excess, reduceMotion, delayMs, durationMs, fill, excess]);

  const activeProps = useAnimatedProps(() => ({ strokeDashoffset: activeC * (1 - fill.value) }));
  const shadowProps = useAnimatedProps(() => ({ strokeDashoffset: activeC * (1 - fill.value) }));
  const excessProps = useAnimatedProps(() => ({ strokeDashoffset: activeC * (1 - excess.value) }));

  const unknown = estimate.status === 'sin_datos';
  const gradId = `ring-${estimate.componentId}-${estimate.status}`;
  const overdue = estimate.percentConsumed !== null && estimate.percentConsumed >= 1;

  let main = '';
  let sub: string | null = null;
  if (unknown) {
    main = 'Sin datos';
  } else if (overdue && estimate.kmTrack && estimate.kmTrack.remaining < 0 && (estimate.binding === 'km' || !estimate.timeTrack)) {
    main = formatKm(Math.round(-estimate.kmTrack.remaining / 10) * 10);
    sub = 'de más';
  } else if (overdue && estimate.timeTrack && estimate.timeTrack.remaining < 0) {
    main = String(Math.round(-estimate.timeTrack.remaining));
    sub = 'días de más';
  } else if (estimate.remainingKm !== null) {
    main = formatKm(Math.round(Math.max(0, estimate.remainingKm) / 10) * 10);
    sub = estimate.remainingDays !== null ? `o ${daysLabel(estimate.remainingDays)}` : null;
  } else if (estimate.remainingDays !== null) {
    main = String(Math.round(Math.max(0, estimate.remainingDays)));
    sub = isInspect(estimate) ? 'días para revisar' : 'días';
  }

  const scale = size / 132;
  const a11y = unknown
    ? `Sin datos: registra el último cambio`
    : `${statusWord(estimate)}: ${main}${sub ? ` ${sub}` : ''}${confidence ? `, ${confidence}` : ''}`;

  return (
    <View style={styles.wrap} accessible accessibilityRole="image" accessibilityLabel={a11y}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={meta.color} />
              <Stop offset="1" stopColor={darken(meta.color, 0.14)} />
            </LinearGradient>
          </Defs>

          {/* hairline background tracks */}
          <Circle cx={cx} cy={cy} r={rOuter} stroke={Colors.border} strokeWidth={1} fill="none" strokeDasharray={unknown ? [4, 6] : undefined} />
          {showSecondary ? <Circle cx={cx} cy={cy} r={rInner} stroke={Colors.border} strokeWidth={1} fill="none" /> : null}

          {/* "pronto" window before the tick */}
          {!unknown && warnWindow > 0 ? (
            <Circle
              cx={cx}
              cy={cy}
              r={activeR}
              stroke={Colors.statusWarnSoft}
              strokeWidth={10}
              fill="none"
              strokeDasharray={[activeC * warnWindow, activeC]}
              strokeDashoffset={-(activeC * (1 - warnWindow))}
              rotation={-90}
              originX={cx}
              originY={cy}
            />
          ) : null}

          {/* secondary (non-binding) track, thin and quiet */}
          {showSecondary && secondaryPct !== null ? (
            <Circle
              cx={cx}
              cy={cy}
              r={secondaryR}
              stroke={Colors.textTertiary}
              strokeOpacity={0.55}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={[secondaryC, secondaryC]}
              strokeDashoffset={secondaryC * (1 - Math.min(1, secondaryPct))}
              rotation={-90}
              originX={cx}
              originY={cy}
            />
          ) : null}

          {/* active arc: soft inner shadow + gradient fill */}
          {!unknown ? (
            <>
              <AnimatedCircle
                cx={cx}
                cy={cy + 1}
                r={activeR}
                stroke={darken(meta.color, 0.35)}
                strokeOpacity={0.3}
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={[activeC, activeC]}
                animatedProps={shadowProps}
                rotation={-90}
                originX={cx}
                originY={cy + 1}
              />
              <AnimatedCircle
                cx={cx}
                cy={cy}
                r={activeR}
                stroke={`url(#${gradId})`}
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={[activeC, activeC]}
                animatedProps={activeProps}
                rotation={-90}
                originX={cx}
                originY={cy}
              />
              <AnimatedCircle
                cx={cx}
                cy={cy}
                r={activeR}
                stroke={Colors.statusExpired}
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={[activeC, activeC]}
                animatedProps={excessProps}
                rotation={-90}
                originX={cx}
                originY={cy}
              />
            </>
          ) : null}

          {/* the manual's interval: 100 % tick at 12 o'clock */}
          <Line x1={cx} y1={cy - activeR - 7} x2={cx} y2={cy - activeR + 7} stroke={Colors.textPrimary} strokeWidth={2} strokeLinecap="round" />
        </Svg>

        <View style={styles.center} pointerEvents="none">
          <Txt
            variant="bigNumber"
            tabularNums
            color={unknown ? Colors.textSecondary : Colors.textPrimary}
            style={[styles.main, { fontSize: unknown ? 17 * scale : 24 * scale, lineHeight: unknown ? 22 * scale : 28 * scale }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}>
            {main}
          </Txt>
          {sub ? (
            <Txt variant="bodySmall" color={Colors.textSecondary} style={{ fontSize: 12 * scale, lineHeight: 15 * scale }}>
              {sub}
            </Txt>
          ) : null}
          {!unknown ? (
            <View style={[styles.pill, { backgroundColor: meta.soft, marginTop: 4 * scale }]}>
              <Txt variant="label" color={meta.text} style={{ fontSize: 10 * scale, lineHeight: 12 * scale }}>
                {statusWord(estimate)}
              </Txt>
            </View>
          ) : null}
        </View>
      </View>

      {caption || confidence || onPressHelp ? (
        <View style={styles.captionBlock}>
          <Txt variant="label" color={Colors.textTertiary}>
            {COPY.intervalCaption}
          </Txt>
          {caption ? (
            <Txt variant="bodySmall" color={Colors.textSecondary} style={styles.captionText}>
              {caption}
            </Txt>
          ) : null}
          <View style={styles.captionRow}>
            {confidence ? (
              <Txt variant="bodySmall" color={Colors.textTertiary} style={styles.captionText}>
                {confidence}
              </Txt>
            ) : null}
            {onPressHelp ? (
              <Pressable onPress={onPressHelp} hitSlop={12} style={styles.help} accessibilityRole="button" accessibilityLabel={COPY.howItWorksTitle}>
                <Txt variant="label" color={Colors.textSecondary}>
                  ?
                </Txt>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  center: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  main: { textAlign: 'center' },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  captionBlock: { alignItems: 'center', gap: 2 },
  captionText: { textAlign: 'center' },
  captionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  help: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
});
