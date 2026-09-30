import { flushSync } from "react-dom";

// Shared-element morph between a record card and its edit dialog, built on the
// View Transitions API. Browsers without it (or users who prefer reduced
// motion) simply get the normal dialog behaviour.

const NAME = "record-morph";
let busy = false;

interface ViewTransitionLike {
  finished: Promise<unknown>;
}
type StartViewTransition = (update: () => Promise<void> | void) => ViewTransitionLike;

function starter(): StartViewTransition | null {
  if (typeof document === "undefined") return null;
  const fn = (document as unknown as { startViewTransition?: StartViewTransition }).startViewTransition;
  return fn ? fn.bind(document) : null;
}

export function canMorph(): boolean {
  if (busy || typeof window === "undefined") return false;
  if (!starter()) return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Rendering is paused while the new state is captured, so requestAnimationFrame
// would never fire here; a short timer lets effects settle instead.
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 24));

function clear(el: HTMLElement) {
  el.style.removeProperty("view-transition-name");
}

/** Card -> dialog. The card carries the shared name in the "old" snapshot. */
export function morphOpen(card: HTMLElement | null, update: () => void): void {
  const start = starter();
  if (!card || !start || !canMorph()) {
    update();
    return;
  }
  busy = true;
  card.style.setProperty("view-transition-name", NAME);
  const vt = start(async () => {
    clear(card);
    flushSync(update);
    await settle();
  });
  vt.finished.catch(() => undefined).finally(() => {
    busy = false;
    clear(card);
  });
}

/** Dialog -> card. The dialog already carries the name via `.morph-dialog`. */
export function morphClose(card: HTMLElement | null, update: () => void): void {
  const start = starter();
  if (!card || !start || !canMorph()) {
    update();
    return;
  }
  busy = true;
  const vt = start(async () => {
    flushSync(update);
    card.style.setProperty("view-transition-name", NAME);
    await settle();
  });
  vt.finished.catch(() => undefined).finally(() => {
    busy = false;
    clear(card);
  });
}
