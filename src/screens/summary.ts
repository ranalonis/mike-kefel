import type { RoundResult, Screen } from "../app";
import { isPass, scorePct } from "../engine/stats";
import { T } from "../texts";
import { num, topbar } from "../ui/dom";
import dadHappy from "../assets/dad-happy.jpg";
import dadSad from "../assets/dad-sad.jpg";

function isResult(p: unknown): p is RoundResult {
  const r = p as RoundResult | undefined;
  return !!r && typeof r.correct === "number" && typeof r.total === "number" && r.total > 0;
}

export const summaryScreen: Screen = (ctx, params) => {
  if (!isResult(params)) return ctx.go("home");
  const pct = scorePct(params.correct, params.total);
  const pass = isPass(pct);

  ctx.root.innerHTML = `
    ${topbar(T.summary.title)}
    <div class="dad${pass ? "" : " sad"}"><img src="${pass ? dadHappy : dadSad}" alt="${pass ? T.summary.dadHappyAlt : T.summary.dadSadAlt}"></div>
    <p class="dad-say">${pass ? T.summary.pass : T.summary.fail}</p>
    <p class="big-score num">${pct}%</p>
    <p class="center">${T.summary.correctOf(num(params.correct), num(params.total))}</p>
    <button class="btn" data-go="practice">${pass ? T.summary.again : T.summary.retry}</button>
    <button class="btn ghost" data-go="home">${T.summary.home}</button>`;
};
