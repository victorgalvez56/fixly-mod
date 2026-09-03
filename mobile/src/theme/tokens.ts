import { Easing } from 'react-native-reanimated';

export const Colors = {
  background: '#121416',
  surface: '#1c2023',
  surfaceAlt: '#252b2f',
  textPrimary: '#f4f6f4',
  textSecondary: '#dbe0e2',
  textTertiary: '#8d979f',
  textMuted: '#b7c0c7',
  border: 'rgba(244,246,244,0.18)',
  borderSoft: 'rgba(244,246,244,0.10)',
  accent: '#d8b24c',
  accentLight: '#ebcb74',
  accentSoft: 'rgba(216,178,76,0.16)',
  onAccent: '#3e3211',
  statusOk: '#86d2b0',
  statusOkSoft: 'rgba(134,210,176,0.16)',
  statusWarn: '#e8a65b',
  statusWarnSoft: 'rgba(232,166,91,0.16)',
  statusExpired: '#f08c83',
  statusExpiredSoft: 'rgba(240,140,131,0.16)',
  dark: '#121416',
  paper: '#f4f6f4',
} as const;
export const StatusMeta = {
  ok: { label: 'Vigente', color: Colors.statusOk, soft: Colors.statusOkSoft },
  warn: { label: 'Por vencer', color: Colors.statusWarn, soft: Colors.statusWarnSoft },
  expired: { label: 'Vencido', color: Colors.statusExpired, soft: Colors.statusExpiredSoft },
} as const;

export type StatusKey = keyof typeof StatusMeta;

export const ComponentStatusMeta = {
  ok: { label: 'Al día', color: Colors.statusOk, soft: Colors.statusOkSoft, text: Colors.statusOk },
  pronto: { label: 'Pronto', color: Colors.statusWarn, soft: Colors.statusWarnSoft, text: Colors.statusWarn },
  toca: { label: 'Toca ahora', color: Colors.statusWarn, soft: Colors.statusWarnSoft, text: Colors.statusWarn },
  vencido: { label: 'Vencido', color: Colors.statusExpired, soft: Colors.statusExpiredSoft, text: Colors.statusExpired },
  sin_datos: { label: 'Sin datos', color: Colors.textTertiary, soft: Colors.surfaceAlt, text: Colors.textMuted },
} as const;

export type ComponentStatusKey = keyof typeof ComponentStatusMeta;

export const Type = {
  screenTitle: { fontSize: 32, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.6 },
  sectionTitle: { fontSize: 23, lineHeight: 28, fontWeight: '800' as const, letterSpacing: -0.2 },
  bigNumber: { fontSize: 38, lineHeight: 42, fontWeight: '800' as const, letterSpacing: -0.8 },
  cardTitle: { fontSize: 19, lineHeight: 23, fontWeight: '700' as const, letterSpacing: -0.1 },
  buttonLabel: { fontSize: 16, lineHeight: 20, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  label: { fontSize: 11, lineHeight: 15, fontWeight: '700' as const, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  mono: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0.2 },
  monoSmall: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.1 },
} as const;

export type TypeRole = keyof typeof Type;
export const TABULAR_ROLES = new Set<TypeRole>(['bigNumber', 'mono', 'monoSmall']);

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;
export const Radius = { sm: 14, md: 20, lg: 28, pill: 999 } as const;
export const TouchTarget = 56;

export const CardShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.22,
  shadowRadius: 12,
  elevation: 3,
} as const;

export const Motion = {
  duration: { tap: 100, disappear: 140, colorChange: 160, cardArrive: 200, stagger: 60, ceiling: 240 },
  easing: { arrive: Easing.bezier(0.22, 1, 0.36, 1), change: Easing.bezier(0.2, 0.8, 0.2, 1) },
} as const;
