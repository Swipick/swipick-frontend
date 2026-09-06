import { MatchCard, PredictionChoice } from '../types/game.types';
import { isAnswered } from './prediction';

/**
 * Regole del mazzo di "Gioca".
 *
 * La sezione mostra soltanto le partite su cui si può ancora agire: non
 * ancora iniziate e non ancora pronosticate. Tutto il resto — già giocate,
 * oppure con il calcio d'inizio passato — esce dal mazzo. Quando il mazzo si
 * svuota il giro è concluso e si passa al riepilogo.
 *
 * Da qui discendono due semplificazioni. Non serve più bloccare i pronostici
 * sulle partite iniziate, perché quelle card non vengono mai mostrate. E il
 * completamento non è più una somma fra pronostici e partite scadute — che
 * poteva contare due volte le partite pronosticate e poi iniziate — ma
 * semplicemente "il mazzo è vuoto".
 *
 * Il tempo è un parametro esplicito e mai letto da dentro: il mazzo va
 * ricalcolato mentre l'utente guarda lo schermo, perché una partita può
 * iniziare proprio mentre ha quella card davanti.
 */

export type Predictions = Map<string, PredictionChoice>;

/** Il calcio d'inizio è passato: la partita non è più pronosticabile. */
export const hasStarted = (fixture: MatchCard, now: Date): boolean =>
  new Date(fixture.kickoff.iso).getTime() <= now.getTime();

/** Una partita è giocabile se non è iniziata e non è già stata giocata. */
export const isPlayable = (
  fixture: MatchCard,
  predictions: Predictions,
  now: Date,
): boolean =>
  !hasStarted(fixture, now) &&
  !isAnswered(predictions.get(fixture.fixtureId));

/**
 * Le card da mostrare, in ordine di scadenza: la prima è quella che sta per
 * chiudersi, ed è anche quella a cui punta il countdown.
 */
export const getPlayableDeck = (
  fixtures: MatchCard[],
  predictions: Predictions,
  now: Date,
): MatchCard[] =>
  fixtures
    .filter((fixture) => isPlayable(fixture, predictions, now))
    .sort(
      (a, b) =>
        new Date(a.kickoff.iso).getTime() - new Date(b.kickoff.iso).getTime(),
    );

export interface RoundProgress {
  /** Partite non più in sospeso: pronosticate oppure scadute. */
  resolved: number;
  /** Partite ancora giocabili. */
  remaining: number;
  total: number;
}

/**
 * Risolte contro rimanenti.
 *
 * Ricavare le risolte per differenza — e non sommando pronostici e partite
 * iniziate — rende impossibile contare due volte una partita pronosticata che
 * nel frattempo è cominciata.
 */
export const getRoundProgress = (
  fixtures: MatchCard[],
  predictions: Predictions,
  now: Date,
): RoundProgress => {
  const remaining = getPlayableDeck(fixtures, predictions, now).length;
  return {
    resolved: fixtures.length - remaining,
    remaining,
    total: fixtures.length,
  };
};

/**
 * Il giro è concluso quando non resta nulla da giocare. Una giornata senza
 * partite non è "conclusa": è vuota, e va distinta perché merita un altro
 * messaggio.
 */
export const isRoundOver = (
  fixtures: MatchCard[],
  predictions: Predictions,
  now: Date,
): boolean =>
  fixtures.length > 0 &&
  getPlayableDeck(fixtures, predictions, now).length === 0;

/** La prossima scadenza fra le card giocabili, o null se non ne restano. */
export const getNextDeadline = (deck: MatchCard[]): Date | null =>
  deck.length > 0 ? new Date(deck[0].kickoff.iso) : null;

/**
 * La card successiva nel mazzo, ciclando. Serve allo skip: rimanda la scelta
 * senza uscire dall'insieme di quelle ancora giocabili.
 */
export const getNextInDeck = (
  deck: MatchCard[],
  currentId: string | null,
): string | null => {
  if (deck.length === 0) return null;

  const index = deck.findIndex((fixture) => fixture.fixtureId === currentId);
  if (index === -1) return deck[0].fixtureId;

  return deck[(index + 1) % deck.length].fixtureId;
};
