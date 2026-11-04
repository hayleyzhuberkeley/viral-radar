"use client";

import { useOptimistic, useTransition } from "react";
import { setStar } from "@/app/formats/actions";

/** One tap to star or unstar. Fills in immediately, then saves. */
export function StarButton({ formatId, name, starred }: { formatId: number; name: string; starred: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(starred);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={optimistic}
      aria-label={optimistic ? `Unstar ${name}` : `Star ${name}`}
      title={optimistic ? "Starred. Click to remove." : "Star this format"}
      className={`rounded-md p-1.5 text-lg leading-none transition hover:bg-border ${optimistic ? "text-accent" : "text-muted"}`}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await setStar(formatId, !optimistic);
        })
      }
    >
      <span aria-hidden>{optimistic ? "★" : "☆"}</span>
    </button>
  );
}
