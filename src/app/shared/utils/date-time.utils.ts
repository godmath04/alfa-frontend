export const WEEK_DAYS_SHORT  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;
export const MONTHS_SHORT     = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const;
export const MONTHS_FULL      = [
  { value: '01', name: 'Enero' },  { value: '02', name: 'Febrero' },
  { value: '03', name: 'Marzo' },  { value: '04', name: 'Abril' },
  { value: '05', name: 'Mayo' },   { value: '06', name: 'Junio' },
  { value: '07', name: 'Julio' },  { value: '08', name: 'Agosto' },
  { value: '09', name: 'Septiembre' }, { value: '10', name: 'Octubre' },
  { value: '11', name: 'Noviembre' },  { value: '12', name: 'Diciembre' },
] as const;

export interface DateEntry {
  value:     string;
  dayName:   string;
  dayNumber: string;
  monthName: string;
}

/** Returns ISO date string 'YYYY-MM-DD' for a given Date. */
export function formatDateToISO(date: Date): string {
  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const dd   = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Converts '08:30:00' → '8:30 AM'. Returns empty string for invalid input. */
export function formatToAmPm(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m    = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/** Adds durationMinutes to a 'HH:mm:ss' time string, returns 'HH:mm:ss'. */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const parts = startTime.split(':');
  const d = new Date();
  d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
  d.setMinutes(d.getMinutes() + durationMinutes);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}:00`;
}

/** Formats seconds as 'm:ss' (e.g. 90 → '1:30'). */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Generates the next `count` days starting from today as DateEntry objects. */
export function generateNextDays(count: number): DateEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const value = formatDateToISO(d);
    return {
      value,
      dayName:   i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : WEEK_DAYS_SHORT[d.getDay()],
      dayNumber: value.slice(8),
      monthName: MONTHS_SHORT[d.getMonth()],
    };
  });
}
