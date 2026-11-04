# Prompts: Feature 2, data model

Issue: #5. Branch: `feature/data-model`.

## Key prompt

There was no new prompt for this feature. The agent worked from one standing instruction and from PLAN.md section 3:

> 你最终只需要按照这个要求做完，然后给我我可以交上去的就可以了
> (Just finish everything to these requirements and hand me something I can submit.)

and the course requirement it was sent with: "A users table plus at least 2 tables of your own, connected by a relationship."

## What the agent did

- Wrote `supabase/migrations/0002_data_model.sql`: `formats`, `examples`, `verticals`, `format_verticals`, with foreign keys, check constraints and row-level security.
- Ran it in the Supabase SQL Editor through my signed-in Chrome.
- Checked the result through the API as a test user: six verticals present, the other tables empty, a blank format name rejected by the database, an example for a format the user does not own rejected by row-level security.
- Wrote `schema.md` and `src/lib/types.ts`.

## Compared with PLAN.md section 3

Built as designed, with four small additions the plan did not spell out:

- `creative_type` gained a sixth value, "UGC w/o Avatar", because my existing data uses it.
- `examples.platform` gained "YouTube" and "Other".
- `formats.user_id` defaults to the logged-in user, so the app cannot forget to set it.
- `stars` is in the plan but not in this migration. It ships with feature 5, the feature that uses it.
