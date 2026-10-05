/**
 * I nomi degli eventi, in un posto solo.
 *
 * Scritti a mano nelle schermate diventano «profilo_condiviso»,
 * «profiloCondiviso» e «share_profile» nello stesso progetto, e i grafici
 * non tornano più. Qui sono anche la documentazione di cosa misuriamo.
 */
export const EVENTI = {
  /** Il foglio di condivisione si è aperto. */
  CONDIVISIONE_APERTA: 'condivisione_aperta',
  /** L'utente ha condiviso davvero: il foglio è stato confermato. */
  CONDIVISIONE_CONCLUSA: 'condivisione_conclusa',
} as const;

/** Da dove parte la condivisione: serve a sapere in quale momento la gente si mostra. */
export type PuntoCondivisione = 'profilo' | 'risultati' | 'fine_mazzo' | 'lega';
