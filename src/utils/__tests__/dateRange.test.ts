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
  // Solo il numero: negli slot da 48pt "Giornata 19" si spezzava a meta'
  // parola. Il titolo al centro dice gia' di che si tratta.
  it('returns previous and next giornata numbers for a mid-season week', () => {
    expect(getAdjacentWeekLabels(20)).toEqual({
      previous: '19',
      next: '21',
    });
  });

  it('returns no previous label at week 1 (never "0")', () => {
    expect(getAdjacentWeekLabels(1)).toEqual({
      previous: null,
      next: '2',
    });
  });

  it('returns no next label at the last week (never "39")', () => {
    expect(getAdjacentWeekLabels(38)).toEqual({
      previous: '37',
      next: null,
    });
  });

  it('supports a custom last week (future-proof for season config)', () => {
    expect(getAdjacentWeekLabels(40, 40)).toEqual({
      previous: '39',
      next: null,
    });
  });
});
