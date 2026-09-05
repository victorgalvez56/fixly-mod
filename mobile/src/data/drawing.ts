import type { VehicleType, Zone } from '@/lib/wear/types';

/**
 * The generated drawings live under src/assets/<vehicle>/ because tsconfig maps
 * `@/assets/*` to the repo-level assets folder; they are reached from here
 * through a relative path instead.
 */
import { CAR_DRAWING } from '../assets/car/drawing';
import { MOTO_DRAWING } from '../assets/moto/drawing';

import type { VehicleDrawing } from './drawing-types';

export type { DrawingLayer, DrawingPath, VehicleDrawing } from './drawing-types';

const DRAWINGS: Record<VehicleType, VehicleDrawing> = {
  auto: CAR_DRAWING,
  moto: MOTO_DRAWING,
};

export function drawingFor(type: VehicleType | null | undefined): VehicleDrawing {
  return DRAWINGS[type ?? 'auto'];
}

/** Where a zone's dot sits, falling back to the middle of the drawing. */
export function zoneAnchor(drawing: VehicleDrawing, zone: Zone): { x: number; y: number } {
  return drawing.zoneAnchors[zone] ?? { x: drawing.home.cx, y: drawing.home.cy };
}

/** Where to zoom for a zone; the whole drawing when none is selected. */
export function zoneFocus(drawing: VehicleDrawing, zone: Zone | null): { cx: number; cy: number; scale: number } {
  const focus = zone ? drawing.zoneFocus[zone] : undefined;
  return focus ?? { cx: drawing.home.cx, cy: drawing.home.cy, scale: 1 };
}

/** Where a component's pin sits, or null when this drawing does not depict it. */
export function componentAnchor(drawing: VehicleDrawing, componentId: string): { x: number; y: number } | null {
  const path = drawing.paths.find((p) => p.layer === 'enginebay' && p.componentId === componentId);
  return path ? path.anchor : null;
}

/** Rendered height of the whole drawing at the given width. */
export function drawingHeight(drawing: VehicleDrawing, width: number): number {
  return (width * drawing.viewBox.h) / drawing.viewBox.w;
}

/** viewBox units -> rendered pixels at the given width. */
export function unitScale(drawing: VehicleDrawing, width: number): number {
  return width / drawing.viewBox.w;
}

/** The width that makes the visible part of the drawing `height` tall in the home card. */
export function widthForCardHeight(drawing: VehicleDrawing, height: number): number {
  return (height * drawing.viewBox.w) / (drawing.viewBox.h * drawing.cardCrop);
}
