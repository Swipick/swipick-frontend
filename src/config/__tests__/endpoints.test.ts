import { ENDPOINTS } from '../api';

describe('ENDPOINTS — season query param wiring (Fase 5)', () => {
  describe('FIXTURES.BY_WEEK', () => {
    it('omits season when not provided (current season on the server)', () => {
      expect(ENDPOINTS.FIXTURES.BY_WEEK(35)).toBe('/fixtures/week/35');
    });
    it('appends ?season when provided (history during the gap)', () => {
      expect(ENDPOINTS.FIXTURES.BY_WEEK(38, 2025)).toBe(
        '/fixtures/week/38?season=2025',
      );
    });
  });

  describe('MATCH_CARDS.BY_WEEK', () => {
    it('appends ?season when provided', () => {
      expect(ENDPOINTS.MATCH_CARDS.BY_WEEK(1, 2026)).toBe(
        '/match-cards/week/1?season=2026',
      );
    });
  });

  describe('PREDICTIONS.BY_WEEK', () => {
    it('keeps mode and adds &season when provided', () => {
      expect(ENDPOINTS.PREDICTIONS.BY_WEEK('u1', 38, 'live', 2025)).toBe(
        '/predictions/user/u1/week/38?mode=live&season=2025',
      );
    });
    it('omits season when not provided', () => {
      expect(ENDPOINTS.PREDICTIONS.BY_WEEK('u1', 38, 'test')).toBe(
        '/predictions/user/u1/week/38?mode=test',
      );
    });
  });

  it('exposes the last-played endpoint for Risultati init', () => {
    expect(ENDPOINTS.FIXTURES.LAST_PLAYED).toBe('/fixtures/last-played');
  });
});
