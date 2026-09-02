/** Peruvian formatting rules from DESIGN.md: comma thousands, dot decimals, "S/" prefix, no space. */
export function formatPEN(amount: number): string {
  const [whole, decimals = '00'] = amount.toFixed(2).split('.');
  const withThousands = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `S/${withThousands}.${decimals}`;
}

export function formatKm(km: number): string {
  return `${km.toLocaleString('es-PE')} km`;
}

const MONTHS_ES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

/**
 * Hand-rolled instead of Intl's `es-PE` short-month format: Spanish month
 * abbreviations carry a trailing period ("jul."), which wraps onto its own
 * line in a narrow mono date column. This also keeps dates uppercase, per
 * DESIGN.md's rule for mono "datos".
 */
export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_ES[d.getMonth()]}`;
}

export function formatLongDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${formatShortDate(isoDate)} ${d.getFullYear()}`;
}

export function daysUntil(isoDate: string): number {
  const today = new Date();
  const target = new Date(isoDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

/** "Vence en 12 días" / "Venció hace 12 días" / "Vence hoy" — the mono detail line under a status row. */
export function dueLabel(isoDate: string): string {
  const days = daysUntil(isoDate);
  if (days === 0) return 'Vence hoy';
  if (days > 0) return `Vence en ${days} día${days === 1 ? '' : 's'}`;
  const passed = Math.abs(days);
  return `Venció hace ${passed} día${passed === 1 ? '' : 's'}`;
}
