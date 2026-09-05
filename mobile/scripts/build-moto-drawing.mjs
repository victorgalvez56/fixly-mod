#!/usr/bin/env node
/**
 * Generates the motorcycle drawing used by the maintenance map:
 *   src/assets/moto/drawing.ts     (typed path list, lengths + anchors computed here)
 *   assets/moto/moto-drawing.svg   (same paths grouped per layer, for Figma)
 *
 * The car is drawn from above because that is how a car's serviceable parts
 * lay out. A motorcycle is the opposite: everything a manual schedules — chain,
 * sprockets, forks, shock, radiator, plug, discs — reads at a glance from the
 * side and overlaps into a knot from above. So this is a left-side elevation,
 * front wheel to the left, which is also the side the chain and the sprocket
 * cover live on.
 *
 * All geometry lives in this file; measuring, validation and emission are
 * shared with the car generator in scripts/lib/drawing-emit.mjs.
 *
 *   node scripts/build-moto-drawing.mjs                 # write both files + print report
 *   node scripts/build-moto-drawing.mjs --preview DIR   # also write styled preview SVGs into DIR
 */
import { dirname, join as joinPath, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { emitDrawing } from './lib/drawing-emit.mjs';
import { arcSegs, belt, caliper, cat, circle, ellipse, line, P, pipe, polar, rect, roundedPoly, rrect, vadd, vlen, vmul, vsub, vunit } from './lib/svg-geometry.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VIEWBOX = { x: 0, y: 0, w: 240, h: 150 };
const ZONES = ['motor', 'refrigeracion', 'transmision', 'frenos', 'llantas', 'electrico', 'suspension', 'combustible'];

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------

/** A rounded bar of width w laid along the segment p0 → p1 (a fork tube, a shock body). */
function bar(p0, p1, w, r = 2) {
  const u = vunit(vsub(p1, p0));
  const n = [u[1], -u[0]];
  const h = vmul(n, w / 2);
  return roundedPoly([vadd(p0, h), vadd(p1, h), vsub(p1, h), vsub(p0, h)], r);
}

/** A short tick across the segment at fraction t of its length (a fork seal, a coil turn). */
function crossTick(p0, p1, t, w) {
  const u = vunit(vsub(p1, p0));
  const n = [u[1], -u[0]];
  const c = vadd(p0, vmul(vsub(p1, p0), t));
  const h = vmul(n, w / 2);
  return line(...vadd(c, h), ...vsub(c, h));
}

/** n evenly spaced spokes between the hub and the rim. */
function spokes(cx, cy, rIn, rOut, n, from = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = from + (360 * i) / n;
    return line(...polar(cx, cy, rIn, a), ...polar(cx, cy, rOut, a));
  }).join(' ');
}

/** n short teeth marks around a sprocket. */
function teeth(cx, cy, r, n, len = 1.8) {
  return Array.from({ length: n }, (_, i) => {
    const a = (360 * i) / n;
    return line(...polar(cx, cy, r, a), ...polar(cx, cy, r + len, a));
  }).join(' ');
}

// ---------------------------------------------------------------------------
// Layout (moto coordinates; front wheel to the left, ground line at y = 138)
// ---------------------------------------------------------------------------
const FRONT = { cx: 46, cy: 108, tyre: 30, rim: 19.5, hub: 4.5, disc: 15 };
const REAR = { cx: 188, cy: 106, tyre: 32, rim: 20.5, hub: 5, sprocket: 13, drum: 7.6 };

const YOKE = [76, 46]; // steering head, where the forks meet the frame
const AXLE_F = [FRONT.cx, FRONT.cy];
const FORK_OFFSET = 5.5; // half the distance between the two tubes
const forkDir = vunit(vsub(AXLE_F, YOKE));
const forkNormal = [forkDir[1], -forkDir[0]];
const forkLine = (side) => {
  const o = vmul(forkNormal, side * FORK_OFFSET);
  return [vadd(YOKE, o), vadd(AXLE_F, o)];
};
const FORK_L = forkLine(-1);
const FORK_R = forkLine(1);

