import { Check } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

export interface CopyEvent {
  id: number;
  label: string;
  /** Short, safe-to-show preview of the copied value. Empty when it shouldn't be shown. */
  preview: string;
  from: Element | null;
}

const EASE_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const EASE_IN = "cubic-bezier(0.5, 0, 0.8, 0.3)";
const FLIGHT_MS = 560;
const HOLD_MS = 2400;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A small chip leaves the copy button and arcs into the tray. X and Y run on
 * different curves (on nested elements) so the path bends instead of sliding
 * in a straight line. Only transform and opacity animate.
 */
function fly(from: Element, to: HTMLElement, text: string, offsetY: number, onLand: () => void) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  if (!a.width && !a.height) return;

  const outer = document.createElement("div");
  const inner = document.createElement("div");
  outer.className = "copy-flight";
  inner.className = "copy-flight-chip glass-pop";
  inner.textContent = text;
  outer.appendChild(inner);
  document.body.appendChild(outer);

  const w = outer.offsetWidth;
  const h = outer.offsetHeight;
  const sx = a.left + a.width / 2 - w / 2;
  const sy = a.top + a.height / 2 - h / 2;
  const tx = b.left + b.width / 2 - w / 2;
  const ty = b.top + b.height / 2 - h / 2 - offsetY;

  outer.animate(
    [{ transform: `translateX(${sx}px)` }, { transform: `translateX(${tx}px)` }],
    { duration: FLIGHT_MS, easing: EASE_OUT, fill: "both" },
  );
  const move = inner.animate(
    [
      { transform: `translateY(${sy}px) scale(1)`, opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.12 },
      { opacity: 1, offset: 0.7 },
      { transform: `translateY(${ty}px) scale(0.35)`, opacity: 0, offset: 1 },
    ],
    { duration: FLIGHT_MS, easing: EASE_IN, fill: "both" },
  );
  const done = () => {
    outer.remove();
    onLand();
  };
  move.onfinish = done;
  move.oncancel = () => outer.remove();
}

export function ClipboardTray({ event }: { event: CopyEvent | null }) {
  const [visible, setVisible] = useState(false);
  const wasVisible = useRef(false);
  const iconRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!event) return;
    const icon = iconRef.current;
    if (event.from && icon && !prefersReducedMotion()) {
      // While hidden the tray sits 12px low; aim for where the icon will settle.
      const offset = wasVisible.current ? 0 : 12;
      fly(event.from, icon, event.preview || event.label, offset, () => {
        icon.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.22)" }, { transform: "scale(1)" }],
          { duration: 320, easing: EASE_OUT },
        );
      });
    }
    wasVisible.current = true;
    setVisible(true);
    const t = setTimeout(() => {
      wasVisible.current = false;
      setVisible(false);
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [event]);

  return (
    <div role="status" aria-live="polite" data-visible={visible} className="clipboard-tray glass-pop">
      <span
        ref={iconRef}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success text-primary-foreground"
      >
        <Check className="h-5 w-5" strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-heading">
          {event ? `Copied ${event.label}` : "Copied"}
        </div>
        {event?.preview ? (
          <div className="type-meta truncate text-muted-foreground">{event.preview}</div>
        ) : null}
      </div>
    </div>
  );
}
