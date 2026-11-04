"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/formats/actions";
import type { FormatWithRelations } from "@/lib/formats";
import type { FieldErrors } from "@/lib/validation";
import { CREATIVE_TYPES, PLATFORMS, REGIONS, TREND_STATUSES, type Vertical } from "@/lib/types";

type Props = {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  verticals: Vertical[];
  format?: FormatWithRelations;
  submitLabel: string;
  cancelHref: string;
};

export function FormatForm({ action, verticals, format, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const firstExample = format?.examples[0];

  // After a failed save, show what the user typed. Otherwise show the saved format.
  const v = (key: string, saved: string | number | null | undefined) => {
    const typed = state.values?.[key];
    if (typeof typed === "string") return typed;
    return saved === null || saved === undefined ? "" : String(saved);
  };
  const err = (key: keyof FieldErrors) => state.fieldErrors?.[key];
  const tickedVerticals = Array.isArray(state.values?.verticals)
    ? (state.values.verticals as string[])
    : (format?.verticals ?? []).map((x) => String(x.id));

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      {state.error && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span>
            Name <Required />
          </span>
          <input
            name="name"
            defaultValue={v("name", format?.name)}
            className="field"
            placeholder="GRWM Loading Bar"
            aria-invalid={err("name") ? true : undefined}
            aria-describedby={err("name") ? "name-error" : undefined}
          />
          <FieldError id="name-error" message={err("name")} />
        </label>

        <Select name="creative_type" label="Creative type" options={CREATIVE_TYPES} value={v("creative_type", format?.creative_type)} error={err("creative_type")} />
        <Select name="trend_status" label="Trend status" options={TREND_STATUSES} value={v("trend_status", format?.trend_status)} error={err("trend_status")} />
        <Select name="region" label="Region" options={REGIONS} value={v("region", format?.region)} error={err("region")} />
        <label className="flex flex-col gap-1 text-sm">
          First seen
          <input
            name="first_seen"
            type="date"
            defaultValue={v("first_seen", format?.first_seen)}
            className="field"
            aria-invalid={err("first_seen") ? true : undefined}
          />
          <FieldError message={err("first_seen")} />
        </label>
      </section>

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-2">Verticals</legend>
        <div className="flex flex-wrap gap-2">
          {verticals.map((vertical) => (
            <label key={vertical.id} className="chip">
              <input
                type="checkbox"
                name="verticals"
                value={vertical.id}
                defaultChecked={tickedVerticals.includes(String(vertical.id))}
                className="accent-[var(--accent)]"
              />
              {vertical.name}
            </label>
          ))}
        </div>
      </fieldset>

      <section className="grid gap-4 sm:grid-cols-4">
        <NumberField name="heat" label="Heat (0 to 100)" min={0} max={100} value={v("heat", format?.heat)} error={err("heat")} />
        <NumberField name="new_in_7_days" label="New videos in 7 days" min={0} value={v("new_in_7_days", format?.new_in_7_days)} error={err("new_in_7_days")} />
        <NumberField name="ai_replicable" label="AI replicability (1 to 5)" min={1} max={5} value={v("ai_replicable", format?.ai_replicable)} error={err("ai_replicable")} />
        <NumberField name="ad_value" label="Ad value (1 to 5)" min={1} max={5} value={v("ad_value", format?.ad_value)} error={err("ad_value")} />
      </section>

      <section className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <label className="flex flex-col gap-1 text-sm">
          <span>
            Example link <Required />
          </span>
          <input
            name="example_url"
            type="url"
            inputMode="url"
            defaultValue={v("example_url", firstExample?.url)}
            className="field"
            placeholder="https://www.tiktok.com/@creator/video/…"
            aria-invalid={err("example_url") ? true : undefined}
            aria-describedby={err("example_url") ? "example_url-error" : undefined}
          />
          <FieldError id="example_url-error" message={err("example_url")} />
        </label>
        <Select name="example_platform" label="Platform" options={PLATFORMS} value={v("example_platform", firstExample?.platform)} error={err("example_platform")} />
        {firstExample && <input type="hidden" name="example_id" value={firstExample.id} />}
      </section>

      <section className="grid gap-4">
        <Area name="mechanic" label="Mechanic" hint="What happens in the video, beat by beat." value={v("mechanic", format?.mechanic)} />
        <Area name="hook" label="Opening hook" hint="The first three seconds." value={v("hook", format?.hook)} />
        <Area name="why_works" label="Why it works" value={v("why_works", format?.why_works)} />
        <Area name="brand_usage" label="Brand usage" hint="How a brand would put its product in." value={v("brand_usage", format?.brand_usage)} />
        <Area name="prompt" label="Generation prompt" value={v("prompt", format?.prompt)} />
        <Area name="swaps" label="Swap rules" hint="What to change, and what never to copy." value={v("swaps", format?.swaps)} />
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href={cancelHref} className="btn-quiet">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Required() {
  return (
    <span className="text-xs text-muted" aria-hidden>
      (required)
    </span>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-xs text-danger">
      {message}
    </span>
  );
}

function Select({
  name,
  label,
  options,
  value,
  error,
}: {
  name: string;
  label: string;
  options: readonly string[];
  value: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {/* The key remounts the select when its value changes. After a failed save React
          resets the form, and a select does not pick its default back up on its own. */}
      <select key={value} name={name} defaultValue={value} className="field" aria-invalid={error ? true : undefined}>
        <option value="">Not set</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

function NumberField({
  name,
  label,
  min,
  max,
  value,
  error,
}: {
  name: string;
  label: string;
  min?: number;
  max?: number;
  value: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        name={name}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step="any"
        defaultValue={value}
        className="field font-mono"
        aria-invalid={error ? true : undefined}
      />
      <FieldError message={error} />
    </label>
  );
}

function Area({ name, label, hint, value }: { name: string; label: string; hint?: string; value: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {hint && <span className="text-xs text-muted">{hint}</span>}
      <textarea name={name} rows={3} defaultValue={value} className="field" />
    </label>
  );
}