const RAD = { x: 77, y: 84, w: 11, h: 28 }; // radiator, in front of the cylinder
const CRANK = { x: 96, y: 98, w: 40, h: 26 }; // crankcase
const CYL_BASE = [112, 100]; // cylinder axis, leaning forward
const CYL_TOP = [104, 84];
const CYL_HALF = 11;
const HEAD_TOP = [99, 70]; // cylinder head, tucked under the tank
const HEAD_HALF = 11.5;
const AIRBOX = { x: 124, y: 74, w: 20, h: 16 };
const SPROCKET_F = [142, 110];
const SWING = { pivot: [138, 108], axle: [REAR.cx, REAR.cy] };
const SHOCK = [[153, 99], [149, 70]]; // monoshock, above the chain's upper run
const BATTERY = { x: 156, y: 64, w: 22, h: 14 };
const TANK_CAP = [116, 41];
const FUEL_FILTER = { x: 136, y: 56, w: 11, h: 8 };
const BRAKE_RES = { x: 84, y: 32, w: 11, h: 7 };

const paths = [];
const def = (p) => paths.push(p);

// --- silhouette -------------------------------------------------------------
def({ id: 'frame_main', layer: 'silhouette', d: 'M 80 50 C 100 45 122 48 150 60 M 150 60 L 212 55' });
def({ id: 'frame_down', layer: 'silhouette', d: 'M 78 56 C 84 72 88 88 95 99' });
def({ id: 'frame_rear', layer: 'silhouette', d: 'M 137 97 L 151 77 M 151 77 L 150 60 M 137 106 L 152 92' });
def({
  id: 'tank',
  layer: 'silhouette',
  d: cat('M 94 68 C 96 50 104 40 120 39 C 136 38 150 46 155 56 L 155 70 C 140 74 110 74 94 70 Z', circle(...TANK_CAP, 3.4)),
});
def({ id: 'seat', layer: 'silhouette', d: 'M 150 68 C 152 58 160 52 174 51 L 206 50 C 210 50 213 53 213 57 L 213 64 C 200 69 172 71 150 68 Z' });
def({ id: 'tail', layer: 'silhouette', d: cat(rrect(210, 52, 10, 8, 2), 'M 214 60 C 216 64 218 68 218 72') });
def({ id: 'fender_front', layer: 'silhouette', d: caliper(FRONT.cx, FRONT.cy, 32.5, 36.5, 198, 322) });
def({ id: 'fender_rear', layer: 'silhouette', d: caliper(REAR.cx, REAR.cy, 34, 38, 228, 318) });
def({ id: 'fork_l', layer: 'silhouette', d: bar(...FORK_L, 6, 2.4) });
def({ id: 'fork_r', layer: 'silhouette', d: bar(...FORK_R, 6, 2.4) });
def({ id: 'yoke', layer: 'silhouette', d: cat(bar([68, 42], [86, 50], 9, 3), circle(77, 46, 2)) });
def({
  id: 'handlebar',
  layer: 'silhouette',
  d: cat(bar([68, 34], [94, 41], 4.5, 2), circle(68.5, 34, 3.2), 'M 88 39 L 92 24'),
});
def({ id: 'headlight', layer: 'silhouette', d: roundedPoly([[60, 38], [74, 42], [74, 58], [58, 53]], 3.5) });
def({ id: 'cluster', layer: 'silhouette', d: rrect(78, 28, 15, 9, 2.5) });
def({
  id: 'engine_block',
  layer: 'silhouette',
  d: cat(
    rrect(CRANK.x, CRANK.y, CRANK.w, CRANK.h, 5),
    bar(CYL_BASE, CYL_TOP, CYL_HALF * 2, 2.5),
    bar(CYL_TOP, HEAD_TOP, HEAD_HALF * 2, 2.5),
    ...[0.32, 0.55, 0.78].map((t) => crossTick(CYL_BASE, CYL_TOP, t, CYL_HALF * 2)),
  ),
});
def({ id: 'radiator_shell', layer: 'silhouette', d: rrect(RAD.x - 1, RAD.y - 1.5, RAD.w + 2, RAD.h + 3, 2) });
def({
  id: 'exhaust',
  layer: 'silhouette',
  d: cat(
    'M 99 88 C 90 96 89 108 94 116 C 102 127 130 129 150 125',
    rrect(148, 114, 60, 13, 6),
    line(202, 116, 202, 125),
  ),
});
def({ id: 'swingarm', layer: 'silhouette', d: roundedPoly([[137, 101], [REAR.cx, 100.5], [REAR.cx, 111.5], [137, 115]], 2.5) });
def({ id: 'shock_body', layer: 'silhouette', d: bar(...SHOCK, 8, 3) });
def({ id: 'pegs_stand', layer: 'silhouette', d: cat(rrect(128, 124, 14, 4, 2), 'M 124 123 C 120 128 116 133 114 137') });

