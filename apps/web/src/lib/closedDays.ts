// Systembolaget closure calendar, computed from rules instead of a hardcoded list.
//
// Source: https://www.systembolaget.se/butiker-ombud/oppettider-helgdagar/
// Stores are closed on Sundays, on every Swedish public holiday ("röda dagar"),
// and on midsommarafton and julafton. Påskafton and nyårsafton close at 15:00.
// The days before midsommar, jul and nyår have extended hours (open to at least 19:00).
// Local deviations can occur, so the UI should link to the official page.

export type DayKind = "closed" | "short" | "extended";

export interface SpecialDay {
  /** ISO date, YYYY-MM-DD */
  date: string;
  name: string;
  kind: DayKind;
  /** Human-readable hours note, e.g. "Öppet till 15:00" */
  note: string;
}

// All dates are handled as UTC midnight so DST never shifts a day.
const DAY_MS = 86_400_000;

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseIso(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

/** Easter Sunday, anonymous Gregorian algorithm (Meeus/Jones/Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month, day);
}

/** First date in [from, from + 6] that falls on the given weekday (0 = Sunday). */
function weekdayInRange(from: Date, weekday: number): Date {
  const offset = (weekday - from.getUTCDay() + 7) % 7;
  return addDays(from, offset);
}

const CLOSED = "Stängt";
const EXTENDED = "Öppet till minst 19:00";

/** Every day with non-ordinary hours in a calendar year, sorted by date. */
export function specialDaysForYear(year: number): SpecialDay[] {
  const easter = easterSunday(year);
  const midsummerEve = weekdayInRange(utc(year, 6, 19), 5); // Friday 19–25 June
  const allSaints = weekdayInRange(utc(year, 10, 31), 6); // Saturday 31 Oct–6 Nov

  const day = (d: Date, name: string, kind: DayKind, note = CLOSED): SpecialDay => ({
    date: isoDate(d),
    name,
    kind,
    note,
  });

  const days: SpecialDay[] = [
    day(utc(year, 1, 1), "Nyårsdagen", "closed"),
    day(utc(year, 1, 6), "Trettondedag jul", "closed"),
    day(addDays(easter, -2), "Långfredagen", "closed"),
    day(addDays(easter, -1), "Påskafton", "short", "Öppet till 15:00"),
    day(easter, "Påskdagen", "closed"),
    day(addDays(easter, 1), "Annandag påsk", "closed"),
    day(utc(year, 5, 1), "Första maj", "closed"),
    day(addDays(easter, 39), "Kristi himmelsfärdsdag", "closed"),
    day(addDays(easter, 49), "Pingstdagen", "closed"),
    day(utc(year, 6, 6), "Nationaldagen", "closed"),
    day(addDays(midsummerEve, -1), "Dagen före midsommarafton", "extended", EXTENDED),
    day(midsummerEve, "Midsommarafton", "closed"),
    day(addDays(midsummerEve, 1), "Midsommardagen", "closed"),
    day(allSaints, "Alla helgons dag", "closed"),
    day(utc(year, 12, 22), "Inför julafton", "extended", EXTENDED),
    day(utc(year, 12, 23), "Dagen före julafton", "extended", EXTENDED),
    day(utc(year, 12, 24), "Julafton", "closed"),
    day(utc(year, 12, 25), "Juldagen", "closed"),
    day(utc(year, 12, 26), "Annandag jul", "closed"),
    day(utc(year, 12, 29), "Inför nyårsafton", "extended", EXTENDED),
    day(utc(year, 12, 30), "Dagen före nyårsafton", "extended", EXTENDED),
    day(utc(year, 12, 31), "Nyårsafton", "short", "Öppet till 15:00"),
  ];

  // Extended hours never apply to a day that is itself closed (e.g. 22 Dec on a Sunday).
  const closedDates = new Set(days.filter((d) => d.kind === "closed").map((d) => d.date));
  return days
    .filter((d) => d.kind === "closed" || (!closedDates.has(d.date) && parseIso(d.date).getUTCDay() !== 0))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Today's date in Stockholm as an ISO date, independent of the browser's zone. */
export function todayInStockholm(now = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDaysIso(iso: string, n: number): string {
  return isoDate(addDays(parseIso(iso), n));
}
