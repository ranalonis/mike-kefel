import type { Screen } from "../app";
import { dailyProgress, dayKey, streak } from "../engine/stats";
import { greeting, T } from "../texts";
import { num } from "../ui/dom";
import { chartIcon, gearIcon } from "../ui/icons";
import { pandaSvg } from "../ui/panda";

export const homeScreen: Screen = async (ctx) => {
  const history = await ctx.storage.getHistory();
  if (!ctx.alive()) return;

  const now = ctx.now();
  const goal = ctx.settings.dailyGoal;
  const happy = (history[dayKey(now)]?.total ?? 0) > 0;
  const s = streak(history, now);

  ctx.root.innerHTML = `
    <div class="topbar"><span></span><button class="icon-btn" data-go="settings" aria-label="${T.home.settings}">${gearIcon}</button></div>
    <h1 class="greet">${greeting(now.getHours())}</h1>
    <div class="today">
      <span class="chip">${T.home.todayLabel} ${num(`${dailyProgress(history, now, goal)}/${goal}`)} ${T.home.exercises}</span>
      <span class="chip">${T.home.streakLabel} ${num(s)} ${T.home.days(s)} 🔥</span>
    </div>
    <div class="start-wrap"><button class="start" data-go="practice">${T.home.start}</button></div>
    <div class="home-bottom">
      <div class="panda-card">${pandaSvg(happy ? "happy" : "worried", happy ? T.home.pandaHappyAlt : T.home.pandaWorriedAlt)}
        <p class="bubble">${happy ? T.home.pandaHappy : T.home.pandaWorried}</p></div>
      <button class="hist-btn" data-go="history">${chartIcon}${T.home.history}</button>
    </div>`;
};
