import { describe, expect, it } from "vitest";
import {
  addRound,
  dailyProgress,
  dayKey,
  daysBefore,
  historySummary,
  isPass,
  lastDays,
  scoreBand,
  scorePct,
  streak,
  type History,
} from "./stats";

const rec = (total = 20, correct = 18) => ({ total, correct, minutes: 5 });
/** History with practice on the given days-ago offsets relative to `today`. */
function hist(today: Date, offsets: number[]): History {
  return Object.fromEntries(offsets.map((n) => [dayKey(daysBefore(today, n)), rec()]));
}

describe("score and 80% threshold", () => {
  it("rounds to whole percent", () => {
    expect(scorePct(16, 20)).toBe(80);
    expect(scorePct(2, 3)).toBe(67);
    expect(scorePct(0, 0)).toBe(0);
  });

  it("80 passes, 79 fails", () => {
    expect(isPass(80)).toBe(true);
    expect(isPass(100)).toBe(true);
    expect(isPass(79)).toBe(false);
    expect(isPass(scorePct(15, 19))).toBe(false); // 78.9 → 79
    expect(isPass(scorePct(31, 39))).toBe(false); // 79.49 → 79
    expect(isPass(scorePct(159, 200))).toBe(true); // 79.5 → shown as 80%, so it passes
  });

  it("chart colour bands", () => {
    expect(scoreBand(80)).toBe("good");
    expect(scoreBand(79)).toBe("mid");
    expect(scoreBand(60)).toBe("mid");
    expect(scoreBand(59)).toBe("low");
  });
});

describe("dayKey", () => {
  it("uses the local date, not UTC", () => {
    expect(dayKey(new Date(2026, 10, 6, 23, 30))).toBe("2026-11-06");
    expect(dayKey(new Date(2026, 10, 6, 0, 15))).toBe("2026-11-06");
  });

  it("daysBefore crosses month and year boundaries", () => {
    expect(dayKey(daysBefore(new Date(2026, 2, 1), 1))).toBe("2026-02-28");
    expect(dayKey(daysBefore(new Date(2027, 0, 1), 1))).toBe("2026-12-31");
  });
});

describe("streak", () => {
  const today = new Date(2026, 10, 6, 9);

  it("counts consecutive days including today", () => {
    expect(streak(hist(today, [0, 1, 2]), today)).toBe(3);
  });

  it("is not broken yet if he hasn't practised today", () => {
    expect(streak(hist(today, [1, 2, 3]), today)).toBe(3);
  });

  it("breaks after a missed day", () => {
    expect(streak(hist(today, [0, 1, 3, 4]), today)).toBe(2);
    expect(streak(hist(today, [2, 3]), today)).toBe(0);
  });

  it("is 0 with no history", () => {
    expect(streak({}, today)).toBe(0);
  });

  it("works across a month boundary", () => {
    const d = new Date(2026, 11, 2, 18); // 2 Dec
    expect(streak(hist(d, [0, 1, 2, 3]), d)).toBe(4); // back to 29 Nov
  });

  it("ignores day records with zero exercises", () => {
    const h = hist(today, [0, 2]);
    h[dayKey(daysBefore(today, 1))] = rec(0, 0);
    expect(streak(h, today)).toBe(1);
  });
});

describe("daily progress and rounds", () => {
  const today = new Date(2026, 10, 6, 9);

  it("adds rounds into the day's totals", () => {
    const a = addRound(undefined, { total: 20, correct: 15, durationMs: 240_000 });
    const b = addRound(a, { total: 10, correct: 10, durationMs: 10_000 });
    expect(b).toEqual({ total: 30, correct: 25, minutes: 5 });
  });

  it("progress is capped at the goal", () => {
    const h: History = { [dayKey(today)]: rec(35, 30) };
    expect(dailyProgress(h, today, 20)).toBe(20);
    expect(dailyProgress(h, today, 40)).toBe(35);
    expect(dailyProgress({}, today, 20)).toBe(0);
  });
});

describe("history (last 10 days)", () => {
  const today = new Date(2026, 10, 6, 9);

  it("returns 10 days oldest first, null for days without practice", () => {
    const h: History = { [dayKey(today)]: rec(20, 15), [dayKey(daysBefore(today, 9))]: rec(10, 10) };
    const days = lastDays(h, today);
    expect(days).toHaveLength(10);
    expect(days[0].key).toBe("2026-10-28");
    expect(days[0].pct).toBe(100);
    expect(days[9].key).toBe("2026-11-06");
    expect(days[9].pct).toBe(75);
    expect(days.slice(1, 9).every((d) => d.pct === null)).toBe(true);
  });

  it("summary: practice days, average of daily scores, streak", () => {
    const h: History = {
      [dayKey(today)]: rec(20, 20), // 100
      [dayKey(daysBefore(today, 1))]: rec(20, 12), // 60
      [dayKey(daysBefore(today, 5))]: rec(20, 16), // 80
      [dayKey(daysBefore(today, 12))]: rec(20, 0), // outside the window
    };
    expect(historySummary(h, today)).toEqual({ practiceDays: 3, averagePct: 80, streak: 2 });
  });

  it("summary of empty history", () => {
    expect(historySummary({}, today)).toEqual({ practiceDays: 0, averagePct: 0, streak: 0 });
  });
});
