import { shuffle, type Rng } from "./random";
import type { Exercise, ExerciseType } from "./types";

/** Mistake counter per exercise key. > 0 means "weak". */
export type Mistakes = Record<string, number>;

/** Maximum share of a round taken from previously-missed exercises. */
export const WEAK_SHARE = 0.4;

/**
 * Picks the exercises for a round, in canonical form (before presentation).
 *
 * Rules:
 * - No exercise appears twice, as long as the pool is at least as large as the round.
 * - Up to 40% of the round comes from weak exercises (mistake counter > 0), most-missed first.
 *   Weak exercises beyond that share are used only when there are not enough others.
 * - If the pool is smaller than the round, it is repeated in fresh shuffles,
 *   never with the same exercise twice in a row.
 */
export function pickRound(pool: Exercise[], length: number, mistakes: Mistakes, rng: Rng): Exercise[] {
  if (pool.length === 0 || length <= 0) return [];

  const shuffled = shuffle([...pool], rng);
  const count = (e: Exercise) => mistakes[e.key] ?? 0;
  // stable sort keeps the random order among equal counts
  const weak = shuffled.filter((e) => count(e) > 0).sort((x, y) => count(y) - count(x));
  const rest = shuffled.filter((e) => count(e) <= 0);

  const nWeak = Math.min(weak.length, Math.floor(length * WEAK_SHARE));
  const round = shuffle([...weak.slice(0, nWeak), ...rest, ...weak.slice(nWeak)].slice(0, length), rng);

  // Small range: refill with further shuffles of the whole pool.
  while (round.length < length) {
    const next = shuffle([...pool], rng);
    if (next.length > 1 && next[0].key === round[round.length - 1].key) {
      [next[0], next[1]] = [next[1], next[0]];
    }
    round.push(...next.slice(0, length - round.length));
  }
  return round;
}

/** Builds a complete round, ready to show: picked up front, each with a random presentation. */
export function buildRound(
  type: ExerciseType,
  pool: Exercise[],
  length: number,
  mistakes: Mistakes,
  rng: Rng,
): Exercise[] {
  return pickRound(pool, length, mistakes, rng).map((e) => type.present(e, rng));
}

/** New mistake counter after an answer: +1 on a mistake, −1 on a correct answer, never below 0. */
export function nextMistakeCount(current: number | undefined, correct: boolean): number {
  const c = current ?? 0;
  return correct ? Math.max(0, c - 1) : c + 1;
}
