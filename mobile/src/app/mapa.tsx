import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOutUp,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ZONE_ANCHORS, ZONE_FOCUS, type CarZone } from '@/data/car-drawing';
import { componentDef } from '@/data/catalog';
import { ZONE_META, isZoneId, type ZoneId } from '@/data/zones';
import { formatKm } from '@/lib/format';
import { COPY } from '@/lib/wear/copy';
import { daysLabel, explanation, formatDateEs, intervalSentence, isInspect, remainingLine, statusWord } from '@/lib/wear/selectors';
import type { WearEstimate } from '@/lib/wear/types';
import { useMaintenance } from '@/state/use-maintenance';
import { useVehicle } from '@/state/vehicle-context';
import { Colors, ComponentStatusMeta, Motion, Radius, Spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { CarMap, anchorFor, carMapHeight, unitScale, type RevealPlan, type ZoneVisual } from '@/ui/CarMap';
import { ComponentRow } from '@/ui/ComponentRow';
import { IntervalBar } from '@/ui/IntervalBar';
import { KmPrompt } from '@/ui/KmPrompt';
import { Txt } from '@/ui/Txt';
import { ZoneChips } from '@/ui/ZoneChips';

/**
 * Timeline of the reveal, in ms from the tap. Same beats as the reference
 * video (chrome fades, drawing zooms, HUD appears, schematic draws in,
 * cards narrate, pins land, status resolves, report slides in), compressed
 * from ~6 s to ~3 s and always skippable with a tap. Scale everything with
 * SPEED (1 = as tuned, 2 = video pace).
 */
const SPEED = 1;
const T = {
  chromeOut: 300,
  zoomDelay: 50,
  zoom: 450,
  detailDelay: 250,
  detail: 600,
  hudDelay: 400,
  hud: 300,
  drawDelay: 450,
  draw: 1400,
  cardEvery: 650,
  pinsDelay: 900,
  pins: 600,
  rows: [1000, 1350, 1700],
  resolveAt: 2250,
  resultsAt: 3000,
  resultsIn: 450,
} as const;
const ms = (n: number) => n * SPEED;

type Phase = 'map' | 'reveal' | 'results';

export default function Mapa() {
  const params = useLocalSearchParams<{ zone?: string }>();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const { vehicle, addReading, lastReading } = useVehicle();
  const { zones, spec, specFor, coldStart } = useMaintenance();

  const [phase, setPhase] = useState<Phase>('map');
  const [zone, setZone] = useState<ZoneId | null>(null);
  const [beat, setBeat] = useState(0);
  const [rows, setRows] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [kmPrompt, setKmPrompt] = useState(false);
  const [stage, setStage] = useState({ w: screenW, h: 0 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Shared values driving every animated piece (transform + opacity + strokeDashoffset only).
  const chrome = useSharedValue(1);
  const zoom = useSharedValue(0);
  const detail = useSharedValue(0);
  const hud = useSharedValue(0);
  const reveal = useSharedValue(0);
  const pins = useSharedValue(0);
  const drawing = useSharedValue(1);

  const mapW = Math.min(240, Math.round(screenW * 0.62));
  const mapH = carMapHeight(mapW);
  const k = unitScale(mapW);
  const ox = (stage.w - mapW) / 2;
  const C = { x: ox + mapW / 2, y: mapH / 2 };

  const zoneList: WearEstimate[] = zone ? zones[zone].estimates : [];
  const worst = zone ? zones[zone].worst : null;
  const worstDef = worst ? componentDef(worst.componentId) : null;
  const worstSpec = worst ? specFor(worst.componentId) : null;

  // Reveal windows: worst component first, 60 ms stagger, each stroke gets most of the timeline.
  const plan: RevealPlan = { windows: {} };
  zoneList.forEach((e, i) => {
    const start = Math.min(0.55, i * 0.12);
    plan.windows[e.componentId] = [start, Math.min(1, start + 0.55)];
  });

  const zoneVisuals: Partial<Record<CarZone, ZoneVisual>> = {};
  (Object.keys(zones) as ZoneId[]).forEach((z) => {
    zoneVisuals[z] = { color: ComponentStatusMeta[zones[z].status].color, pending: zones[z].pending > 0 };
  });

  const resolvedColors: Record<string, string> = {};
  if (resolved) zoneList.forEach((e) => (resolvedColors[e.componentId] = ComponentStatusMeta[e.status].color));

  const focus = zone ? ZONE_FOCUS[zone] : { cx: 120, cy: 200, scale: 1 };
  const S = focus.scale;
  const F = { x: ox + focus.cx * k, y: focus.cy * k };
  const Tgt = { x: stage.w / 2, y: Math.max(mapH * 0.46, 190) };
  const tx = Tgt.x - C.x - (F.x - C.x) * S;
  const ty = Tgt.y - C.y - (F.y - C.y) * S;

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  function later(fn: () => void, at: number) {
    timers.current.push(setTimeout(fn, ms(at)));
  }

  function resetValues(instant: boolean) {
    [chrome, zoom, detail, hud, reveal, pins, drawing].forEach(cancelAnimation);
    const t = { duration: instant ? 0 : Motion.duration.disappear, easing: Motion.easing.change };
    chrome.value = withTiming(1, t);
    zoom.value = withTiming(0, t);
    detail.value = withTiming(0, t);
    hud.value = withTiming(0, t);
    reveal.value = 0;
    pins.value = 0;
    drawing.value = withTiming(1, t);
  }

  function finishToResults() {
    clearTimers();
    const n = zoneList.length;
    setBeat(Math.max(0, n - 1));
    setRows(3);
    setResolved(true);
    const quick = { duration: Motion.duration.cardArrive, easing: Motion.easing.arrive };
    chrome.value = withTiming(0, quick);
    zoom.value = withTiming(1, quick);
    detail.value = withTiming(1, quick);
    hud.value = withTiming(0, { duration: Motion.duration.disappear, easing: Motion.easing.change });
    reveal.value = withTiming(1, quick);
    pins.value = withTiming(1, quick);
    drawing.value = withTiming(0.14, { duration: 500, easing: Motion.easing.change });
    setPhase('results');
  }

  function startReveal(z: ZoneId) {
    clearTimers();
    setZone(z);
    setBeat(0);
    setRows(0);
    setResolved(false);
    const list = zones[z].estimates;
    if (reduceMotion || list.length === 0) {
      setPhase('results');
      chrome.value = 0;
      zoom.value = 1;
      detail.value = 1;
      hud.value = 0;
      reveal.value = 1;
      pins.value = 1;
      drawing.value = 0.14;
      setBeat(Math.max(0, list.length - 1));
      setRows(3);
      setResolved(true);
      return;
    }
    setPhase('reveal');
    const arrive = Motion.easing.arrive;
    const change = Motion.easing.change;
    chrome.value = withTiming(0, { duration: ms(T.chromeOut), easing: change });
    zoom.value = withDelay(ms(T.zoomDelay), withTiming(1, { duration: ms(T.zoom), easing: arrive }));
    detail.value = withDelay(ms(T.detailDelay), withTiming(1, { duration: ms(T.detail), easing: change }));
    hud.value = withDelay(ms(T.hudDelay), withTiming(1, { duration: ms(T.hud), easing: arrive }));
    reveal.value = withDelay(ms(T.drawDelay), withTiming(1, { duration: ms(T.draw), easing: Easing.bezier(0.2, 0.8, 0.2, 1) }));
    pins.value = withDelay(ms(T.pinsDelay), withTiming(1, { duration: ms(T.pins), easing: arrive }));
    drawing.value = 1;
    for (let i = 1; i < list.length; i++) later(() => setBeat(i), T.hudDelay + i * T.cardEvery);
    T.rows.forEach((at, i) => later(() => setRows(i + 1), at));
    later(() => setResolved(true), T.resolveAt);
    later(() => finishToResults(), T.resultsAt + Math.max(0, list.length - 3) * T.cardEvery);
  }

  function backToMap() {
    clearTimers();
    setPhase('map');
    setZone(null);
    setResolved(false);
    resetValues(reduceMotion);
  }

  // Deep link from the home card: /mapa?zone=motor runs the reveal on arrival.
  const requested = params.zone;
  useEffect(() => {
    if (isZoneId(requested) && phase === 'map' && zone === null && stage.h > 0) {
      const id = setTimeout(() => startReveal(requested), 350);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested, stage.h]);

  useEffect(() => () => clearTimers(), []);

  const chromeStyle = useAnimatedStyle(() => ({ opacity: chrome.value, transform: [{ translateY: (1 - chrome.value) * 6 }] }));
  const hudStyle = useAnimatedStyle(() => ({ opacity: hud.value, transform: [{ translateY: (1 - hud.value) * 12 }] }));
  const zoomStyle = useAnimatedStyle(() => ({
    opacity: drawing.value,
    transform: [{ translateX: zoom.value * tx }, { translateY: zoom.value * ty }, { scale: 1 + zoom.value * (S - 1) }],
  }));

  function onStageLayout(e: LayoutChangeEvent) {
    setStage({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  }

  const title = phase === 'results' && zone ? ZONE_META[zone].label : 'Tu auto';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ---- header (map phase) ---- */}
      <Animated.View style={[styles.header, chromeStyle]} pointerEvents={phase === 'map' ? 'auto' : 'none'}>
        <CircleButton icon="chevron-left" label="Volver" onPress={() => router.back()} />
        <Txt variant="cardTitle" style={styles.headerTitle}>
          {title}
        </Txt>
        <CircleButton icon="more-horizontal" label="Ficha del vehículo" onPress={() => router.push('/vehiculo')} />
      </Animated.View>

      {/* ---- the drawing stage ---- */}
      <View style={[styles.stage, { height: mapH }]} onLayout={onStageLayout}>
        <Animated.View style={[styles.mapWrap, { width: mapW, height: mapH, left: ox }, zoomStyle]}>
          <CarMap
            width={mapW}
            zones={zoneVisuals}
            selectedZone={zone}
            reveal={reveal}
            detail={detail}
            plan={plan}
            resolvedColors={resolvedColors}
            onPressZone={phase === 'map' ? (z) => startReveal(z) : undefined}
          />
        </Animated.View>

        {/* zone dots (map) and component pins (reveal) share the zoom math so they ride the drawing */}
        {stage.h > 0
          ? (Object.keys(zones) as ZoneId[])
              .filter((z) => zones[z].pending > 0 && (phase === 'map' || z !== zone))
              .map((z) => (
                <Marker
                  key={`zone-${z}`}
                  base={{ x: ox + ZONE_ANCHORS[z].x * k, y: ZONE_ANCHORS[z].y * k }}
                  center={C}
                  scale={S}
                  translate={{ x: tx, y: ty }}
                  zoom={zoom}
                  appear={chrome}
                  drawing={drawing}
                  color={ComponentStatusMeta[zones[z].status].color}
                  word={zones[z].worst ? statusWord(zones[z].worst) : ''}
                  kind="dot"
                />
              ))
          : null}
        {stage.h > 0 && zone
          ? zoneList.map((e, i) => {
              const a = anchorFor(e.componentId) ?? ZONE_ANCHORS[zone];
              return (
                <Marker
                  key={`pin-${e.componentId}`}
                  base={{ x: ox + a.x * k, y: a.y * k }}
                  center={C}
                  scale={S}
                  translate={{ x: tx, y: ty }}
                  zoom={zoom}
                  appear={pins}
                  drawing={drawing}
                  delay={i / Math.max(1, zoneList.length)}
                  color={resolved ? ComponentStatusMeta[e.status].color : Colors.textTertiary}
                  word={resolved ? statusWord(e) : ''}
                  kind="pin"
                  emphasized={resolved && e.status !== 'ok'}
                />
              );
            })
          : null}
      </View>

      {/* ---- map phase: name + zone chips ---- */}
      <Animated.View style={[styles.mapBottom, chromeStyle]} pointerEvents={phase === 'map' ? 'auto' : 'none'}>
        <View style={styles.name}>
          <Txt variant="cardTitle">{vehicle ? `${vehicle.brand} ${vehicle.model}` : ''}</Txt>
          <Txt variant="bodySmall" color={Colors.textSecondary}>
            {vehicle ? `${vehicle.year} · ${vehicle.plate}` : ''}
          </Txt>
        </View>
        {coldStart ? (
          <Txt variant="body" color={Colors.textSecondary} style={styles.cold}>
            Todavía no tenemos el manual de tu {vehicle?.brand} {vehicle?.model} {vehicle?.year}.
          </Txt>
        ) : (
          <ZoneChips zones={zones} onPress={startReveal} />
        )}
      </Animated.View>

      {/* ---- reveal HUD ---- */}
      {phase === 'reveal' && zone && worst ? (
        <Animated.View style={[styles.hud, { top: insets.top + 8 }, hudStyle]} pointerEvents="none">
          <ProgressRow estimate={worst} durationMs={ms(2200)} delayMs={ms(T.drawDelay)} />
          <View style={styles.cardStack}>
            {beat + 1 < zoneList.length ? <View style={styles.ghostCard} /> : null}
            <Animated.View key={beat} entering={FadeInDown.duration(ms(260)).easing(Easing.out(Easing.cubic))} exiting={FadeOutUp.duration(ms(180))} style={styles.card}>
              <NarrationCard estimate={zoneList[beat]} resolved={resolved} spec={spec ? specFor(zoneList[beat].componentId) : null} />
            </Animated.View>
          </View>
          <View style={[styles.tooltip, { top: mapH * 0.36 }]}>
            <Txt variant="bodyBold" numberOfLines={1}>
              {worstDef?.shortLabel}
            </Txt>
            <TooltipRow visible={rows >= 1} label="Último" value={worst.anchor.km !== null ? formatKm(Math.round(worst.anchor.km)) : worst.anchor.date ? formatDateEs(worst.anchor.date) : 'Sin registro'} />
            <TooltipRow visible={rows >= 2} label="Próximo" value={worst.dueAtKm !== null ? formatKm(worst.dueAtKm) : worst.projectedDueDate ? formatDateEs(worst.projectedDueDate) : '—'} />
            <TooltipRow visible={rows >= 3} label={worst.percentConsumed !== null && worst.percentConsumed >= 1 ? 'Estado' : 'Faltan'} value={rows >= 3 ? shortRemaining(worst) : ''} dotColor={rows >= 3 ? ComponentStatusMeta[worst.status].color : undefined} />
          </View>
        </Animated.View>
      ) : null}

      {phase === 'reveal' ? (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={finishToResults} accessibilityRole="button" accessibilityLabel="Saltar la animación" />
          <Animated.View style={[styles.pill, { bottom: insets.bottom + 16 }, hudStyle]}>
            <CircleButton icon="rotate-ccw" label="Repetir" onPress={() => startReveal(zone!)} plain />
            <Pressable onPress={finishToResults} style={styles.pillMain} accessibilityRole="button" accessibilityLabel="Ver el resultado">
              <Feather name="chevron-right" size={22} color={Colors.onAccent} />
            </Pressable>
            <Pressable onPress={finishToResults} hitSlop={8} accessibilityRole="button" accessibilityLabel="Saltar">
              <Txt variant="bodyBold" color={Colors.textSecondary}>
                Saltar
              </Txt>
            </Pressable>
          </Animated.View>
        </>
      ) : null}

      {/* ---- results ---- */}
      {phase === 'results' && zone && worst && worstDef ? (
        <Animated.View entering={FadeIn.duration(ms(T.resultsIn))} style={[StyleSheet.absoluteFill, { paddingTop: insets.top }]}>
          <ScrollView contentContainerStyle={[styles.results, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(ms(300)).easing(Easing.out(Easing.cubic))} style={styles.header}>
              <CircleButton icon="chevron-left" label="Volver al mapa" onPress={backToMap} />
              <View style={styles.headerCenter}>
                <Txt variant="cardTitle">{ZONE_META[zone].label}</Txt>
                <Txt variant="monoSmall" color={Colors.textTertiary}>
                  Según tu manual · hoy
                </Txt>
              </View>
              <CircleButton icon="more-horizontal" label="Ficha del vehículo" onPress={() => router.push('/vehiculo')} />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(ms(300)).delay(ms(60))}>
              <ProgressRow estimate={worst} durationMs={Motion.duration.cardArrive} delayMs={0} />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(ms(320)).delay(ms(120)).easing(Easing.out(Easing.cubic))} style={[styles.verdict, { backgroundColor: Colors.background }]}>
              <View style={[styles.verdictIcon, { backgroundColor: ComponentStatusMeta[worst.status].soft }]}>
                <Feather name={worst.status === 'ok' ? 'check' : worst.status === 'sin_datos' ? 'help-circle' : 'alert-triangle'} size={18} color={ComponentStatusMeta[worst.status].text} />
              </View>
              <Txt variant="cardTitle">{verdictTitle(worst, worstDef.shortLabel, ZONE_META[zone].label)}</Txt>
              {worstSpec ? (
                <Txt variant="body" color={Colors.textSecondary}>
                  {explanation(worst, worstSpec, worstDef.label)}
                </Txt>
              ) : null}
              <Txt variant="bodyBold">{recommendation(worst)}</Txt>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(ms(240)).delay(ms(240))}>
              <Txt variant="label" color={Colors.textTertiary}>
                {COPY.componentsByManual}
              </Txt>
            </Animated.View>
            {zoneList.map((e, i) => (
              <Animated.View key={e.componentId} entering={FadeInDown.duration(ms(300)).delay(ms(280 + i * 70)).easing(Easing.out(Easing.cubic))}>
                <ComponentRow estimate={e} onPress={() => router.push({ pathname: '/servicio/[id]', params: { id: e.componentId } })} />
              </Animated.View>
            ))}

            <Animated.View entering={FadeIn.duration(ms(300)).delay(ms(400))} style={styles.actions}>
              <Pressable onPress={() => setKmPrompt(true)} style={styles.rescan} accessibilityRole="button">
                <Feather name="refresh-cw" size={14} color={Colors.textSecondary} />
                <Txt variant="bodyBold" color={Colors.textSecondary}>
                  {COPY.updateKm}
                </Txt>
              </Pressable>
              <Button
                label={worst.status === 'sin_datos' ? COPY.recordLastChange : COPY.doneAction}
                variant="primary"
                icon={<Feather name="tool" size={16} color={Colors.onAccent} />}
                onPress={() => router.push({ pathname: '/registrar', params: { component: worst.componentId } })}
              />
            </Animated.View>
          </ScrollView>
        </Animated.View>
      ) : null}

      <KmPrompt
        visible={kmPrompt}
        lastKm={lastReading?.km ?? null}
        onClose={() => setKmPrompt(false)}
        onSave={(km) => {
          addReading(km);
          if (zone) {
            resetValues(true);
            setTimeout(() => startReveal(zone), 60);
          }
        }}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------

function shortRemaining(e: WearEstimate): string {
  if (e.status === 'sin_datos') return 'Sin registro';
  if (e.percentConsumed !== null && e.percentConsumed >= 1) return statusWord(e);
  if (e.remainingKm !== null) return `~${formatKm(Math.round(e.remainingKm / 10) * 10)}`;
  if (e.remainingDays !== null) return `~${daysLabel(e.remainingDays)}`;
  return '—';
}

function verdictTitle(e: WearEstimate, short: string, zoneLabel: string): string {
  const verb = isInspect(e) ? 'revisar' : 'cambiar';
  switch (e.status) {
    case 'vencido':
      return `${short}: vencido`;
    case 'toca':
      return `Toca ${verb} ${short.toLowerCase()}`;
    case 'pronto':
      return `Pronto toca ${verb} ${short.toLowerCase()}`;
    case 'sin_datos':
      return `${short}: sin datos`;
    default:
      return `${zoneLabel}: todo al día`;
  }
}

function recommendation(e: WearEstimate): string {
  switch (e.status) {
    case 'vencido':
      return 'Hazlo cuanto antes y regístralo aquí.';
    case 'toca':
    case 'pronto': {
      const km = e.remainingKm !== null ? `~${formatKm(Math.round(Math.max(0, e.remainingKm) / 10) * 10)}` : null;
      const days = e.remainingDays !== null ? daysLabel(Math.max(0, e.remainingDays)) : null;
      const both = [km, days].filter(Boolean).join(' o ');
      return both ? `Hazlo en los próximos ${both}.` : 'Hazlo pronto.';
    }
    case 'sin_datos':
      return e.action === 'no_schedule' ? COPY.noSchedule : 'Registra el último cambio para calcular cuándo toca.';
    default:
      return remainingLine(e) ? `Nada que hacer por ahora. ${remainingLine(e)}.` : 'Nada que hacer por ahora.';
  }
}

function CircleButton({ icon, label, onPress, plain }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; plain?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label} style={[styles.circle, plain && styles.circlePlain]}>
      <Feather name={icon} size={20} color={Colors.textPrimary} />
    </Pressable>
  );
}

function ProgressRow({ estimate, durationMs, delayMs }: { estimate: WearEstimate; durationMs: number; delayMs: number }) {
  const pct = estimate.percentConsumed !== null ? Math.round(estimate.percentConsumed * 100) : null;
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressBar}>
        <IntervalBar estimate={estimate} height={4} durationMs={durationMs} delayMs={delayMs} />
      </View>
      <Txt variant="monoSmall" tabularNums color={Colors.textSecondary} style={styles.progressLabel}>
        {pct !== null ? `${pct} % del intervalo` : 'sin datos'}
      </Txt>
    </View>
  );
}

