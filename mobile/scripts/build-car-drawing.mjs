#!/usr/bin/env node
/**
 * Generates the top-down car drawing used by the maintenance map:
 *   src/assets/car/drawing.ts     (typed path list, lengths + anchors computed here)
 *   assets/car/car-drawing.svg    (same paths grouped per layer, for Figma)
 *
 * All geometry lives in this file. Lengths and anchors are computed with
 * scripts/svg-path-length.mjs so nothing numeric in drawing.ts is typed by hand.
 *
 *   node scripts/build-car-drawing.mjs                 # write both files + print report
 *   node scripts/build-car-drawing.mjs --preview DIR   # also write styled preview SVGs into DIR
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join as joinPath, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { firstSubpathBBox, pathBBox, pathLength } from './svg-path-length.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VIEWBOX = { x: 0, y: 0, w: 240, h: 400 };
const LIMITS = { maxPaths: 220, maxLength: 900, minStroke: 0.75, minHit: 40 };
const STROKE = { silhouette: 1.3, glass: 1.0, wheels: 1.2, zones: 1.3, enginebay: 0.75, hoses: 0.9, hit: 0 };
const ZONES = ['motor', 'refrigeracion', 'transmision', 'frenos', 'llantas', 'electrico', 'cabina', 'combustible'];

// ---------------------------------------------------------------------------
// Geometry helpers (absolute M L C Q Z only; 2-decimal output)
// ---------------------------------------------------------------------------
const K = 0.5522847498; // cubic Bezier quarter-circle constant
const f = (n) => {
  const r = Math.round(n * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString();
};
const P = (x, y) => `${f(x)} ${f(y)}`;
const cat = (...parts) => parts.join(' ');
const rad = (deg) => (deg * Math.PI) / 180;
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const vmul = (a, s) => [a[0] * s, a[1] * s];
const vlen = (a) => Math.hypot(a[0], a[1]);
const vunit = (a) => vmul(a, 1 / vlen(a));
const polar = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

const line = (x1, y1, x2, y2) => `M ${P(x1, y1)} L ${P(x2, y2)}`;
const rect = (x, y, w, h) => `M ${P(x, y)} L ${P(x + w, y)} L ${P(x + w, y + h)} L ${P(x, y + h)} Z`;

function rrect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0) return rect(x, y, w, h);
  const k = K * r;
  return [
    `M ${P(x + r, y)}`,
    `L ${P(x + w - r, y)}`,
    `C ${P(x + w - r + k, y)} ${P(x + w, y + r - k)} ${P(x + w, y + r)}`,
    `L ${P(x + w, y + h - r)}`,
    `C ${P(x + w, y + h - r + k)} ${P(x + w - r + k, y + h)} ${P(x + w - r, y + h)}`,
    `L ${P(x + r, y + h)}`,
    `C ${P(x + r - k, y + h)} ${P(x, y + h - r + k)} ${P(x, y + h - r)}`,
    `L ${P(x, y + r)}`,
    `C ${P(x, y + r - k)} ${P(x + r - k, y)} ${P(x + r, y)}`,
    'Z',
  ].join(' ');
}

function ellipse(cx, cy, rx, ry) {
  const kx = K * rx;
  const ky = K * ry;
  return [
    `M ${P(cx + rx, cy)}`,
    `C ${P(cx + rx, cy + ky)} ${P(cx + kx, cy + ry)} ${P(cx, cy + ry)}`,
    `C ${P(cx - kx, cy + ry)} ${P(cx - rx, cy + ky)} ${P(cx - rx, cy)}`,
    `C ${P(cx - rx, cy - ky)} ${P(cx - kx, cy - ry)} ${P(cx, cy - ry)}`,
    `C ${P(cx + kx, cy - ry)} ${P(cx + rx, cy - ky)} ${P(cx + rx, cy)}`,
    'Z',
  ].join(' ');
}
const circle = (cx, cy, r) => ellipse(cx, cy, r, r);

/** Cubic segments approximating an arc from angle a0 to a1 (degrees, SVG orientation). */
function arcSegs(cx, cy, r, a0, a1) {
  const sweep = rad(a1 - a0);
  const n = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2) - 1e-9));
  const phi = sweep / n;
  const k = (4 / 3) * Math.tan(phi / 4);
  let th = rad(a0);
  const out = [];
  for (let i = 0; i < n; i++) {
    const c0 = Math.cos(th);
    const s0 = Math.sin(th);
    const c1 = Math.cos(th + phi);
    const s1 = Math.sin(th + phi);
    const p1 = [cx + r * (c0 - k * s0), cy + r * (s0 + k * c0)];
    const p2 = [cx + r * (c1 + k * s1), cy + r * (s1 - k * c1)];
    const p3 = [cx + r * c1, cy + r * s1];
    out.push(`C ${P(...p1)} ${P(...p2)} ${P(...p3)}`);
    th += phi;
  }
  return out.join(' ');
}

/** Closed C-shaped bracket between two radii, spanning angles a0..a1. */
function caliper(cx, cy, rIn, rOut, a0, a1) {
  return cat(
    `M ${P(...polar(cx, cy, rOut, a0))}`,
    arcSegs(cx, cy, rOut, a0, a1),
    `L ${P(...polar(cx, cy, rIn, a1))}`,
    arcSegs(cx, cy, rIn, a1, a0),
    'Z',
  );
}

