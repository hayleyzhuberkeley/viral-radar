# Prompts: Feature 3, create, read, update, delete

Issue: #7. Branch: `feature/crud`.

## Key prompts

No new prompt started this feature. The agent kept working from the standing instruction:

> 你最终只需要按照这个要求做完，然后给我我可以交上去的就可以了
> (Just finish everything to these requirements and hand me something I can submit.)

with the course requirement: "Add an item, view the list, open one item's detail page, edit it, and delete it with an 'are you sure?' confirmation", and the test requirement: "Data isolation: User B cannot see User A's data."

## What the agent did

- Built the list on the home page, the add form, the detail page, the edit form, and delete behind an "Are you sure?" dialog.
- One form component serves both add and edit. A failed save keeps everything that was typed.
- Wrote the data-isolation test in Playwright with two real accounts against the real database.

## Bugs and wrong turns

- **The agent logged itself out while checking its own work.** Its check script clicked the first submit button on the page, which was "Log out" in the header and not "Save format". The symptom was the add form landing on the login page. It found the cause in the server log (`logOut()` had run), then scoped its clicks to the form. The app was not at fault, but it shows the header button and the form button are easy to confuse for anything that looks for "the submit button".
- **Red-then-green did not go as planned.** The honest way to break data isolation is to loosen the database rule so every user can read every format. The agent tried that and its own safety check refused, because it weakens security on a live database. It broke the app layer instead: it removed the check that turns someone else's format into "Not found". The test went red (expected 404, got 200), and green again once the check was back.
- **The first revert silently failed.** The agent ran `git checkout` to undo the break, but the file had never been committed, so git had nothing to restore and the break stayed in. It noticed from the error line, restored the check by hand, and searched the code for the break marker before going on.

## Different from the plan

- PLAN.md put this test in the login pull request. It moved here because there was nothing to isolate before formats existed.
- The plan's test also checks the dashboard for user B. The dashboard does not exist yet, so that part waits for feature 7.
