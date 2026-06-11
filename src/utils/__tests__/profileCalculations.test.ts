import {
  calculateWeightedAverage,
  calculateProfileKPIs,
  findBestWeek,
  findWorstWeek,
} from '../profileCalculations';
import { WeeklyStats, UserSummary } from '../../types/profile';

const week = (overrides: Partial<WeeklyStats>): WeeklyStats => ({
  week: 1,
  totalPredictions: 10,
  correctPredictions: 0,
  finishedPredictions: 10,
  accuracy: 0,
  points: 0,
  ...overrides,
});

describe('calculateWeightedAverage', () => {
  it('does not dilute the average with predictions on unfinished matches', () => {
    // Giornata 2 in corso: 10 pronostici fatti, nessuna partita finita.
    // La media deve restare quella della giornata 1 (70%), non scendere a 35%.
    const stats = [
      week({ week: 1, correctPredictions: 7, finishedPredictions: 10, accuracy: 70 }),
      week({ week: 2, correctPredictions: 0, finishedPredictions: 0, accuracy: 0 }),
    ];
    expect(calculateWeightedAverage(stats)).toBe(70);
  });

  it('returns 0 at season start when no match has finished yet', () => {
    const stats = [week({ week: 1, finishedPredictions: 0 })];
    expect(calculateWeightedAverage(stats)).toBe(0);
  });

  it('weights weeks by finished predictions', () => {
    const stats = [
      week({ week: 1, correctPredictions: 10, finishedPredictions: 10, accuracy: 100 }),
      week({ week: 2, totalPredictions: 5, correctPredictions: 0, finishedPredictions: 5, accuracy: 0 }),
    ];
    // 10 corrette su 15 finite
    expect(calculateWeightedAverage(stats)).toBeCloseTo(66.67, 1);
  });
});

describe('findBestWeek / findWorstWeek at season start', () => {
  it('returns week null when no match has finished (never "giornata 1" by default)', () => {
    const stats = [week({ week: 1, finishedPredictions: 0 })];
    expect(findBestWeek(stats).week).toBeNull();
    expect(findWorstWeek(stats).week).toBeNull();
  });
});

describe('calculateProfileKPIs — empty state inizio stagione', () => {
  it('returns a defined empty state for a null summary', () => {
    const kpi = calculateProfileKPIs(null);
    expect(kpi.weeksPlayed).toBe(0);
    expect(kpi.average).toBe('0%');
    expect(kpi.best.week).toBeNull();
    expect(kpi.worst.week).toBeNull();
  });

  it('counts played weeks but keeps best/worst empty before the first results', () => {
    const summary: UserSummary = {
      userId: 'u1',
      totalPredictions: 10,
      correctPredictions: 0,
      overallAccuracy: 0,
      weeklyStats: [week({ week: 1, finishedPredictions: 0 })],
    };
    const kpi = calculateProfileKPIs(summary);
    expect(kpi.weeksPlayed).toBe(1); // ha giocato, anche se senza risultati
    expect(kpi.average).toBe('0%');
    expect(kpi.best.week).toBeNull(); // non "giornata 1" inventata
    expect(kpi.worst.week).toBeNull();
  });

  it('keeps normal behaviour once results exist', () => {
    const summary: UserSummary = {
      userId: 'u1',
      totalPredictions: 20,
      correctPredictions: 12,
      overallAccuracy: 60,
      weeklyStats: [
        week({ week: 1, correctPredictions: 8, accuracy: 80 }),
        week({ week: 2, correctPredictions: 4, accuracy: 40 }),
      ],
    };
    const kpi = calculateProfileKPIs(summary);
    expect(kpi.weeksPlayed).toBe(2);
    expect(kpi.best.week).toBe(1);
    expect(kpi.worst.week).toBe(2);
  });
});
