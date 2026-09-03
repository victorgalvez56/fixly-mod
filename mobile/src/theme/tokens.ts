import { Easing } from 'react-native-reanimated';

/**
 * Fixly design tokens — light, card-based, green-accent UI matching the
 * reference screenshots the user supplied (native iOS-style look: white
 * surfaces, soft shadows, rounded corners, a single green accent).
 */

export const Colors = {
  background: '#ffffff',
  surface: '#f5f6f8',
  surfaceAlt: '#eef0f3',

  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',

  border: '#e5e7eb',
  borderSoft: '#eef0f2',

  accent: '#16a34a',
  accentLight: '#22c55e',
  accentSoft: '#dcfce7',
  onAccent: '#ffffff',

  statusOk: '#16a34a',
  statusOkSoft: '#dcfce7',
  statusWarn: '#f59e0b',
  statusWarnSoft: '#fef3c7',
  statusExpired: '#ef4444',
  statusExpiredSoft: '#fee2e2',

  dark: '#111827',
} as const;

/** Status word + color pairing — the label always ships with the color, never alone. */
export const StatusMeta = {
  ok: { label: 'Vigente', color: Colors.statusOk, soft: Colors.statusOkSoft },
  warn: { label: 'Por vencer', color: Colors.statusWarn, soft: Colors.statusWarnSoft },
  expired: { label: 'Vencido', color: Colors.statusExpired, soft: Colors.statusExpiredSoft },
} as const;

export type StatusKey = keyof typeof StatusMeta;

/**
 * Component (maintenance) status vocabulary — separate from the document
 * vocabulary above. `text` is the color used for the WORD on a soft chip:
 * amber text goes darker (#b45309) so it survives sunlight on a cheap screen.
 */
export const ComponentStatusMeta = {
  ok: { label: 'Al día', color: Colors.statusOk, soft: Colors.statusOkSoft, text: '#15803d' },
  pronto: { label: 'Pronto', color: Colors.statusWarn, soft: Colors.statusWarnSoft, text: '#b45309' },
  toca: { label: 'Toca ahora', color: Colors.statusWarn, soft: Colors.statusWarnSoft, text: '#b45309' },
  vencido: { label: 'Vencido', color: Colors.statusExpired, soft: Colors.statusExpiredSoft, text: '#b91c1c' },
  sin_datos: { label: 'Sin datos', color: Colors.textTertiary, soft: Colors.surfaceAlt, text: Colors.textSecondary },
} as const;

export type ComponentStatusKey = keyof typeof ComponentStatusMeta;

/**
 * System fonts, not custom-loaded ones: the reference UI reads as a native
 * platform font (SF Pro / Roboto), and skipping custom font loading entirely
 * is a real Android cold-start win — no useFonts hook, no splash-screen hold.
 */
export const Type = {
  screenTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.3 },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.1 },
  bigNumber: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const, letterSpacing: -0.4 },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  buttonLabel: { fontSize: 16, lineHeight: 20, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  bodySmall: { fontSize: 14, lineHeight: 19, fontWeight: '400' as const },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.4, textTransform: 'uppercase' as const },
  mono: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  monoSmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;

export type TypeRole = keyof typeof Type;

/** Roles that always show digits meant to line up (km, prices, dates, counters): tabular by default. */
export const TABULAR_ROLES = new Set<TypeRole>(['bigNumber', 'mono', 'monoSmall']);

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 14,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

/** Minimum touch target — 56px, hand-on-wheel usable. */
export const TouchTarget = 56;

/** Soft native-style elevation. Android uses `elevation` (cheap, hardware layer), not a CSS box-shadow blur. */
export const CardShadow = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
} as const;

export const Motion = {
  duration: {
    tap: 100,
    disappear: 140,
    colorChange: 160,
    cardArrive: 200,
    stagger: 60,
    ceiling: 240,
  },
  easing: {
    arrive: Easing.bezier(0.22, 1, 0.36, 1),
    change: Easing.bezier(0.2, 0.8, 0.2, 1),
  },
} as const;
