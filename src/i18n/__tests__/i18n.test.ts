import { it as testiIt } from '../it';
import { en } from '../en';
import { categoriaPlurale } from '../pluralRules';

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
