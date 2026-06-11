import { formatDateRange, getAdjacentWeekLabels } from '../dateRange';

describe('formatDateRange', () => {
  it('formats a multi-day week as "dal DD/MM al DD/MM"', () => {
    // Giornata su più giorni: venerdì-lunedì (caso atteso dal bug report)
    const dates = [
      '2026-04-24T18:30:00Z',
      '2026-04-25T16:00:00Z',
      '2026-04-25T20:45:00Z',
      '2026-04-26T14:00:00Z',
      '2026-04-27T20:45:00Z',
    ];
    expect(formatDateRange(dates)).toBe('dal 24/04 al 27/04');
  });

  it('uses min and max regardless of input order', () => {
    const dates = [
      '2026-04-26T14:00:00Z',
      '2026-04-24T18:30:00Z',
      '2026-04-27T20:45:00Z',
    ];
    expect(formatDateRange(dates)).toBe('dal 24/04 al 27/04');
  });

  it('formats a genuinely single-day week with the same start and end', () => {
    const dates = ['2026-05-03T15:00:00Z', '2026-05-03T20:45:00Z'];
    expect(formatDateRange(dates)).toBe('dal 03/05 al 03/05');
  });

  it('pads day and month with leading zeros', () => {
    const dates = ['2026-09-05T18:00:00Z', '2026-09-07T20:45:00Z'];
    expect(formatDateRange(dates)).toBe('dal 05/09 al 07/09');
  });

  it('returns null for an empty list (no invented fallback dates)', () => {
    expect(formatDateRange([])).toBeNull();
  });

  it('ignores invalid dates and formats from the valid ones', () => {
    const dates = ['not-a-date', '2026-04-24T18:30:00Z', '2026-04-27T20:45:00Z'];
    expect(formatDateRange(dates)).toBe('dal 24/04 al 27/04');
  });

  it('returns null when no date is valid', () => {
    expect(formatDateRange(['not-a-date', ''])).toBeNull();
  });
});

describe('getAdjacentWeekLabels', () => {
  it('returns previous and next giornata labels for a mid-season week', () => {
    expect(getAdjacentWeekLabels(20)).toEqual({
      previous: 'Giornata 19',
      next: 'Giornata 21',
    });
  });

  it('returns no previous label at week 1 (never "Giornata 0")', () => {
    expect(getAdjacentWeekLabels(1)).toEqual({
      previous: null,
      next: 'Giornata 2',
    });
  });

  it('returns the next season label at the last week (never "Giornata 39")', () => {
    expect(getAdjacentWeekLabels(38)).toEqual({
      previous: 'Giornata 37',
      next: 'Stagione successiva',
    });
  });

  it('supports a custom last week (future-proof for season config)', () => {
    expect(getAdjacentWeekLabels(40, 40)).toEqual({
      previous: 'Giornata 39',
      next: 'Stagione successiva',
    });
  });
});
