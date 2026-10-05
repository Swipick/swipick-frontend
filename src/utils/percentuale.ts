/**
 * Il numero dentro una percentuale scritta per gli umani.
 *
 * Il profilo mostra «65,5%» con la virgola, perché è italiano. Mandare quella
 * stringa a un sistema di analisi la renderebbe inconfrontabile con i numeri
 * che arrivano da altrove, e un `parseFloat` ingenuo su «65,5%» restituisce
 * 65: l'errore sarebbe invisibile e sistematico.
 */
export function percentualeDa(testo: string | null | undefined): number | null {
  if (typeof testo !== 'string') return null;

  const pulito = testo.replace('%', '').replace(',', '.').trim();
  if (pulito.length === 0) return null;

  const numero = Number(pulito);
  if (!Number.isFinite(numero)) return null;
  if (numero < 0 || numero > 100) return null;

  return numero;
}