/** Orthogonal polyline with small rounded corners (short cubics), like a pipe run. */
function pipe(points, r = 2) {
  const n = points.length;
  let d = `M ${P(...points[0])}`;
  for (let i = 1; i < n; i++) {
    const p = points[i];
    if (i === n - 1) {
      d += ` L ${P(...p)}`;
      break;
    }
    const prev = points[i - 1];
    const next = points[i + 1];
    const din = vunit(vsub(p, prev));
    const dout = vunit(vsub(next, p));
    const rr = Math.min(r, vlen(vsub(p, prev)) / 2, vlen(vsub(next, p)) / 2);
    const a = vadd(p, vmul(din, -rr));
    const b = vadd(p, vmul(dout, rr));
    d += ` L ${P(...a)} C ${P(...vadd(a, vmul(din, K * rr)))} ${P(...vadd(b, vmul(dout, -K * rr)))} ${P(...b)}`;
  }
  return d;
}

/** Closed polygon with corners rounded by quadratic curves. */
function roundedPoly(points, r) {
  const n = points.length;
  const corner = (i) => {
    const p = points[i];
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const din = vunit(vsub(p, prev));
    const dout = vunit(vsub(next, p));
    const rr = Math.min(r, vlen(vsub(p, prev)) / 2, vlen(vsub(next, p)) / 2);
    return { a: vadd(p, vmul(din, -rr)), b: vadd(p, vmul(dout, rr)), p };
  };
  const c0 = corner(0);
  const parts = [`M ${P(...c0.b)}`];
  for (let i = 1; i < n; i++) {
    const c = corner(i);
    parts.push(`L ${P(...c.a)} Q ${P(...c.p)} ${P(...c.b)}`);
  }
  parts.push(`L ${P(...c0.a)} Q ${P(...c0.p)} ${P(...c0.b)} Z`);
  return parts.join(' ');
}

/** Belt wrapped around a set of pulleys: outer tangents + arcs (convex hull of circles). */
function belt(circles) {
  const gx = circles.reduce((s, c) => s + c.cx, 0) / circles.length;
  const gy = circles.reduce((s, c) => s + c.cy, 0) / circles.length;
  const ang = (c) => Math.atan2(c.cy - gy, c.cx - gx);
  const cs = circles.slice().sort((a, b) => ang(a) - ang(b));
  const n = cs.length;
  const normals = cs.map((A, i) => {
    const B = cs[(i + 1) % n];
    const dx = B.cx - A.cx;
    const dy = B.cy - A.cy;
    const L = Math.hypot(dx, dy);
    const ux = dx / L;
    const uy = dy / L;
    const c = (A.r - B.r) / L;
    const s = Math.sqrt(Math.max(0, 1 - c * c));
    const cands = [1, -1].map((sg) => [c * ux - sg * s * uy, c * uy + sg * s * ux]);
    const mx = (A.cx + B.cx) / 2 - gx;
    const my = (A.cy + B.cy) / 2 - gy;
    return cands.sort((p, q) => q[0] * mx + q[1] * my - (p[0] * mx + p[1] * my))[0];
  });
  const deg = (v) => (Math.atan2(v[1], v[0]) * 180) / Math.PI;
  let d = '';
  for (let i = 0; i < n; i++) {
    const A = cs[i];
    const B = cs[(i + 1) % n];
    const nA = normals[i];
    const nB = normals[(i + 1) % n];
    const pA = [A.cx + A.r * nA[0], A.cy + A.r * nA[1]];
    const pB = [B.cx + B.r * nA[0], B.cy + B.r * nA[1]];
    if (i === 0) d += `M ${P(...pA)}`;
    d += ` L ${P(...pB)}`;
    const a0 = deg(nA);
    const sweep = (((deg(nB) - a0) % 360) + 360) % 360;
    d += ' ' + arcSegs(B.cx, B.cy, B.r, a0, a0 + sweep);
  }
  return d + ' Z';
}

// ---------------------------------------------------------------------------
// Drawing definition
// ---------------------------------------------------------------------------
const paths = [];
const def = (p) => paths.push(p);

