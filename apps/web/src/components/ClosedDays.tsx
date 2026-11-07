"use client";
import { useEffect, useMemo, useState } from "react";
import { addDaysIso, parseIso, specialDaysForYear, todayInStockholm, type SpecialDay } from "../lib/closedDays";

const SOURCE_URL = "https://www.systembolaget.se/butiker-ombud/oppettider-helgdagar/";

const weekdayLong = new Intl.DateTimeFormat("sv-SE", { weekday: "long", timeZone: "UTC" });
const dayMonth = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long", timeZone: "UTC" });
const monthName = new Intl.DateTimeFormat("sv-SE", { month: "long", timeZone: "UTC" });

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const fmtLong = (iso: string) => cap(`${weekdayLong.format(parseIso(iso))} ${dayMonth.format(parseIso(iso))}`);

const KIND_STYLE: Record<string, string> = {
  closed: "bg-red-600 text-white",
  short: "bg-amber-500 text-black",
  extended: "bg-emerald-600 text-white",
  sunday: "text-gray-500",
  normal: "text-gray-300",
};

const NOTE_STYLE: Record<string, string> = {
  closed: "text-red-400",
  short: "text-amber-400",
  extended: "text-emerald-400",
  sunday: "text-red-400",
};

interface Reason {
  kind: string;
  name: string;
  note: string;
}

function reasonFor(iso: string, special: SpecialDay | undefined): Reason | null {
  if (special) return special;
  if (parseIso(iso).getUTCDay() === 0) return { kind: "sunday", name: "Söndag", note: "Stängt" };
  return null;
}

function DayCell({ iso, today, special, column }: { iso: string; today: string; special?: SpecialDay; column: number }) {
  const reason = reasonFor(iso, special);
  const kind = special?.kind ?? (reason ? "sunday" : "normal");
  const past = iso < today;
  // Keep the tooltip inside the month card: anchor it left or right near the edges.
  const align =
    column <= 1 ? "left-0" : column >= 5 ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <span
      tabIndex={reason ? 0 : undefined}
      aria-label={reason ? `${fmtLong(iso)}: ${reason.name}, ${reason.note}` : undefined}
      className={`group relative rounded leading-5 outline-none ${KIND_STYLE[kind]} ${past ? "opacity-40" : ""} ${
        iso === today ? "ring-2 ring-yellow-400" : ""
      } ${reason ? "cursor-help" : ""}`}
    >
      {Number(iso.slice(8))}
      {reason && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-full z-20 mb-2 hidden w-max max-w-[14rem] rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-left text-xs leading-snug text-gray-200 shadow-xl group-hover:block group-focus:block ${align}`}
        >
          <span className="block text-gray-400">{fmtLong(iso)}</span>
          <span className="block font-semibold text-white">{reason.name}</span>
          <span className={`block ${NOTE_STYLE[kind]}`}>{reason.note}</span>
        </span>
      )}
    </span>
  );
}

function YearCalendar({ year, today, specials }: { year: number; today: string; specials: Map<string, SpecialDay> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, m) => {
        const first = new Date(Date.UTC(year, m, 1));
        const firstIso = first.toISOString().slice(0, 10);
        const daysInMonth = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
        const lead = (first.getUTCDay() + 6) % 7; // Monday-first grid
        return (
          <div key={m} className="rounded-lg border border-gray-800 p-2">
            <p className="text-xs font-semibold text-gray-300 mb-1">{cap(monthName.format(first))}</p>
            <div className="grid grid-cols-7 gap-[2px] text-[10px] text-center">
              {["m", "t", "o", "t", "f", "l", "s"].map((d, i) => (
                <span key={i} className="text-gray-600">
                  {d}
                </span>
              ))}
              {Array.from({ length: lead }, (_, i) => (
                <span key={`lead-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, d) => {
                const iso = addDaysIso(firstIso, d);
                return (
                  <DayCell
                    key={iso}
                    iso={iso}
                    today={today}
                    special={specials.get(iso)}
                    column={(lead + d) % 7}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ClosedDays = () => {
  // Today is resolved on the client so the server render never shows a stale date.
  const [today, setToday] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    const t = todayInStockholm();
    setToday(t);
    setYear(Number(t.slice(0, 4)));
  }, []);

  const specials = useMemo(() => {
    if (!year) return new Map<string, SpecialDay>();
    return new Map(specialDaysForYear(year).map((d) => [d.date, d] as const));
  }, [year]);

  if (!today || year === null) return null;
  const thisYear = Number(today.slice(0, 4));

  return (
    <section className="mx-4 my-24 md:container md:mx-auto lg:w-2/3" aria-labelledby="closed-days-heading">
      <h2 id="closed-days-heading" className="text-center text-lg lg:text-2xl">
        När har Systembolaget stängt?
      </h2>
      <p className="text-center text-sm text-gray-500 mt-2">
        Stängt alla söndagar och röda dagar, samt midsommarafton och julafton. Håll muspekaren över en dag för att se
        varför.
      </p>

      <div className="mt-8 mb-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setYear(year - 1)}
          disabled={year <= thisYear - 1}
          className="px-3 text-gray-400 hover:text-white disabled:opacity-30"
          aria-label="Föregående år"
        >
          ‹
        </button>
        <span className="font-semibold">{year}</span>
        <button
          onClick={() => setYear(year + 1)}
          disabled={year >= thisYear + 2}
          className="px-3 text-gray-400 hover:text-white disabled:opacity-30"
          aria-label="Nästa år"
        >
          ›
        </button>
      </div>

      <YearCalendar year={year} today={today} specials={specials} />

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-red-600" /> Stängt
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-amber-500" /> Stänger 15:00
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-emerald-600" /> Öppet till minst 19:00
        </span>
        <span className="flex items-center gap-1">
          <span className="text-gray-500">17</span> Söndag (stängt)
        </span>
      </div>

      <p className="mt-6 text-center text-xs text-gray-600">
        Lokala avvikelser kan förekomma. Källa:{" "}
        <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">
          Systembolagets öppettider under storhelger
        </a>
      </p>
    </section>
  );
};

export default ClosedDays;
