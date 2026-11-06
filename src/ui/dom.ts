import { T } from "../texts";
import { backIcon } from "./icons";

/** A number shown left-to-right inside RTL text. */
export const num = (v: number | string) => `<span class="num">${v}</span>`;

/** Top bar with a back-to-home button and a title. */
export function topbar(title: string): string {
  return `<div class="topbar"><button class="icon-btn" data-go="home" aria-label="${T.back}">${backIcon}</button><h1 class="title">${title}</h1><span style="width:48px"></span></div>`;
}

let toastTimer: number | undefined;
export function toast(msg: string): void {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove("show"), 1800);
}

/** Typed element lookup inside a root; throws if the markup is wrong (a bug, not a runtime state). */
export function $<E extends Element = HTMLElement>(root: ParentNode, selector: string): E {
  const el = root.querySelector<E>(selector);
  if (!el) throw new Error(`missing element ${selector}`);
  return el;
}