// --- silhouette (reused from src/ui/car-svg.ts; tread hatching + seats dropped) ---
def({ id: 'body_l', layer: 'silhouette', d: 'M 120 14 C 96 14 70 16 52 21 C 39 25 31 33 29.5 44 C 28.6 52 28.5 58 28.5 62 C 26.6 72 26.6 98 28.5 116 C 29.5 150 29.5 236 28.5 266 C 26.6 278 26.6 334 28.5 346 C 29.5 360 37 373 48 378 C 64 384 92 386 120 386' });
def({ id: 'body_r', layer: 'silhouette', d: 'M 120 386 C 148 386 176 384 192 378 C 203 373 210.5 360 211.5 346 C 213.4 334 213.4 278 211.5 266 C 210.5 236 210.5 150 211.5 116 C 213.4 98 213.4 72 211.5 62 C 211.5 58 211.4 52 210.5 44 C 209 33 201 25 188 21 C 170 16 144 14 120 14' });
def({ id: 'hood_edge', layer: 'silhouette', d: 'M 33 50 C 35 38 43 29 58 25 C 78 20 100 19 120 19 C 140 19 162 20 182 25 C 197 29 205 38 207 50' });
def({ id: 'hood_creases', layer: 'silhouette', d: 'M 64 26 C 57 44 53 72 51 100 M 176 26 C 183 44 187 72 189 100' });
def({ id: 'cowl', layer: 'silhouette', d: 'M 44 104 C 70 98.5 95 96.5 120 96.5 C 145 96.5 170 98.5 196 104' });
def({ id: 'headlights', layer: 'silhouette', d: 'M 31.5 56 C 31 44 35 33 47 26.5 L 55 28 C 46 33.5 41 43 40.5 56 Z M 208.5 56 C 209 44 205 33 193 26.5 L 185 28 C 194 33.5 199 43 199.5 56 Z' });
def({
  id: 'grille',
  layer: 'silhouette',
  d: cat(
    'M 70 24.5 C 70 19 73 16.4 79 16 L 161 16 C 167 16.4 170 19 170 24.5 Z',
    circle(120, 20.2, 3.2),
    ...[84, 94, 104, 136, 146, 156].map((x) => line(x, 17.5, x, 23)),
  ),
});
def({ id: 'shoulder_l', layer: 'silhouette', d: 'M 43 107 C 39 140 39 205 41 252 C 43 292 48 318 52 330' });
def({ id: 'shoulder_r', layer: 'silhouette', d: 'M 197 107 C 201 140 201 205 199 252 C 197 292 192 318 188 330' });
def({ id: 'pillars_l', layer: 'silhouette', d: 'M 45 114 C 50 130 54 145 57 157 C 55 200 55 250 61 288 M 44 302 C 50 294 56 290 61 288' });
def({ id: 'pillars_r', layer: 'silhouette', d: 'M 195 114 C 190 130 186 145 183 157 C 185 200 185 250 179 288 M 196 302 C 190 294 184 290 179 288' });
def({ id: 'door_seams_l', layer: 'silhouette', d: 'M 28.5 150 C 34 146 40 138 43 122 M 28.5 222 C 33 222 38 221 40.5 220 L 55.5 221 M 28.5 284 C 31 276 36 268 41.5 262' });
def({ id: 'door_seams_r', layer: 'silhouette', d: 'M 211.5 150 C 206 146 200 138 197 122 M 211.5 222 C 207 222 202 221 199.5 220 L 184.5 221 M 211.5 284 C 209 276 204 268 198.5 262' });
def({ id: 'door_handles', layer: 'silhouette', d: cat(ellipse(30.8, 208, 2, 5.2), ellipse(209.2, 208, 2, 5.2), ellipse(30.8, 270, 2, 5.2), ellipse(209.2, 270, 2, 5.2)) });
def({ id: 'antenna', layer: 'silhouette', d: 'M 117 281 C 117.4 275.5 118.8 270.5 120 268.5 C 121.2 270.5 122.6 275.5 123 281 Z' });
def({ id: 'tailgate', layer: 'silhouette', d: 'M 48 336 C 72 341 96 343 120 343 C 144 343 168 341 192 336 L 196 356 C 175 366 148 370 120 370 C 92 370 65 366 44 356 Z M 50 331 C 74 335.5 97 337.5 120 337.5 C 143 337.5 166 335.5 190 331' });
def({ id: 'plate', layer: 'silhouette', d: rrect(104, 355, 32, 9, 1.5) });
def({ id: 'taillights', layer: 'silhouette', d: 'M 31.5 336 C 31.5 346 34 354 41 360 L 48 357.5 C 42.5 351 40.5 344 40.5 336 Z M 208.5 336 C 208.5 346 206 354 199 360 L 192 357.5 C 197.5 351 199.5 344 199.5 336 Z' });
def({ id: 'bumper_rear', layer: 'silhouette', d: 'M 34 364 C 42 372 60 379 82 381.5 C 95 382.6 108 383 120 383 C 132 383 145 382.6 158 381.5 C 180 379 198 372 206 364 M 46 372 C 70 377 96 378.5 120 378.5 C 144 378.5 170 377 194 372' });
def({ id: 'exhaust', layer: 'silhouette', d: cat(rrect(52, 366, 12, 2.6, 1.3), rrect(176, 366, 12, 2.6, 1.3)) });

// --- glass ---
def({ id: 'windshield', layer: 'glass', d: 'M 43 107 C 70 101 95 99 120 99 C 145 99 170 101 197 107 L 183 157 C 160 152.5 140 151.5 120 151.5 C 100 151.5 80 152.5 57 157 Z' });
def({
  id: 'roof',
  layer: 'glass',
  d: cat(
    'M 59 161 C 80 157 100 155.5 120 155.5 C 140 155.5 160 157 181 161',
    rrect(70, 170, 100, 54, 7),
    'M 62 284 C 80 283 100 282.5 120 282.5 C 140 282.5 160 283 178 284',
  ),
});
def({ id: 'rear_glass', layer: 'glass', d: 'M 61 288 C 80 286 100 285 120 285 C 140 285 160 286 179 288 L 191 327 C 166 331.5 141 333 120 333 C 99 333 74 331.5 49 327 Z' });
def({ id: 'mirror_l', layer: 'glass', d: 'M 40 137.5 C 33 138 25 144 20.5 150.5 C 16.5 156 19 161.5 24.5 160.5 C 31 159 38 149 40 137.5 Z' });
def({ id: 'mirror_r', layer: 'glass', d: 'M 200 137.5 C 207 138 215 144 219.5 150.5 C 223.5 156 221 161.5 215.5 160.5 C 209 159 202 149 200 137.5 Z' });

