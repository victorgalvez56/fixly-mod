import type { VehicleType, Zone } from '@/lib/wear/types';

/**
 * The shape both generated drawings share (scripts/build-car-drawing.mjs and
 * scripts/build-moto-drawing.mjs). One vehicle = one VehicleDrawing; the map
 * component renders whichever it is handed and knows nothing about cars.
 */
export type DrawingLayer = 'silhouette' | 'glass' | 'wheels' | 'zones' | 'enginebay' | 'hoses' | 'hit';

export type DrawingPath = {
  id: string;
  layer: DrawingLayer;
  zone?: Zone;
  componentId?: string;
  fluid?: 'oil' | 'coolant' | 'brake';
  d: string;
  strokeWidth: number;
  /** Flattened-curve length, used as the strokeDasharray for the draw-in reveal. */
  length: number;
  /** Bbox centroid of the path's first subpath: where a pin or dot lands. */
  anchor: { x: number; y: number };
};

export type VehicleDrawing = {
  vehicleType: VehicleType;
  viewBox: { x: number; y: number; w: number; h: number };
  paths: DrawingPath[];
  /** The zones this drawing actually draws, in no particular order. */
  zones: Zone[];
  zoneAnchors: Partial<Record<Zone, { x: number; y: number }>>;
  zoneFocus: Partial<Record<Zone, { cx: number; cy: number; scale: number }>>;
  /** Fraction of the drawing's height worth showing in the compact home card. */
  cardCrop: number;
  /** Where the whole drawing is centred when no zone is selected. */
  home: { cx: number; cy: number };
};
