# MK TypeSprint

**Free, private typing-speed test with WPM tracking, code practice, and progress history. No signup.**

Live: https://11-web-keyboard-practice.vercel.app

MK TypeSprint is a browser typing lab. Start a timed test or word-count test, type, get honest WPM + accuracy + per-key statistics, and watch weak keys emerge over time. Everything stays in your browser — history, personal bests, settings.

## What actually ships today

- Timed modes (15/30/60/120s + custom), word-count modes (10/25/50/100 + custom).
- Content: common English (easy/medium/hard word banks), curated quotes, code snippets in multiple languages, punctuation, numbers, and a zen mode.
- Live metrics: raw WPM, net WPM, accuracy, error count.
- Persistent history + personal best.
- Modular typing engine ([`src/lib/typing-metrics.js`](src/lib/typing-metrics.js)) with pure functions unit-tested against canonical WPM math (23 tests).
- Versioned storage layer ([`src/lib/storage.js`](src/lib/storage.js)) with namespaced keys, JSON export, JSON import, storage-usage introspection (9 tests).
- Analytics: nothing loads unless `VITE_GTM_ID` or `VITE_GA4_ID` is set at build time, or Vercel Analytics is enabled in the dashboard. See [docs/ANALYTICS.md](docs/ANALYTICS.md).

Roadmap (see [docs/ROADMAP.md](docs/ROADMAP.md)):

- Full modularization: `index.html` still holds the UI + orchestrator; the pure math and storage layers have been extracted but the DOM controller has not. Coming next.
- Keyboard heatmap + weakest-key adaptive practice using `findWeakestKeys` already exposed by `typing-metrics.js`.
- Multilingual word banks.
- Optional AI coach (env placeholders exist; no LLM calls wired yet).

## Tech stack

- Vanilla HTML + CSS + JS (ES modules)
- Vite 7
- Vitest + jsdom
- No framework migration; extraction into modules is the modernization path.

## Getting started

```bash
npm install
npm run dev
npm test
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local` for local dev.

```
VITE_GTM_ID=
VITE_GA4_ID=
```

## Deployment

Deploys to Vercel via Git integration. Framework: Vite (auto). Output: `dist/`.

## Project structure

```
index.html            # UI + main controller (extraction to modules in progress)
src/
  lib/
    typing-metrics.js       # pure math: WPM, accuracy, consistency, per-key, weakest keys
    storage.js              # versioned localStorage wrapper + export/import
    __tests__/              # unit tests
public/
  robots.txt
  sitemap.xml
  manifest.webmanifest
tests/
  app.test.js
  setup.js
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).

Built and maintained by [Kazi Musharraf](https://www.mkazi.live) (`mk-knight23`).
