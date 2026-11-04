import type { FormatWithRelations } from "@/lib/formats";

export type GuideStep = {
  title: string;
  /** What this step is for, in one line. */
  why: string;
  /** Where to do it. */
  href: string;
  action: string;
  done: boolean;
};

/**
 * The app is one workflow: log, score, shortlist, brief. Each step is ticked
 * off from the user's own data, so the guide always shows where they are.
 */
export function guideSteps(formats: FormatWithRelations[]): GuideStep[] {
  const first = formats[0];
  const unscored = formats.find((f) => f.score === null);
  const scored = formats.find((f) => f.score !== null);
  const withBrief = formats.find((f) => f.prompt?.trim() || f.swaps?.trim());

  return [
    {
      title: "Log a format",
      why: "A format is a viral video idea many creators reuse. Add one by hand, or import a spreadsheet.",
      href: "/formats/new",
      action: "Add format",
      done: formats.length > 0,
    },
    {
      title: "Score it",
      why: "Fill in heat, AI replicability and ad value. The app turns them into one score from 0 to 100.",
      href: unscored ? `/formats/${unscored.id}/edit` : first ? `/formats/${first.id}` : "/formats/new",
      action: unscored ? `Score "${unscored.name}"` : "See a score",
      done: formats.some((f) => f.score !== null),
    },
    {
      title: "Star your shortlist",
      why: "Sort by highest score, filter to your client's vertical, and star the ones worth pitching.",
      href: "/?sort=score",
      action: "Sort by score",
      done: formats.some((f) => f.starred),
    },
    {
      title: "Copy the brief",
      why: "Open a starred format and copy its brief: the prompt, the swap rules and the reference link for your creative team.",
      href: withBrief ? `/formats/${withBrief.id}` : scored ? `/formats/${scored.id}/edit` : first ? `/formats/${first.id}/edit` : "/formats/new",
      action: withBrief ? "Open a brief" : "Add a prompt",
      done: Boolean(withBrief),
    },
  ];
}

/** The one thing to do next on a single format's page. */
export function nextStep(format: FormatWithRelations): { text: string; href?: string; action?: string } {
  const edit = `/formats/${format.id}/edit`;
  if (format.score === null) {
    return { text: "Next: add heat, AI replicability and ad value so this format gets a score.", href: edit, action: "Add the numbers" };
  }
  if (!format.prompt?.trim() && !format.swaps?.trim()) {
    return { text: "Next: add a generation prompt and swap rules so there is a brief to hand over.", href: edit, action: "Add the brief" };
  }
  if (!format.starred) {
    return { text: "Next: star this format if it belongs on your shortlist." };
  }
  return { text: "Ready to hand over. Copy the brief below and send it to your creative team." };
}
