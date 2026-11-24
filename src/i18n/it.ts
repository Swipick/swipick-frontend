/**
 * I testi dell'app in italiano: la fonte di verità. Ogni chiave nuova nasce
 * qui; `en.ts` ha la stessa forma per tipo, quindi una traduzione mancante
 * non compila.
 *
 * Plurali alla maniera di i18next: `chiave_one` e `chiave_other`, chiamati
 * con `t('chiave', { count })`.
 */
export const it = {
  comune: {
    annulla: 'Annulla',
    conferma: 'Conferma',
    errore: 'Errore',
    riprova: 'Riprova',
  },
  lingua: {
    titolo: 'Lingua',
    automatica: 'Automatica',
    automaticaNota: 'Segue la lingua del telefono',
    italiano: 'Italiano',
    inglese: 'English',
    scegli: "Scegli la lingua dell'app",
  },
};

/** La stessa forma, con stringhe qualsiasi: è il tipo che deve rispettare ogni traduzione. */
type Forma<T> = { [K in keyof T]: T[K] extends string ? string : Forma<T[K]> };
export type Testi = Forma<typeof it>;