// --- wheels (di/dd = front left/right, ti/td = rear left/right; left = smaller x) ---
const WHEEL = { w: 14, h: 56, r: 5 };
const WHEELS = [
  { id: 'di', x: 33, y: 56 },
  { id: 'dd', x: 193, y: 56 },
  { id: 'ti', x: 33, y: 278 },
  { id: 'td', x: 193, y: 278 },
];
const wheelCenter = (w) => [w.x + WHEEL.w / 2, w.y + WHEEL.h / 2];
for (const w of WHEELS) def({ id: `wheel_${w.id}`, layer: 'wheels', d: rrect(w.x, w.y, WHEEL.w, WHEEL.h, WHEEL.r) });

const DISC_R = 4.6;
const tiresD = WHEELS.map((w) => rrect(w.x - 1.5, w.y - 0.5, WHEEL.w + 3, WHEEL.h + 1, 6)).join(' ');
const discsD = WHEELS.map((w) => circle(...wheelCenter(w), DISC_R)).join(' ');
const calipersD = WHEELS.map((w) => {
  const [cx, cy] = wheelCenter(w);
  return w.x < VIEWBOX.w / 2 ? caliper(cx, cy, 5.3, 6.6, -52, 52) : caliper(cx, cy, 5.3, 6.6, 128, 232);
}).join(' ');

// --- engine bay layout (car coordinates; hood at the top, firewall/cowl at y ~100) ---
const RAD = { x: 74, y: 28, w: 92, h: 8, tank: 6 }; // radiator right behind the grille
const RES = { x: 62, y: 39, w: 11, h: 8 }; // coolant expansion reservoir, front-left
const BAT = { x: 58, y: 52, w: 24, h: 16 }; // battery, front-left corner of the bay
const AIR = { x: 57, y: 74, w: 26, h: 18 }; // air box, left
const BLOCK = { x: 92, y: 50, w: 76, h: 42 }; // transverse engine block (zone_motor)
const VC = { x: 98, y: 56, w: 68, h: 18 }; // valve cover
const PLUG_XS = [106, 119, 132, 145];
const PLUG = { y: 65, r: 2.8 };
const OIL_CAP = { cx: 158, cy: 65, r: 3.2 };
const OIL_FILTER = { x: 134, y: 39, w: 12, h: 7 }; // canister, front-right of the block
const DIPSTICK = { cx: 124, cy: 43.5, r: 1.8 };
const TIMING = [[171, 50], [181, 51], [183, 74], [169, 74]]; // timing cover, right end of the block
const BOLTS = [[174, 55], [179, 55.5], [179.5, 69.5], [172.5, 69.5]];
const PULLEYS = [
  { cx: 174, cy: 91, r: 5.5 }, // crank
  { cx: 183, cy: 80, r: 3.6 }, // alternator
  { cx: 183.5, cy: 96, r: 2.8 }, // tensioner
];
const BRAKE_RES = { x: 150, y: 94, w: 14, h: 8 }; // on the firewall, rear-right
const GEARBOX = { x: 56, y: 96, w: 34, h: 24 }; // left-rear of the block
const CABIN_FILTER = { x: 150, y: 124, w: 24, h: 12 }; // under the windshield, right
const TANK = { x: 80, y: 334, w: 80, h: 21 }; // fuel tank under the trunk
const FUEL_FILTER = { x: 166, y: 338, w: 10, h: 12 };

// --- zones (simplified outline of each zone's main region) ---
def({ id: 'zone_motor', layer: 'zones', zone: 'motor', d: rrect(BLOCK.x, BLOCK.y, BLOCK.w, BLOCK.h, 6) });
def({ id: 'zone_refrigeracion', layer: 'zones', zone: 'refrigeracion', d: rrect(RAD.x - 2, RAD.y - 2, RAD.w + 4, RAD.h + 4, 2.5) });
def({ id: 'zone_electrico', layer: 'zones', zone: 'electrico', d: rrect(BAT.x - 0.5, BAT.y - 1.5, BAT.w + 1, BAT.h + 3, 2) });
def({ id: 'zone_transmision', layer: 'zones', zone: 'transmision', d: rrect(GEARBOX.x - 2, GEARBOX.y - 2, GEARBOX.w + 4, GEARBOX.h + 4, 5) });
def({ id: 'zone_frenos', layer: 'zones', zone: 'frenos', d: discsD });
def({ id: 'zone_llantas', layer: 'zones', zone: 'llantas', d: tiresD });
def({ id: 'zone_cabina', layer: 'zones', zone: 'cabina', d: rrect(100, 120, 80, 20, 3) });
def({ id: 'zone_combustible', layer: 'zones', zone: 'combustible', d: rrect(TANK.x, TANK.y, TANK.w, TANK.h, 6) });

// --- engine bay components ---
const comp = (id, zone, componentId, d, extra = {}) => def({ id, layer: 'enginebay', zone, componentId, d, ...extra });

