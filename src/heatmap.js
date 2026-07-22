/**
 * Keyboard accuracy heatmap. Aggregates per-key hit/miss counts across
 * sessions (persisted via the versioned storage layer) and renders a CSS-grid
 * QWERTY keyboard colored green -> red by accuracy.
 */
import { el } from './ui.js';
import { read, write, STORAGE_KEYS } from './lib/storage.js';

export const QWERTY_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  [' '],
];

/** Lowercase letters; everything else (digits, punctuation, space) as-is. */
export function normalizeKey(key) {
  if (typeof key !== 'string' || key.length !== 1) return null;
  return key.toLowerCase();
}

/**
 * Pure merge of a session's per-key stats into the running aggregate.
 * Returns a NEW object — inputs are not mutated.
 * @param {Record<string, {hits:number,misses:number,total:number,accuracy:number}>} aggregate
 * @param {Record<string, {hits:number,misses:number,total:number,accuracy:number}>} sessionPerKey
 */
export function mergePerKeyStats(aggregate, sessionPerKey) {
  const merged = {};
  for (const source of [aggregate || {}, sessionPerKey || {}]) {
    for (const [rawKey, stat] of Object.entries(source)) {
      const key = normalizeKey(rawKey);
      if (!key || !stat) continue;
      const prev = merged[key] || { hits: 0, misses: 0, total: 0, accuracy: 100 };
      const hits = prev.hits + (stat.hits || 0);
      const misses = prev.misses + (stat.misses || 0);
      const total = prev.total + (stat.total || 0);
      merged[key] = {
        hits,
        misses,
        total,
        accuracy: total > 0 ? Math.round((hits / total) * 100) : 100,
      };
    }
  }
  return merged;
}

/** Read the persisted aggregate (empty object when nothing stored). */
export function loadPerKeyStats() {
  const stored = read(STORAGE_KEYS.PER_KEY, {});
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}

/** Merge one finished session's per-key stats into the persisted aggregate. */
export function recordSessionPerKey(sessionPerKey) {
  if (!sessionPerKey || Object.keys(sessionPerKey).length === 0) return loadPerKeyStats();
  const merged = mergePerKeyStats(loadPerKeyStats(), sessionPerKey);
  write(STORAGE_KEYS.PER_KEY, merged);
  return merged;
}

/** Accuracy (0..100) to a green->red hue. */
function heatColor(accuracy) {
  const hue = Math.max(0, Math.min(120, Math.round((accuracy / 100) * 120)));
  return `hsl(${hue}, 72%, 42%)`;
}

function keyLabel(key) {
  return key === ' ' ? 'space' : key;
}

/** Render the QWERTY heatmap into #keyboardHeatmap. */
export function renderHeatmap() {
  if (!el.keyboardHeatmap) return;
  const stats = loadPerKeyStats();
  const hasData = Object.keys(stats).length > 0;

  const rowsHtml = QWERTY_ROWS.map((row) => {
    const keysHtml = row
      .map((key) => {
        const stat = stats[key];
        const isSpace = key === ' ';
        const classes = `heatmap-key${isSpace ? ' heatmap-space' : ''}${stat ? '' : ' heatmap-empty'}`;
        const style = stat ? ` style="background:${heatColor(stat.accuracy)};color:#fff"` : '';
        const title = stat
          ? `${keyLabel(key)} — ${stat.accuracy}% accuracy (${stat.hits} hit / ${stat.misses} miss)`
          : `${keyLabel(key)} — no data yet`;
        return `<span class="${classes}"${style} title="${title}" tabindex="0" aria-label="${title}">${keyLabel(key)}</span>`;
      })
      .join('');
    return `<div class="heatmap-row">${keysHtml}</div>`;
  }).join('');

  el.keyboardHeatmap.innerHTML = rowsHtml;
  if (el.heatmapHint) {
    el.heatmapHint.textContent = hasData
      ? 'Colored green (accurate) to red (error-prone). Hover or focus a key for exact counts.'
      : 'Complete a test to start building your per-key accuracy map.';
  }
}
