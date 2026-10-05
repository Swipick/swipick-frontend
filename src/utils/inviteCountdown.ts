/**
 * Quanto resta a un codice d'invito.
 *
 * Due funzioni pure invece di un calcolo dentro la schermata: il conto delle
 * ore è il genere di cosa che sbaglia di uno e nessuno se ne accorge, perché
 * "47 ore" e "48 ore" sembrano entrambe giuste.
 */

/** Ore intere mancanti, arrotondate per difetto. Mai negative. */
export function oreRimanenti(
  expiresAt: string | Date | null | undefined,
  now: Date = new Date(),
): number {
  if (!expiresAt) return 0;
  const scadenza = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(scadenza.getTime())) return 0;

  const ms = scadenza.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.floor(ms / (60 * 60 * 1000));
}

/**
 * Le ore come si dicono: sotto l'ora si passa ai minuti, perché "0 ore" a
 * un utente suona come "scaduto" quando invece c'è ancora tempo.
 */
export function testoScadenza(ore: number): string {
  if (ore <= 0) return 'meno di un’ora';
  if (ore === 1) return 'un’ora';
  return `${ore} ore`;
}
