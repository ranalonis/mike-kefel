import type { RoundResult, Screen } from "../app";
import { multiplication } from "../engine/multiplication";
import { defaultRng, randInt } from "../engine/random";
import { buildRound, nextMistakeCount } from "../engine/round";
import { addRound, dayKey } from "../engine/stats";
import { T } from "../texts";
import { $, num, topbar } from "../ui/dom";
import { beep } from "../ui/sound";

const SHOW_CORRECT_MS = 800;
const SHOW_WRONG_MS = 1800;
const LOW_TIME_FRACTION = 0.3;

export const practiceScreen: Screen = async (ctx) => {
  const { storage, settings } = ctx;
  const type = multiplication;
  const mistakes = await storage.getMistakes();
  if (!ctx.alive()) return;

  const round = buildRound(type, type.pool(settings), settings.roundSize, mistakes, defaultRng);
  const total = round.length;
  if (total === 0) return ctx.go("home");
  const maxDigits = Math.max(3, ...round.map((e) => String(e.answer).length));
  const limitMs = settings.secondsPerQ * 1000;
  const startedAt = Date.now();

  let n = 0; // index of the current exercise = number answered so far
  let correct = 0;
  let input = "";
  let locked = false;
  let saved = false;
  let deadline = 0;
  let tick: number | undefined;
  let advance: number | undefined;

  ctx.root.innerHTML = `
    ${topbar(T.practice.title)}
    <div class="progress" aria-label="${T.practice.progress}"><i style="width:0%"></i></div>
    <div class="exercise num" aria-live="polite"></div>
    <div class="answer num"></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="keypad">
      ${[7, 8, 9, 4, 5, 6, 1, 2, 3].map((d) => `<button class="key" data-k="${d}">${d}</button>`).join("")}
      <button class="key" data-k="del" aria-label="${T.practice.delete}">⌫</button>
      <button class="key" data-k="0">0</button>
      <button class="key go" data-k="ok">${T.practice.check}</button>
    </div>
    ${limitMs ? `<div class="timer"><span class="t num"></span><div class="bar"><i style="width:100%"></i></div><span>${T.practice.seconds}</span></div>` : ""}`;

  const root = ctx.root;
  const el = {
    progress: $(root, ".progress > i"),
    exercise: $(root, ".exercise"),
    answer: $(root, ".answer"),
    feedback: $(root, ".feedback"),
    timerText: limitMs ? $(root, ".timer .t") : null,
    bar: limitMs ? $(root, ".timer .bar") : null,
  };

  const showInput = () => (el.answer.innerHTML = input || "&nbsp;");

  function showQuestion(): void {
    const ex = round[n];
    input = "";
    locked = false;
    el.exercise.textContent = `${type.format(ex)} = ?`;
    el.answer.className = "answer num";
    showInput();
    el.feedback.innerHTML = T.practice.exerciseOf(num(n + 1), num(total));
    startTimer();
  }

  function startTimer(): void {
    clearInterval(tick);
    if (!limitMs) return;
    deadline = Date.now() + limitMs;
    const update = () => {
      if (locked) return;
      const left = Math.max(0, deadline - Date.now());
      const frac = left / limitMs;
      el.timerText!.textContent = String(Math.ceil(left / 1000));
      (el.bar!.firstElementChild as HTMLElement).style.width = `${frac * 100}%`;
      el.bar!.classList.toggle("low", frac < LOW_TIME_FRACTION);
      if (left <= 0) submit(true);
    };
    update();
    tick = window.setInterval(update, 100);
  }

  function submit(timeout: boolean): void {
    if (locked) return;
    locked = true;
    clearInterval(tick);
    const ex = round[n];
    const ok = !timeout && type.check(ex, input);

    mistakes[ex.key] = nextMistakeCount(mistakes[ex.key], ok);
    ctx.track(storage.saveMistake(ex.key, mistakes[ex.key]));
    if (settings.sound) beep(ok);

    if (ok) {
      correct++;
      el.answer.classList.add("ok");
      el.feedback.textContent = T.practice.praise[randInt(defaultRng, 0, T.practice.praise.length - 1)];
    } else {
      el.answer.classList.add("bad");
      el.answer.innerHTML = String(ex.answer);
      el.feedback.innerHTML = `${timeout ? T.practice.timeUp : T.practice.almost} ${num(`${type.format(ex)} = ${ex.answer}`)}`;
    }

    n++;
    el.progress.style.width = `${(n / total) * 100}%`;
    advance = window.setTimeout(() => (n >= total ? finish() : showQuestion()), ok ? SHOW_CORRECT_MS : SHOW_WRONG_MS);
  }

  /** Adds the answered part of the round to today's record (once). */
  function saveRound(): void {
    if (saved || n === 0) return;
    saved = true;
    const key = dayKey(ctx.now());
    const result = { total: n, correct, durationMs: Date.now() - startedAt };
    ctx.track(storage.getHistory().then((h) => storage.saveDay(key, addRound(h[key], result))));
  }

  function finish(): void {
    saveRound();
    const result: RoundResult = { correct, total: n };
    ctx.go("summary", result);
  }

  function press(k: string): void {
    if (locked) return;
    if (k === "ok") {
      if (input) submit(false);
      return;
    }
    if (k === "del") input = input.slice(0, -1);
    else if (input.length < maxDigits) input += k;
    showInput();
  }

  $(root, ".keypad").addEventListener("click", (e) => {
    const key = (e.target as Element).closest<HTMLElement>("[data-k]");
    if (key) press(key.dataset.k!);
  });

  const onKey = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === "Backspace") press("del");
    else if (e.key === "Enter") {
      e.preventDefault(); // don't also "click" a focused button
      press("ok");
    }
  };
  document.addEventListener("keydown", onKey);

  showQuestion();

  return () => {
    clearInterval(tick);
    clearTimeout(advance);
    document.removeEventListener("keydown", onKey);
    saveRound(); // leaving mid-round still counts what was answered
  };
};
