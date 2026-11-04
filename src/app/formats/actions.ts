"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { validateFormat, type FieldErrors, type FormatInput } from "@/lib/validation";

export type FormState = {
  error?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string | string[]>;
};

/** What the form sends back so a failed save keeps everything the user typed. */
function echo(fd: FormData): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$")) continue;
    values[key] = key === "verticals" ? fd.getAll(key).map(String) : String(fd.get(key) ?? "");
  }
  return values;
}

type Parsed =
  | { ok: false; state: FormState }
  | {
      ok: true;
      format: Omit<FormatInput, "example_url" | "example_platform">;
      example: { url: string; platform: string | null };
      verticalIds: number[];
    };

/** Validates the form. On failure the state carries one message per bad field. */
function parse(fd: FormData): Parsed {
  const result = validateFormat(Object.fromEntries(fd.entries()));
  if (!result.ok) {
    const count = Object.keys(result.fieldErrors).length;
    return {
      ok: false,
      state: {
        error: count === 1 ? "One field needs fixing before this can be saved." : `${count} fields need fixing before this can be saved.`,
        fieldErrors: result.fieldErrors,
        values: echo(fd),
      },
    };
  }
  const { example_url, example_platform, ...format } = result.data;
  return {
    ok: true,
    format,
    example: { url: example_url, platform: example_platform },
    verticalIds: fd.getAll("verticals").map(Number).filter((n) => Number.isInteger(n) && n > 0),
  };
}

export async function createFormat(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();
  const parsed = parse(fd);
  if (!parsed.ok) return parsed.state;
  const { format, verticalIds, example } = parsed;
  const supabase = await createClient();

  const { data, error } = await supabase.from("formats").insert(format).select("id").single();
  if (error || !data) return { error: "Could not save the format. Check the fields and try again.", values: echo(fd) };

  if (verticalIds.length > 0) {
    await supabase
      .from("format_verticals")
      .insert(verticalIds.map((vertical_id) => ({ format_id: data.id, vertical_id })));
  }
  await supabase.from("examples").insert({ format_id: data.id, url: example.url, platform: example.platform });

  revalidatePath("/");
  redirect(`/formats/${data.id}`);
}

export async function updateFormat(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();
  const parsed = parse(fd);
  if (!parsed.ok) return parsed.state;
  const { format, verticalIds, example } = parsed;
  const supabase = await createClient();

  const { data, error } = await supabase.from("formats").update(format).eq("id", id).select("id");
  if (error) return { error: "Could not save your changes. Check the fields and try again.", values: echo(fd) };
  if (!data || data.length === 0) return { error: "That format no longer exists.", values: echo(fd) };

  // Replace the vertical tags with what is ticked now.
  await supabase.from("format_verticals").delete().eq("format_id", id);
  if (verticalIds.length > 0) {
    await supabase.from("format_verticals").insert(verticalIds.map((vertical_id) => ({ format_id: id, vertical_id })));
  }

  // The form edits the first example link. Extra examples are left alone.
  const exampleId = Number(fd.get("example_id"));
  if (Number.isInteger(exampleId) && exampleId > 0) {
    await supabase.from("examples").update({ url: example.url, platform: example.platform }).eq("id", exampleId);
  } else {
    await supabase.from("examples").insert({ format_id: id, url: example.url, platform: example.platform });
  }

  revalidatePath("/");
  revalidatePath(`/formats/${id}`);
  redirect(`/formats/${id}`);
}

export async function deleteFormat(id: number) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("formats").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}