function NarrationCard({ estimate, resolved, spec }: { estimate: WearEstimate; resolved: boolean; spec: ReturnType<ReturnType<typeof useMaintenance>['specFor']> }) {
  const def = componentDef(estimate.componentId);
  const meta = ComponentStatusMeta[estimate.status];
  const subtitle = resolved ? `${statusWord(estimate)} · ${remainingLine(estimate)}` : spec ? intervalSentence(spec, estimate) : def.description;
  return (
    <View style={styles.cardInner}>
      <View style={styles.cardTile}>
        <Feather name={def.icon} size={18} color={Colors.textPrimary} />
      </View>
      <View style={styles.cardText}>
        <Txt variant="bodyBold" numberOfLines={1}>
          {def.label}
        </Txt>
        <Txt variant="bodySmall" color={resolved ? meta.text : Colors.textSecondary} numberOfLines={1}>
          {subtitle}
        </Txt>
      </View>
    </View>
  );
}

function TooltipRow({ visible, label, value, dotColor }: { visible: boolean; label: string; value: string; dotColor?: string }) {
  return (
    <View style={styles.tooltipRow}>
      <Txt variant="monoSmall" color={Colors.textTertiary}>
        {label}
      </Txt>
      {visible ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.tooltipValue}>
          {dotColor ? <View style={[styles.tooltipDot, { backgroundColor: dotColor }]} /> : null}
          <Txt variant="monoSmall" tabularNums numberOfLines={1}>
            {value}
          </Txt>
        </Animated.View>
      ) : (
        <Txt variant="monoSmall" color={Colors.textTertiary}>
          …
        </Txt>
      )}
    </View>
  );
}