// --- glass ------------------------------------------------------------------
def({ id: 'screen', layer: 'glass', d: 'M 64 36 C 62 28 64 22 70 18 L 76 20 C 71 24 69 30 70 37 Z' });
def({ id: 'mirror_glass', layer: 'glass', d: ellipse(93, 21, 5, 3.4) });
def({ id: 'cluster_face', layer: 'glass', d: cat(rrect(80, 30, 11, 5, 1.5), line(85.5, 30, 85.5, 35)) });

// --- wheels -----------------------------------------------------------------
const tyresD = cat(circle(FRONT.cx, FRONT.cy, FRONT.tyre), circle(REAR.cx, REAR.cy, REAR.tyre));
def({ id: 'wheel_front', layer: 'wheels', d: cat(circle(FRONT.cx, FRONT.cy, FRONT.tyre), circle(FRONT.cx, FRONT.cy, FRONT.rim), circle(FRONT.cx, FRONT.cy, FRONT.hub)) });
def({ id: 'wheel_rear', layer: 'wheels', d: cat(circle(REAR.cx, REAR.cy, REAR.tyre), circle(REAR.cx, REAR.cy, REAR.rim), circle(REAR.cx, REAR.cy, REAR.hub)) });

// --- zones ------------------------------------------------------------------
def({ id: 'zone_motor', layer: 'zones', zone: 'motor', d: rrect(90, 68, 54, 58, 6) });
def({ id: 'zone_refrigeracion', layer: 'zones', zone: 'refrigeracion', d: rrect(RAD.x - 2, RAD.y - 2.5, RAD.w + 4, RAD.h + 5, 2.5) });
def({ id: 'zone_transmision', layer: 'zones', zone: 'transmision', d: rrect(136, 92, 72, 30, 8) });
def({ id: 'zone_frenos', layer: 'zones', zone: 'frenos', d: cat(circle(FRONT.cx, FRONT.cy, FRONT.disc), circle(REAR.cx, REAR.cy, REAR.drum)) });
def({ id: 'zone_llantas', layer: 'zones', zone: 'llantas', d: tyresD });
def({ id: 'zone_electrico', layer: 'zones', zone: 'electrico', d: rrect(BATTERY.x - 2, BATTERY.y - 2, BATTERY.w + 4, BATTERY.h + 4, 2.5) });
def({ id: 'zone_suspension', layer: 'zones', zone: 'suspension', d: cat(bar(YOKE, AXLE_F, 20, 5), bar(...SHOCK, 13, 4)) });
def({ id: 'zone_combustible', layer: 'zones', zone: 'combustible', d: rrect(94, 36, 58, 28, 10) });

// --- components -------------------------------------------------------------
const comp = (id, zone, componentId, d, extra = {}) => def({ id, layer: 'enginebay', zone, componentId, d, ...extra });

