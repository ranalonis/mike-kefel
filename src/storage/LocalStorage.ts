import type { Mistakes } from "../engine/round";
import type { DayRecord, History } from "../engine/stats";
import { sanitizeSettings, type Settings } from "../settings";
import type { Storage } from "./Storage";

/** The subset of the browser's Web Storage this class needs (injectable for tests). */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const KEYS = {
  settings: "mk_settings",
  history: "mk_history",
  mistakes: "mk_mistakes",
} as const;

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

/** Storage in the browser's localStorage. Corrupt or unexpected data is ignored, never thrown. */
export class LocalStorage implements Storage {
  private readonly kv: KeyValueStore | null;

  constructor(kv?: KeyValueStore) {
    this.kv = kv ?? LocalStorage.browserStore();
  }

  private static browserStore(): KeyValueStore | null {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null; // access can throw when site data is blocked
    }
  }

  private read(key: string): unknown {
    try {
      const v = this.kv?.getItem(key);
      return v ? JSON.parse(v) : undefined;
    } catch {
      return undefined;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      this.kv?.setItem(key, JSON.stringify(value));
    } catch {
      // quota full or storage blocked: the app keeps working for this session
    }
  }

  async getSettings(): Promise<Settings> {
    return sanitizeSettings(this.read(KEYS.settings));
  }

  async saveSettings(settings: Settings): Promise<void> {
    this.write(KEYS.settings, sanitizeSettings(settings));
  }

  async getHistory(): Promise<History> {
    const raw = this.read(KEYS.history);
    const out: History = {};
    if (!raw || typeof raw !== "object") return out;
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (!DAY_KEY.test(k) || !v || typeof v !== "object") continue;
      const r = v as Record<string, unknown>;
      if ("demo" in r) continue; // prototype demo data is never real practice
      if (isCount(r.total) && isCount(r.correct) && r.correct <= r.total) {
        out[k] = { total: r.total, correct: r.correct, minutes: isCount(r.minutes) ? r.minutes : 0 };
      }
    }
    return out;
  }

  async saveDay(dayKey: string, record: DayRecord): Promise<void> {
    const history = await this.getHistory();
    history[dayKey] = record;
    this.write(KEYS.history, history);
  }

  async getMistakes(): Promise<Mistakes> {
    const raw = this.read(KEYS.mistakes);
    const out: Mistakes = {};
    if (!raw || typeof raw !== "object") return out;
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (isCount(v) && v > 0) out[k] = v;
    }
    return out;
  }

  async saveMistake(exerciseKey: string, count: number): Promise<void> {
    const mistakes = await this.getMistakes();
    if (count > 0) mistakes[exerciseKey] = count;
    else delete mistakes[exerciseKey];
    this.write(KEYS.mistakes, mistakes);
  }
}
