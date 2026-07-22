/**
 * Weak-key practice mode: picks practice words biased toward the user's
 * lowest-accuracy keys (from the persisted per-key aggregate) and explains
 * the recommendation in the UI. Falls back to regular words when the user
 * disables targeting or when there is not enough per-key data yet.
 */
import { el } from './ui.js';
import { findWeakestKeys } from './lib/typing-metrics.js';
import { getWeakKeyWord, getRandomWord } from './content.js';
import { loadPerKeyStats } from './heatmap.js';

export const WEAK_KEY_COUNT = 3;
export const MIN_KEY_SAMPLES = 3;

/**
 * Letters-only weakest keys from the persisted aggregate (word banks are
 * lowercase letters, so punctuation/digits cannot be practiced with words).
 * Keys with perfect accuracy are never "weak" — no point practicing them.
 * @returns {string[]} up to WEAK_KEY_COUNT single characters
 */
export function getCurrentWeakKeys() {
  const perKey = loadPerKeyStats();
  const letterStats = {};
  for (const [key, stat] of Object.entries(perKey)) {
    if (/^[a-z]$/.test(key) && stat && stat.accuracy < 100) letterStats[key] = stat;
  }
  return findWeakestKeys(letterStats, {
    topN: WEAK_KEY_COUNT,
    minSamples: MIN_KEY_SAMPLES,
  }).map((entry) => entry.key);
}

function isTargetingEnabled() {
  return !el.weakKeyToggle || el.weakKeyToggle.checked;
}

/** Next practice word for weak mode (regular word when targeting is off). */
export function getWeakPracticeWord(difficulty) {
  const weakKeys = isTargetingEnabled() ? getCurrentWeakKeys() : [];
  if (weakKeys.length === 0) return getRandomWord(difficulty);
  return getWeakKeyWord(weakKeys, difficulty);
}

/** Refresh the "Practicing: e, r, t" explainer shown in weak-key mode. */
export function updateWeakKeyExplainer() {
  if (!el.weakKeyInfo) return;
  if (!isTargetingEnabled()) {
    el.weakKeyInfo.textContent =
      'Weak-key targeting is off — practicing regular words.';
    return;
  }
  const weakKeys = getCurrentWeakKeys();
  if (weakKeys.length === 0) {
    el.weakKeyInfo.textContent =
      'Not enough per-key data yet (3+ samples per key needed) — practicing regular words. Complete a few tests first.';
    return;
  }
  el.weakKeyInfo.textContent = `Practicing: ${weakKeys.join(', ')} — your lowest-accuracy keys.`;
}
