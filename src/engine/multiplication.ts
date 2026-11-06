import type { Exercise, ExerciseType } from "./types";

const ID = "mul";

export function multiplicationKey(a: number, b: number): string {
  return `${ID}:${Math.min(a, b)}x${Math.max(a, b)}`;
}

export const multiplication: ExerciseType = {
  id: ID,

  pool({ minTable, maxTable }) {
    const out: Exercise[] = [];
    for (let a = minTable; a <= maxTable; a++) {
      for (let b = a; b <= maxTable; b++) {
        out.push({ key: multiplicationKey(a, b), operands: [a, b], answer: a * b });
      }
    }
    return out;
  },

  present(ex, rng) {
    const [a, b] = ex.operands;
    return rng() < 0.5 ? { ...ex, operands: [a, b] } : { ...ex, operands: [b, a] };
  },

  format(ex) {
    return ex.operands.join(" × ");
  },

  check(ex, input) {
    const s = input.trim();
    return /^\d+$/.test(s) && Number(s) === ex.answer;
  },
};
