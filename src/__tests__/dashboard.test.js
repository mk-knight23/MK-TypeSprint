import { describe, it, expect } from 'vitest';
import {
  buildSparklinePoints,
  totalPracticeMinutes,
  bestAccuracy,
} from '../dashboard.js';

describe('buildSparklinePoints', () => {
  it('returns empty string for fewer than 2 values', () => {
    expect(buildSparklinePoints([])).toBe('');
    expect(buildSparklinePoints([50])).toBe('');
    expect(buildSparklinePoints(null)).toBe('');
  });

  it('maps values into the padded viewBox', () => {
    const points = buildSparklinePoints([0, 100], 100, 50).split(' ');
    expect(points).toHaveLength(2);
    const [x1, y1] = points[0].split(',').map(Number);
    const [x2, y2] = points[1].split(',').map(Number);
    expect(x1).toBe(4); // left pad
    expect(x2).toBe(96); // width - pad
    expect(y1).toBe(46); // min value sits at the bottom
    expect(y2).toBe(4); // max value sits at the top
  });

  it('handles flat series without dividing by zero', () => {
    const points = buildSparklinePoints([60, 60, 60], 100, 50);
    expect(points.split(' ')).toHaveLength(3);
    expect(points).not.toContain('NaN');
  });
});

describe('totalPracticeMinutes', () => {
  it('sums entry.time seconds and rounds to minutes', () => {
    const history = [{ time: 60 }, { time: 90 }, { time: 30 }];
    expect(totalPracticeMinutes(history)).toBe(3);
  });

  it('ignores malformed entries', () => {
    expect(totalPracticeMinutes([{ time: 120 }, {}, { time: 'x' }, null])).toBe(
      2
    );
    expect(totalPracticeMinutes(undefined)).toBe(0);
  });
});

describe('bestAccuracy', () => {
  it('returns the highest accuracy in history', () => {
    expect(
      bestAccuracy([{ accuracy: 91 }, { accuracy: 97 }, { accuracy: 88 }])
    ).toBe(97);
  });

  it('returns 0 for empty or missing history', () => {
    expect(bestAccuracy([])).toBe(0);
    expect(bestAccuracy(null)).toBe(0);
  });
});
