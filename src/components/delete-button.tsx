"use client";

import { useRef, useTransition } from "react";

/** Delete with an "are you sure?" step. Nothing is deleted until the second click. */
export function DeleteButton({ name, action }: { name: string; action: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button type="button" className="btn-danger" onClick={() => dialog.current?.showModal()}>
        Delete
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="delete-title"
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface p-6 text-foreground backdrop:bg-black/60"
      >
        <h2 id="delete-title" className="text-lg font-semibold">
          Are you sure?
        </h2>
        <p className="mt-2 text-sm text-muted">
          This deletes <span className="text-foreground">{name}</span> with its example links. It cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-quiet" onClick={() => dialog.current?.close()} disabled={pending}>
            Keep it
          </button>
          <button type="button" className="btn-danger" disabled={pending} onClick={() => startTransition(() => action())}>
            {pending ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
