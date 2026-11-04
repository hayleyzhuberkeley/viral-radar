# Prompts: Feature 9, replication brief (one of my three)

Issue: #19. Branch: `feature/brief`.

## Key prompts

No new prompt. The agent built this from the user story in PLAN.md, which I approved when the plan was merged:

> As a strategist, I want one button that copies the generation prompt and the swap rules (what to change, what never to copy), so that a creative team can start the remake immediately.

## What the agent did

- `src/lib/brief.ts` turns a format into one block of plain text: name, a line of facts, opening hook, mechanic, generation prompt, swap rules, reference link. Anything missing is left out.
- The detail page shows the brief exactly as it will be pasted, with a "Copy brief" button that changes to "Copied" for two seconds.
- If the browser refuses clipboard access, the button falls back to an older copy method, and if that fails too it says to select the text.
- A format with no prompt and no swap rules shows "No brief yet" with a link to edit, and no button.
- Four unit tests and two browser tests. One reads the clipboard back and checks it equals what is on screen.

## A decision the agent made

The plan said the button copies "the generation prompt and the swap rules". The agent added the hook, the mechanic and the reference link to the copied text, reasoning that a creative team receiving only a prompt would not know what the original looks like. The brief still only exists when there is a prompt or swap rules. I would have asked for the same thing, but I did not ask.

## Compared with PLAN.md

The plan's cut list had this button falling back to "plain selectable text" if time ran short. It did not need cutting, and the selectable text is there anyway.
