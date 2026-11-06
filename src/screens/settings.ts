import type { Screen } from "../app";
import { sanitizeSettings, SETTING_OPTIONS, type Settings } from "../settings";
import { T } from "../texts";
import { $, toast, topbar } from "../ui/dom";

type NumericKey = keyof typeof SETTING_OPTIONS;

function select(id: NumericKey, value: number, label: (v: number) => string = String): string {
  const opts = SETTING_OPTIONS[id]
    .map((v) => `<option value="${v}"${v === value ? " selected" : ""}>${label(v)}</option>`)
    .join("");
  return `<select id="${id}">${opts}</select>`;
}

function row(id: string, label: string, control: string, hint?: string): string {
  return `<div class="row"><label for="${id}">${label}${hint ? `<small>${hint}</small>` : ""}</label>${control}</div>`;
}

export const settingsScreen: Screen = (ctx) => {
  const s = ctx.settings;
  ctx.root.innerHTML = `
    ${topbar(T.settings.title)}
    <h2 class="section-h">${T.settings.section}</h2>
    <div class="list">
      ${row("secondsPerQ", T.settings.secondsPerQ, select("secondsPerQ", s.secondsPerQ, (v) => (v ? T.settings.seconds(v) : T.settings.noLimit)))}
      ${row("roundSize", T.settings.roundSize, select("roundSize", s.roundSize))}
      ${row("dailyGoal", T.settings.dailyGoal, select("dailyGoal", s.dailyGoal), T.settings.dailyGoalHint)}
      ${row("minTable", T.settings.minTable, select("minTable", s.minTable), T.settings.minTableHint)}
      ${row("maxTable", T.settings.maxTable, select("maxTable", s.maxTable))}
      ${row("sound", T.settings.sound, `<button class="switch" role="switch" id="sound" aria-checked="${s.sound}"></button>`)}
    </div>
    <button class="btn" id="saveSettings">${T.settings.save}</button>`;

  const root = ctx.root;
  const sound = $(root, "#sound");
  sound.addEventListener("click", () => sound.setAttribute("aria-checked", String(sound.getAttribute("aria-checked") !== "true")));

  $(root, "#saveSettings").addEventListener("click", () => {
    const v = (id: NumericKey) => Number($<HTMLSelectElement>(root, `#${id}`).value);
    // sanitized so memory and storage always hold the same, valid settings
    const next: Settings = sanitizeSettings({
      secondsPerQ: v("secondsPerQ"),
      roundSize: v("roundSize"),
      dailyGoal: v("dailyGoal"),
      minTable: v("minTable"),
      maxTable: v("maxTable"),
      sound: sound.getAttribute("aria-checked") === "true",
    });
    ctx.setSettings(next);
    ctx.track(ctx.storage.saveSettings(next));
    toast(T.settings.saved);
  });
};
