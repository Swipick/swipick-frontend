/**
 * Calcolo del contatore della schermata Risultati.
 *
 * Estratto da RisultatiScreen perche' e' la parte del file dove un errore non
 * si vede: produce un numero plausibile qualunque cosa sbagli. Qui e' una
 * funzione pura, con `now` iniettabile, quindi verificabile.
 */

export interface WeekMeterMatch {
  status: string;
  /** ISO dell'orario di inizio */
  kickoff: string;
  actualResult: string | null;
  isCorrect: boolean | null;
  /** true se l'utente ha gia' scoperto questo risultato */
  revealed: boolean;
}

export interface WeekMeter {
  /** Indovinate sul TOTALE della giornata: parte da 0 e puo' solo salire. */
  percent: number;
  total: number;
  correct: number;
  /** Concluse ma non ancora aperte dall'utente. */
  toReveal: number;
  /** Non ancora giocate. */
  toPlay: number;
  /** Non manca piu' niente da scoprire: il numero e' definitivo. */
  isFinal: boolean;
  /** Dal primo fischio d'inizio all'ultimo triplice fischio. */
  isLive: boolean;
}

/**
 * Una partita e' "iniziata" se il backend l'ha gia' marcata oppure se l'orario
 * di inizio e' passato: lo stato puo' tardare ad aggiornarsi, l'orologio no.
 */
export const hasKickedOff = (
  status: string,
  kickoff: string,
  now: number = Date.now(),
): boolean => {
  if (status === "LIVE" || status === "FINISHED") return true;
  const start = new Date(kickoff).getTime();
  return Number.isFinite(start) && start <= now;
};

const isFinished = (m: WeekMeterMatch): boolean =>
  m.status === "FINISHED" && !!m.actualResult;

export const computeWeekMeter = (
  matches: WeekMeterMatch[],
  now: number = Date.now(),
): WeekMeter => {
  const total = matches.length;
  if (total === 0) {
    return {
      percent: 0,
      total: 0,
      correct: 0,
      toReveal: 0,
      toPlay: 0,
      isFinal: false,
      isLive: false,
    };
  }

  let revealedCount = 0;
  let correct = 0;
  let finished = 0;
  let started = 0;

  for (const m of matches) {
    if (hasKickedOff(m.status, m.kickoff, now)) started += 1;
    if (isFinished(m)) finished += 1;
    if (!m.revealed) continue;
    revealedCount += 1;
    if (m.isCorrect === true) correct += 1;
  }

  return {
    percent: Math.round((correct / total) * 100),
    total,
    correct,
    toReveal: finished - revealedCount,
    toPlay: total - finished,
    isFinal: revealedCount === total,
    isLive: started > 0 && finished < total,
  };
};
