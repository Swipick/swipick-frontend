import PostHog from 'posthog-react-native';
import { ENV } from '../../config/env';

/**
 * Il punto unico da cui l'app manda eventi.
 *
 * Le schermate non importano mai PostHog direttamente: chiamano `traccia`.
 * Così la dipendenza sta in un file solo, si può spegnere dalla
 * configurazione, e nei test non serve simulare una libreria intera.
 *
 * Senza chiave l'analisi è semplicemente spenta: l'app deve funzionare
 * identica a chi non ha configurato niente, e nessun evento deve far
 * fallire un'operazione dell'utente.
 */

let client: PostHog | null = null;

export function analisiAttiva(): boolean {
  return Boolean(ENV.POSTHOG_KEY);
}

export function avviaAnalisi(): PostHog | null {
  if (!analisiAttiva()) return null;
  if (client) return client;

  client = new PostHog(ENV.POSTHOG_KEY, {
    host: ENV.POSTHOG_HOST,
    // Apertura, chiusura e installazione: dicono quante sessioni ci sono
    // davvero. È un'opzione del client, non dell'autocattura del provider —
    // che non usiamo, perché schermate e tocchi riempirebbero il progetto di
    // rumore in cui i numeri che contano si perdono.
    captureAppLifecycleEvents: true,
  });

  // In sviluppo PostHog racconta cosa cattura e quando spedisce: senza, il
  // solo modo di sapere se un evento è partito è guardare il traffico di rete.
  if (__DEV__) client.debug(true);
  return client;
}

/**
 * Un evento. Non attende e non solleva mai: se l'analisi è spenta o la rete
 * non c'è, l'utente non se ne accorge.
 */
export function traccia(
  evento: string,
  proprieta?: Record<string, string | number | boolean | null>,
): void {
  try {
    client?.capture(evento, proprieta);
  } catch (err) {
    console.warn('[Analisi] evento non inviato:', evento, err);
  }
}

/** Da qui in poi gli eventi appartengono a questa persona. */
export function identifica(
  id: string,
  proprieta?: Record<string, string | number | boolean | null>,
): void {
  try {
    client?.identify(id, proprieta);
  } catch (err) {
    console.warn('[Analisi] identify fallito:', err);
  }
}

/** Al logout: gli eventi successivi non devono finire sulla persona sbagliata. */
export function dimentica(): void {
  try {
    client?.reset();
  } catch (err) {
    console.warn('[Analisi] reset fallito:', err);
  }
}

export function clientAnalisi(): PostHog | null {
  return client;
}
