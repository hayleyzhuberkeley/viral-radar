# Prompts: stranger-test fix, nav bar

Issue: #27. Branch: `fix/nav`.

## Key prompt

I sent the agent a screenshot of the header and wrote:

> 这个nav bar点起来也不方便
> (This nav bar is also awkward to click.)

## What the agent did

- Each nav item is now a 40px-tall target with padding around the text, so a click near the edge still lands. Before, the target was only as big as the word.
- The current page is marked with a filled background and an accent underline. "Radar" stays marked on the Starred tab and on a format's pages.
- The logo and the Log out button are the same height as the nav items, and the header wraps on a narrow screen. The email is hidden on phones.
- One browser test: checks each item is at least 40px tall, clicks near the corner of an item instead of on the text, checks the current-page marker moves, and checks nothing overflows at phone width.

## A test that failed for the wrong reason

After this change the dashboard test failed once: after deleting a format, the page had not returned to the list within five seconds. Run alone, it passed. The cause was the development server compiling a page for the first time after the code changed. The agent gave every check ten seconds, reran all twelve tests, and they passed. It did not change the app, and it said so before changing the timeout.
