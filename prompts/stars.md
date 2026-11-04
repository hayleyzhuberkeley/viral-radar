# Prompts: Feature 5, stars

Issue: #11. Branch: `feature/stars`.

## Key prompts

No new prompt. The agent continued from the standing instruction to finish the app to the course requirements, here: "Users can star items and see a 'starred' view. All stars live in one stars table (a junction table) where each row references a user and an item. One table for everyone, not one per user."

## What the agent did

- `supabase/migrations/0003_stars.sql`: one `stars` table with a two-column primary key (user, format), run in the Supabase SQL Editor.
- Three database rules: read your own stars, remove your own stars, add a star only as yourself and only on a format you own.
- A star button on every card and on the detail page. It fills in immediately and saves in the background.
- "All" and "Starred" tabs, with a Starred page that lists only starred formats.
- Two browser tests: star, see it under Starred, unstar. And user B cannot star or see stars on user A's format.

## A design call the agent made

The whole card is a link to the detail page, and the star sits on the card. A button inside a link is invalid and clicks would open the page. The agent made only the title a real link, stretched its click area over the card, and lifted the star above it. It did not ask me first. I am fine with it, and the test clicks the star on a card to prove it does not navigate.

## Compared with PLAN.md

Built as designed. The plan listed `starred_at` as a date. It is a timestamp.
