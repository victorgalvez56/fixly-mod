/**
 * Shared SVG path builders for the vehicle drawing generators
 * (build-car-drawing.mjs, build-moto-drawing.mjs).
 *
 * Everything emits absolute `M L H V C Q Z` commands with 2-decimal numbers,
 * which is the subset scripts/svg-path-length.mjs and react-native-svg both
 * handle without surprises.
 */
// ---------------------------------------------------------------------------
// Geometry helpers (absolute M L C Q Z only; 2-decimal output)
// ---------------------------------------------------------------------------
export const K = 0.5522847498; // cubic Bezier quarter-circle constant
export const f = (n) => {
  const r = Math.round(n * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString();
};
export const P = (x, y) => `${f(x)} ${f(y)}`;
export const cat = (...parts) => parts.join(' ');
export const rad = (deg) => (deg * Math.PI) / 180;
export const vsub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const vadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const vmul = (a, s) => [a[0] * s, a[1] * s];
export const vlen = (a) => Math.hypot(a[0], a[1]);
export const vunit = (a) => vmul(a, 1 / vlen(a));
export const polar = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

export const line = (x1, y1, x2, y2) => `M ${P(x1, y1)} L ${P(x2, y2)}`;
export const rect = (x, y, w, h) => `M ${P(x, y)} L ${P(x + w, y)} L ${P(x + w, y + h)} L ${P(x, y + h)} Z`;

export function rrect(x, y, w, h, r) {
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

export function ellipse(cx, cy, rx, ry) {
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
export const circle = (cx, cy, r) => ellipse(cx, cy, r, r);

/** Cubic segments approximating an arc from angle a0 to a1 (degrees, SVG orientation). */
export function arcSegs(cx, cy, r, a0, a1) {
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
export function caliper(cx, cy, rIn, rOut, a0, a1) {
  return cat(
    `M ${P(...polar(cx, cy, rOut, a0))}`,
    arcSegs(cx, cy, rOut, a0, a1),
    `L ${P(...polar(cx, cy, rIn, a1))}`,
    arcSegs(cx, cy, rIn, a1, a0),
    'Z',
  );
}

/** Orthogonal polyline with small rounded corners (short cubics), like a pipe run. */
export function pipe(points, r = 2) {
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
export function roundedPoly(points, r) {
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
export function belt(circles) {
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
