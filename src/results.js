/**
 * End-of-test flow: compute the final summary via the pure metrics library,
 * persist stats + history, and show the results modal.
 */
import { el } from './ui.js';
import { track } from './analytics.js';
import { summarizeTest } from './lib/typing-metrics.js';
import {
  getStats,
  saveStats,
  addHistoryEntry,
  updateStatsDisplay,
  renderHistory,
} from './history.js';
import { state, stopTimer } from './session.js';

export function endTest() {
  state.isRunning = false;
  stopTimer();

  const elapsedSec = (Date.now() - state.startTime) / 1000;
  const summary = summarizeTest({
    totalChars: state.totalChars,
    correctChars: state.correctChars,
    elapsedSec,
    errors: state.errors,
    keystrokes: state.keystrokes,
  });

  // Personal best check
  const stats = getStats();
  const isPersonalBest = summary.netWpm > stats.bestWPM;

  stats.tests++;
  if (isPersonalBest) stats.bestWPM = summary.netWpm;
  saveStats();

  // History entry
  addHistoryEntry({
    date: new Date().toISOString(),
    wpm: summary.netWpm,
    rawWPM: summary.rawWpm,
    accuracy: summary.accuracy,
    time: Math.round(elapsedSec),
    errors: state.errors,
    mode: state.mode,
    difficulty: state.difficulty,
  });

  updateStatsDisplay();
  renderHistory();

  // Modal
  el.modalWPM.textContent = summary.netWpm;
  el.modalRawWPM.textContent = summary.rawWpm;
  el.modalAccuracy.textContent = summary.accuracy + '%';
  el.modalErrors.textContent = state.errors;
  el.modalPersonalBest.classList.toggle('show', isPersonalBest);
  el.resultsModal.classList.add('show');

  el.wordInput.disabled = true;
  el.startBtn.disabled = false;
  el.resetBtn.disabled = true;
  el.difficulty.disabled = false;

  track('test_completed', {
    mode: state.mode,
    wpm: summary.netWpm,
    accuracy: summary.accuracy,
    difficulty: state.difficulty,
  });
  if (isPersonalBest) track('personal_best_achieved', { wpm: summary.netWpm });
}
