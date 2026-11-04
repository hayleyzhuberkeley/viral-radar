"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; values?: Record<string, string | string[]> };

const text = (fd: FormData, key: string) => {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
};
const num = (fd: FormData, key: string) => {
  const v = text(fd, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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

function read(fd: FormData) {
  return {
    format: {
      name: text(fd, "name") ?? "",
      creative_type: text(fd, "creative_type"),
      trend_status: text(fd, "trend_status"),
      region: text(fd, "region"),
      heat: num(fd, "heat"),
      ai_replicable: num(fd, "ai_replicable"),
      ad_value: num(fd, "ad_value"),
      new_in_7_days: num(fd, "new_in_7_days"),
      mechanic: text(fd, "mechanic"),
      hook: text(fd, "hook"),
      why_works: text(fd, "why_works"),
      brand_usage: text(fd, "brand_usage"),
      prompt: text(fd, "prompt"),
      swaps: text(fd, "swaps"),
      first_seen: text(fd, "first_seen"),
    },
    verticalIds: fd.getAll("verticals").map(Number).filter(Number.isInteger),
    example: { url: text(fd, "example_url"), platform: text(fd, "example_platform") },
  };
}

export async function createFormat(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();
  const { format, verticalIds, example } = read(fd);
  const supabase = await createClient();

  const { data, error } = await supabase.from("formats").insert(format).select("id").single();
  if (error || !data) return { error: "Could not save the format. Check the fields and try again.", values: echo(fd) };

  if (verticalIds.length > 0) {
    await supabase
      .from("format_verticals")
      .insert(verticalIds.map((vertical_id) => ({ format_id: data.id, vertical_id })));
  }
  if (example.url) {
    await supabase.from("examples").insert({ format_id: data.id, url: example.url, platform: example.platform });
  }

  revalidatePath("/");
  redirect(`/formats/${data.id}`);
}

export async function updateFormat(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();
  const { format, verticalIds, example } = read(fd);
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
    if (example.url) {
      await supabase.from("examples").update({ url: example.url, platform: example.platform }).eq("id", exampleId);
    } else {
      await supabase.from("examples").delete().eq("id", exampleId);
    }
  } else if (example.url) {
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
