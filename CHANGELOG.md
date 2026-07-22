# Changelog - MK TypeSprint

All notable changes to this project will be documented in this file.

## [2.4.0] - unreleased
- Refactor: extracted the ~525-line inline script in index.html into ES modules under src/ (main.js orchestrator + analytics.js, content.js, ui.js, theme.js, session.js, results.js, history.js), loaded via `<script type="module" src="/src/main.js">`. Pure extraction — behavior preserved and proven by parity tests (old inline WPM/accuracy formulas vs src/lib/typing-metrics.js) and a jsdom integration suite that boots the real markup and types full sessions.
- End-of-test math now routes through src/lib/typing-metrics.js (summarizeTest) and all persistence routes through src/lib/storage.js (versioned `typesprint:v1:*` keys) with a one-time, non-destructive migration of legacy `typingHistory` / `typingStats` / raw `theme` values.
- Fixed residual old branding: navbar/footer showed "TF / TypeFlow"; now "TS / TypeSprint" (QA defect D1).
- New: keyboard accuracy heatmap — per-key hit/miss collection during sessions, aggregated across sessions under `typesprint:v1:perKey`, rendered as a QWERTY grid colored green→red with exact counts on hover/focus.
- New: Weak Keys practice mode — generates words biased (75%) toward your 3 lowest-accuracy letter keys (min 3 samples, perfect keys excluded), with an in-UI explanation ("Practicing: e, r, t — your lowest-accuracy keys") and a disable toggle. Deterministic, seeded-RNG-tested generator.
- New: data controls in the stats area — Export JSON (storage.exportAll download), Import JSON (validated storage.importAll with success/error feedback), and Delete All Data (confirm-gated; clears namespaced + legacy keys).
- New: progress dashboard — WPM trend sparkline (inline SVG), best WPM/accuracy records, tests taken, and total practice minutes, all from real stored history.
- CSS intentionally remains inline in index.html this wave.

## [2.3.0] - 2026-07-22
- P0 upgrade pass: fixed brand spelling (Qazi → Kazi), removed stale deploy artifacts, replaced legacy Vercel builds config with modern SPA rewrites + security headers.
- Truthful docs: real README, docs/ARCHITECTURE.md, docs/ANALYTICS.md, docs/PRIVACY.md, updated SECURITY.md.
- Analytics: GTM + GA4 only inject at build time when a valid env var is set; no fake tracking.
- PWA manifest added or corrected; JSON-LD upgraded with creator + author URLs.
- Extracted pure typing math into src/lib/typing-metrics.js and versioned localStorage layer into src/lib/storage.js with 32 new unit tests (baseline had 1).

## [2.2.0] - 2026-07-19
- Redesigned with premium glassmorphism.
- Unified brand identification under Kazi Musharraf.
- Modernized project dependencies.
- Added SEO pages, analytics wrapper, and sitemaps.
