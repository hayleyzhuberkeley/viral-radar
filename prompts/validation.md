# Prompts: Feature 4, validation

Issue: #9. Branch: `feature/validation`.

## Key prompts

No new prompt. The agent continued from the standing instruction to finish the app to the course requirements, here: "Required fields can't be left blank. Show a friendly message if someone tries."

## What the agent did

- Put every rule in one file, `src/lib/validation.ts`, using Zod. The server action runs the rules and the form only displays what comes back, so the message and the real check cannot drift apart.
- Required: a name and one example link. The link must be a real http or https address.
- Range checks: heat 0 to 100, AI replicability and ad value whole numbers 1 to 5, new videos 0 or more.
- Messages appear next to the field, the field gets a red border, and a summary line counts how many fields need fixing.
- Six unit tests in `src/lib/validation.test.ts`.

## Bug the agent caught in its own work

After a failed save, the text boxes and checkboxes kept what I had typed but **every dropdown snapped back to "Not set"**. The agent noticed because its check compared each field before and after a failed save and "Trend status" came back empty. Cause: React resets a form after its action runs, and a dropdown does not pick its default value back up the way a text box does. Fix: give each dropdown a key equal to its value so it is rebuilt with the right option selected. Checked again with two dropdowns set, both survived.

## Different from the plan

PLAN.md said the example link is required, and feature 3 shipped with it optional. This feature makes it required as planned. Formats added through the database directly, as the isolation test does, can still exist without a link.
