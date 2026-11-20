# Feature backlog — halftime-timer

Planned work only, nothing built. Shipped items move to `BUILT.md` (rules: CLAUDE.md, "Feature backlog, built list and ideas").
Specs are written here from Claude chat. Item IDs are HT-1, HT-2, ... (never reused; HT is this repo's prefix, unique across the owner's repos).

## Ready

### HT-1 — Open a countdown from a link
**In short:** Other apps (calendarkit, footykit, the gauntlet Slates) can open halftime-timer with a ready countdown to a given time, e.g. "First game · BOS @ DET 20:00".
**What:**
- A link like `?end=<ISO date-time with offset>&name=<text>` adds an end-time timer (same as "+ Add end time") with that name and selects it, so the countdown is on screen at once.
- Opening the same link twice doesn't add a duplicate (same end time + name = same timer). A time already in the past: show the timer at 0 with a short note, don't add a negative countdown.
- The floating window can't open by itself (the browser needs a click), so after a link opens a timer, the "Pop out" button is highlighted for one click.
- Existing timers and features stay as they are.
- Write the live URL and the link format at the top of the README, so the other repos can use them.
**Tests:** e2e: opening the link adds and shows the named countdown; opening it twice keeps one; a past time shows 0 and the note.
