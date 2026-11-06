import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../settings";
import { LocalStorage, type KeyValueStore } from "./LocalStorage";

class MemoryStore implements KeyValueStore {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}

describe("LocalStorage", () => {
  it("returns defaults and empty data on first run (no demo data)", async () => {
    const s = new LocalStorage(new MemoryStore());
    expect(await s.getSettings()).toEqual(DEFAULT_SETTINGS);
    expect(await s.getHistory()).toEqual({});
    expect(await s.getMistakes()).toEqual({});
  });

  it("round-trips settings", async () => {
    const s = new LocalStorage(new MemoryStore());
    const next = { ...DEFAULT_SETTINGS, secondsPerQ: 0, roundSize: 30, dailyGoal: 60, sound: false };
    await s.saveSettings(next);
    expect(await s.getSettings()).toEqual(next);
  });

  it("replaces invalid or unknown setting values with defaults", async () => {
    const kv = new MemoryStore();
    kv.setItem("mk_settings", JSON.stringify({ secondsPerQ: 7, roundSize: 30, maxTable: "12", phone: "050", sound: "yes" }));
    const s = await new LocalStorage(kv).getSettings();
    expect(s).toEqual({ ...DEFAULT_SETTINGS, roundSize: 30 });
    expect(s).not.toHaveProperty("phone");
  });

  it("saves day records independently", async () => {
    const s = new LocalStorage(new MemoryStore());
    await s.saveDay("2026-11-05", { total: 20, correct: 17, minutes: 6 });
    await s.saveDay("2026-11-06", { total: 10, correct: 10, minutes: 2 });
    await s.saveDay("2026-11-06", { total: 30, correct: 28, minutes: 8 });
    expect(await s.getHistory()).toEqual({
      "2026-11-05": { total: 20, correct: 17, minutes: 6 },
      "2026-11-06": { total: 30, correct: 28, minutes: 8 },
    });
  });

  it("drops prototype demo days and malformed records", async () => {
    const kv = new MemoryStore();
    kv.setItem(
      "mk_history",
      JSON.stringify({
        "2026-11-01": { total: 20, correct: 18, minutes: 6, demo: true },
        "2026-11-02": { total: 20, correct: 25, minutes: 6 },
        "not-a-date": { total: 20, correct: 10, minutes: 6 },
        "2026-11-03": { total: 20, correct: 15, minutes: 6 },
      }),
    );
    expect(await new LocalStorage(kv).getHistory()).toEqual({ "2026-11-03": { total: 20, correct: 15, minutes: 6 } });
  });

  it("stores mistake counters and removes them at 0", async () => {
    const s = new LocalStorage(new MemoryStore());
    await s.saveMistake("mul:7x8", 2);
    await s.saveMistake("mul:6x9", 1);
    await s.saveMistake("mul:6x9", 0);
    expect(await s.getMistakes()).toEqual({ "mul:7x8": 2 });
  });

  it("survives corrupt JSON and a throwing store", async () => {
    const kv = new MemoryStore();
    kv.setItem("mk_history", "{oops");
    expect(await new LocalStorage(kv).getHistory()).toEqual({});

    const throwing: KeyValueStore = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    const s = new LocalStorage(throwing);
    await expect(s.saveDay("2026-11-06", { total: 1, correct: 1, minutes: 1 })).resolves.toBeUndefined();
    expect(await s.getSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