comp(
  'comp_aceite_motor', 'motor', 'aceite_motor',
  cat(
    rrect(OIL_FILTER.x, OIL_FILTER.y, OIL_FILTER.w, OIL_FILTER.h, 1.5),
    ...[3, 6, 9].map((dx) => line(OIL_FILTER.x + dx, OIL_FILTER.y + 1.5, OIL_FILTER.x + dx, OIL_FILTER.y + OIL_FILTER.h - 1.5)),
    circle(OIL_CAP.cx, OIL_CAP.cy, OIL_CAP.r),
    circle(OIL_CAP.cx, OIL_CAP.cy, 1.3),
    circle(DIPSTICK.cx, DIPSTICK.cy, DIPSTICK.r),
    line(DIPSTICK.cx, DIPSTICK.cy + DIPSTICK.r, DIPSTICK.cx, VC.y),
  ),
  { fluid: 'oil' },
);
comp(
  'comp_bujias', 'motor', 'bujias',
  cat(
    rrect(VC.x, VC.y, VC.w, VC.h, 3),
    rrect(PLUG_XS[0] - 5, PLUG.y - 4.5, PLUG_XS[3] - PLUG_XS[0] + 10, 9, 2),
    ...PLUG_XS.map((x) => circle(x, PLUG.y, PLUG.r)),
  ),
);
comp(
  'comp_filtro_aire_motor', 'motor', 'filtro_aire_motor',
  cat(
    rrect(AIR.x, AIR.y, AIR.w, AIR.h, 2.5),
    line(AIR.x, AIR.y + 6, AIR.x + AIR.w, AIR.y + 6),
    `M ${P(AIR.x + AIR.w, AIR.y + 5)} C ${P(AIR.x + AIR.w + 4, AIR.y + 5)} ${P(AIR.x + AIR.w + 5, AIR.y + 3)} ${P(BLOCK.x, AIR.y + 3)}`,
    `M ${P(AIR.x + AIR.w, AIR.y + 11)} C ${P(AIR.x + AIR.w + 4, AIR.y + 11)} ${P(AIR.x + AIR.w + 5, AIR.y + 9)} ${P(BLOCK.x, AIR.y + 9)}`,
  ),
);
comp(
  'comp_correa_distribucion', 'motor', 'correa_distribucion',
  cat(roundedPoly(TIMING, 2.5), ...BOLTS.map(([x, y]) => circle(x, y, 1.1))),
);
comp(
  'comp_correa_accesorios', 'motor', 'correa_accesorios',
  cat(...PULLEYS.map((p) => circle(p.cx, p.cy, p.r)), ...PULLEYS.map((p) => circle(p.cx, p.cy, 0.9)), belt(PULLEYS)),
);
comp(
  'comp_refrigerante', 'refrigeracion', 'refrigerante',
  cat(
    rrect(RAD.x, RAD.y, RAD.w, RAD.h, 1.5),
    line(RAD.x + RAD.tank, RAD.y, RAD.x + RAD.tank, RAD.y + RAD.h),
    line(RAD.x + RAD.w - RAD.tank, RAD.y, RAD.x + RAD.w - RAD.tank, RAD.y + RAD.h),
    ...Array.from({ length: 12 }, (_, i) => {
      const core = RAD.w - 2 * RAD.tank;
      const x = RAD.x + RAD.tank + (core * (i + 1)) / 13;
      return line(x, RAD.y + 1.5, x, RAD.y + RAD.h - 1.5);
    }),
    rrect(RES.x, RES.y, RES.w, RES.h, 2),
    circle(RES.x + RES.w / 2, RES.y + RES.h / 2, 2),
  ),
  { fluid: 'coolant' },
);
comp(
  'comp_bateria', 'electrico', 'bateria',
  cat(
    rrect(BAT.x, BAT.y, BAT.w, BAT.h, 1.5),
    circle(BAT.x + 5, BAT.y + 4, 1.6),
    circle(BAT.x + BAT.w - 5, BAT.y + 4, 1.6),
    line(BAT.x + BAT.w - 7, BAT.y + 11, BAT.x + BAT.w - 3, BAT.y + 11),
    line(BAT.x + BAT.w - 5, BAT.y + 9, BAT.x + BAT.w - 5, BAT.y + 13),
  ),
);
comp(
  'comp_liquido_frenos', 'frenos', 'liquido_frenos',
  cat(rrect(BRAKE_RES.x, BRAKE_RES.y, BRAKE_RES.w, BRAKE_RES.h, 1.5), circle(BRAKE_RES.x + BRAKE_RES.w / 2, BRAKE_RES.y + BRAKE_RES.h / 2, 2.2)),
  { fluid: 'brake' },
);
comp(
  'comp_aceite_caja', 'transmision', 'aceite_caja',
  cat(rrect(GEARBOX.x, GEARBOX.y, GEARBOX.w, GEARBOX.h, 4), circle(GEARBOX.x + GEARBOX.w - 8, GEARBOX.y + 7, 2.2)),
);
comp(
  'comp_filtro_cabina', 'cabina', 'filtro_cabina',
  cat(
    rrect(CABIN_FILTER.x, CABIN_FILTER.y, CABIN_FILTER.w, CABIN_FILTER.h, 1.5),
    ...[6, 12, 18].map((dx) => line(CABIN_FILTER.x + dx, CABIN_FILTER.y + 1.5, CABIN_FILTER.x + dx, CABIN_FILTER.y + CABIN_FILTER.h - 1.5)),
  ),
);
comp(
  'comp_plumillas', 'cabina', 'plumillas',
  cat(
    // wiper 1: pivot, arm, blade
    circle(102, 118, 1.3), line(102, 118, 106, 114.25), line(96, 116, 136, 109),
    // wiper 2
    circle(146, 118, 1.3), line(146, 118, 150, 114.25), line(140, 116, 180, 109),
  ),
);
comp('comp_pastillas_freno', 'frenos', 'pastillas_freno', calipersD);
comp('comp_llantas', 'llantas', 'llantas', tiresD);
comp(
  'comp_filtro_combustible', 'combustible', 'filtro_combustible',
  cat(
    rrect(FUEL_FILTER.x, FUEL_FILTER.y, FUEL_FILTER.w, FUEL_FILTER.h, 2.5),
    ...[3.5, 6, 8.5].map((dy) => line(FUEL_FILTER.x + 1.5, FUEL_FILTER.y + dy, FUEL_FILTER.x + FUEL_FILTER.w - 1.5, FUEL_FILTER.y + dy)),
    line(FUEL_FILTER.x, FUEL_FILTER.y + 6, TANK.x + TANK.w, FUEL_FILTER.y + 6),
  ),
);

