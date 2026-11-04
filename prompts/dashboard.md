# Prompts: Feature 7, dashboard

Issue: #15. Branch: `feature/dashboard`.

## Key prompts

No new prompt started this feature. The agent continued from the standing instruction to finish the app to the course requirements, here: "At least one chart and 2 to 3 summary stats computed from your data (count, average, best month)", and the test requirement: "Dashboard: One of your summary stats calculates correctly."

While it was building this I asked:

> 还要多久
> (How much longer?)

It answered with a count of merged pull requests and what was left, and kept going.

## What the agent did

- A dashboard page with three stats and one bar chart, linked from the header.
- Total formats, average score, and the hottest vertical this month (the vertical with the most formats added in the current calendar month).
- A bar chart of formats per vertical, drawn with Recharts. Every vertical is listed, even at zero.
- All the numbers come from one plain function, `summarize()` in `src/lib/stats.ts`, with eight unit tests.
- The dashboard browser test from PLAN.md, and the dashboard check added to the data-isolation test.

## Decisions the agent made that I should know about

- **Average score skips formats with no score.** A format without a score is counted in the total but left out of the average, and the card says "From 2 scored formats" when the two numbers differ. The alternative, treating a missing score as zero, would drag the average down for no reason.
- **"This month" uses UTC.** A format added late on the last evening of the month in California counts toward the next month. Simple and predictable, slightly wrong at the edges.
- **Ties for hottest vertical go alphabetically.**

## A mistake in the agent's own test

The first run of the dashboard test failed before it checked anything. The test clicked the link named "Dashboard", but its own test data was named "Dashboard test ninety" and so on, and each card is a link, so four links matched. The app was fine. The agent made the click match the exact name.
