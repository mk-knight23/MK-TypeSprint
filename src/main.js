/**
 * App orchestrator — wires DOM events to the session, results, history,
 * and theme modules. This is the only module with top-level side effects.
 */
import { initElements, el, showSection } from './ui.js';
import { initTheme, toggleTheme } from './theme.js';
import {
  state,
  startTest,
  resetGame,
  handleInput,
  handleWordInputKeydown,
  setTestEndHandler,
  isTimedMode,
} from './session.js';
import { endTest } from './results.js';
import {
  migrateLegacyData,
  loadPersistedData,
  updateStatsDisplay,
  renderHistory,
  deleteHistoryItem,
  clearHistory,
} from './history.js';
import { track } from './analytics.js';

/* ============================================
   Bootstrap
   ============================================ */
initElements();
migrateLegacyData();
loadPersistedData();
setTestEndHandler(endTest);

// Inline onclick handlers in the markup rely on these globals.
window.showSection = showSection;
window.deleteHistoryItem = deleteHistoryItem;

/* ============================================
   Event Listeners
   ============================================ */
el.themeToggle.addEventListener('click', toggleTheme);
el.difficulty.addEventListener('change', (e) => {
  state.difficulty = e.target.value;
});

el.modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    el.modeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.dataset.mode;

    el.timerGroup.style.display = isTimedMode(state.mode) ? 'flex' : 'none';
    el.codeLanguageGroup.style.display =
      state.mode === 'code' ? 'flex' : 'none';

    track('mode_changed', { mode: state.mode });
  });
});

el.codeLanguage.addEventListener('change', (e) => {
  state.codeLanguage = e.target.value;
});
el.timerDuration.addEventListener('change', (e) => {
  state.timerDuration = parseInt(e.target.value);
});

el.startBtn.addEventListener('click', startTest);
el.resetBtn.addEventListener('click', resetGame);
el.wordInput.addEventListener('input', handleInput);
el.wordInput.addEventListener('keydown', handleWordInputKeydown);

el.historyBtn.addEventListener('click', () => {
  renderHistory();
  el.historySection.classList.toggle('show');
});

el.clearHistoryBtn.addEventListener('click', clearHistory);
el.modalCloseBtn.addEventListener('click', () =>
  el.resultsModal.classList.remove('show')
);
el.modalRestartBtn.addEventListener('click', () => {
  el.resultsModal.classList.remove('show');
  startTest();
});
el.resultsModal.addEventListener('click', (e) => {
  if (e.target === el.resultsModal) el.resultsModal.classList.remove('show');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && el.resultsModal.classList.contains('show')) {
    el.resultsModal.classList.remove('show');
  }
  if (
    e.key === ' ' &&
    document.activeElement !== el.wordInput &&
    !el.startBtn.disabled
  ) {
    e.preventDefault();
    startTest();
  }
});

/* ============================================
   Init
   ============================================ */
initTheme();
updateStatsDisplay();
renderHistory();
