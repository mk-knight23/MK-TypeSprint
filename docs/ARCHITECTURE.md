# Architecture — MK TypeSprint

## Current state

A single `index.html` (~1900 lines) plus extracted pure logic under `src/lib/`. No framework migration is planned.

```
index.html
  ├── <head>       meta, JSON-LD, manifest link, opt-in analytics
  ├── <style>      ~900 lines of CSS (extraction to src/styles pending)
  ├── <body>       markup for sections
  └── <script>     UI orchestrator (extraction to src/main.js pending)

src/lib/
  typing-metrics.js   pure math (WPM, accuracy, consistency, per-key, weakest keys)
  storage.js          versioned localStorage wrapper (export/import/usage)
  __tests__/          33 unit tests total
```

## Why extract math + storage first?

Those are the pieces most likely to be wrong, and the pieces most valuable to have unit-tested. They are also framework-agnostic — extracting them commits to no migration path.

Once these modules are in place, the DOM controller in `index.html` can be gradually moved out into `src/main.js` and split into small modules per concern (mode selection, session controller, results modal, history, theme). No framework is needed for that; ES modules are enough.

## WPM math (canonical)

Formulas match Monkeytype / 10FastFingers convention:

- 1 word = 5 characters
- raw WPM = `(totalChars / 5) / minutes`
- net WPM = `(correctChars / 5) / minutes` (penalizes errors)
- accuracy = `round(correctChars / totalChars * 100)`
- consistency = `round((1 - stdev/mean) * 100)` over inter-keystroke intervals

`summarizeTest(input)` in `typing-metrics.js` returns all metrics in one call. Every formula is unit-tested against representative inputs.

## Storage layout

Every persistent key lives under `typesprint:v1:*`. The `v1` prefix reserves space for a future migration when the schema needs to change.

- `typesprint:v1:stats`     — `{ tests, bestWPM, totalTime, avgWpm, avgAccuracy }`
- `typesprint:v1:history`   — `Array<{ date, wpm, rawWPM, accuracy, ... }>` capped at 100
- `typesprint:v1:theme`     — `"light" | "dark"`
- `typesprint:v1:settings`  — future

Legacy unversioned keys (e.g. `typingStats`, `typingHistory`) are read as a fallback via `read()` so existing users do not lose data.

## Security surface

- Zero server. Zero third-party network calls without user configuration.
- Analytics scripts are only injected when a valid GTM/GA4 id is present at build time; the placeholder `%VITE_GTM_ID%` is explicitly rejected.

## What is intentionally not built (yet)

- Framework migration. Not justified by the current scope.
- Public leaderboards. Would require secure server validation to prevent cheating.
- Nutrition, calories, WPM-to-life-outcome claims. Would be dishonest.
