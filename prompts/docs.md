# Prompts: documentation and deployment

Issue: #23. Branch: `docs/readme`.

## Key prompts

1. > Set up Vercel for me. Fetch https://vercel.com/get-started.md and follow it.

   The agent installed the Vercel CLI and started a login, which I confirmed in my browser. It found the project I had already created from the Vercel website. That project had no environment variables, so the live site answered every request with an error. The agent added the two public Supabase values from my local file through the CLI and redeployed.

2. > 快快快
   (Hurry up.)

## What the agent did

- README.md: what the app does, the live URL, the tools, how to run it and how to test it.
- PLAN.md: added Plan vs. Reality at the bottom. The original plan above it is untouched.
- schema.md: added a comparison with section 3 of the plan.
- The browser tests can now run against the live URL with `BASE_URL`. All nine pass there.

## Where I had to step in

- The agent would not type the Supabase key into Vercel's web form, and asked me to paste it. Before I did, I gave it the Vercel guide, and it set the value through the command line from my local file instead.
- Installing Vercel's GitHub app, which gives Vercel access to my repository, was mine to click.
