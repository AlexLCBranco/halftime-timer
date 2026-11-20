# Feature backlog — halftime-timer

Planned work only, nothing built. Shipped items move to `BUILT.md` (rules: CLAUDE.md, "Feature backlog, built list and ideas").
Specs are written here from Claude chat. Item IDs are HT-1, HT-2, ... (never reused; HT is this repo's prefix, unique across the owner's repos).

## Ready


### HT-3 — Shared layout: pinned header menu, chips instead of dropdowns
**In short:** halftime-timer gets the shared layout every app now uses: a header always at the top (back/forward, breadcrumb, main places, "Go anywhere" search), and under it "What" chips and a "How" switch, so nothing is hidden in dropdowns.
**What:**
- Follow [NAV_PATTERN.md](https://github.com/AlexLCBranco/backlogkit/blob/main/NAV_PATTERN.md) exactly (read it first; it is the spec). Same look as footykit FK-65 so the apps read as one site; if FK-65 has shipped, copy its header styles rather than re-designing.
- If the app has fewer than 2 places, the header still appears (back/forward, breadcrumb, search) with only the tabs it has; don't invent places.
- Replace every `<select>` used to pick what's shown with chips/strips. Every state in the URL; old URLs keep working.
**Tests:** as in NAV_PATTERN.md section 6.

