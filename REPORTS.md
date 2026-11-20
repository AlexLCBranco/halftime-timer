# Reports

Newest first.

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
