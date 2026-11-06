import type { Mistakes } from "../engine/round";
import type { DayRecord, History } from "../engine/stats";
import type { Settings } from "../settings";

/**
 * Where the app keeps its data. Methods are async and record-level (one day, one mistake counter)
 * so a synced implementation (Supabase) can be added later without changing the rest of the code.
 */
export interface Storage {
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;

  getHistory(): Promise<History>;
  saveDay(dayKey: string, record: DayRecord): Promise<void>;

  getMistakes(): Promise<Mistakes>;
  saveMistake(exerciseKey: string, count: number): Promise<void>;
}
