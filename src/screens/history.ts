import type { Screen } from "../app";
import { historySummary, lastDays, scoreBand } from "../engine/stats";
import { T } from "../texts";
import { topbar } from "../ui/dom";

const DAYS = 10;
const PX_PER_PCT = 1.8;
const BAND_CLASS = { good: "", mid: " mid", low: " low" } as const;

export const historyScreen: Screen = async (ctx) => {
  const history = await ctx.storage.getHistory();
  if (!ctx.alive()) return;

  const now = ctx.now();
  const days = lastDays(history, now, DAYS);
  const sum = historySummary(history, now, DAYS);

  const bars = days
    .map((d) =>
      d.pct === null
        ? `<div class="col"><span class="v">${T.history.noPractice}</span><div class="b none"></div></div>`
        : `<div class="col"><span class="v num">${d.pct}%</span><div class="b${BAND_CLASS[scoreBand(d.pct)]}" style="height:${Math.max(4, d.pct * PX_PER_PCT)}px"></div></div>`,
    )
    .join("");
  const labels = days
    .map((d, i) =>
      i === days.length - 1
        ? `<span style="color:var(--ink)">${T.history.today}</span>`
        : `<span class="num">${d.date.getDate()}/${d.date.getMonth() + 1}</span>`,
    )
    .join("");

  ctx.root.innerHTML = `
    ${topbar(T.history.title)}
    <div class="chart">
      <div class="bars" role="img" aria-label="${T.history.chartLabel}">${bars}</div>
      <div class="days">${labels}</div>
    </div>
    <div class="stats">
      <div class="stat"><b class="num">${sum.practiceDays}/${DAYS}</b>${T.history.practiceDays}</div>
      <div class="stat"><b class="num">${sum.averagePct}%</b>${T.history.average}</div>
      <div class="stat"><b class="num">${sum.streak}</b>${T.history.streak}</div>
    </div>`;
};
