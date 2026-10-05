import { percentualeDa } from '../percentuale';

describe('percentualeDa', () => {
  it('legge la virgola italiana', () => {
    expect(percentualeDa('65,5%')).toBe(65.5);
  });

  it('legge anche il punto e il numero intero', () => {
    expect(percentualeDa('65.5%')).toBe(65.5);
    expect(percentualeDa('70%')).toBe(70);
    expect(percentualeDa('0%')).toBe(0);
    expect(percentualeDa('100%')).toBe(100);
  });

  it('non si fa ingannare dove parseFloat sbaglierebbe', () => {
    // parseFloat('65,5%') darebbe 65: un errore sistematico e invisibile
    expect(percentualeDa('65,5%')).not.toBe(65);
  });

  it('rifiuta quello che percentuale non è', () => {
    expect(percentualeDa('—')).toBeNull();
    expect(percentualeDa('')).toBeNull();
    expect(percentualeDa('  ')).toBeNull();
    expect(percentualeDa('abc')).toBeNull();
    expect(percentualeDa(null)).toBeNull();
    expect(percentualeDa(undefined)).toBeNull();
  });

  it('rifiuta i valori fuori scala, che sarebbero un difetto a monte', () => {
    expect(percentualeDa('120%')).toBeNull();
    expect(percentualeDa('-5%')).toBeNull();
  });
});
