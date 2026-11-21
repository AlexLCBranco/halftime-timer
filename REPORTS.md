# Reports

Newest first.

## 2026-11-21 — HT-3

Built: HT-3 — Shared layout: pinned header menu, chips instead of dropdowns (v1.1.0). Header pinned at the top, styled from footykit FK-65: back / forward, breadcrumb "Timers › <timer>" (the timer part lists the other timers), "Go anywhere" (Ctrl+K) that finds a timer by name, and one place tab, "Timers" (the app has one place; none invented). The timers list became "What" chips above the clock (× deletes your own). No "How" row: there is one way to look at a timer. The app had no dropdowns to replace. Colours and type now match footykit.
Addresses: `?timer=<id>` for a timer kept in this browser, `?end=…&name=…` stays in the address for linked countdowns (it used to be dropped), a bare address opens the timer used last (as before).
Blocked: none. Ideas added: none.
Tests: 11 new Playwright e2e tests (e2e/nav.spec.js) for NAV_PATTERN.md section 6: header present / same height / pinned after scrolling; chips, breadcrumb, place tab and search navigate; URL round-trips through reload and back / forward; pick-a-timer under 100 ms with 13 timers; layout shift under 0.01; no `<select>`, icon-only buttons named; 390 px fits with no sideways scroll. HT-1 link tests updated for the chips and the kept address.
Screenshots: reports/ht-3/desktop.png and reports/ht-3/phone.png.
Your call: a `?timer=<id>` link only works in the browser that has that timer (timers live in the browser); only `?end=` links open anywhere.
Test by hand: the look (see the screenshots); the pop-out window still opens and shows the clock in the new colours (headless browsers have no Document Picture-in-Picture).

## 2026-11-19 — version label (no backlog item)

Built: version number (v1.0.0) in the bottom-right corner with commit and build time in its tooltip; no-cache /version.json; build step (scripts/build.mjs) and vercel.json; GitHub Actions CI running the version-bump check, unit tests, build and e2e.
Blocked: none. Ideas added: none.
Tests: version e2e (label matches /version.json, no-cache header, bottom-right, covers nothing) plus unit tests for the bump check; all passing locally and live.
Test by hand: nothing.

## 2026-11-19 — HT-1

Built: HT-1 — Open a countdown from a link (`?end=<ISO with offset>&name=<text>`; format in README).
Blocked: none. Ideas added: none.
Tests: 4 Playwright e2e tests in `e2e/` (link adds and runs the countdown, same link twice keeps one, past time shows 00:00 + note, Pop out highlight), passing locally and against the live site.
Test by hand: clicking the highlighted "Pop out" opens the floating window (headless browsers have no Document Picture-in-Picture, so this can't be automated).
