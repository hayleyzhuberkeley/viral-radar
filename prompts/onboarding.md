# Prompts: stranger-test fix, guidance

Issue: #25. Branch: `fix/onboarding`.

## Key prompt

After the stranger test I sent the agent the main struggle:

> 卡住的地方主要是没有引导，这绝对是个b2b的tool，但是第一步到最后一步的tool不是很清晰的关系
> (The main place they got stuck is that there is no guidance. This is clearly a B2B tool, but the relationship between the tools from the first step to the last is not clear.)

## What the agent did

- **Login and sign-up pages** now say who the app is for ("For brand and agency strategists who have to answer 'what should we make next?'") and list the four steps.
- **Home page** has a "How it works" card: Log a format, Score it, Star your shortlist, Copy the brief. Each step has one line on why, a button that goes to where it happens, and a tick once the user's own data shows it is done. The next step is highlighted. The card disappears when all four are done, and can be hidden and brought back.
- **A format's page** has a "Next:" line that says the one thing to do for that format: add the numbers, add the brief, star it, or hand it over.
- The empty radar now offers both "Add format" and "Import a CSV".
- Four unit tests for the step logic, and two browser tests: one walks a brand-new account from an empty radar through all four steps, one hides the guide and brings it back.

## Decisions the agent made

- **Steps are ticked from data, not from clicks.** The agent could have tracked "has this user visited the page". It chose to look at the formats themselves: is there a format, is one scored, is one starred, does one have a brief. So the guide is right even for someone who imported a spreadsheet and never used the form.
- **"Copy the brief" is ticked when a brief exists, not when the button is pressed.** The app does not record button presses. That is a small lie in the guide and I accepted it.
- **Hiding is remembered in the browser, not the account.** On a second device the guide comes back.
