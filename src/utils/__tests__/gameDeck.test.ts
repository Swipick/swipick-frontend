import { MatchCard, PredictionChoice } from '../../types/game.types';
import {
  getNextDeadline,
  getNextInDeck,
  getPlayableDeck,
  getRoundProgress,
  hasStarted,
  isPlayable,
  isRoundOver,
} from '../gameDeck';

const NOW = new Date('2026-09-06T12:00:00Z');

// Giornata reale: venerdì -> lunedì, con NOW a domenica mattina.
const fixture = (id: string, iso: string): MatchCard =>
  ({
    fixtureId: id,
    week: 3,
    kickoff: { iso, display: '' },
    stadium: '',
    home: {} as any,
    away: {} as any,
  }) as MatchCard;

const VEN = fixture('ven', '2026-09-04T18:45:00Z'); // iniziata
const SAB = fixture('sab', '2026-09-05T16:00:00Z'); // iniziata
const DOM_1 = fixture('dom1', '2026-09-06T13:00:00Z'); // aperta
const DOM_2 = fixture('dom2', '2026-09-06T18:45:00Z'); // aperta
const LUN = fixture('lun', '2026-09-07T18:45:00Z'); // aperta

const ALL = [VEN, SAB, DOM_1, DOM_2, LUN];

const preds = (entries: [string, PredictionChoice][] = []) =>
  new Map<string, PredictionChoice>(entries);

describe('hasStarted', () => {
  it('considera iniziata la partita al minuto esatto del calcio d’inizio', () => {
    expect(hasStarted(DOM_1, new Date('2026-09-06T13:00:00Z'))).toBe(true);
  });

  it('un secondo prima è ancora giocabile', () => {
    expect(hasStarted(DOM_1, new Date('2026-09-06T12:59:59Z'))).toBe(false);
  });
});

describe('isPlayable', () => {
  it('è giocabile se non è iniziata e non è pronosticata', () => {
    expect(isPlayable(DOM_1, preds(), NOW)).toBe(true);
  });

  it('non è giocabile se già pronosticata', () => {
    expect(isPlayable(DOM_1, preds([['dom1', '1']]), NOW)).toBe(false);
  });

  it('non è giocabile se il calcio d’inizio è passato', () => {
    expect(isPlayable(VEN, preds(), NOW)).toBe(false);
  });

  it('SKIP non la rende giocata: resta nel mazzo', () => {
    expect(isPlayable(DOM_1, preds([['dom1', 'SKIP']]), NOW)).toBe(true);
  });
});

describe('getPlayableDeck', () => {
  it('tiene solo le partite ancora giocabili', () => {
    const deck = getPlayableDeck(ALL, preds([['dom1', 'X']]), NOW);
    expect(deck.map((f) => f.fixtureId)).toEqual(['dom2', 'lun']);
  });

  it('ordina per scadenza, così la prima è quella che sta per chiudersi', () => {
    const deck = getPlayableDeck([LUN, DOM_2, DOM_1], preds(), NOW);
    expect(deck.map((f) => f.fixtureId)).toEqual(['dom1', 'dom2', 'lun']);
  });

  it('si svuota quando tutte sono iniziate o giocate', () => {
    const tutte = preds([
      ['dom1', '1'],
      ['dom2', 'X'],
      ['lun', '2'],
    ]);
    expect(getPlayableDeck(ALL, tutte, NOW)).toHaveLength(0);
  });
});

describe('getRoundProgress', () => {
  it('conta come risolte sia le pronosticate sia le scadute', () => {
    // 2 iniziate + 1 pronosticata = 3 risolte, 2 rimanenti.
    expect(getRoundProgress(ALL, preds([['dom1', '1']]), NOW)).toEqual({
      resolved: 3,
      remaining: 2,
      total: 5,
    });
  });

  it('non conta due volte una partita pronosticata e poi iniziata', () => {
    // 'sab' e' sia pronosticata sia gia' iniziata: vale una sola volta.
    // La vecchia somma pronostici + iniziate avrebbe dato 3 su 5 risolte
    // con 3 rimanenti, cioe' 6 partite su 5.
    const p = getRoundProgress(ALL, preds([['sab', '1']]), NOW);
    expect(p).toEqual({ resolved: 2, remaining: 3, total: 5 });
    expect(p.resolved + p.remaining).toBe(p.total);
  });

  it('a giornata mai giocata e interamente passata è tutto risolto', () => {
    const dopo = new Date('2026-09-08T00:00:00Z');
    expect(getRoundProgress(ALL, preds(), dopo)).toEqual({
      resolved: 5,
      remaining: 0,
      total: 5,
    });
  });
});

describe('isRoundOver', () => {
  it('è concluso quando non resta nulla da giocare', () => {
    const dopo = new Date('2026-09-08T00:00:00Z');
    expect(isRoundOver(ALL, preds(), dopo)).toBe(true);
  });

  it('non è concluso finché una partita è ancora aperta', () => {
    expect(isRoundOver(ALL, preds(), NOW)).toBe(false);
  });

  it('una giornata senza partite non è "conclusa": è vuota', () => {
    expect(isRoundOver([], preds(), NOW)).toBe(false);
  });
});

describe('getNextDeadline', () => {
  it('è il calcio d’inizio della prima card del mazzo', () => {
    const deck = getPlayableDeck(ALL, preds(), NOW);
    expect(getNextDeadline(deck)?.toISOString()).toBe('2026-09-06T13:00:00.000Z');
  });

  it('è null a mazzo vuoto, così il countdown sparisce', () => {
    expect(getNextDeadline([])).toBeNull();
  });
});

describe('getNextInDeck', () => {
  const deck = [DOM_1, DOM_2, LUN];

  it('avanza alla card successiva', () => {
    expect(getNextInDeck(deck, 'dom1')).toBe('dom2');
  });

  it('dall’ultima torna alla prima: lo skip rimanda, non esclude', () => {
    expect(getNextInDeck(deck, 'lun')).toBe('dom1');
  });

  it('da una card non più nel mazzo riparte dalla prima', () => {
    expect(getNextInDeck(deck, 'sparita')).toBe('dom1');
  });

  it('a mazzo vuoto non c’è dove andare', () => {
    expect(getNextInDeck([], 'dom1')).toBeNull();
  });
});