/** A dot or pin that follows the drawing through the zoom without scaling itself. */
function Marker({
  base,
  center,
  scale,
  translate,
  zoom,
  appear,
  drawing,
  delay = 0,
  color,
  word,
  kind,
  emphasized,
}: {
  base: { x: number; y: number };
  center: { x: number; y: number };
  scale: number;
  translate: { x: number; y: number };
  zoom: SharedValue<number>;
  appear: SharedValue<number>;
  drawing: SharedValue<number>;
  delay?: number;
  color: string;
  word: string;
  kind: 'dot' | 'pin';
  emphasized?: boolean;
}) {
  const style = useAnimatedStyle(() => {
    const s = 1 + zoom.value * (scale - 1);
    const x = center.x + (base.x - center.x) * s + zoom.value * translate.x;
    const y = center.y + (base.y - center.y) * s + zoom.value * translate.y;
    const local = Math.min(1, Math.max(0, (appear.value - delay) / Math.max(0.001, 1 - delay)));
    return {
      opacity: local * drawing.value,
      transform: [{ translateX: x }, { translateY: y }, { scale: 0.7 + 0.3 * local }],
    };
  });
  return (
    <Animated.View style={[styles.marker, style]} pointerEvents="none">
      {kind === 'dot' ? (
        <View style={styles.dotWrap}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          {word ? (
            <View style={styles.dotLabel}>
              <Txt variant="label" color={Colors.textPrimary} style={styles.dotLabelText}>
                {word}
              </Txt>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.pinWrap}>
          <View style={[styles.pin, emphasized && styles.pinBig]}>
            <View style={[styles.pinDot, { backgroundColor: color }, emphasized && styles.pinDotBig]} />
          </View>
          {word ? (
            <View style={styles.pinLabel}>
              <Txt variant="label" color={Colors.textPrimary} style={styles.dotLabelText}>
                {word}
              </Txt>
            </View>
          ) : null}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface, overflow: 'visible' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, height: 56 },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  circlePlain: { backgroundColor: 'transparent' },
  stage: { width: '100%', overflow: 'visible', marginTop: 4 },
  mapWrap: { position: 'absolute', top: 0, overflow: 'visible' },
  mapBottom: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, paddingTop: Spacing.md },
  name: { alignItems: 'center', gap: 2 },
  cold: { textAlign: 'center' },
  hud: { position: 'absolute', left: 0, right: 0, paddingHorizontal: Spacing.lg, gap: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1 },
  progressLabel: { width: 118, textAlign: 'right' },
  cardStack: { position: 'relative', paddingTop: 6 },
  ghostCard: { position: 'absolute', left: 14, right: 14, top: 12, height: 64, borderRadius: Radius.sm, backgroundColor: Colors.background, opacity: 0.45 },
  card: { borderRadius: Radius.sm, backgroundColor: Colors.background, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  cardInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  cardTile: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 2 },
  tooltip: {
    position: 'absolute',
    right: Spacing.lg,
    width: 150,
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    padding: 10,
    gap: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  tooltipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: Colors.borderSoft, paddingTop: 6 },
  tooltipValue: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  tooltipDot: { width: 6, height: 6, borderRadius: 3 },
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 18,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  pillMain: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' },
  results: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  verdict: { borderRadius: Radius.md, padding: 16, gap: 8, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  verdictIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: Spacing.md, alignItems: 'stretch', paddingTop: Spacing.sm },
  rescan: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44 },
  marker: { position: 'absolute', left: 0, top: 0 },
  dotWrap: { alignItems: 'center', marginLeft: -5, marginTop: -5 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: Colors.background },
  dotLabel: { marginTop: 3, backgroundColor: Colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  dotLabelText: { fontSize: 9, lineHeight: 11 },
  pinWrap: { alignItems: 'center', marginLeft: -14, marginTop: -14 },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  pinBig: { width: 34, height: 34, borderRadius: 17, marginTop: -3 },
  pinDot: { width: 10, height: 10, borderRadius: 5 },
  pinDotBig: { width: 14, height: 14, borderRadius: 7 },
  pinLabel: { marginTop: 3, backgroundColor: Colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
});
