# Prompts: Feature 1, sign up and login

Issue: #3. Branch: `feature/auth`.

## Key prompts (verbatim, from me to Claude Code)

1. > 帮我做成一个app吧，就是发现爆款的app
   (Make this into an app, an app for discovering viral hits.)

2. > 你最终只需要按照这个要求做完，然后给我我可以交上去的就可以了
   (Just finish everything to these requirements and hand me something I can submit.)
   Sent with the course's spine table, which defines this feature as: "A new visitor can create their own account from inside your app, then log in and log out. Every account is a row in your users table. Each user sees only their own data."

3. > 加好了
   (Added.) Sent after I added the GitHub permission rules the agent asked for. This is the message that started the build.

## What the agent did with them

- Scaffolded Next.js 16 with Tailwind, then read the docs bundled in `node_modules/next/dist/docs` because this version renamed Middleware to Proxy and ships Cache Components on by default.
- Turned Cache Components off in `next.config.ts`. Its reasoning: every page shows one user's private data, so nothing should be prerendered or shared.
- Built email and password sign up, login and logout on Supabase Auth with Server Actions, and one shared form component with friendly error messages.
- Added `src/proxy.ts` to redirect signed-out visitors, and `requireUser()` for pages to call as the real check.
- Wrote `supabase/migrations/0001_users.sql`: a `users` table, row-level security, and a trigger that inserts a row on every sign up.

## Where I had to step in

- The agent could not create the GitHub repo. Its session blocked the upload three times until I added permission rules to my settings file.
- The agent cannot create accounts. The Supabase project and its keys in `.env.local` are mine to set up, and the feature was verified only after that.
- PLAN.md said the data-isolation test would ship in this pull request. There is no user data to isolate until feature 3, so the agent moved the test there. Logged for Plan vs. Reality.

## Later prompts on this branch

4. > 你直接弄吧
   (Just do it yourself.) Sent with my Supabase project link, after the agent had given me setup steps.

5. > 用chrome
   (Use Chrome.) The agent's own browser was not signed in to Supabase, so I let it drive my signed-in Chrome.

What happened: the agent read the project URL and the public anon key, ran the migration in the Supabase SQL Editor, and left the service role key and database password untouched. It tried to switch off "Confirm email" and was blocked by its own safety check, so I flipped that toggle myself.

## Verified against the real project

- Signed out, `/` redirects to `/login`.
- Blank form: "Enter your email." Short password: "Use a password with at least 8 characters." Wrong password: "Wrong email or password.", with the email kept in the field.
- Sign up lands on the home page signed in, log out returns to `/login`, log in works again.
- The new account appears as one row in `public.users`. A signed-out request to the same table returns no rows.
