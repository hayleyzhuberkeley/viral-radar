"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { GuideStep } from "@/lib/guide";

const KEY = "viral-radar:guide-hidden";

// The "hidden" choice lives in the browser. Reading it through
// useSyncExternalStore keeps the server and the first client render in step.
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function readHidden() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function setHidden(hidden: boolean) {
  try {
    if (hidden) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    // Private windows can refuse storage. The guide then simply stays open.
  }
  listeners.forEach((listener) => listener());
}

/**
 * The workflow as numbered steps. Open for new users, and until every step is
 * done. Can be hidden and brought back.
 */
export function Guide({ steps }: { steps: GuideStep[] }) {
  const hidden = useSyncExternalStore(subscribe, readHidden, () => false);
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const current = steps.findIndex((s) => !s.done);

  if (hidden || allDone) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        className={`mt-6 text-sm text-muted underline underline-offset-4 hover:text-foreground ${allDone && !hidden ? "hidden" : ""}`}
      >
        Show how it works ({doneCount} of {steps.length} steps done)
      </button>
    );
  }

  return (
    <section aria-labelledby="guide-title" className="card mt-6" data-testid="guide">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="guide-title" className="text-base font-semibold">
            How it works
          </h2>
          <p className="mt-1 text-sm text-muted">
            Four steps, from a video you spotted to a brief your creative team can use.{" "}
            <span className="font-mono text-foreground">
              {doneCount} of {steps.length}
            </span>{" "}
            done.
          </p>
        </div>
        <button type="button" onClick={() => setHidden(true)} className="btn-quiet">
          Hide
        </button>
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const isCurrent = index === current;
          return (
            <li
              key={step.title}
              aria-current={isCurrent ? "step" : undefined}
              data-done={step.done}
              className={`flex flex-col gap-2 rounded-md border p-3 ${isCurrent ? "border-accent" : "border-border"}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                    step.done ? "bg-accent text-accent-ink" : isCurrent ? "border border-accent text-accent" : "border border-border text-muted"
                  }`}
                  aria-hidden
                >
                  {step.done ? "✓" : index + 1}
                </span>
                <h3 className="text-sm font-semibold">
                  {step.title}
                  <span className="sr-only">{step.done ? " (done)" : isCurrent ? " (next)" : ""}</span>
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-muted">{step.why}</p>
              {!step.done && (
                <Link href={step.href} className={`mt-auto self-start ${isCurrent ? "btn-primary" : "btn-quiet"}`}>
                  {step.action}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