comp(
  'comp_aceite_motor', 'motor', 'aceite_motor',
  cat(
    // filter canister on the front of the crankcase, drain plug underneath, sight glass behind
    rrect(99, 110, 10, 9, 2),
    ...[3, 5.5, 8].map((dx) => line(99 + dx, 111.5, 99 + dx, 117.5)),
    circle(114, CRANK.y + CRANK.h, 2.4),
    circle(129, 116, 2.6),
    circle(129, 116, 1.1),
  ),
  { fluid: 'oil' },
);
comp(
  'comp_bujia', 'motor', 'bujia',
  cat(circle(109, 78, 2.6), circle(109, 78, 1.1), 'M 111.5 77.5 C 117 76 122 73 127 70'),
);
comp(
  'comp_filtro_aire_motor', 'motor', 'filtro_aire_motor',
  cat(
    rrect(AIRBOX.x, AIRBOX.y, AIRBOX.w, AIRBOX.h, 3),
    ...[5, 10, 15].map((dx) => line(AIRBOX.x + dx, AIRBOX.y + 2, AIRBOX.x + dx, AIRBOX.y + AIRBOX.h - 2)),
    `M ${P(AIRBOX.x, AIRBOX.y + 8)} C ${P(AIRBOX.x - 5, AIRBOX.y + 8)} ${P(AIRBOX.x - 7, AIRBOX.y + 10)} ${P(112, 86)}`,
  ),
);
comp(
  'comp_ajuste_valvulas', 'motor', 'ajuste_valvulas',
  cat(
    bar(CYL_TOP, HEAD_TOP, HEAD_HALF * 1.7, 2.5),
    ...[0.35, 0.65].map((t) => crossTick(CYL_TOP, HEAD_TOP, t, HEAD_HALF * 1.6)),
    circle(...vadd(CYL_TOP, [6, 1]), 1.3),
    circle(...vadd(HEAD_TOP, [-5, -1.5]), 1.3),
  ),
);
comp(
  'comp_refrigerante', 'refrigeracion', 'refrigerante',
  cat(
    rrect(RAD.x, RAD.y, RAD.w, RAD.h, 1.5),
    line(RAD.x, RAD.y + 4, RAD.x + RAD.w, RAD.y + 4),
    line(RAD.x, RAD.y + RAD.h - 4, RAD.x + RAD.w, RAD.y + RAD.h - 4),
    ...Array.from({ length: 8 }, (_, i) => {
      const y = RAD.y + 4 + ((RAD.h - 8) * (i + 1)) / 9;
      return line(RAD.x + 1.5, y, RAD.x + RAD.w - 1.5, y);
    }),
    circle(RAD.x + RAD.w / 2, RAD.y + 2, 1.6),
  ),
  { fluid: 'coolant' },
);
comp(
  'comp_lubricacion_cadena', 'transmision', 'lubricacion_cadena',
  belt([
    { cx: SPROCKET_F[0], cy: SPROCKET_F[1], r: 6.6 },
    { cx: REAR.cx, cy: REAR.cy, r: REAR.sprocket + 1.3 },
  ]),
);
comp(
  'comp_kit_arrastre', 'transmision', 'kit_arrastre',
  cat(
    circle(...SPROCKET_F, 5.5),
    teeth(SPROCKET_F[0], SPROCKET_F[1], 5.5, 9, 1.4),
    circle(REAR.cx, REAR.cy, REAR.sprocket),
    teeth(REAR.cx, REAR.cy, REAR.sprocket, 16, 1.6),
  ),
);
comp(
  'comp_embrague', 'transmision', 'embrague',
  cat(circle(130, 112, 8), circle(130, 112, 3), ...[45, 135, 225, 315].map((a) => circle(...polar(130, 112, 6, a), 1.1))),
);
comp(
  'comp_pastillas_freno', 'frenos', 'pastillas_freno',
  cat(
    caliper(FRONT.cx, FRONT.cy, 11.5, 17.5, 28, 74),
    arcSegs(FRONT.cx, FRONT.cy, 14.5, 30, 72),
    circle(FRONT.cx, FRONT.cy, FRONT.disc),
    circle(FRONT.cx, FRONT.cy, 7.5),
  ),
);
comp(
  'comp_liquido_frenos', 'frenos', 'liquido_frenos',
  cat(rrect(BRAKE_RES.x, BRAKE_RES.y, BRAKE_RES.w, BRAKE_RES.h, 1.5), circle(BRAKE_RES.x + BRAKE_RES.w / 2, BRAKE_RES.y + BRAKE_RES.h / 2, 1.9)),
  { fluid: 'brake' },
);
comp(
  'comp_zapatas_freno', 'frenos', 'zapatas_freno',
  cat(circle(REAR.cx, REAR.cy, REAR.drum), arcSegs(REAR.cx, REAR.cy, 5.2, 100, 250), arcSegs(REAR.cx, REAR.cy, 5.2, 285, 435)),
);
comp('comp_llantas', 'llantas', 'llantas', tyresD);
comp(
  'comp_rayos_ruedas', 'llantas', 'rayos_ruedas',
  cat(spokes(FRONT.cx, FRONT.cy, FRONT.hub + 1, FRONT.rim, 6, 12), spokes(REAR.cx, REAR.cy, REAR.hub + 1, REAR.rim, 6, 24)),
);
comp(
  'comp_bateria', 'electrico', 'bateria',
  cat(
    rrect(BATTERY.x, BATTERY.y, BATTERY.w, BATTERY.h, 1.5),
    line(BATTERY.x, BATTERY.y + 4.5, BATTERY.x + BATTERY.w, BATTERY.y + 4.5),
    circle(BATTERY.x + 5, BATTERY.y + 2.2, 1.5),
    circle(BATTERY.x + BATTERY.w - 5, BATTERY.y + 2.2, 1.5),
    line(BATTERY.x + BATTERY.w - 7, BATTERY.y + 10, BATTERY.x + BATTERY.w - 3, BATTERY.y + 10),
    line(BATTERY.x + BATTERY.w - 5, BATTERY.y + 8, BATTERY.x + BATTERY.w - 5, BATTERY.y + 12),
  ),
);
comp(
  'comp_aceite_horquilla', 'suspension', 'aceite_horquilla',
  cat(
    bar(vadd(FORK_L[0], vmul(forkDir, 24)), FORK_L[1], 7.5, 2.5),
    bar(vadd(FORK_R[0], vmul(forkDir, 24)), FORK_R[1], 7.5, 2.5),
    crossTick(...FORK_L, 0.36, 9),
    crossTick(...FORK_R, 0.36, 9),
  ),
  { fluid: 'oil' },
);
comp(
  'comp_amortiguador_trasero', 'suspension', 'amortiguador_trasero',
  cat(
    bar(...SHOCK, 9, 3),
    ...[0.2, 0.35, 0.5, 0.65, 0.8].map((t) => crossTick(...SHOCK, t, 10)),
    circle(...SHOCK[0], 2),
    circle(...SHOCK[1], 2),
  ),
);
comp(
  'comp_filtro_combustible', 'combustible', 'filtro_combustible',
  cat(
    rrect(FUEL_FILTER.x, FUEL_FILTER.y, FUEL_FILTER.w, FUEL_FILTER.h, 2),
    ...[2.5, 4.5, 6.5].map((dy) => line(FUEL_FILTER.x + 1.5, FUEL_FILTER.y + dy, FUEL_FILTER.x + FUEL_FILTER.w - 1.5, FUEL_FILTER.y + dy)),
    line(FUEL_FILTER.x, FUEL_FILTER.y + 4, 128, FUEL_FILTER.y + 4),
  ),
);

