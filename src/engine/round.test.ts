import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type Settings } from "../settings";
import { multiplication, multiplicationKey } from "./multiplication";
import { seededRng } from "./random";
import { buildRound, nextMistakeCount, pickRound, type Mistakes } from "./round";

const settings = (over: Partial<Settings> = {}): Settings => ({ ...DEFAULT_SETTINGS, ...over });
const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);

function round(over: Partial<Settings> = {}, mistakes: Mistakes = {}, seed = 1) {
  const s = settings(over);
  return buildRound(multiplication, multiplication.pool(s), s.roundSize, mistakes, seededRng(seed));
}

describe("multiplication", () => {
  it("pool has one exercise per unordered pair", () => {
    const pool = multiplication.pool(settings({ minTable: 2, maxTable: 10 }));
    expect(pool).toHaveLength(45); // 9 numbers → 9·10/2
    expect(new Set(pool.map((e) => e.key)).size).toBe(45);
  });

  it("7×8 and 8×7 share a key", () => {
    expect(multiplicationKey(7, 8)).toBe(multiplicationKey(8, 7));
  });

  it("present keeps key and answer, and uses both orders", () => {
    const ex = multiplication.pool(settings({ minTable: 7, maxTable: 8 })).find((e) => e.answer === 56)!;
    const rng = seededRng(3);
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const p = multiplication.present(ex, rng);
      expect(p.key).toBe(ex.key);
      expect(p.answer).toBe(56);
      seen.add(multiplication.format(p));
    }
    expect(seen).toEqual(new Set(["7 × 8", "8 × 7"]));
  });

  it("check accepts only the exact number", () => {
    const ex = { key: multiplicationKey(7, 8), operands: [7, 8], answer: 56 };
    expect(multiplication.check(ex, "56")).toBe(true);
    expect(multiplication.check(ex, " 56 ")).toBe(true);
    expect(multiplication.check(ex, "65")).toBe(false);
    expect(multiplication.check(ex, "")).toBe(false);
    expect(multiplication.check(ex, "5.6e1")).toBe(false);
  });
});

describe("round: no repeats", () => {
  it.each([10, 15, 20, 30, 40])("round of %i has no repeated exercise (2–10)", (size) => {
    for (const seed of SEEDS) {
      const r = round({ roundSize: size }, {}, seed);
      expect(r).toHaveLength(size);
      expect(new Set(r.map((e) => e.key)).size).toBe(size);
    }
  });

  it("no repeats even when most of the pool is weak", () => {
    const pool = multiplication.pool(settings());
    const mistakes: Mistakes = Object.fromEntries(pool.slice(0, 40).map((e) => [e.key, 3]));
    for (const seed of SEEDS) {
      const r = round({ roundSize: 40 }, mistakes, seed);
      expect(new Set(r.map((e) => e.key)).size).toBe(40);
    }
  });

  it("every answer matches its operands", () => {
    for (const e of round({ roundSize: 40, maxTable: 15 })) {
      expect(e.answer).toBe(e.operands[0] * e.operands[1]);
    }
  });
});

describe("round: weak exercises", () => {
  const pool = multiplication.pool(settings()); // 45 exercises
  const weakKeys = pool.slice(0, 20).map((e) => e.key);
  const mistakes: Mistakes = Object.fromEntries(weakKeys.map((k) => [k, 1]));

  it("takes at most 40% of the round from weak exercises", () => {
    for (const seed of SEEDS) {
      const r = pickRound(pool, 20, mistakes, seededRng(seed));
      expect(r.filter((e) => weakKeys.includes(e.key)).length).toBeLessThanOrEqual(8);
    }
  });

  it("does include weak exercises, up to the 40% share", () => {
    for (const seed of SEEDS) {
      const r = pickRound(pool, 20, mistakes, seededRng(seed));
      expect(r.filter((e) => weakKeys.includes(e.key)).length).toBe(8);
    }
  });

  it("prefers the most-missed exercises", () => {
    const m: Mistakes = { ...mistakes, [weakKeys[19]]: 9, [weakKeys[18]]: 7 };
    for (const seed of SEEDS) {
      const keys = pickRound(pool, 10, m, seededRng(seed)).map((e) => e.key);
      expect(keys).toContain(weakKeys[19]);
      expect(keys).toContain(weakKeys[18]);
    }
  });

  it("ignores counters that dropped back to 0", () => {
    const m: Mistakes = Object.fromEntries(pool.map((e) => [e.key, 0]));
    const r = pickRound(pool, 20, m, seededRng(1));
    expect(new Set(r.map((e) => e.key)).size).toBe(20);
  });

  it("weak exercises are mixed in, not all at the start", () => {
    let weakFirstCount = 0;
    for (const seed of SEEDS) {
      const r = pickRound(pool, 20, mistakes, seededRng(seed));
      if (r.slice(0, 8).every((e) => weakKeys.includes(e.key))) weakFirstCount++;
    }
    expect(weakFirstCount).toBeLessThan(5);
  });
});

describe("round: range smaller than round", () => {
  it("repeats only when needed, never twice in a row", () => {
    // 8–10 → 6 exercises, round of 20
    for (const seed of SEEDS) {
      const r = round({ minTable: 8, maxTable: 10, roundSize: 20 } as Partial<Settings>, {}, seed);
      expect(r).toHaveLength(20);
      for (let i = 1; i < r.length; i++) expect(r[i].key).not.toBe(r[i - 1].key);
      // every exercise appears before any appears a second time
      expect(new Set(r.slice(0, 6).map((e) => e.key)).size).toBe(6);
    }
  });

  it("handles a single-exercise pool without hanging", () => {
    const pool = multiplication.pool(settings({ minTable: 3, maxTable: 3 }));
    expect(pickRound(pool, 5, {}, seededRng(1))).toHaveLength(5);
  });

  it("empty pool gives an empty round", () => {
    expect(pickRound([], 10, {}, seededRng(1))).toEqual([]);
  });
});

describe("mistake counter", () => {
  it("goes up on a mistake and down on a correct answer, never below 0", () => {
    expect(nextMistakeCount(undefined, false)).toBe(1);
    expect(nextMistakeCount(2, false)).toBe(3);
    expect(nextMistakeCount(2, true)).toBe(1);
    expect(nextMistakeCount(0, true)).toBe(0);
    expect(nextMistakeCount(undefined, true)).toBe(0);
  });
});