// --- hoses (rounded orthogonal pipe runs) ---
const hose = (id, zone, fluid, d) => def({ id, layer: 'hoses', zone, fluid, d });
hose('hose_coolant_1', 'refrigeracion', 'coolant', pipe([[163, RAD.y + RAD.h], [163, 42], [177, 42], [177, BLOCK.y]], 2.5));
hose(
  'hose_coolant_2', 'refrigeracion', 'coolant',
  cat(
    pipe([[77, RAD.y + RAD.h], [77, 42], [RES.x + RES.w, 42]], 2),
    pipe([[RES.x + RES.w, 45.5], [86, 45.5], [86, 62], [VC.x, 62]], 2.5),
  ),
);
hose('hose_oil_1', 'motor', 'oil', pipe([[OIL_FILTER.x + OIL_FILTER.w, 42.5], [152, 42.5], [152, VC.y]], 2));
hose('hose_brake_1', 'frenos', 'brake', pipe([[157, BRAKE_RES.y + BRAKE_RES.h], [157, 107], [140, 107], [140, 112]], 2));

// --- hit polygons (not drawn; generous, non-overlapping) ---
const hit = (id, zone, x1, y1, x2, y2) => def({ id, layer: 'hit', zone, d: rect(x1, y1, x2 - x1, y2 - y1) });
hit('hit_refrigeracion', 'refrigeracion', 52, 8, 188, 48);
hit('hit_electrico', 'electrico', 50, 49, 90, 94);
hit('hit_motor', 'motor', 91, 49, 190, 100);
hit('hit_transmision', 'transmision', 50, 95, 90, 146);
hit('hit_cabina', 'cabina', 91, 101, 190, 150);
hit('hit_combustible', 'combustible', 60, 320, 180, 372);
hit('hit_esquina_di', 'frenos', 8, 44, 49, 124);
hit('hit_esquina_dd', 'frenos', 191, 44, 232, 124);
hit('hit_esquina_ti', 'frenos', 8, 266, 49, 346);
hit('hit_esquina_td', 'frenos', 191, 266, 232, 346);

// --- zoom targets per zone ---
const ZONE_FOCUS = {
  motor: { cx: 122, cy: 66, scale: 1.9 },
  refrigeracion: { cx: 120, cy: 50, scale: 1.9 },
  electrico: { cx: 92, cy: 62, scale: 1.9 },
  transmision: { cx: 82, cy: 104, scale: 1.9 },
  frenos: { cx: 40, cy: 84, scale: 1.6 },
  llantas: { cx: 40, cy: 84, scale: 1.6 },
  cabina: { cx: 138, cy: 122, scale: 1.5 },
  combustible: { cx: 120, cy: 344, scale: 1.7 },
};

// ---------------------------------------------------------------------------
// Measure, validate, emit
// ---------------------------------------------------------------------------
const round2 = (n) => Math.round(n * 100) / 100;
const CMD_RE = /^[MLHVCQZ0-9.\s-]+$/;

for (const p of paths) {
  p.strokeWidth = STROKE[p.layer];
  if (!CMD_RE.test(p.d)) throw new Error(`${p.id}: path contains unsupported characters`);
  p.length = round2(pathLength(p.d));
  const bb = firstSubpathBBox(p.d);
  p.anchor = { x: round2((bb.minX + bb.maxX) / 2), y: round2((bb.minY + bb.maxY) / 2) };
}

const REQUIRED_IDS = [
  'wheel_di', 'wheel_dd', 'wheel_ti', 'wheel_td',
  ...ZONES.map((z) => `zone_${z}`),
  'comp_aceite_motor', 'comp_bujias', 'comp_filtro_aire_motor', 'comp_correa_distribucion', 'comp_correa_accesorios',
  'comp_refrigerante', 'comp_bateria', 'comp_liquido_frenos', 'comp_aceite_caja', 'comp_filtro_cabina', 'comp_plumillas',
  'comp_pastillas_freno', 'comp_llantas', 'comp_filtro_combustible',
  'hose_coolant_1', 'hose_coolant_2', 'hose_oil_1', 'hose_brake_1',
  'hit_motor', 'hit_refrigeracion', 'hit_electrico', 'hit_transmision', 'hit_cabina', 'hit_combustible',
  'hit_esquina_di', 'hit_esquina_dd', 'hit_esquina_ti', 'hit_esquina_td',
];

