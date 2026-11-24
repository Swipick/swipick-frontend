/**
 * `Intl.PluralRules` per italiano e inglese, quando il motore non lo ha.
 *
 * Hermes implementa `Intl` solo in parte e `PluralRules` non c'è: senza,
 * i18next ignora i plurali e "1 punti" passa inosservato. Per le due lingue
 * dell'app la regola cardinale è la stessa (CLDR): "one" per 1 senza
 * decimali, "other" per tutto il resto. Dieci righe verificabili invece di
 * una dipendenza con i dati di tutte le lingue del mondo; se un giorno si
 * aggiunge una lingua con regole diverse, qui va un polyfill vero.
 */
export function categoriaPlurale(n: number): 'one' | 'other' {
  return Math.abs(n) === 1 && Number.isInteger(n) ? 'one' : 'other';
}

class PluralRulesMinime {
  private readonly locale: string;
  constructor(locales?: string | string[]) {
    this.locale = (Array.isArray(locales) ? locales[0] : locales) ?? 'it';
  }
  select(n: number): string {
    return categoriaPlurale(n);
  }
  resolvedOptions() {
    return { locale: this.locale, type: 'cardinal', pluralCategories: ['one', 'other'] };
  }
}

export function installaPluralRules(): void {
  const intl = (globalThis as { Intl?: Record<string, unknown> }).Intl;
  if (intl && typeof intl.PluralRules !== 'function') {
    intl.PluralRules = PluralRulesMinime;
  }
}
