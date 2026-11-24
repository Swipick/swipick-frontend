import { it as testiIt } from '../it';
import { en } from '../en';
import { categoriaPlurale } from '../pluralRules';
import i18n, { suffissoOrdinale } from '../index';
import { formatItalianPercentage } from '../../utils/profileCalculations';
import { formatDateRange } from '../../utils/dateRange';

/** Tutte le chiavi foglia, come "lingua.titolo". */
function chiavi(o: Record<string, unknown>, prefisso = ''): string[] {
  return Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'string'
      ? [`${prefisso}${k}`]
      : chiavi(v as Record<string, unknown>, `${prefisso}${k}.`),
  );
}

describe('testi', () => {
  it('italiano e inglese hanno le stesse chiavi', () => {
    expect(chiavi(en).sort()).toEqual(chiavi(testiIt).sort());
  });

  it('nessun testo vuoto', () => {
    const vuoti = [...chiavi(testiIt), ...chiavi(en)].filter((k) => {
      const [a, ...resto] = k.split('.');
      const v = resto.reduce((o: any, p) => o?.[p], (testiIt as any)[a] ?? (en as any)[a]);
      return typeof v === 'string' && v.trim() === '';
    });
    expect(vuoti).toEqual([]);
  });

  it('ogni plurale ha la forma singolare e quella plurale', () => {
    for (const lingua of [testiIt, en]) {
      const ks = chiavi(lingua);
      for (const k of ks.filter((x) => x.endsWith('_one'))) {
        expect(ks).toContain(k.replace(/_one$/, '_other'));
      }
    }
  });
});

describe('plurali senza Intl.PluralRules', () => {
  it('"one" solo per 1 intero', () => {
    expect(categoriaPlurale(1)).toBe('one');
    expect(categoriaPlurale(0)).toBe('other');
    expect(categoriaPlurale(2)).toBe('other');
    expect(categoriaPlurale(1.5)).toBe('other');
    expect(categoriaPlurale(-1)).toBe('one');
  });
});

describe('formati per lingua', () => {
  afterEach(() => i18n.changeLanguage('it'));

  it('percentuali: virgola in italiano, punto in inglese', async () => {
    expect(formatItalianPercentage(65.54)).toBe('65,5%');
    expect(formatItalianPercentage(70)).toBe('70%');
    await i18n.changeLanguage('en');
    expect(formatItalianPercentage(65.54)).toBe('65.5%');
  });

  it('intervallo della giornata e plurali nelle due lingue', async () => {
    const date = ['2026-11-21T14:00:00Z', '2026-11-23T19:45:00Z'];
    expect(formatDateRange(date)).toBe('dal 21/11 al 23/11');
    expect(i18n.t('risultati.partite', { count: 1 })).toBe('1 partita');
    expect(i18n.t('risultati.partite', { count: 3 })).toBe('3 partite');
    await i18n.changeLanguage('en');
    expect(formatDateRange(date)).toBe('21/11 to 23/11');
    expect(i18n.t('risultati.partite', { count: 1 })).toBe('1 match');
    expect(i18n.t('risultati.partite', { count: 3 })).toBe('3 matches');
  });
});

describe('suffisso ordinale', () => {
  it('º in italiano, st/nd/rd/th in inglese', () => {
    expect(suffissoOrdinale(5, 'it')).toBe('º');
    expect(
      [1, 2, 3, 4, 11, 12, 13, 21, 22, 101].map((n) => `${n}${suffissoOrdinale(n, 'en')}`),
    ).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '101st']);
  });
});
