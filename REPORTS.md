# Reports

Newest first.

## 2026-11-19 — HT-1

Built: HT-1 — Open a countdown from a link (`?end=<ISO with offset>&name=<text>`; format in README).
Blocked: none. Ideas added: none.
Tests: 4 Playwright e2e tests in `e2e/` (link adds and runs the countdown, same link twice keeps one, past time shows 00:00 + note, Pop out highlight), passing locally and against the live site.
Test by hand: clicking the highlighted "Pop out" opens the floating window (headless browsers have no Document Picture-in-Picture, so this can't be automated).
