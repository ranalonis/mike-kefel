import type { Settings } from "./settings";
import type { Storage } from "./storage/Storage";
import { homeScreen } from "./screens/home";
import { practiceScreen } from "./screens/practice";
import { summaryScreen } from "./screens/summary";
import { historyScreen } from "./screens/history";
import { settingsScreen } from "./screens/settings";

export type ScreenName = "home" | "practice" | "summary" | "history" | "settings";

export interface RoundResult {
  correct: number;
  total: number;
}

export interface ScreenContext {
  root: HTMLElement;
  storage: Storage;
  settings: Settings;
  setSettings(s: Settings): void;
  go(name: ScreenName, params?: unknown): void;
  /** Register a pending write; the next screen waits for it before reading. */
  track(p: Promise<unknown>): void;
  /** False once the user has navigated away from this screen (check after every await). */
  alive(): boolean;
  now(): Date;
}

export type Cleanup = () => void;
export type Screen = (ctx: ScreenContext, params?: unknown) => Promise<Cleanup | void> | Cleanup | void;

const SCREENS: Record<ScreenName, Screen> = {
  home: homeScreen,
  practice: practiceScreen,
  summary: summaryScreen,
  history: historyScreen,
  settings: settingsScreen,
};

export function startApp(root: HTMLElement, storage: Storage, initialSettings: Settings): void {
  let settings = initialSettings;
  let cleanup: Cleanup | null = null;
  let navId = 0;
  let pending: Promise<unknown> = Promise.resolve();

  async function go(name: ScreenName, params?: unknown): Promise<void> {
    const prev = cleanup;
    cleanup = null;
    prev?.(); // stops timers/listeners and may register a final write
    const id = ++navId;
    await pending;
    if (id !== navId) return;

    const ctx: ScreenContext = {
      root,
      storage,
      get settings() {
        return settings;
      },
      setSettings: (s) => {
        settings = s;
      },
      go: (n, p) => void go(n, p),
      track: (p) => {
        pending = Promise.all([pending, p]).catch((e) => console.error(e));
      },
      alive: () => id === navId,
      now: () => new Date(),
    };
    window.scrollTo(0, 0);
    const c = await SCREENS[name](ctx, params);
    if (id !== navId) c?.(); // navigated away while it was rendering
    else cleanup = c ?? null;
  }

  root.addEventListener("click", (e) => {
    const target = (e.target as Element).closest<HTMLElement>("[data-go]");
    if (target) void go(target.dataset.go as ScreenName);
  });

  void go("home");
}
