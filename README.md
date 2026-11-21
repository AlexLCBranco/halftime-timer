# Halftime Timer

Live: **https://halftime-timer.vercel.app**

## Open a countdown from a link

```
https://halftime-timer.vercel.app/?end=<ISO date-time with offset>&name=<text>
```

Example: `https://halftime-timer.vercel.app/?end=2026-11-19T20:00:00-05:00&name=First%20game%20%C2%B7%20BOS%20%40%20DET`

- `end` (required): an ISO 8601 date-time with an offset (`Z`, `+02:00`, `-05:00`). URL-encode it (`+` must be `%2B`).
- `name` (optional): the timer's name; defaults to "Until <time>". URL-encode it.
- Adds the countdown to the timers (the "What" chips) and shows it straight away. The same `end` + `name` again reuses that timer.
- A time already in the past shows `00:00` with "already ended".
- The floating window needs one click: the "Pop out" button is highlighted after a link opens a timer.

## Addresses

The timer on screen is always in the address, so reload, back / forward and bookmarks show the same timer:

- `?timer=<id>`: a timer kept in this browser (`?timer=halftime` is the built-in one). Unknown ids open Halftime.
- `?end=…&name=…`: a linked countdown (above); this one opens the same countdown in any browser.
- No query: the timer used last in this browser.

Layout and menu follow [NAV_PATTERN.md](https://github.com/AlexLCBranco/backlogkit/blob/main/NAV_PATTERN.md).

## Tests

End-to-end tests (Playwright) live in `e2e/`:

```
cd e2e && npm install
npm test            # against the live site
npm run test:local  # against this checkout
```