const problems = [];
const ids = new Map();
for (const p of paths) ids.set(p.id, (ids.get(p.id) ?? 0) + 1);
for (const [id, n] of ids) if (n > 1) problems.push(`duplicate id ${id} (${n}x)`);
for (const id of REQUIRED_IDS) if (!ids.has(id)) problems.push(`missing required id ${id}`);
if (paths.length >= LIMITS.maxPaths) problems.push(`too many paths: ${paths.length} (limit ${LIMITS.maxPaths})`);
for (const p of paths) {
  if (p.length >= LIMITS.maxLength) problems.push(`${p.id}: length ${p.length} >= ${LIMITS.maxLength}`);
  if (p.layer !== 'hit' && p.strokeWidth < LIMITS.minStroke) problems.push(`${p.id}: strokeWidth ${p.strokeWidth} < ${LIMITS.minStroke}`);
  if (p.zone && !ZONES.includes(p.zone)) problems.push(`${p.id}: unknown zone ${p.zone}`);
  if (p.layer === 'enginebay' && !(p.zone && p.componentId)) problems.push(`${p.id}: enginebay paths need zone + componentId`);
  if (p.layer === 'hit' && !p.d.trim().endsWith('Z')) problems.push(`${p.id}: hit polygon must be closed`);
}
const hits = paths.filter((p) => p.layer === 'hit').map((p) => ({ id: p.id, ...pathBBox(p.d) }));
for (const h of hits) {
  const w = h.maxX - h.minX;
  const hh = h.maxY - h.minY;
  if (w < LIMITS.minHit || hh < LIMITS.minHit) problems.push(`${h.id}: hit box ${w}x${hh} smaller than ${LIMITS.minHit}x${LIMITS.minHit}`);
}
for (let i = 0; i < hits.length; i++) {
  for (let j = i + 1; j < hits.length; j++) {
    const a = hits[i];
    const b = hits[j];
    const overlap = a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY;
    if (overlap) problems.push(`hit boxes overlap: ${a.id} x ${b.id}`);
  }
}
if (problems.length) {
  console.error('build-car-drawing: validation failed');
  for (const p of problems) console.error(' - ' + p);
  process.exit(1);
}

const ZONE_ANCHORS = Object.fromEntries(ZONES.map((z) => [z, paths.find((p) => p.id === `zone_${z}`).anchor]));

// --- drawing.ts ---
const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const tsEntry = (p) => {
  const fields = [`id: ${q(p.id)}`, `layer: ${q(p.layer)}`];
  if (p.zone) fields.push(`zone: ${q(p.zone)}`);
  if (p.componentId) fields.push(`componentId: ${q(p.componentId)}`);
  if (p.fluid) fields.push(`fluid: ${q(p.fluid)}`);
  fields.push(`d: ${q(p.d)}`, `strokeWidth: ${p.strokeWidth}`, `length: ${p.length}`, `anchor: { x: ${p.anchor.x}, y: ${p.anchor.y} }`);
  return `  { ${fields.join(', ')} },`;
};
const ts = `/* eslint-disable */
/**
 * GENERATED by scripts/build-car-drawing.mjs — do not edit by hand.
 * Top-down 5-door hatchback wireframe (hood at the top) plus an engine-bay
 * schematic drawn inside the hood region of the same 240x400 coordinate space.
 * Paths use absolute M L H V C Q Z only; lengths are flattened-curve lengths;
 * anchors are the bbox centroid of each path's first subpath.
 */
export type CarLayer = 'silhouette' | 'glass' | 'wheels' | 'zones' | 'enginebay' | 'hoses' | 'hit';
export type CarZone =
  | 'motor'
  | 'refrigeracion'
  | 'transmision'
  | 'frenos'
  | 'llantas'
  | 'electrico'
  | 'cabina'
  | 'combustible';
export type CarPath = {
  id: string;
  layer: CarLayer;
  zone?: CarZone;
  componentId?: string;
  fluid?: 'oil' | 'coolant' | 'brake';
  d: string;
  strokeWidth: number;
  length: number;
  anchor: { x: number; y: number };
};

export const CAR_VIEWBOX = { x: ${VIEWBOX.x}, y: ${VIEWBOX.y}, w: ${VIEWBOX.w}, h: ${VIEWBOX.h} } as const;

export const CAR_PATHS: CarPath[] = [
${paths.map(tsEntry).join('\n')}
];

/** Centroid of each zone's main shape (bbox centre of zone_<zone>). */
export const ZONE_ANCHORS: Record<CarZone, { x: number; y: number }> = {
${ZONES.map((z) => `  ${z}: { x: ${ZONE_ANCHORS[z].x}, y: ${ZONE_ANCHORS[z].y} },`).join('\n')}
};

/** Where to zoom for each zone: centre point (car coordinates) and scale factor. */
export const ZONE_FOCUS: Record<CarZone, { cx: number; cy: number; scale: number }> = {
${ZONES.map((z) => `  ${z}: { cx: ${ZONE_FOCUS[z].cx}, cy: ${ZONE_FOCUS[z].cy}, scale: ${ZONE_FOCUS[z].scale} },`).join('\n')}
};
`;
mkdirSync(joinPath(ROOT, 'src/assets/car'), { recursive: true });
writeFileSync(joinPath(ROOT, 'src/assets/car/drawing.ts'), ts);

