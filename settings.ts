export interface Settings {
  /** Seconds per exercise; 0 = no limit. */
  secondsPerQ: number;
  /** Exercises in each round. */
  roundSize: number;
  /** Exercises per day for the home-screen goal (separate from roundSize). */
  dailyGoal: number;
  minTable: number;
  maxTable: number;
  sound: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  secondsPerQ: 10,
  roundSize: 20,
  dailyGoal: 20,
  minTable: 2,
  maxTable: 10,
  sound: true,
};

/** Allowed values for each numeric setting (the settings screen offers exactly these). */
export const SETTING_OPTIONS = {
  secondsPerQ: [5, 8, 10, 15, 20, 0],
  roundSize: [10, 15, 20, 30, 40],
  dailyGoal: [10, 20, 30, 40, 60],
  minTable: [1, 2, 3],
  maxTable: [10, 12, 15],
} as const satisfies Record<string, readonly number[]>;

type NumericKey = keyof typeof SETTING_OPTIONS;

/** Keeps only known keys with allowed values; anything else falls back to the default. */
export function sanitizeSettings(raw: unknown): Settings {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: Settings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(SETTING_OPTIONS) as NumericKey[]) {
    const v = src[key];
    if (typeof v === "number" && (SETTING_OPTIONS[key] as readonly number[]).includes(v)) out[key] = v;
  }
  if (typeof src.sound === "boolean") out.sound = src.sound;
  return out;
}
