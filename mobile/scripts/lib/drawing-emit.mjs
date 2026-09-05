/**
 * Measure, validate and emit a vehicle drawing.
 *
 * Both generators (build-car-drawing.mjs, build-moto-drawing.mjs) declare pure
 * geometry and hand it here; nothing numeric in the generated TypeScript is
 * typed by hand. Lengths and anchors come from svg-path-length.mjs.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join as joinPath, resolve } from 'node:path';

import { firstSubpathBBox, pathBBox, pathLength } from '../svg-path-length.mjs';

export const STROKE = { silhouette: 1.3, glass: 1.0, wheels: 1.2, zones: 1.3, enginebay: 0.75, hoses: 0.9, hit: 0 };
export const LIMITS = { maxPaths: 220, maxLength: 900, minStroke: 0.75, minHit: 40 };

const LAYER_ORDER = ['silhouette', 'glass', 'wheels', 'zones', 'enginebay', 'hoses', 'hit'];
const SVG_STROKE = { silhouette: '#c3c9d1', glass: '#c3c9d1', wheels: '#c3c9d1', zones: '#8f99a8', enginebay: '#3b4552', hoses: '#3b4552' };
const CMD_RE = /^[MLHVCQZ0-9.\s-]+$/;
const round2 = (n) => Math.round(n * 100) / 100;
const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** Fills in strokeWidth, length and anchor on every path, in place. */
function measure(paths) {
  for (const p of paths) {
    p.strokeWidth = STROKE[p.layer];
    if (!CMD_RE.test(p.d)) throw new Error(`${p.id}: path contains unsupported characters`);
    p.length = round2(pathLength(p.d));
    const bb = firstSubpathBBox(p.d);
    p.anchor = { x: round2((bb.minX + bb.maxX) / 2), y: round2((bb.minY + bb.maxY) / 2) };
  }
}

function validate({ paths, zones, requiredIds, zoneFocus, zonesWithoutHit }) {
  const problems = [];
  const ids = new Map();
  for (const p of paths) ids.set(p.id, (ids.get(p.id) ?? 0) + 1);
  for (const [id, n] of ids) if (n > 1) problems.push(`duplicate id ${id} (${n}x)`);
  for (const id of requiredIds) if (!ids.has(id)) problems.push(`missing required id ${id}`);
  if (paths.length >= LIMITS.maxPaths) problems.push(`too many paths: ${paths.length} (limit ${LIMITS.maxPaths})`);

  for (const z of zones) {
    if (!ids.has(`zone_${z}`)) problems.push(`zone ${z} has no zone_${z} outline`);
    if (!zoneFocus[z]) problems.push(`zone ${z} has no zoom target`);
    if (!zonesWithoutHit.includes(z) && !paths.some((p) => p.layer === 'hit' && p.zone === z)) {
      problems.push(`zone ${z} has no hit polygon (list it in zonesWithoutHit if it is reachable only from a chip)`);
    }
    if (!paths.some((p) => p.layer === 'enginebay' && p.zone === z && p.componentId)) {
      problems.push(`zone ${z} has no component path to reveal`);
    }
  }

  for (const p of paths) {
    if (p.length >= LIMITS.maxLength) problems.push(`${p.id}: length ${p.length} >= ${LIMITS.maxLength}`);
    if (p.layer !== 'hit' && p.strokeWidth < LIMITS.minStroke) problems.push(`${p.id}: strokeWidth ${p.strokeWidth} < ${LIMITS.minStroke}`);
    if (p.zone && !zones.includes(p.zone)) problems.push(`${p.id}: unknown zone ${p.zone}`);
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
      if (a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY) {
        problems.push(`hit boxes overlap: ${a.id} x ${b.id}`);
      }
    }
  }
  return { problems, hits };
}

function tsEntry(p) {
  const fields = [`id: ${q(p.id)}`, `layer: ${q(p.layer)}`];
  if (p.zone) fields.push(`zone: ${q(p.zone)}`);
  if (p.componentId) fields.push(`componentId: ${q(p.componentId)}`);
  if (p.fluid) fields.push(`fluid: ${q(p.fluid)}`);
  fields.push(`d: ${q(p.d)}`, `strokeWidth: ${p.strokeWidth}`, `length: ${p.length}`, `anchor: { x: ${p.anchor.x}, y: ${p.anchor.y} }`);
  return `  { ${fields.join(', ')} },`;
}

