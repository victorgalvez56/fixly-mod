#!/usr/bin/env node
/**
 * Path-length helper for the car drawing asset (plain Node, no dependencies).
 *
 * Supports ABSOLUTE commands only: M L H V C Q Z. Curves are flattened by
 * sampling CURVE_SAMPLES points per segment. Also exposes parsing and bbox
 * helpers used by scripts/build-car-drawing.mjs.
 *
 *   node scripts/svg-path-length.mjs "M 0 0 L 3 4"   -> prints 5
 */

export const CURVE_SAMPLES = 24;

const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, Q: 4, Z: 0 };
const TOKEN = /([MLHVCQZ])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)|(\S)/g;

/**
 * Parse a d string into subpaths. Each subpath is { start: [x, y], closed,
 * segments: [{ type: 'L' | 'Q' | 'C', pts: [[x, y], ...] }] } where pts
 * includes the segment's start point first.
 */
export function parsePath(d) {
  const tokens = [];
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(d)) !== null) {
    if (m[1]) tokens.push({ cmd: m[1] });
    else if (m[2]) tokens.push({ num: parseFloat(m[2]) });
    else throw new Error(`Unsupported token "${m[3]}" (only absolute M L H V C Q Z are allowed) in: ${d}`);
  }

  const subpaths = [];
  let current = null;
  let cmd = null;
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let i = 0;

  const readNums = (n) => {
    const out = [];
    for (let k = 0; k < n; k++) {
      const t = tokens[i++];
      if (!t || t.num === undefined) throw new Error(`Expected ${n} numbers after "${cmd}" in: ${d}`);
      out.push(t.num);
    }
    return out;
  };
  const ensureSubpath = () => {
    if (!current) {
      current = { start: [x, y], closed: false, segments: [] };
      subpaths.push(current);
    }
  };
  const push = (type, pts) => {
    ensureSubpath();
    current.segments.push({ type, pts });
    [x, y] = pts[pts.length - 1];
  };

  while (i < tokens.length) {
    const t = tokens[i];
    if (t.cmd !== undefined) {
      cmd = t.cmd;
      i++;
      if (cmd === 'Z') {
        if (current) {
          if (x !== sx || y !== sy) current.segments.push({ type: 'L', pts: [[x, y], [sx, sy]] });
          current.closed = true;
        }
        x = sx;
        y = sy;
        current = null;
        continue;
      }
      if (cmd === 'M') {
        [x, y] = readNums(2);
        sx = x;
        sy = y;
        current = { start: [x, y], closed: false, segments: [] };
        subpaths.push(current);
        cmd = 'L'; // implicit lineto for further pairs
        continue;
      }
    }
    if (cmd === null) throw new Error(`Path must start with M: ${d}`);
    if (!(cmd in ARITY)) throw new Error(`Unknown command "${cmd}" in: ${d}`);
    if (tokens[i] === undefined || tokens[i].num === undefined) {
      throw new Error(`Expected numbers after "${cmd}" in: ${d}`);
    }
    const from = [x, y];
    switch (cmd) {
      case 'L': {
        const [nx, ny] = readNums(2);
        push('L', [from, [nx, ny]]);
        break;
      }
      case 'H': {
        const [nx] = readNums(1);
        push('L', [from, [nx, y]]);
        break;
      }
      case 'V': {
        const [ny] = readNums(1);
        push('L', [from, [x, ny]]);
        break;
      }
      case 'C': {
        const [x1, y1, x2, y2, nx, ny] = readNums(6);
        push('C', [from, [x1, y1], [x2, y2], [nx, ny]]);
        break;
      }
      case 'Q': {
        const [x1, y1, nx, ny] = readNums(4);
        push('Q', [from, [x1, y1], [nx, ny]]);
        break;
      }
      default:
        throw new Error(`Unhandled command "${cmd}" in: ${d}`);
    }
  }
  return subpaths;
}

function bezierPoint(pts, t) {
  // De Casteljau for quadratic (3 pts) and cubic (4 pts)
  let p = pts.map((q) => [q[0], q[1]]);
  while (p.length > 1) {
    const next = [];
    for (let k = 0; k < p.length - 1; k++) {
      next.push([p[k][0] + (p[k + 1][0] - p[k][0]) * t, p[k][1] + (p[k + 1][1] - p[k][1]) * t]);
    }
    p = next;
  }
  return p[0];
}

/** Flatten one parsed subpath to a polyline (array of [x, y]). */
export function flattenSubpath(sub, samples = CURVE_SAMPLES) {
  const pts = [sub.start];
  for (const seg of sub.segments) {
    if (seg.type === 'L') {
      pts.push(seg.pts[1]);
    } else {
      for (let k = 1; k <= samples; k++) pts.push(bezierPoint(seg.pts, k / samples));
    }
  }
  return pts;
}

/** Flatten a d string to an array of polylines, one per subpath. */
export function flattenPath(d, samples = CURVE_SAMPLES) {
  return parsePath(d).map((sub) => flattenSubpath(sub, samples));
}

function polylineLength(pts) {
  let len = 0;
  for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
  return len;
}

/** Total length of a path (sum over all subpaths). */
export function pathLength(d, samples = CURVE_SAMPLES) {
  return flattenPath(d, samples).reduce((sum, pts) => sum + polylineLength(pts), 0);
}

function bboxOf(polylines) {
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const pts of polylines) {
    for (const [px, py] of pts) {
      if (px < box.minX) box.minX = px;
      if (py < box.minY) box.minY = py;
      if (px > box.maxX) box.maxX = px;
      if (py > box.maxY) box.maxY = py;
    }
  }
  return box;
}

/** Bounding box of the whole path (from the flattened polylines). */
export function pathBBox(d, samples = CURVE_SAMPLES) {
  return bboxOf(flattenPath(d, samples));
}

/** Bounding box of the FIRST subpath only (used for anchors of multi-subpath paths). */
export function firstSubpathBBox(d, samples = CURVE_SAMPLES) {
  return bboxOf(flattenPath(d, samples).slice(0, 1));
}

// CLI: node scripts/svg-path-length.mjs "<d>"
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const d = process.argv[2];
  if (!d) {
    console.error('usage: node scripts/svg-path-length.mjs "M 0 0 L 3 4"');
    process.exit(1);
  }
  console.log(pathLength(d).toFixed(2));
}
