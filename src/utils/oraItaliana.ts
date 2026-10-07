/**
 * L'ora italiana di un istante, calcolata senza dipendere dal fuso del
 * dispositivo né dai dati ICU del motore JavaScript.
 *
 * L'orario di una partita di Serie A si legge in ora italiana, sempre, per
 * chiunque guardi: è la stessa scelta già dichiarata lato server in
 * `gaming-services/src/modules/match-cards/format-display-date.ts`, dove è
 * annotata la volta in cui andò storta e ogni orario usciva un'ora in
 * anticipo. Qui il frontend si allinea a quella decisione.
 *
 * Perché non `Intl` con `timeZone: 'Europe/Rome'`, che è quel che fa il
 * server: perché il server è Node con ICU completo, mentre qui si gira su
 * Hermes, dove il supporto dei fusi in `Intl` cambia con la versione e con la
 * piattaforma. `dateRange.ts` evitava già `toLocaleDateString` per lo stesso
 * motivo. La regola europea dell'ora legale è legge scritta e si implementa in
 * dieci righe verificabili: meglio dieci righe sotto test che un fallback
 * silenzioso al fuso del telefono.
 */

export const FUSO_PARTITE = 'Europe/Rome';

/** Giorni abbreviati come li scrive l'italiano, senza punto. */
export const GIORNI_BREVI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];

/**
 * Il giorno del mese dell'ultima domenica di un mese, in UTC.
 * `mese` è l'indice JavaScript: 2 è marzo, 9 è ottobre.
 */
const ultimaDomenicaDi = (anno: number, mese: number): number => {
  // Il giorno 0 del mese successivo è l'ultimo giorno di questo mese.
  const ultimo = new Date(Date.UTC(anno, mese + 1, 0));
  return ultimo.getUTCDate() - ultimo.getUTCDay();
};

/**
 * Lo scostamento dell'ora italiana dall'UTC, in minuti: 60 d'inverno, 120
 * durante l'ora legale.
 *
 * La regola europea: l'ora legale comincia l'ultima domenica di marzo alle
 * 01:00 UTC e finisce l'ultima domenica di ottobre alle 01:00 UTC. Il confronto
 * si fa in UTC proprio perché è lì che la regola è definita, così non serve
 * sapere già l'ora locale per calcolarla.
 */
export const offsetItalianoMinuti = (istante: Date): number => {
  const anno = istante.getUTCFullYear();
  const inizio = Date.UTC(anno, 2, ultimaDomenicaDi(anno, 2), 1);
  const fine = Date.UTC(anno, 9, ultimaDomenicaDi(anno, 9), 1);
  const t = istante.getTime();
  return t >= inizio && t < fine ? 120 : 60;
};

/** Le parti di una data lette in ora italiana. */
export interface PartiItaliane {
  anno: number;
  mese: number; // 1-12, non l'indice JavaScript
  giorno: number;
  ore: number;
  minuti: number;
  giornoSettimana: number; // 0 domenica … 6 sabato
}

/**
 * Scompone un istante in parti di ora italiana, o `null` se la data non è
 * valida — così chi chiama può mostrare uno stato vuoto invece di un orario
 * inventato.
 */
export const partiItaliane = (istante: Date): PartiItaliane | null => {
  if (Number.isNaN(istante.getTime())) return null;

  // Spostare l'istante dello scostamento e poi leggerlo in UTC dà le parti
  // dell'ora locale, senza mai passare dal fuso del dispositivo.
  const locale = new Date(istante.getTime() + offsetItalianoMinuti(istante) * 60000);

  return {
    anno: locale.getUTCFullYear(),
    mese: locale.getUTCMonth() + 1,
    giorno: locale.getUTCDate(),
    ore: locale.getUTCHours(),
    minuti: locale.getUTCMinutes(),
    giornoSettimana: locale.getUTCDay(),
  };
};

const due = (n: number): string => String(n).padStart(2, '0');

/** "24/10", in ora italiana. */
export const giornoMeseItaliano = (istante: Date): string | null => {
  const p = partiItaliane(istante);
  return p ? `${due(p.giorno)}/${due(p.mese)}` : null;
};

/** "gio, 24/10, 20:45", in ora italiana. */
export const calcioDInizioItaliano = (istante: Date): string | null => {
  const p = partiItaliane(istante);
  if (!p) return null;
  return `${GIORNI_BREVI[p.giornoSettimana]}, ${due(p.giorno)}/${due(p.mese)}, ${due(p.ore)}:${due(p.minuti)}`;
};
