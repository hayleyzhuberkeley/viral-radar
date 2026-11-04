# Prompts: Feature 6, find things

Issue: #13. Branch: `feature/find`.

## Key prompts

No new prompt. The agent continued from the standing instruction to finish the app to the course requirements, here: "Search or filter, plus sort (e.g., newest first, highest rated)."

## What the agent did

- A search box for the name, filters for vertical, creative type and trend status, and four sorts: newest, oldest, highest score, name.
- The search and filters live in the page address, so a filtered view survives a reload and can be bookmarked.
- The same bar works on both the All and Starred tabs. The two pages now share one component.
- The filtering and sorting logic is one plain function in `src/lib/find.ts` with eight unit tests, plus one browser test.

## Bug the test caught

The agent's first version had "Clear search and filters" as a plain link back to the unfiltered page. The list came back, but **the search box still showed the old text**, so the screen said one thing and showed another. The agent had not noticed. Its own browser test did: it expected an empty box after clearing and got "toy car". Cause: the box keeps whatever was typed until something changes it, and following a link does not. Fix: clearing now empties the boxes themselves and then updates the address. The test was extended to check the boxes are empty and all three formats are back.

## Different from the plan

- "Highest score" is in the sort menu now, but scores are empty until feature 8. Unscored formats sort last.
- The plan listed region as a possible filter and put it first in the cut list. It is not built.
