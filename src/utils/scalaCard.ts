/**
 * Quanto rimpicciolire la card di Gioca perché non finisca sotto i tasti
 * 1/X/2.
 *
 * I tasti stanno in un punto fisso sopra la barra in basso e la card ha
 * un'altezza fissa: sugli schermi bassi il tasto X copriva la riga "Ultimi 5"
 * (feedback dei tester, 25/11). Invece di soglie sull'altezza dello schermo,
 * che sbagliano sui telefoni di mezzo, si misura lo spazio vero e si
 * rimpicciolisce solo quanto basta, mai sotto il 75%.
 */
export const SCALA_MINIMA = 0.75;

export function scalaCard(spazioDisponibile: number, altezzaCard: number): number {
  if (!(spazioDisponibile > 0) || !(altezzaCard > 0)) return 1;
  return Math.max(SCALA_MINIMA, Math.min(1, spazioDisponibile / altezzaCard));
}

/**
 * La scala di React Native parte dal centro: per tenere ferma la cima della
 * card si sposta in su di metà dell'altezza persa.
 */
export function spostamentoPerScala(altezzaCard: number, scala: number): number {
  return -(altezzaCard * (1 - scala)) / 2;
}
