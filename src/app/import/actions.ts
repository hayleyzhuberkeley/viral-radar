"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prepareRows, type SkippedRow } from "@/lib/import";
import { createClient } from "@/lib/supabase/server";

export type BatchResult = { imported: number; skipped: SkippedRow[]; error?: string };

const MAX_ROWS_PER_CALL = 50;

/**
 * Saves one batch of CSV rows. The browser parses the file and sends rows in
 * small batches, so a large file never has to travel in a single request.
 */
export async function importRows(rows: Record<string, unknown>[], firstRowNumber: number): Promise<BatchResult> {
  await requireUser();
  if (!Array.isArray(rows) || rows.length > MAX_ROWS_PER_CALL) {
    return { imported: 0, skipped: [], error: "That batch is too large." };
  }
  const supabase = await createClient();

  const [existing, verticals] = await Promise.all([
    supabase.from("formats").select("name"),
    supabase.from("verticals").select("id, name"),
  ]);
  if (existing.error || verticals.error) return { imported: 0, skipped: [], error: "Could not read your radar. Try again." };

  const { ready, skipped } = prepareRows(
    rows,
    firstRowNumber,
    existing.data.map((f) => f.name),
    verticals.data,
  );
  if (ready.length === 0) return { imported: 0, skipped };

  // One insert for the formats. The rows come back in the order they went in.
  const inserted = await supabase.from("formats").insert(ready.map((r) => r.format)).select("id");
  if (inserted.error || inserted.data.length !== ready.length) {
    return { imported: 0, skipped, error: "Could not save this batch. Nothing from it was added." };
  }
  const ids = inserted.data.map((f) => f.id);

  const examples = ready.map((r, i) => ({ format_id: ids[i], url: r.example.url, platform: r.example.platform }));
  const tags = ready.flatMap((r, i) => r.verticalIds.map((vertical_id) => ({ format_id: ids[i], vertical_id })));
  const [ex, fv] = await Promise.all([
    supabase.from("examples").insert(examples),
    tags.length > 0 ? supabase.from("format_verticals").insert(tags) : Promise.resolve({ error: null }),
  ]);
  if (ex.error || fv.error) {
    // Do not leave half-built formats behind.
    await supabase.from("formats").delete().in("id", ids);
    return { imported: 0, skipped, error: "Could not save this batch. Nothing from it was added." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { imported: ready.length, skipped };
}
