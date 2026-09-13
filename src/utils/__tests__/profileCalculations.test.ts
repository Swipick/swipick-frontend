import {
  calculateWeightedAverage,
  calculateProfileKPIs,
  findBestWeek,
  findWorstWeek,
  findLastWeek,
  buildChartBars,
  ordinalWeek,
  generateShareMessage,
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

describe('findLastWeek — l\'ultima giornata e il suo andamento', () => {
  it('confronta con la precedente conclusa, non con quella prima in ordine di array', () => {
    const last = findLastWeek([
      week({ week: 4, accuracy: 70, correctPredictions: 7 }),
      week({ week: 2, accuracy: 80, correctPredictions: 8 }),
      week({ week: 3, accuracy: 40, correctPredictions: 4 }),
    ]);
    expect(last.week).toBe(4);
    expect(last.trend).toBe('up'); // 70 dopo il 40 della terza
  });

  it('non inventa un andamento quando la giornata conclusa e\' una sola', () => {
    const last = findLastWeek([week({ week: 1, accuracy: 60 })]);
    expect(last.week).toBe(1);
    expect(last.trend).toBeNull();
  });

  it('salta le giornate senza partite concluse', () => {
    const last = findLastWeek([
      week({ week: 1, accuracy: 60 }),
      week({ week: 2, finishedPredictions: 0, accuracy: 0 }),
    ]);
    expect(last.week).toBe(1);
  });
});

describe('buildChartBars', () => {
  it('tiene le giornate piu\' recenti quando sono troppe', () => {
    const stats = Array.from({ length: 12 }, (_, i) =>
      week({ week: i + 1, accuracy: 50 })
    );
    const bars = buildChartBars(stats, 8);
    expect(bars).toHaveLength(8);
    expect(bars[0].week).toBe(5);
    expect(bars[7].week).toBe(12);
  });

  it('non mostra le giornate senza risultati', () => {
    const bars = buildChartBars([
      week({ week: 1, accuracy: 60 }),
      week({ week: 2, finishedPredictions: 0 }),
    ]);
    expect(bars.map((b) => b.week)).toEqual([1]);
  });
});

describe('ordinalWeek', () => {
  it('usa l\'ordinale come il resto dell\'app', () => {
    expect(ordinalWeek(2)).toBe('2ª giornata');
  });

  it('non scrive niente quando la giornata non c\'e\'', () => {
    expect(ordinalWeek(null)).toBe('');
  });
});

describe('generateShareMessage', () => {
  it('mette media, record, sfida e link', () => {
    const kpi = calculateProfileKPIs({
      userId: 'u1',
      totalPredictions: 40,
      correctPredictions: 25,
      overallAccuracy: 62.5,
      weeklyStats: [
        week({ week: 1, correctPredictions: 6, accuracy: 60 }),
        week({ week: 2, correctPredictions: 8, accuracy: 80 }),
      ],
    });
    const msg = generateShareMessage(kpi);

    expect(msg).toContain('2 giornate su Swipick');
    expect(msg).toContain('Il mio record è 80% in una giornata.');
    expect(msg).toContain('Prova a battermi.');
    expect(msg).toContain('www.swipick.com');
  });

  it('tace sul record quando non ci sono ancora risultati', () => {
    const msg = generateShareMessage(calculateProfileKPIs(null));
    expect(msg).not.toContain('record');
    expect(msg).toContain('Prova a battermi.');
  });
});

describe('calculateProfileKPIs — numeri grezzi', () => {
  it('riporta indovinati e conclusi, non i pronostici su partite da giocare', () => {
    const kpi = calculateProfileKPIs({
      userId: 'u1',
      totalPredictions: 30,
      correctPredictions: 12,
      overallAccuracy: 60,
      weeklyStats: [
        week({ week: 1, correctPredictions: 6, accuracy: 60 }),
        week({ week: 2, correctPredictions: 6, accuracy: 60 }),
        week({ week: 3, correctPredictions: 0, finishedPredictions: 0 }),
      ],
    });
    expect(kpi.correct).toBe(12);
    expect(kpi.finished).toBe(20);
    expect(kpi.hasResults).toBe(true);
    expect(kpi.weeksPlayed).toBe(3);
  });

  it('senza risultati distingue il vuoto dallo zero', () => {
    const kpi = calculateProfileKPIs({
      userId: 'u1',
      totalPredictions: 10,
      correctPredictions: 0,
      overallAccuracy: 0,
      weeklyStats: [week({ week: 1, finishedPredictions: 0 })],
    });
    expect(kpi.hasResults).toBe(false);
    expect(kpi.chart).toEqual([]);
    expect(kpi.last.week).toBeNull();
  });
});