// --- hoses ------------------------------------------------------------------
const hose = (id, zone, fluid, d) => def({ id, layer: 'hoses', zone, fluid, d });
hose('hose_coolant_1', 'refrigeracion', 'coolant', pipe([[RAD.x + RAD.w / 2, RAD.y], [RAD.x + RAD.w / 2, 76], [100, 76]], 2.5));
hose('hose_coolant_2', 'refrigeracion', 'coolant', pipe([[RAD.x + RAD.w / 2, RAD.y + RAD.h], [RAD.x + RAD.w / 2, 118], [CRANK.x, 118]], 2.5));
hose('hose_brake_1', 'frenos', 'brake', `M ${P(BRAKE_RES.x + 5, BRAKE_RES.y + BRAKE_RES.h)} C ${P(84, 52)} ${P(74, 74)} ${P(62, 96)}`);

// --- hit polygons (not drawn; generous, non-overlapping) ---------------------
const hit = (id, zone, x1, y1, x2, y2) => def({ id, layer: 'hit', zone, d: rect(x1, y1, x2 - x1, y2 - y1) });
hit('hit_suspension', 'suspension', 10, 14, 78, 80);
hit('hit_frenos', 'frenos', 10, 82, 78, 148);
hit('hit_combustible', 'combustible', 88, 14, 134, 64);
hit('hit_motor', 'motor', 88, 66, 134, 148);
hit('hit_electrico', 'electrico', 136, 30, 214, 88);
hit('hit_transmision', 'transmision', 136, 90, 230, 148);

