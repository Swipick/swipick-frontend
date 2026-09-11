jest.mock('../../services/api/predictions', () => ({
  predictionsApi: {
    createPrediction: jest.fn(),
    deleteUserPredictions: jest.fn(),
    getUserPredictions: jest.fn(),
  },
}));
jest.mock('../../services/api/fixtures', () => ({
  fixturesApi: { getFixturesByWeek: jest.fn(), getLiveWeek: jest.fn() },
}));

import { act } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { predictionsApi } from '../../services/api/predictions';
import { MatchCard, PredictionChoice } from '../../types/game.types';

const mockCreate = predictionsApi.createPrediction as jest.Mock;

const fixture = (id: string): MatchCard =>
  ({ fixtureId: id, homeTeam: { name: 'A' }, awayTeam: { name: 'B' } } as unknown as MatchCard);

const seed = (predictions: Array<[string, PredictionChoice]> = []) =>
  useGameStore.setState({
    fixtures: [fixture('f1'), fixture('f2')],
    predictions: new Map(predictions),
    skippedFixtures: [],
    currentIndex: 0,
    currentWeek: 4,
    mode: 'live',
    loading: false,
    error: null,
    predictionError: null,
    isComplete: false,
    showSummary: false,
  });

describe('useGameStore.makePrediction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    seed();
  });

  it('salva e restituisce true', async () => {
    mockCreate.mockResolvedValue({});
    let ok: boolean | undefined;
    await act(async () => {
      ok = await useGameStore.getState().makePrediction('1', 'u1', 'f1');
    });
    expect(ok).toBe(true);
    expect(useGameStore.getState().predictions.get('f1')).toBe('1');
    expect(useGameStore.getState().predictionError).toBeNull();
  });

  it('su fallimento restituisce false e NON svuota la schermata', async () => {
    mockCreate.mockRejectedValue(new Error('rete assente'));
    let ok: boolean | undefined;
    await act(async () => {
      ok = await useGameStore.getState().makePrediction('2', 'u1', 'f1');
    });
    expect(ok).toBe(false);
    // `error` fa comparire la pagina d'errore a tutto schermo: deve restare nullo.
    expect(useGameStore.getState().error).toBeNull();
    expect(useGameStore.getState().predictionError).toEqual({ fixtureId: 'f1', choice: '2' });
    // Il pronostico non risulta salvato: l'utente non deve credere il contrario.
    expect(useGameStore.getState().predictions.has('f1')).toBe(false);
  });

  it('un ritenta riuscito ripulisce l\'errore', async () => {
    mockCreate.mockRejectedValueOnce(new Error('rete assente')).mockResolvedValue({});
    await act(async () => {
      await useGameStore.getState().makePrediction('X', 'u1', 'f1');
    });
    expect(useGameStore.getState().predictionError).not.toBeNull();
    await act(async () => {
      await useGameStore.getState().makePrediction('X', 'u1', 'f1');
    });
    expect(useGameStore.getState().predictionError).toBeNull();
    expect(useGameStore.getState().predictions.get('f1')).toBe('X');
  });

  it('la stessa scelta gia\' registrata non rimanda nulla al server', async () => {
    seed([['f1', '1']]);
    let ok: boolean | undefined;
    await act(async () => {
      ok = await useGameStore.getState().makePrediction('1', 'u1', 'f1');
    });
    expect(ok).toBe(true);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('in modalita\' ospite salva in locale senza chiamare il server', async () => {
    await act(async () => {
      await useGameStore.getState().makePrediction('1', '', 'f1');
    });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(useGameStore.getState().predictions.get('f1')).toBe('1');
  });
});

describe('useGameStore.clearSession', () => {
  it('azzera lo stato locale senza toccare il server', () => {
    seed([['f1', '1']]);
    useGameStore.setState({ predictionError: { fixtureId: 'f1', choice: '1' } });

    act(() => {
      useGameStore.getState().clearSession();
    });

    const s = useGameStore.getState();
    expect(s.fixtures).toEqual([]);
    expect(s.predictions.size).toBe(0);
    expect(s.predictionError).toBeNull();
    expect(s.error).toBeNull();
    // resetGame cancella i pronostici sul server: clearSession no.
    expect(predictionsApi.deleteUserPredictions).not.toHaveBeenCalled();
  });
});
