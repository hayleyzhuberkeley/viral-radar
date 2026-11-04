# Viral Radar

A personal tracker for short-video formats that are going viral and that a brand could remake.

A single viral video cannot be copied. A format that many creators reuse can. Log each format once, and the app scores it, lets you find it again by category, and hands you a brief a creative team can start from.

**Live app:** https://viral-radar-xi.vercel.app

Sign up with any email and a password of eight characters or more. Every account is private: you only ever see the formats you logged.

## What it does

| | |
|---|---|
| **Sign up and login** | Create an account inside the app, log in, log out. |
| **Formats** | Add a format, see your list, open its detail page, edit it, delete it after an "Are you sure?" |
| **Validation** | A name and one example link are required. Friendly messages sit next to the field. |
| **Stars** | Star a format from its card. The Starred tab shows only those. |
| **Find things** | Search by name, filter by vertical, creative type and trend status, sort by newest, oldest, score or name. |
| **Dashboard** | Total formats, average score, the hottest vertical this month, and a chart of formats per vertical. |
| **Composite score** | Every format gets 0 to 100 from heat, freshness, AI replicability, vertical breadth and ad value, with the breakdown shown. |
| **Replication brief** | One button copies the prompt, the swap rules and the reference link as plain text. |
| **Guidance** | A four-step "How it works" card that ticks itself off from your data, and a "Next:" line on every format. |
| **CSV import** | Upload a spreadsheet export. Bad rows are listed with the reason. The same file twice adds nothing. |

## Tools

| Tool | Used for |
|---|---|
| [Claude Code](https://claude.com/claude-code) | The coding agent. It wrote the code from PLAN.md, one issue and one pull request per feature. The prompts are in `prompts/`. |
| Next.js 16, React 19, TypeScript | The app: pages and server code in one project. |
| Tailwind CSS 4 | Styling. |
| Supabase | Postgres database and email and password login. Row-level security keeps each user's data private. |
| Vercel | Hosting. Every merge to `main` redeploys the live URL. |
| Zod | Validation rules shared by the add form, the edit form and CSV import. |
| Recharts | The dashboard chart. |
| Papa Parse | Reading CSV files. |
| Vitest and Playwright | Unit tests and browser tests. |

## Run it yourself

You need Node.js 20 or newer and a free [Supabase](https://supabase.com) project.

1. **Get the code and install.**

   ```bash
   git clone https://github.com/hayleyzhuberkeley/viral-radar.git
   cd viral-radar
   npm install
   ```

2. **Create the database.** In your Supabase project open the SQL Editor and run the three files in `supabase/migrations`, in order: `0001_users.sql`, `0002_data_model.sql`, `0003_stars.sql`.

3. **Turn off email confirmation** (optional, but sign up is instant without it). In Supabase: Authentication, Sign In / Providers, switch off "Confirm email".

4. **Add your keys.** Copy `.env.example` to `.env.local` and fill in the first two values from Supabase: Project Settings, API.

   ```bash
   cp .env.example .env.local
   ```

5. **Start it.**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 and sign up.

## Tests

```bash
npm test          # 45 unit tests: validation, find, dashboard stats, score, brief, CSV import, guide
npm run test:e2e  # 12 browser tests against the running app and the real database
```

The browser tests need two test accounts. Create `.env.test.local` with `TEST_USER_A_EMAIL`, `TEST_USER_A_PASSWORD`, `TEST_USER_B_EMAIL` and `TEST_USER_B_PASSWORD`. The accounts are created on first run. To run the same tests against the deployed app, set `BASE_URL`:

```bash
BASE_URL=https://viral-radar-xi.vercel.app npm run test:e2e
```

The two tests the project is built around:

- **Data isolation** (`tests/data-isolation.spec.ts`): user B cannot see user A's formats in the list, on the dashboard, by direct link, or by asking the database.
- **Dashboard** (`tests/dashboard.spec.ts`): total and average score are correct, and update after a delete.

Failing and passing runs of both are in `docs/tests/`.

## Where things are

| Path | What |
|---|---|
| `PLAN.md` | The plan written before anything was built, with Plan vs. Reality at the bottom. |
| `schema.md` | Every table, its columns, and how the tables relate. |
| `prompts/` | The prompts behind each feature and what the agent did with them. |
| `supabase/migrations/` | The SQL that creates the database. |
| `src/app/` | Pages and server actions. |
| `src/lib/` | The logic: validation, find, stats, score, brief, import. Each has a test file beside it. |
| `tests/` | Browser tests. |
