# Halftime Timer — backlog

Ordered by priority. Built 2026-11-19 from an audit of `index.html` against the
standards in the global CLAUDE.md (version display, testing policy) and a read
of the timer logic. Tick items off (or delete them) as they ship.

## 1. Standards gaps

- [ ] **Version display.** Add `package.json` (start at `v1.0.0`), show the
      version small and muted in the bottom-right corner with commit + build
      time in its tooltip, and serve a no-cache `/version.json`. Needs a tiny
      build step (Vite, as in Calendarkit) or a script that stamps
      `index.html` at deploy time. Must not show inside the pop-out window.
- [ ] **CI version-bump check.** GitHub Action that fails a push to `main`
      when app files changed but `package.json` version didn't (port
      Calendarkit's `scripts/check-version.ts`).
- [ ] **Test suite.** There are no tests at all. Add:
  - unit tests for the pure logic (`fmt`, `nextAt`) — pull them into a small
    module so they can be imported;
  - Playwright end-to-end tests against `https://halftime-timer.vercel.app`
    covering: start/pause/reset, Space and R shortcuts, adding/deleting a
    duration timer and an end-time timer, slider scrubbing, overtime
    (`-00:05`) display, persistence across reload. Each test uses its own
    throwaway timers and deletes them (or clears `localStorage`) at the end.
  - The pop-out window (Document Picture-in-Picture) needs a user gesture and
    likely can't be driven headless — keep that as the one manual check.

## 2. Bugs / likely bugs

- [ ] **Running timer lost on reload.** Timer state (`endAt`, `state`,
      `remaining`) isn't saved, so refreshing or closing the tab mid-countdown
      resets it. Persist it and resume on load.
- [ ] **Stopping an end-time alarm restarts it for tomorrow.** When an
      "ends at" timer is done, pressing stop calls `reset()`, which
      immediately starts a new ~24 h countdown. Probably should go idle until
      started again.
- [ ] **No sound if nothing was clicked.** An end-time timer can start on page
      load; the alarm stays silent until the first click unlocks audio. At
      minimum show a "click to enable sound" hint while audio is locked.
- [ ] **Description is shared by all timers.** The name follows the selected
      timer but the description (`localStorage.desc`) is global. Decide: make
      it per-timer, or label it as a general note.
- [ ] **Space on a focused button may double-fire.** The global Space
      shortcut plus the button's own Space activation could toggle twice
      (start then pause). Verify with a test; ignore Space when the target is
      a `<button>` if it does.

## 3. Features

- [ ] **System notification when time's up** (Notification API), so it's
      noticed when the tab is in the background and the pop-out is closed.
- [ ] **Undo for deleting a timer** (the × deletes immediately, no confirm).
- [ ] **Edit an existing timer** (rename / change length) instead of
      delete-and-re-add.
- [ ] **Reorder timers** (drag in the list).
- [ ] **Alarm options:** volume, choice of sound, and how long it rings
      (currently fixed 30 s).
- [ ] **Firefox/Safari fallback for pop-out** (Document PiP is Chromium-only):
      e.g. a compact `window.open` mini-window, even though it can't stay on
      top.
- [ ] **Optional light mode** (dark stays the default).
