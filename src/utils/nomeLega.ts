/**
 * Confronto fra il nome digitato per confermare un'eliminazione e il nome
 * vero della lega.
 *
 * Sta qui, puro, perché è il punto dove un errore non si vede: una
 * normalizzazione troppo larga lascia eliminare una lega a chi ha scritto
 * un'altra cosa, una troppo stretta blocca chi ha scritto esattamente il nome
 * ma con una maiuscola diversa. In nessuno dei due casi appare un errore.
 */

/** Maiuscole, spazi doppi e spazi ai bordi non contano. */
export function normalizzaNomeLega(valore: string): string {
  if (typeof valore !== 'string') return '';
  return valore.trim().replace(/\s+/g, ' ').toLocaleLowerCase('it');
}

/**
 * Chiedere il nome serve a far fermare a pensare, non a far indovinare la
 * punteggiatura: la tolleranza è voluta. Due stringhe vuote non combaciano
 * mai, altrimenti un nome mancante aprirebbe la porta a chiunque.
 */
export function nomiCombaciano(digitato: string, nomeVero: string): boolean {
  const a = normalizzaNomeLega(digitato);
  const b = normalizzaNomeLega(nomeVero);
  if (a.length === 0 || b.length === 0) return false;
  return a === b;
}
