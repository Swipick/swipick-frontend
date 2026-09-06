import { PredictionChoice } from '../types/game.types';

/**
 * Una card è "giocata" solo se la scelta è 1, X o 2.
 *
 * `SKIP` non è una risposta: segnala che la partita è stata rimandata, ed è
 * trattata come tale ovunque si misuri il progresso (viene filtrata via da
 * `actualPredictions` nello store). La distinzione conta qui perché i
 * pronostici arrivano anche dal backend — `loadWeek` copia `choice` così
 * com'è — e scambiare un `SKIP` per una risposta nasconderebbe i pulsanti su
 * una partita che l'utente non ha ancora giocato.
 */
export const isAnswered = (
  choice: PredictionChoice | undefined | null,
): choice is '1' | 'X' | '2' =>
  choice === '1' || choice === 'X' || choice === '2';
