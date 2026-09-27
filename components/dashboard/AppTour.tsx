"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type TourStep = {
  id: string;
  title: string;
  description: string;
  /**
   * data-tour id of an element to click first if `id` isn't on the page yet —
   * e.g. a drawer/sheet trigger that must be opened before its contents mount.
   */
  openTrigger?: string;
};

type Rect = { top: number; left: number; width: number; height: number };

const PADDING = 8;

// Components that gate content behind an uncontrolled open state (Vaul
// drawers, Radix dialogs) can opt in to being opened reliably by the tour —
// listen for this event and flip your own `open` state when `detail.id`
// matches your data-tour id, instead of relying on a synthetic click/tap.
export const TOUR_OPEN_TRIGGER_EVENT = "apptour:open-trigger";

export default function AppTour({
  steps,
  storageKey,
  ready,
  open,
  onOpenChange,
}: {
  steps: TourStep[];
  storageKey: string;
  ready: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const autoStarted = useRef(false);

  // Auto-start once, the first time the target content is ready.
  useEffect(() => {
    if (autoStarted.current || !ready || steps.length === 0) return;
    autoStarted.current = true;
    if (!localStorage.getItem(storageKey)) {
      onOpenChange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, steps.length, storageKey]);

  // True while this step opened a drawer/sheet on our behalf, so we know to
  // close it again when the user moves off this step.
  const autoOpened = useRef(false);

  // Every time the tour opens — auto-start or a manual "Take a tour" replay
  // — start clean: step 1, and no stale "we opened a drawer" flag left over
  // from an earlier run that was dismissed via Skip/X (which never clears
  // it, since only Done is supposed to close an auto-opened drawer).
  useEffect(() => {
    if (open) {
      setStepIndex(0);
      autoOpened.current = false;
    }
  }, [open]);

  const finish = () => {
    localStorage.setItem(storageKey, "1");
    onOpenChange(false);
  };

  // Some steps have both a desktop and mobile element sharing the same
  // data-tour id (e.g. TradingPanel vs. PlacePositionDrawer's trigger) —
  // only one is actually laid out at a time, so pick whichever renders
  // with real dimensions instead of always taking the first DOM match.
  const findVisible = (id: string) => {
    const candidates = document.querySelectorAll<HTMLElement>(
      `[data-tour="${id}"]`,
    );
    return Array.from(candidates).find((c) => {
      const r = c.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  };

  // Locate the current step's target, skipping steps whose element isn't on the page.
  useEffect(() => {
    if (!open) return;
    let cleanupTracking: (() => void) | undefined;

    const track = (initialEl: HTMLElement, id: string) => {
      let current = initialEl;
      // Recompute position only — must never itself trigger a scroll, or it
      // re-fires the scroll listener below and fights scrollIntoView mid-animation.
      const update = () => {
        // A refetch/re-render elsewhere in the tree (wallet balance polling,
        // etc.) can replace this node rather than just update it in place —
        // re-locate instead of reporting a stale, detached 0x0 rect.
        if (!current.isConnected) {
          const fresh = findVisible(id);
          if (!fresh) return;
          current = fresh;
        }
        const r = current.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      };
      update();
      current.scrollIntoView({ behavior: "smooth", block: "center" });
      const t = setTimeout(update, 400); // catch the final position once smooth-scroll settles
      window.addEventListener("resize", update);
      window.addEventListener("scroll", update, true);
      cleanupTracking = () => {
        clearTimeout(t);
        window.removeEventListener("resize", update);
        window.removeEventListener("scroll", update, true);
      };
    };

    const skipOrFinish = () => {
      if (stepIndex < steps.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        finish();
      }
    };

    const step = steps[stepIndex];
    if (!step) {
      finish();
      return;
    }

    const el = findVisible(step.id);
    if (el) {
      track(el, step.id);
    } else if (step.openTrigger) {
      const trigger = findVisible(step.openTrigger);
      if (!trigger) {
        skipOrFinish();
      } else {
        autoOpened.current = true;
        // Ask the target component to open itself via React state (see
        // TOUR_OPEN_TRIGGER_EVENT docs below). Deliberately NOT also
        // simulating a click on `trigger` here: once the component is open
        // (from this event), a second click on its real trigger reads as a
        // toggle to Radix/Vaul — which closes it again, and the next retry
        // reopens it, and so on. One mechanism only.
        const openTargets = () => {
          document.dispatchEvent(
            new CustomEvent(TOUR_OPEN_TRIGGER_EVENT, {
              detail: { id: step.openTrigger },
            }),
          );
        };
        openTargets();
        let attempts = 0;
        const poll = setInterval(() => {
          attempts += 1;
          const found = findVisible(step.id);
          if (found) {
            clearInterval(poll);
            track(found, step.id);
            return;
          }
          if (attempts >= 30) {
            clearInterval(poll);
            skipOrFinish();
            return;
          }
          if (attempts % 3 === 0) openTargets();
        }, 100);
        cleanupTracking = () => clearInterval(poll);
      }
    } else {
      skipOrFinish();
    }

    return () => {
      cleanupTracking?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex, steps]);

  // Only close a drawer/sheet we auto-opened when the user explicitly hits
  // Done — not on Back/Next/Skip, and not as a side-effect of re-renders.
  const closeAutoOpenedDrawer = () => {
    if (autoOpened.current) {
      autoOpened.current = false;
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    }
  };

  if (!open || !rect) return null;

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const spotlightStyle: React.CSSProperties = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  // Prefer placing the tooltip below the target; flip above if there isn't room.
  const spaceBelow = window.innerHeight - (rect.top + rect.height);
  const placeAbove = spaceBelow < 200;
  const tooltipTop = placeAbove
    ? Math.max(16, rect.top - PADDING - 12)
    : rect.top + rect.height + PADDING + 12;
  const tooltipLeft = Math.min(
    Math.max(16, rect.left),
    window.innerWidth - 336,
  );

  return createPortal(
    <>
      <div
        className="fixed z-200 rounded-2xl border-2 border-blue-500 pointer-events-none transition-all duration-300"
        style={{
          ...spotlightStyle,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
        }}
      />
      <div
        className="fixed z-201 w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-2xl transition-all duration-300"
        style={{
          top: placeAbove ? undefined : tooltipTop,
          bottom: placeAbove
            ? window.innerHeight - tooltipTop
            : undefined,
          left: tooltipLeft,
          // Vaul sets `pointer-events: none` on <body> while its drawer is
          // open (to trap interaction inside it) and it inherits down —
          // reassert auto so the tour's own buttons stay clickable.
          pointerEvents: "auto",
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Step {stepIndex + 1} of {steps.length}
          </span>
          <button
            onClick={finish}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-white font-bold text-base mb-1.5">
          {step.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-5">
          {step.description}
        </p>
        <div className="flex items-center justify-between">
          <button
            onClick={finish}
            className="text-xs font-bold text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                onClick={() => setStepIndex((i) => i - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) {
                  closeAutoOpenedDrawer();
                  finish();
                } else {
                  setStepIndex((i) => i + 1);
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
