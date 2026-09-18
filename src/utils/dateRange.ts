/**
 * Date range and week navigation helpers for the Risultati screen.
 */

/**
 * Format the date range of a giornata as "dal DD/MM al DD/MM".
 *
 * Deterministic formatting (no toLocaleDateString) so the output does not
 * depend on the JS engine locale data. Invalid dates are ignored; returns
 * null when there is nothing valid to format, so the caller can render an
 * empty state instead of invented dates.
 */
export const formatDateRange = (isoDates: string[]): string | null => {
  const times = isoDates
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t));

  if (times.length === 0) return null;

  const toIt = (t: number): string => {
    const d = new Date(t);
    const day = d.getUTCDate().toString().padStart(2, '0');
    const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  return `dal ${toIt(Math.min(...times))} al ${toIt(Math.max(...times))}`;
};

export interface AdjacentWeekLabels {
  previous: string | null;
  next: string | null;
}

/**
 * Labels for the previous/next slots in the week selector.
 *
 * Solo il numero: gli slot laterali sono larghi 48pt, e "Giornata" a 14px ne
 * misura una cinquantina — ci si spezzava dentro a meta' parola ("giorna" e
 * poi "ta"). La parola la dice gia' il titolo al centro, in grande.
 *
 * Oltre l'ultima giornata non c'e' un numero da mostrare, come prima della
 * giornata 1: in entrambi i casi la freccia e' comunque disabilitata.
 */
export const getAdjacentWeekLabels = (
  selectedWeek: number,
  lastWeek: number = 38,
): AdjacentWeekLabels => ({
  previous: selectedWeek > 1 ? String(selectedWeek - 1) : null,
  next: selectedWeek >= lastWeek ? null : String(selectedWeek + 1),
});
