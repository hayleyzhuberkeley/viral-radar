# Prompts: Feature 8, composite score (one of my three)

Issue: #17. Branch: `feature/score`.

## Key prompts

No new prompt. The agent built this from PLAN.md section 2, which I had approved when the plan was merged. The formula there is the spec:

```
freshness = 0.6 × min(1, new_in_7_days / 8) + (0.4 if Rising or Peak, 0.15 if Steady, 0 if Fading)
breadth   = min(1, number of verticals / 3)
score     = 100 × (0.30 × heat/100 + 0.20 × freshness + 0.25 × ai_replicable/5 + 0.15 × breadth + 0.10 × ad_value/5)
```

It comes from the scoring I already use in my own trend spreadsheet.

## What the agent did

- `src/lib/score.ts`: one function that returns the score and a five-line breakdown.
- The score is worked out on the server on every add and edit. It is never typed in.
- The card shows the score. The detail page shows it large with the breakdown: points earned out of the maximum for heat, freshness, AI replicability, vertical breadth and ad value.
- Seven unit tests and one browser test. The plan's worked example gives 81.0, and dropping heat from 80 to 40 gives 69.0.

## A decision the plan did not cover

The plan never said what happens when a number is missing. The agent decided: **no score unless heat, AI replicability and ad value are all filled in.** Those three carry 65 of the 100 points, and a format with one of them blank would show a low score that looks like a judgement when it is only a gap. Missing "new videos" and zero verticals count as zero. The detail page says "No score yet" with a link to edit. I agree with the call, but it was the agent's, not mine.

## Compared with PLAN.md

Built as designed. The plan's extra test ("then its score is 81.0") is the first unit test and the browser test.