// --- car-drawing.svg (for designers) ---
const LAYER_ORDER = ['silhouette', 'glass', 'wheels', 'zones', 'enginebay', 'hoses', 'hit'];
const SVG_STROKE = { silhouette: '#c3c9d1', glass: '#c3c9d1', wheels: '#c3c9d1', zones: '#8f99a8', enginebay: '#3b4552', hoses: '#3b4552' };
const attrs = (p) =>
  [p.zone && `data-zone="${p.zone}"`, p.componentId && `data-component="${p.componentId}"`, p.fluid && `data-fluid="${p.fluid}"`]
    .filter(Boolean)
    .join(' ');
const svgGroups = LAYER_ORDER.map((layer) => {
  const members = paths.filter((p) => p.layer === layer);
  const head =
    layer === 'hit'
      ? `<g id="hit" fill="#000" opacity="0" stroke="none">`
      : `<g id="${layer}" fill="none" stroke="${SVG_STROKE[layer]}" stroke-width="${STROKE[layer]}">`;
  const body = members.map((p) => `    <path id="${p.id}" ${attrs(p)} d="${p.d}"/>`.replace(/"  d=/, '" d=')).join('\n');
  return `  ${head}\n${body}\n  </g>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}" width="${VIEWBOX.w}" height="${VIEWBOX.h}" stroke-linecap="round" stroke-linejoin="round">
${svgGroups.join('\n')}
</svg>
`;
mkdirSync(joinPath(ROOT, 'assets/car'), { recursive: true });
writeFileSync(joinPath(ROOT, 'assets/car/car-drawing.svg'), svg);

// --- optional styled previews (scan look: gray wireframe, dark components, colored fluids) ---
const previewIdx = process.argv.indexOf('--preview');
if (previewIdx !== -1) {
  const dir = resolve(process.argv[previewIdx + 1] || '.');
  mkdirSync(dir, { recursive: true });
  const FLUID = { oil: '#b07a1f', coolant: '#2b7bd6', brake: '#c43d3d' };
  const style = (p) => {
    if (p.layer === 'hit') return null;
    if (p.layer === 'zones') return `stroke="#a9b2bf" stroke-dasharray="1.5 1.5" stroke-width="${p.strokeWidth * 0.6}"`;
    if (p.layer === 'enginebay') return `stroke="#2f3742" stroke-width="${p.strokeWidth}"`;
    if (p.layer === 'hoses') return `stroke="${FLUID[p.fluid]}" stroke-width="${p.strokeWidth}"`;
    return `stroke="#c3c9d1" stroke-width="${p.strokeWidth}"`;
  };
  const body = (withHits) =>
    paths
      .map((p) => {
        const s = style(p);
        if (!s) {
          return withHits ? `<path d="${p.d}" fill="#3b82f6" fill-opacity="0.08" stroke="#3b82f6" stroke-width="0.4" stroke-dasharray="2 1"/>` : '';
        }
        return `<path d="${p.d}" fill="none" ${s}/>`;
      })
      .join('\n');
  const anchors = ZONES.map((z) => `<circle cx="${ZONE_ANCHORS[z].x}" cy="${ZONE_ANCHORS[z].y}" r="1.4" fill="#e11d48"/>`).join('\n');
  const wrap = (vb, w, h, inner) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" stroke-linecap="round" stroke-linejoin="round"><rect x="-1000" y="-1000" width="3000" height="3000" fill="#ffffff"/>\n${inner}\n</svg>\n`;
  writeFileSync(joinPath(dir, 'preview-full.svg'), wrap('-80 0 400 400', 800, 800, body(false)));
  writeFileSync(joinPath(dir, 'preview-hood.svg'), wrap('30 0 180 180', 1440, 1440, body(false)));
  writeFileSync(joinPath(dir, 'preview-debug.svg'), wrap('-80 0 400 400', 1600, 1600, body(true) + '\n' + anchors));
  writeFileSync(joinPath(dir, 'preview-rear.svg'), wrap('20 230 200 200', 1200, 1200, body(false)));
  console.log(`previews written to ${dir}`);
}

// --- report ---
const byLayer = {};
for (const p of paths) byLayer[p.layer] = (byLayer[p.layer] ?? 0) + 1;
const sorted = paths.slice().sort((a, b) => a.length - b.length);
console.log(`paths: ${paths.length} total`, byLayer);
console.log(`length: min ${sorted[0].length} (${sorted[0].id}), max ${sorted[sorted.length - 1].length} (${sorted[sorted.length - 1].id})`);
console.log('ZONE_ANCHORS:', ZONE_ANCHORS);
console.log(`required ids: ${REQUIRED_IDS.length}/${REQUIRED_IDS.length} present; hit boxes: ${hits.length}, no overlaps, all >= ${LIMITS.minHit}x${LIMITS.minHit}`);
console.log('wrote src/assets/car/drawing.ts and assets/car/car-drawing.svg');