function writeSvg(file, { viewBox, paths }) {
  const attrs = (p) =>
    [p.zone && `data-zone="${p.zone}"`, p.componentId && `data-component="${p.componentId}"`, p.fluid && `data-fluid="${p.fluid}"`]
      .filter(Boolean)
      .join(' ');
  const groups = LAYER_ORDER.filter((layer) => paths.some((p) => p.layer === layer)).map((layer) => {
    const head =
      layer === 'hit'
        ? `<g id="hit" fill="#000" opacity="0" stroke="none">`
        : `<g id="${layer}" fill="none" stroke="${SVG_STROKE[layer]}" stroke-width="${STROKE[layer]}">`;
    const body = paths
      .filter((p) => p.layer === layer)
      .map((p) => `    <path id="${p.id}" ${attrs(p)} d="${p.d}"/>`.replace(/"  d=/, '" d='))
      .join('\n');
    return `  ${head}\n${body}\n  </g>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}" width="${viewBox.w}" height="${viewBox.h}" stroke-linecap="round" stroke-linejoin="round">
${groups.join('\n')}
</svg>
`;
  mkdirSync(resolve(file, '..'), { recursive: true });
  writeFileSync(file, svg);
}

/** Scan look: gray wireframe, dark components, colored fluids. Debug view adds hit boxes + anchors. */
function writePreviews(dir, { paths, zones, zoneAnchors, previews }) {
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
        if (!s) return withHits ? `<path d="${p.d}" fill="#3b82f6" fill-opacity="0.08" stroke="#3b82f6" stroke-width="0.4" stroke-dasharray="2 1"/>` : '';
        return `<path d="${p.d}" fill="none" ${s}/>`;
      })
      .join('\n');
  const anchors = zones.map((z) => `<circle cx="${zoneAnchors[z].x}" cy="${zoneAnchors[z].y}" r="1.4" fill="#e11d48"/>`).join('\n');
  const wrap = (vb, w, h, inner) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" stroke-linecap="round" stroke-linejoin="round"><rect x="-1000" y="-1000" width="3000" height="3000" fill="#ffffff"/>\n${inner}\n</svg>\n`;
  for (const [name, view] of Object.entries(previews)) {
    writeFileSync(joinPath(dir, `${name}.svg`), wrap(view.viewBox, view.size, view.size, body(view.hits === true) + (view.hits ? '\n' + anchors : '')));
  }
  console.log(`previews written to ${dir}`);
}

/**
 * @param {object} drawing
 * @param {'auto'|'moto'} drawing.vehicleType
 * @param {{x,y,w,h}} drawing.viewBox
 * @param {Array} drawing.paths            geometry only; measured here
 * @param {string[]} drawing.zones         zones this vehicle actually has
 * @param {object} drawing.zoneFocus       zone -> { cx, cy, scale }
 * @param {number} drawing.cardCrop        fraction of height shown in the home card
 * @param {{cx,cy}} drawing.home           centre when no zone is selected
 * @param {string[]} drawing.requiredIds   ids that must survive an edit
 * @param {string[]} [drawing.zonesWithoutHit] zones reachable only from a chip
 * @param {string} drawing.constName       exported constant, e.g. 'CAR_DRAWING'
 * @param {string} drawing.tsOut           path of the generated module
 * @param {string} drawing.svgOut          path of the designer SVG
 * @param {string} drawing.doc             one-paragraph header for the module
 * @param {object} drawing.previews        name -> { viewBox, size, hits }
 */
export function emitDrawing(drawing) {
  const { paths, zones, zoneFocus, viewBox, vehicleType, constName, tsOut, svgOut, doc, previews, requiredIds, cardCrop, home } = drawing;
  const zonesWithoutHit = drawing.zonesWithoutHit ?? [];

  measure(paths);
  const { problems, hits } = validate({ paths, zones, requiredIds, zoneFocus, zonesWithoutHit });
  if (problems.length) {
    console.error(`${constName}: validation failed`);
    for (const p of problems) console.error(' - ' + p);
    process.exit(1);
  }

  const zoneAnchors = Object.fromEntries(zones.map((z) => [z, paths.find((p) => p.id === `zone_${z}`).anchor]));

  const ts = `/**
 * GENERATED — do not edit by hand.
${doc
  .trim()
  .split('\n')
  .map((l) => ` * ${l}`.trimEnd())
  .join('\n')}
 * Paths use absolute M L H V C Q Z only; lengths are flattened-curve lengths;
 * anchors are the bbox centroid of each path's first subpath.
 */
import type { VehicleDrawing } from '@/data/drawing-types';

export const ${constName}: VehicleDrawing = {
  vehicleType: '${vehicleType}',
  viewBox: { x: ${viewBox.x}, y: ${viewBox.y}, w: ${viewBox.w}, h: ${viewBox.h} },
  cardCrop: ${cardCrop},
  home: { cx: ${home.cx}, cy: ${home.cy} },
  zones: [${zones.map((z) => q(z)).join(', ')}],
  zoneAnchors: {
${zones.map((z) => `    ${z}: { x: ${zoneAnchors[z].x}, y: ${zoneAnchors[z].y} },`).join('\n')}
  },
  zoneFocus: {
${zones.map((z) => `    ${z}: { cx: ${zoneFocus[z].cx}, cy: ${zoneFocus[z].cy}, scale: ${zoneFocus[z].scale} },`).join('\n')}
  },
  paths: [
${paths.map(tsEntry).join('\n')}
  ],
};
`;
  mkdirSync(resolve(tsOut, '..'), { recursive: true });
  writeFileSync(tsOut, ts);
  writeSvg(svgOut, { viewBox, paths });

  const previewIdx = process.argv.indexOf('--preview');
  if (previewIdx !== -1) {
    writePreviews(resolve(process.argv[previewIdx + 1] || '.'), { paths, zones, zoneAnchors, previews });
  }

  const byLayer = {};
  for (const p of paths) byLayer[p.layer] = (byLayer[p.layer] ?? 0) + 1;
  const sorted = paths.slice().sort((a, b) => a.length - b.length);
  console.log(`${constName}: ${paths.length} paths`, byLayer);
  console.log(`  length: min ${sorted[0].length} (${sorted[0].id}), max ${sorted[sorted.length - 1].length} (${sorted[sorted.length - 1].id})`);
  console.log(`  zones: ${zones.join(', ')}`);
  console.log(`  required ids: ${requiredIds.length}/${requiredIds.length} present; hit boxes: ${hits.length}, no overlaps, all >= ${LIMITS.minHit}x${LIMITS.minHit}`);
  console.log(`  wrote ${tsOut.replace(process.cwd() + '/', '')} and ${svgOut.replace(process.cwd() + '/', '')}`);
}
