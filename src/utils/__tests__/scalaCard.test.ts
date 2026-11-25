import { SCALA_MINIMA, scalaCard, spostamentoPerScala } from '../scalaCard';

describe('scalaCard', () => {
  it('lascia la card intera quando lo spazio basta', () => {
    expect(scalaCard(600, 500)).toBe(1);
    expect(scalaCard(500, 500)).toBe(1);
  });

  it('la rimpicciolisce quanto serve per non finire sotto i tasti', () => {
    expect(scalaCard(450, 500)).toBeCloseTo(0.9);
  });

  it('non scende sotto la scala minima', () => {
    expect(scalaCard(100, 500)).toBe(SCALA_MINIMA);
  });

  it('senza misure (primo disegno) non tocca nulla', () => {
    expect(scalaCard(0, 500)).toBe(1);
    expect(scalaCard(500, 0)).toBe(1);
  });

  it("sposta in su di metà dell'altezza persa", () => {
    expect(spostamentoPerScala(500, 0.9)).toBeCloseTo(-25);
    expect(spostamentoPerScala(500, 1)).toBeCloseTo(0);
  });
});
