import type { FormatWithRelations } from "@/lib/formats";

/**
 * The replication brief as plain text: everything a creative team needs to
 * start a remake, ready to paste into a chat or a doc. Null when the format
 * has neither a generation prompt nor swap rules.
 */
export function buildBrief(format: FormatWithRelations): string | null {
  const prompt = format.prompt?.trim();
  const swaps = format.swaps?.trim();
  if (!prompt && !swaps) return null;

  const facts = [
    format.creative_type,
    format.verticals.length > 0 ? format.verticals.map((v) => v.name).join(", ") : null,
    format.score !== null ? `Score ${format.score.toFixed(1)}` : null,
  ].filter(Boolean);

  const sections: [string, string | null | undefined][] = [
    ["Opening hook", format.hook?.trim()],
    ["Mechanic", format.mechanic?.trim()],
    ["Generation prompt", prompt],
    ["Swap rules", swaps],
    ["Reference", format.examples[0]?.url],
  ];

  return [
    `REPLICATION BRIEF: ${format.name}`,
    facts.length > 0 ? facts.join(" · ") : null,
    ...sections.filter(([, body]) => body).map(([title, body]) => `${title.toUpperCase()}\n${body}`),
  ]
    .filter(Boolean)
    .join("\n\n");
}
