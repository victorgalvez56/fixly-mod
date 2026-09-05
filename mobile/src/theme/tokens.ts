import { Easing } from 'react-native-reanimated';

/**
 * Palette, radii, borders and shadows reverse-engineered from the Duolingo FREE UI Kit
 * (Figma community file nPWrj7evuZ4PhJziHZmwGb) — see the 924-node scan across its 19
 * editable screens. Hex values below are the kit's actual measured values, not guesses.
 * Fixly has no 4-way documented-status system of its own (that came from the retired
 * DESIGN.md dark theme), so vigente/por vencer/vencido are remapped onto Duolingo's own
 * semantic colors: green = correct/good, yellow = attention, red = wrong/expired.
 */
export const Colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F7F7', // 4 uses in the kit — secondary/recessed surface
  textPrimary: '#3C3C3C', // 190 uses — body copy, the kit's most common text color
  textSecondary: '#777777', // 15 uses
  textTertiary: '#AFAFAF', // 12 uses — disabled/caption
  textMuted: '#AFAFAF', // kit has no 4th gray tier; reuses tertiary
  border: '#E5E5E5', // 69 uses, always solid (not rgba) and always 2px — see BorderWidth
  borderSoft: '#F0F0F0', // lighter internal-divider tint; not in the kit, derived from border
  accent: '#58CC02', // Duolingo's own primary/CTA green, 23 uses
  accentLight: '#7DDD3C', // lighter tint for hover/pressed highlight; kit has no documented hover state
  accentSoft: 'rgba(88,204,2,0.14)',
  accentShadow: '#58A700', // the exact solid shadow color under every primary button, 3 uses
  onAccent: '#FFFFFF',
  link: '#1CB0F6', // secondary-button / link blue, 4 uses
  statusOk: '#58CC02',
  statusOkSoft: 'rgba(88,204,2,0.14)',
  statusWarn: '#FFC800', // 10 uses — progress/XP/attention, closest the kit has to "warning"
  statusWarnSoft: 'rgba(255,200,0,0.16)',
  warningText: '#b45309', // darker warning text tone — statusWarn (#FFC800) fails contrast as small text on white
  statusExpired: '#FF4B4B', // 2 uses — the kit's actual "wrong answer" red
  statusExpiredSoft: 'rgba(255,75,75,0.14)',
  dark: '#3C3C3C',
  paper: '#FFFFFF',
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

/**
 * The kit is 100% Inter, exactly two weights (Medium 500 / Bold 700). Loaded via
 * @expo-google-fonts/inter and gated in src/app/_layout.tsx — every entry below names
 * the loaded font file directly rather than relying on fontWeight, since RN on Android
 * ignores fontWeight once a specific static font file is set as fontFamily.
 */
export const Type = {
  screenTitle: { fontSize: 30, lineHeight: 38, fontWeight: '700' as const, letterSpacing: 0, fontFamily: 'Inter_700Bold' },
  sectionTitle: { fontSize: 23, lineHeight: 31, fontWeight: '700' as const, letterSpacing: 0, fontFamily: 'Inter_700Bold' },
  bigNumber: { fontSize: 34, lineHeight: 40, fontWeight: '700' as const, letterSpacing: 0, fontFamily: 'Inter_700Bold' },
  cardTitle: { fontSize: 17, lineHeight: 24, fontWeight: '700' as const, letterSpacing: 0, fontFamily: 'Inter_700Bold' },
  buttonLabel: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, fontFamily: 'Inter_700Bold' },
  body: { fontSize: 15, lineHeight: 24, fontWeight: '500' as const, fontFamily: 'Inter_500Medium' },
  bodyBold: { fontSize: 15, lineHeight: 24, fontWeight: '700' as const, fontFamily: 'Inter_700Bold' },
  bodySmall: { fontSize: 14, lineHeight: 24, fontWeight: '500' as const, fontFamily: 'Inter_500Medium' },
  label: { fontSize: 12, lineHeight: 20, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, fontFamily: 'Inter_700Bold' },
  mono: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const, letterSpacing: 0.2, fontFamily: 'Inter_700Bold' },
  monoSmall: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.1, fontFamily: 'Inter_500Medium' },
} as const;

export type TypeRole = keyof typeof Type;
export const TABULAR_ROLES = new Set<TypeRole>(['bigNumber', 'mono', 'monoSmall']);

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;
/** Only three radii exist across the whole kit. */
export const Radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
/** Every stroke in the kit is 2px — there is no second border weight. */
export const BorderWidth = 2;
export const TouchTarget = 56;

/**
 * The kit's signature look is a solid, zero-blur offset shadow (never a soft blur), and
 * its color changes per surface — this is the neutral default for static cards
 * (offset shadowColor = Colors.border). Colored elements (the primary button) declare
 * their own shadowColor inline instead of using this token — see Button.tsx.
 */
export const CardShadow = {
  shadowColor: Colors.border,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 2,
} as const;

export const Motion = {
  duration: { tap: 100, disappear: 140, colorChange: 160, cardArrive: 200, stagger: 60, ceiling: 240 },
  easing: { arrive: Easing.bezier(0.22, 1, 0.36, 1), change: Easing.bezier(0.2, 0.8, 0.2, 1) },
} as const;