// --- zoom targets per zone --------------------------------------------------
const ZONE_FOCUS = {
  motor: { cx: 115, cy: 95, scale: 2 },
  refrigeracion: { cx: 84, cy: 98, scale: 2.4 },
  transmision: { cx: 172, cy: 107, scale: 2 },
  frenos: { cx: 46, cy: 108, scale: 2 },
  llantas: { cx: 117, cy: 106, scale: 1.35 },
  electrico: { cx: 167, cy: 71, scale: 2.4 },
  suspension: { cx: 61, cy: 76, scale: 2 },
  combustible: { cx: 125, cy: 52, scale: 2.2 },
};

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------
emitDrawing({
  vehicleType: 'moto',
  constName: 'MOTO_DRAWING',
  viewBox: VIEWBOX,
  paths,
  zones: ZONES,
  zoneFocus: ZONE_FOCUS,
  // A bike reads whole or not at all: no crop, and it takes the full card width.
  cardCrop: 1,
  home: { cx: 120, cy: 75 },
  doc: `Left-side elevation of a naked motorcycle (front wheel to the left) in a
240x150 space, plus the schematic of every part the manual schedules drawn
over it. The left side is the one that carries the chain and sprockets.`,
  requiredIds: [
    'wheel_front', 'wheel_rear',
    ...ZONES.map((z) => `zone_${z}`),
    'comp_aceite_motor', 'comp_bujia', 'comp_filtro_aire_motor', 'comp_ajuste_valvulas', 'comp_refrigerante',
    'comp_lubricacion_cadena', 'comp_kit_arrastre', 'comp_embrague', 'comp_pastillas_freno', 'comp_liquido_frenos',
    'comp_zapatas_freno', 'comp_llantas', 'comp_rayos_ruedas', 'comp_bateria', 'comp_aceite_horquilla',
    'comp_amortiguador_trasero', 'comp_filtro_combustible',
    'hose_coolant_1', 'hose_coolant_2', 'hose_brake_1',
    'hit_suspension', 'hit_frenos', 'hit_combustible', 'hit_motor', 'hit_electrico', 'hit_transmision',
  ],
  // Both wheels answer the 'frenos' tap; tyres and the radiator open from their chip.
  zonesWithoutHit: ['llantas', 'refrigeracion'],
  tsOut: joinPath(ROOT, 'src/assets/moto/drawing.ts'),
  svgOut: joinPath(ROOT, 'assets/moto/moto-drawing.svg'),
  previews: {
    'moto-preview-full': { viewBox: '-10 -10 260 170', size: 1040 },
    'moto-preview-engine': { viewBox: '70 30 100 100', size: 1200 },
    'moto-preview-drive': { viewBox: '120 70 110 80', size: 1200 },
    'moto-preview-debug': { viewBox: '-10 -10 260 170', size: 1560, hits: true },
  },
});
