import { Share } from 'react-native';
import { traccia } from './analytics';
import { EVENTI, PuntoCondivisione } from './eventi';

/**
 * Condividere e misurarlo, in un gesto solo.
 *
 * `Share.share` distingue già fra «ha aperto il foglio e ha annullato» e «ha
 * condiviso»: è la differenza fra «la funzione si trova» e «il testo
 * convince», e buttarla via sarebbe uno spreco. Finora quell'esito finiva in
 * un console.log.
 */
export async function condividiEMisura({
  punto,
  messaggio,
  titolo,
  percentuale,
}: {
  punto: PuntoCondivisione;
  messaggio: string;
  titolo?: string;
  /** La percentuale contenuta nel testo, quando c'è: è il dato che chiedevi di contare. */
  percentuale?: number | null;
}): Promise<void> {
  const proprieta = {
    punto,
    con_percentuale: typeof percentuale === 'number',
    percentuale: typeof percentuale === 'number' ? percentuale : null,
  };

  traccia(EVENTI.CONDIVISIONE_APERTA, proprieta);

  try {
    const esito = await Share.share(
      titolo ? { title: titolo, message: messaggio } : { message: messaggio },
    );

    if (esito.action === Share.sharedAction) {
      traccia(EVENTI.CONDIVISIONE_CONCLUSA, {
        ...proprieta,
        // Su iOS dice verso quale app: su Android resta nullo.
        destinazione: esito.activityType ?? null,
      });
    }
  } catch (err) {
    // Il foglio chiuso o non disponibile non è un errore da mostrare.
    console.warn('[Condivisione] non riuscita:', err);
  }
}
