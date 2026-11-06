/** Totals for one calendar day (all rounds of that day together). */
export interface DayRecord {
  total: number;
  correct: number;
  minutes: number;
}

/** Day records keyed by local date "YYYY-MM-DD". */
export type History = Record<string, DayRecord>;

export const PASS_PCT = 80;
export const MID_PCT = 60;

/** Local calendar date as "YYYY-MM-DD" (not UTC — a late-evening round counts for that evening). */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** The date `n` days before `d` (n may be negative), at local noon to stay clear of DST edges. */
export function daysBefore(d: Date, n: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  out.setDate(out.getDate() - n);
  return out;
}

/** Score in whole percent; 0 when nothing was answered. */
export function scorePct(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export function isPass(pct: number): boolean {
  return pct >= PASS_PCT;
}

/** Colour band for the history chart: green from 80, orange 60–79, red below 60. */
export type ScoreBand = "good" | "mid" | "low";
export function scoreBand(pct: number): ScoreBand {
  return pct >= PASS_PCT ? "good" : pct >= MID_PCT ? "mid" : "low";
}

function practiced(rec: DayRecord | undefined): boolean {
  return !!rec && rec.total > 0;
}

/**
 * Consecutive practice days ending today — or ending yesterday if he hasn't practised yet today,
 * so the streak doesn't look broken in the morning.
 */
export function streak(history: History, today: Date): number {
  let i = practiced(history[dayKey(today)]) ? 0 : 1;
  let n = 0;
  while (practiced(history[dayKey(daysBefore(today, i))])) {
    n++;
    i++;
  }
  return n;
}

/** Exercises done today, for the "X / goal" chip (capped at the goal). */
export function dailyProgress(history: History, today: Date, goal: number): number {
  return Math.min(history[dayKey(today)]?.total ?? 0, goal);
}

/** Adds a finished (or abandoned) round to that day's totals. Returns the new day record. */
export function addRound(
  existing: DayRecord | undefined,
  round: { total: number; correct: number; durationMs: number },
): DayRecord {
  const cur = existing ?? { total: 0, correct: 0, minutes: 0 };
  return {
    total: cur.total + round.total,
    correct: cur.correct + round.correct,
    minutes: cur.minutes + Math.max(1, Math.round(round.durationMs / 60000)),
  };
}

export interface HistoryDay {
  key: string;
  date: Date;
  /** null = no practice that day. */
  pct: number | null;
}

/** The last `n` days, oldest first, ending today. */
export function lastDays(history: History, today: Date, n = 10): HistoryDay[] {
  const out: HistoryDay[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = daysBefore(today, i);
    const key = dayKey(date);
    const rec = history[key];
    out.push({ key, date, pct: practiced(rec) ? scorePct(rec.correct, rec.total) : null });
  }
  return out;
}

/** Stats under the history chart: practice days out of n, average daily score, streak. */
export function historySummary(history: History, today: Date, n = 10) {
  const days = lastDays(history, today, n).filter((d) => d.pct !== null);
  const sum = days.reduce((s, d) => s + (d.pct ?? 0), 0);
  return {
    practiceDays: days.length,
    averagePct: days.length ? Math.round(sum / days.length) : 0,
    streak: streak(history, today),
  };
}
