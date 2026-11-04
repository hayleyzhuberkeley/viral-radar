import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Example, Format, Vertical } from "@/lib/types";

export type FormatWithRelations = Format & {
  verticals: Vertical[];
  examples: Example[];
};

type Row = Format & {
  format_verticals: { verticals: Vertical | null }[] | null;
  examples: Example[] | null;
};

const SELECT = "*, format_verticals(verticals(id, name)), examples(*)";

function shape(row: Row): FormatWithRelations {
  const { format_verticals, examples, ...format } = row;
  return {
    ...format,
    verticals: (format_verticals ?? [])
      .map((fv) => fv.verticals)
      .filter((v): v is Vertical => v !== null)
      .sort((a, b) => a.id - b.id),
    examples: (examples ?? []).sort((a, b) => a.id - b.id),
  };
}

/** Every format the logged-in user owns, newest first. Row-level security scopes it. */
export async function listFormats(): Promise<FormatWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formats")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  if (error) throw new Error(error.message);
  return (data ?? []).map(shape);
}

/** One format, or null when it does not exist or belongs to someone else. */
export async function getFormat(id: number): Promise<FormatWithRelations | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formats")
    .select(SELECT)
    .eq("id", id)
    .returns<Row[]>()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? shape(data as Row) : null;
}

export async function listVerticals(): Promise<Vertical[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("verticals").select("id, name").order("id");
  if (error) throw new Error(error.message);
  return data ?? [];
}
