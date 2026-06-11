/**
 * Gestione centralizzata dei 401 ripetuti.
 *
 * Il client API non può importare lo store di auth (dipendenza circolare:
 * authService → usersApi → client). Lo store registra qui il proprio
 * signOut all'avvio; il client segnala 401 e successi.
 *
 * Un singolo 401 può essere transitorio (race sul refresh del token);
 * due consecutivi indicano una sessione non più valida → signout forzato,
 * niente sessioni "zombie".
 */

const CONSECUTIVE_401_THRESHOLD = 2;

let handler: (() => void) | null = null;
let consecutive401 = 0;

export const setUnauthorizedHandler = (fn: () => void): void => {
  handler = fn;
};

export const reportRequestSuccess = (): void => {
  consecutive401 = 0;
};

export const reportUnauthorized = (): void => {
  consecutive401 += 1;
  if (consecutive401 >= CONSECUTIVE_401_THRESHOLD) {
    consecutive401 = 0;
    handler?.();
  }
};

export const __resetForTests = (): void => {
  handler = null;
  consecutive401 = 0;
};
