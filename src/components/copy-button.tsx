"use client";

import { useRef, useState } from "react";

/** Copies text to the clipboard and says so for two seconds. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Older browsers and pages without clipboard permission: fall back to a hidden text box.
      const box = document.createElement("textarea");
      box.value = text;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      box.remove();
    }
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button type="button" className="btn-primary" onClick={copy}>
      <span aria-live="polite">
        {state === "copied" ? "Copied" : state === "failed" ? "Could not copy. Select the text below." : label}
      </span>
    </button>
  );
}
