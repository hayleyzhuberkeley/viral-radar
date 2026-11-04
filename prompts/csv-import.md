# Prompts: Feature 10, CSV import (one of my three)

Issue: #21. Branch: `feature/csv-import`.

## Key prompts

No new prompt started this feature. The agent built it from the user story in PLAN.md:

> As a strategist, I want to upload a CSV exported from my old spreadsheet and have each row become a format, so that I do not retype 160 entries. Rows that fail validation are listed with the reason and skipped.

While it was building I asked again:

> 还需要多久
> (How much longer?)

It said 20 to 30 minutes and listed what was left.

## What the agent did

- An Import page: choose a CSV, see progress, get a result line ("2 imported, 3 skipped, out of 5 rows") and a table of skipped rows with the spreadsheet row number, the name and the reason.
- The browser reads the file with Papa Parse and sends rows to the server 25 at a time. The server checks every row with the same rules as the add form, then saves formats, verticals and example links.
- Headers from my old spreadsheet are accepted as they are: "Format", "Example 1", "Opening Hook", "AI Replicability", "Symphony Prompt" and so on.
- A name I already have is skipped, ignoring capitals, so the same file twice adds nothing.
- Imported formats are scored like any other.
- A sample CSV to download.
- Eight unit tests and one browser test with a five-row file: two good rows, one with no name, one with a bad link, one with an unknown vertical.

## Decisions the agent made

- **Duplicates are matched on name.** PLAN.md flagged "without creating duplicates when I upload the same file twice" as a risk but did not say how. The agent chose the name, ignoring capitals. Two different formats with the same name cannot both be imported. That fits my data, where every name is unique.
- **A failed batch leaves nothing behind.** If the example links or vertical tags fail to save, the formats from that batch are deleted again, so I never end up with half-built rows.
- **An unknown vertical skips the whole row** and says which word was not recognised, instead of quietly dropping the tag.
- **The file is parsed in the browser**, not uploaded whole. The agent's reason: a request to the server has a size limit of about 1 MB, and my real export with all its analysis text is close to that.

## Compared with PLAN.md

Built as planned, including the three related tables the plan worried about. The first item on the cut list ("CSV import shrinks to formats only") was not needed.
