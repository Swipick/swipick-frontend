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
  accesso: {
    indietro: '← Indietro',
    email: 'Email',
    password: 'Password',
    accedi: 'Accedi',
    oppure: 'oppure',
    accediGoogle: 'Accedi con Google',
    notaApple:
      'Ti sei registrato con Apple? Accedi da iPhone e collega Google o una password in Impostazioni → Metodi di accesso.',
    passwordDimenticata: 'Hai dimenticato la password?',
    recuperaPassword: 'Recupera password',
    erroreAccesso: 'Errore di accesso',
    inserisciEmailPassword: 'Inserisci email e password',
    emailNonValida: 'Formato email non valido',
    googleNonRiuscito: 'Accesso con Google non riuscito',
    appleNonRiuscito: 'Accesso con Apple non riuscito',
    recuperoTesto: 'Inserisci il tuo indirizzo email per ricevere il link di reset password',
    invia: 'Invia',
    inserisciEmailValida: 'Inserisci un indirizzo email valido',
    emailInviataTitolo: 'Email inviata',
    emailInviataTesto:
      "Ti abbiamo inviato un'email con le istruzioni per reimpostare la password. Controlla anche la cartella spam.",
    invioNonRiuscito: "Impossibile inviare l'email. Riprova più tardi.",
  },
  registrazione: {
    passo: 'Passo {{n}} di 2',
    titolo: 'Crea account',
    sottotitolo: 'Bastano dieci secondi',
    accessoGoogleInCorso: 'Accesso con Google…',
    continuaGoogle: 'Continua con Google',
    consensoPrima: 'Continuando accetti i',
    termini: 'Termini di servizio',
    consensoMezzo: 'e la',
    privacy: 'Privacy Policy',
    tuaEmail: 'La tua email',
    inserisciEmail: 'Inserisci la tua email',
    scegliPassword: 'Scegli una password',
    passwordCorta: 'La password deve avere almeno 8 caratteri',
    passwordSuggerimento: 'Almeno 8 caratteri. Più è lunga, meglio è.',
    creazione: 'Creazione account…',
    continua: 'Continua',
    attesaServer: 'Il server potrebbe metterci qualche istante. Attendi per favore…',
    haiAccount: 'Hai già un account?',
    nonRiuscita: 'Registrazione non riuscita',
  },
  errori: {
    auth: {
      emailGiaUsata: 'Questa email è già registrata. Effettua il login.',
      emailNonValida: 'Formato email non valido.',
      accountDisabilitato: 'Questo account è stato disabilitato.',
      utenteNonTrovato: "Utente non trovato. Verifica l'indirizzo email.",
      passwordErrata: 'Password errata. Riprova.',
      passwordDebole: 'Password troppo debole. Usa almeno 8 caratteri.',
      rete: 'Errore di rete. Controlla la connessione.',
      troppiTentativi: 'Troppi tentativi falliti. Riprova più tardi.',
      credenzialiNonValide: 'Credenziali non valide. Verifica email e password.',
      appleAnnullato: 'Accesso con Apple annullato.',
      appleNonDisponibile: 'Accesso con Apple non disponibile su questo dispositivo.',
      generico: "Errore durante l'accesso. Riprova.",
      googleNonInQuestaBuild:
        'Login Google non disponibile in questa build (Expo Go). Usa email e password, oppure un development build.',
      googleNessunToken: 'Nessun token ricevuto da Google',
      googleInCorso: 'Accesso con Google già in corso',
      googlePlayServices: 'Google Play Services non disponibili su questo dispositivo',
      googleNonRiuscitoDettaglio: 'Accesso con Google non riuscito. Riprova. [{{dettaglio}}]',
      uscitaNonRiuscita: 'Uscita non riuscita. Riprova.',
      nessunUtente: 'Nessun utente collegato',
      metodoNonCollegato: 'Questo metodo non è collegato al tuo account',
      unicoMetodo: 'È il tuo unico metodo di accesso: collegane un altro prima di staccare questo.',
      senzaEmail:
        'Questo account non ha un indirizzo email: non è possibile impostare una password.',
      nessunMetodoConferma: 'Nessun metodo di accesso con cui confermare la tua identità',
    },
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
