/**
 * Integration smoke test: boots the real index.html markup, imports the real
 * module graph (src/main.js), and exercises full typing sessions through DOM
 * events. Asserts end-of-test numbers against the ORIGINAL inline formulas
 * to prove behavior parity after the ES-module extraction.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// import.meta.url is not a file: URL under the jsdom environment — resolve
// from the project root (vitest runs with cwd at the repo root) instead.
const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
const bodyMarkup = html
  .match(/<body>([\s\S]*)<\/body>/)[1]
  .replace(/<script[^>]*><\/script>/g, '');

async function bootApp() {
  document.body.innerHTML = bodyMarkup;
  vi.resetModules();
  const session = await import('../src/session.js');
  await import('../src/main.js');
  return session;
}

/** Original inline endTest formulas (pre-refactor index.html). */
const oldNetWpm = (correctChars, timeMin) => Math.round(correctChars / 5 / timeMin);
const oldRawWpm = (totalChars, timeMin) => Math.round(totalChars / 5 / timeMin);
const oldAccuracy = (correctChars, totalChars) =>
  totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

const MS_PER_KEYSTROKE = 100;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Simulates one input event, advancing the clock and independently tracking
 * the counters with the ORIGINAL inline algorithm.
 */
function makeTyper(input, counters) {
  return function dispatchValue(value, target) {
    vi.advanceTimersByTime(MS_PER_KEYSTROKE);
    input.value = value;
    counters.total++;
    if (value.length <= target.length) {
      if (value[value.length - 1] === target[value.length - 1]) counters.correct++;
      else counters.errors++;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
}

describe('full app boot + word-mode session (parity with original)', () => {
  it('completes a 20-word test with identical WPM/accuracy numbers', async () => {
    const { state } = await bootApp();
    const input = document.getElementById('wordInput');
    const counters = { total: 0, correct: 0, errors: 0 };
    const type = makeTyper(input, counters);

    document.getElementById('startBtn').click();
    expect(state.isRunning).toBe(true);
    expect(input.disabled).toBe(false);

    for (let w = 0; w < 20; w++) {
      const word = state.currentWord;
      for (let i = 1; i <= word.length; i++) {
        type(word.slice(0, i), word);
      }
    }

    // Test must have ended after the 20th word.
    expect(state.isRunning).toBe(false);
    const modal = document.getElementById('resultsModal');
    expect(modal.classList.contains('show')).toBe(true);

    const elapsedMin = (counters.total * MS_PER_KEYSTROKE) / 60000;
    expect(document.getElementById('modalWPM').textContent).toBe(
      String(oldNetWpm(counters.correct, elapsedMin))
    );
    expect(document.getElementById('modalRawWPM').textContent).toBe(
      String(oldRawWpm(counters.total, elapsedMin))
    );
    expect(document.getElementById('modalAccuracy').textContent).toBe(
      oldAccuracy(counters.correct, counters.total) + '%'
    );
    expect(document.getElementById('modalErrors').textContent).toBe('0');

    // Persistence went through the versioned storage layer.
    const storedHistory = JSON.parse(localStorage.getItem('typesprint:v1:history'));
    expect(storedHistory).toHaveLength(1);
    expect(storedHistory[0].wpm).toBe(oldNetWpm(counters.correct, elapsedMin));
    expect(storedHistory[0].mode).toBe('word');
    const storedStats = JSON.parse(localStorage.getItem('typesprint:v1:stats'));
    expect(storedStats.tests).toBe(1);
    expect(storedStats.bestWPM).toBe(oldNetWpm(counters.correct, elapsedMin));

    // Every forward keystroke was recorded for the per-key stats.
    expect(state.keystrokes).toHaveLength(counters.total);
    expect(state.keystrokes.every((k) => k.correct)).toBe(true);
  });

  it('tracks errors and backspaces exactly like the original algorithm', async () => {
    const { state } = await bootApp();
    const input = document.getElementById('wordInput');
    const counters = { total: 0, correct: 0, errors: 0 };
    const type = makeTyper(input, counters);

    document.getElementById('startBtn').click();

    // First word: one wrong first char, backspace, then type it correctly.
    const first = state.currentWord;
    type('x', first); // wrong char → error
    type('', first); // backspace → original quirk counts correct
    for (let i = 1; i <= first.length; i++) type(first.slice(0, i), first);

    // Remaining 19 words typed cleanly.
    for (let w = 0; w < 19; w++) {
      const word = state.currentWord;
      for (let i = 1; i <= word.length; i++) type(word.slice(0, i), word);
    }

    expect(state.isRunning).toBe(false);
    const elapsedMin = (counters.total * MS_PER_KEYSTROKE) / 60000;
    expect(counters.errors).toBe(1);
    expect(document.getElementById('modalErrors').textContent).toBe('1');
    expect(document.getElementById('modalWPM').textContent).toBe(
      String(oldNetWpm(counters.correct, elapsedMin))
    );
    expect(document.getElementById('modalAccuracy').textContent).toBe(
      oldAccuracy(counters.correct, counters.total) + '%'
    );

    // Backspace produced no keystroke record; wrong + correct chars did.
    expect(state.keystrokes.filter((k) => !k.correct)).toHaveLength(1);
  });

  it('ends a timed test automatically when the timer hits zero', async () => {
    const { state } = await bootApp();
    const input = document.getElementById('wordInput');
    const counters = { total: 0, correct: 0, errors: 0 };
    const type = makeTyper(input, counters);

    // Switch to Timer mode via the real mode button.
    const timeBtn = document.querySelector('.btn-option[data-mode="time"]');
    timeBtn.click();
    expect(state.mode).toBe('time');
    expect(document.getElementById('timerGroup').style.display).toBe('flex');

    document.getElementById('startBtn').click();
    const word = state.currentWord;
    for (let i = 1; i <= Math.min(3, word.length); i++) type(word.slice(0, i), word);

    // Drain the remaining 60s of the countdown.
    vi.advanceTimersByTime(60000);

    expect(state.isRunning).toBe(false);
    expect(document.getElementById('resultsModal').classList.contains('show')).toBe(true);
    expect(document.getElementById('timerDisplay').classList.contains('show')).toBe(false);
  });
});

describe('boot-time migration and rendering', () => {
  it('migrates legacy typingHistory/typingStats/theme and renders them', async () => {
    const legacyEntry = {
      date: '2026-07-01T10:00:00.000Z',
      wpm: 64,
      rawWPM: 70,
      accuracy: 91,
      time: 60,
      errors: 6,
      mode: 'word',
      difficulty: 'medium',
    };
    localStorage.setItem('typingHistory', JSON.stringify([legacyEntry]));
    localStorage.setItem('typingStats', JSON.stringify({ tests: 7, bestWPM: 64 }));
    localStorage.setItem('theme', 'dark');

    await bootApp();

    // Namespaced copies exist.
    expect(JSON.parse(localStorage.getItem('typesprint:v1:history'))).toEqual([legacyEntry]);
    expect(JSON.parse(localStorage.getItem('typesprint:v1:stats'))).toEqual({
      tests: 7,
      bestWPM: 64,
    });
    expect(JSON.parse(localStorage.getItem('typesprint:v1:theme'))).toBe('dark');

    // And they drive the UI: stats panel, history list, theme attribute.
    expect(document.getElementById('statTests').textContent).toBe('7');
    expect(document.getElementById('statBest').textContent).toBe('64');
    expect(document.getElementById('historySection').classList.contains('show')).toBe(true);
    expect(document.getElementById('historyList').innerHTML).toContain('<strong>64</strong>');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('theme toggle flips and persists through the storage layer', async () => {
    await bootApp();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    document.getElementById('themeToggle').click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(JSON.parse(localStorage.getItem('typesprint:v1:theme'))).toBe('dark');
  });
});
