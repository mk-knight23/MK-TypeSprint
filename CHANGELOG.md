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
- A11y (WCAG 2.2 AA, wave-2 audit fixes):
  - Global Space hijack fixed (TS-1): Space starts a test only when nothing interactive is focused (`document.activeElement === document.body`) and Start is enabled, restoring Space activation of focused controls and page scroll. New pure guards in `src/keyboard.js`; no single-key shortcut fires on editable targets (TS-6).
  - Keyboard trap fixed (TS-2): Escape now aborts a running test and returns focus to the Start button, giving keyboard users an exit from the typing input.
  - Results modal focus management (TS-3): focus moves to "Try Again" on open, Tab is trapped inside the dialog, and focus returns to Start on close (Close / Try Again / overlay / Esc). New `src/lib/focus-trap.js`; `role="dialog"` + `aria-modal` were already present.
  - Muted-label contrast (TS-4): light `--text-muted` `#94a3b8`→`#5b6b80` (2.18→4.63:1 on page bg) and dark `#64748b`→`#8b96a9` (3.43→6.25:1), both clearing AA 4.5:1 while preserving the muted/secondary hierarchy.
  - Heatmap key labels (TS-5): label color is now chosen per key (black/white) by background luminance, guaranteeing ≥4.59:1 across the accuracy scale (was as low as 2.12:1) with the green→red hue scale unchanged.
  - New tests: keyboard guards, focus-trap wrap resolver, real-DOM modal focus + Space/Esc behavior, and a numeric heatmap-contrast sweep.

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
