import type { Settings } from "../settings";
import type { Rng } from "./random";

/** One exercise as shown to the child. */
export interface Exercise {
  /**
   * Identity of the exercise, shared by all its presentations (7×8 and 8×7 have the same key).
   * Used for "no repeats in a round" and for the mistake counters. Prefixed with the type id.
   */
  key: string;
  /** Operands in display order. */
  operands: number[];
  answer: number;
}

/** A kind of exercise (multiplication now; division, fractions… later). */
export interface ExerciseType {
  id: string;
  /** All distinct exercises for the current settings, one per key, in canonical form. */
  pool(settings: Settings): Exercise[];
  /** A random presentation of the exercise (e.g. random operand order). Must keep the same key. */
  present(ex: Exercise, rng: Rng): Exercise;
  /** Text of the question, without "= ?". Displayed left-to-right. */
  format(ex: Exercise): string;
  /** Whether the typed input is the correct answer. */
  check(ex: Exercise, input: string): boolean;
}
