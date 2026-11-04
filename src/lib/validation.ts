import { z } from "zod";
import { CREATIVE_TYPES, PLATFORMS, REGIONS, TREND_STATUSES } from "@/lib/types";

// One set of rules, used by the server action. The form shows whatever
// messages come back, so the friendly text and the real check cannot disagree.

const blankToNull = (v: unknown) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
};

const optionalText = z.preprocess(blankToNull, z.string().nullable());

const oneOf = (options: readonly string[], label: string) =>
  z.preprocess(
    blankToNull,
    z
      .string()
      .refine((v) => options.includes(v), `Pick a ${label} from the list.`)
      .nullable(),
  );

const numberBetween = (min: number, max: number, label: string, whole = false) =>
  z.preprocess(
    blankToNull,
    z
      .string()
      .transform((v, ctx) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          ctx.addIssue({ code: "custom", message: `${label} must be a number.` });
          return z.NEVER;
        }
        if (whole && !Number.isInteger(n)) {
          ctx.addIssue({ code: "custom", message: `${label} must be a whole number.` });
          return z.NEVER;
        }
        if (n < min || n > max) {
          const range = max === Infinity ? `${min} or more` : `between ${min} and ${max}`;
          ctx.addIssue({ code: "custom", message: `${label} must be ${range}.` });
          return z.NEVER;
        }
        return n;
      })
      .nullable(),
  );

function isLink(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export const formatSchema = z.object({
  name: z
    .string({ error: "Give the format a name." })
    .trim()
    .min(1, "Give the format a name.")
    .max(120, "Keep the name under 120 characters."),
  example_url: z
    .string({ error: "Add a link to one example video." })
    .trim()
    .min(1, "Add a link to one example video.")
    .refine(isLink, "That doesn't look like a link. Paste the full address, starting with https://"),
  example_platform: oneOf(PLATFORMS, "platform"),
  creative_type: oneOf(CREATIVE_TYPES, "creative type"),
  trend_status: oneOf(TREND_STATUSES, "trend status"),
  region: oneOf(REGIONS, "region"),
  heat: numberBetween(0, 100, "Heat"),
  new_in_7_days: numberBetween(0, Infinity, "New videos in 7 days", true),
  ai_replicable: numberBetween(1, 5, "AI replicability", true),
  ad_value: numberBetween(1, 5, "Ad value", true),
  first_seen: z.preprocess(
    blankToNull,
    z
      .string()
      .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), "Use a real date.")
      .nullable(),
  ),
  mechanic: optionalText,
  hook: optionalText,
  why_works: optionalText,
  brand_usage: optionalText,
  prompt: optionalText,
  swaps: optionalText,
});

export type FormatInput = z.infer<typeof formatSchema>;
export type FieldErrors = Partial<Record<keyof FormatInput, string>>;

export type ValidationResult =
  | { ok: true; data: FormatInput }
  | { ok: false; fieldErrors: FieldErrors };

/** Checks raw form values. Returns clean data, or one friendly message per bad field. */
export function validateFormat(raw: Record<string, unknown>): ValidationResult {
  const parsed = formatSchema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };

  const fieldErrors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof FormatInput | undefined;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, fieldErrors };
}
