import { computeScore } from "@/lib/score";
import { validateFormat, type FormatInput } from "@/lib/validation";

/** The column names the importer understands, and other spellings it accepts for each. */
export const COLUMNS: Record<string, string[]> = {
  name: ["format", "format_name", "title"],
  example_url: ["example", "example_link", "example_1", "link", "url"],
  example_platform: ["platform"],
  creative_type: ["type"],
  trend_status: ["status", "trend"],
  region: [],
  verticals: ["vertical", "industries"],
  heat: [],
  new_in_7_days: ["new_in_7d", "new_videos_in_7_days"],
  ai_replicable: ["ai_replicability"],
  ad_value: [],
  first_seen: [],
  mechanic: [],
  hook: ["opening_hook"],
  why_works: ["why_it_works"],
  brand_usage: [],
  prompt: ["generation_prompt", "symphony_prompt"],
  swaps: ["swap_rules", "commercial_swaps"],
};

const key = (header: string) =>
  header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const LOOKUP = new Map<string, string>();
for (const [column, aliases] of Object.entries(COLUMNS)) {
  LOOKUP.set(column, column);
  for (const alias of aliases) LOOKUP.set(alias, column);
}

/** Renames a CSV row's headers to the importer's column names and drops the rest. */
export function mapRow(raw: Record<string, unknown>): Record<string, string> {
  const row: Record<string, string> = {};
  for (const [header, value] of Object.entries(raw)) {
    const column = LOOKUP.get(key(header));
    if (column && !(column in row)) row[column] = value === null || value === undefined ? "" : String(value);
  }
  return row;
}

/** A link pasted as markdown, [text](url), becomes just the url. */
function plainLink(value: string) {
  const markdown = value.trim().match(/^\[[^\]]*\]\((https?:\/\/[^)\s]+)\)$/);
  return markdown ? markdown[1] : value.trim();
}

function guessPlatform(url: string): string {
  if (/tiktok\.com/i.test(url)) return "TikTok";
  if (/instagram\.com/i.test(url)) return "Instagram";
  if (/xiaohongshu\.com|xhslink\./i.test(url)) return "Xiaohongshu";
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  return "Other";
}

export type ReadyRow = {
  row: number;
  format: Omit<FormatInput, "example_url" | "example_platform"> & { score: number | null };
  example: { url: string; platform: string };
  verticalIds: number[];
};
export type SkippedRow = { row: number; name: string; reason: string };

/**
 * Checks every row. Returns the ones that are ready to save and the ones that
 * are skipped, each with a reason. Nothing is saved here.
 *
 * @param rows           rows as parsed from the CSV, headers as keys
 * @param firstRowNumber the spreadsheet row number of rows[0], for messages
 * @param existingNames  names the user already has, so a second upload adds nothing
 * @param verticals      the list of verticals from the database
 */
export function prepareRows(
  rows: Record<string, unknown>[],
  firstRowNumber: number,
  existingNames: string[],
  verticals: { id: number; name: string }[],
): { ready: ReadyRow[]; skipped: SkippedRow[] } {
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  const verticalIdByName = new Map(verticals.map((v) => [v.name.toLowerCase(), v.id]));
  const ready: ReadyRow[] = [];
  const skipped: SkippedRow[] = [];

  rows.forEach((raw, index) => {
    const row = firstRowNumber + index;
    const mapped = mapRow(raw);
    const name = (mapped.name ?? "").trim();

    if (Object.values(mapped).every((v) => v.trim() === "")) return; // blank line

    if (mapped.example_url) mapped.example_url = plainLink(mapped.example_url);
    if (mapped.first_seen) mapped.first_seen = mapped.first_seen.trim().slice(0, 10);

    const result = validateFormat(mapped);
    if (!result.ok) {
      skipped.push({ row, name: name || "(no name)", reason: Object.values(result.fieldErrors).join(" ") });
      return;
    }

    const verticalIds: number[] = [];
    const unknown: string[] = [];
    for (const part of (mapped.verticals ?? "").split(/[;,|]/)) {
      const label = part.trim();
      if (!label) continue;
      const id = verticalIdByName.get(label.toLowerCase());
      if (id === undefined) unknown.push(label);
      else if (!verticalIds.includes(id)) verticalIds.push(id);
    }
    if (unknown.length > 0) {
      skipped.push({ row, name, reason: `Unknown vertical: ${unknown.join(", ")}. Use ${verticals.map((v) => v.name).join(", ")}.` });
      return;
    }

    if (taken.has(name.toLowerCase())) {
      skipped.push({ row, name, reason: "Already in your radar." });
      return;
    }
    taken.add(name.toLowerCase());

    const { example_url, example_platform, ...fields } = result.data;
    ready.push({
      row,
      format: { ...fields, score: computeScore({ ...fields, verticalCount: verticalIds.length })?.score ?? null },
      example: { url: example_url, platform: example_platform ?? guessPlatform(example_url) },
      verticalIds,
    });
  });

  return { ready, skipped };
}
