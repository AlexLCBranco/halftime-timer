# Built — halftime-timer

Shipped work only, newest first (rules: CLAUDE.md, "Feature backlog, built list and ideas").

## 2026-11-19

- Version number in the bottom-right corner
  The site shows its version (v1.0.0) small in the corner; hover it for the commit and build time.
- HT-1 — Open a countdown from a link
  A link like `?end=<time>&name=<text>` opens the app with that countdown already running (see README).

### Internal

- /version.json (no-cache), build step and vercel.json, CI that runs the tests and checks the version was bumped.
- Playwright e2e tests in `e2e/` (run against the live site by default).
