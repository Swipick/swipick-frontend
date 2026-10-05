import { normalizzaNomeLega, nomiCombaciano } from '../nomeLega';

describe('nomiCombaciano', () => {
  it('accetta il nome esatto', () => {
    expect(nomiCombaciano('Amici del bar', 'Amici del bar')).toBe(true);
  });

  it('non guarda le maiuscole', () => {
    expect(nomiCombaciano('amici del bar', 'Amici del bar')).toBe(true);
    expect(nomiCombaciano('AMICI DEL BAR', 'Amici del bar')).toBe(true);
  });

  it('perdona spazi ai bordi e spazi doppi', () => {
    expect(nomiCombaciano('  Amici del bar  ', 'Amici del bar')).toBe(true);
    expect(nomiCombaciano('Amici  del   bar', 'Amici del bar')).toBe(true);
  });

  it('rifiuta un nome diverso, anche di poco', () => {
    expect(nomiCombaciano('Amici del ba', 'Amici del bar')).toBe(false);
    expect(nomiCombaciano('Amici del bar!', 'Amici del bar')).toBe(false);
    expect(nomiCombaciano('Ufficio', 'Amici del bar')).toBe(false);
  });

  it('non lascia passare il vuoto', () => {
    expect(nomiCombaciano('', 'Amici del bar')).toBe(false);
    expect(nomiCombaciano('   ', 'Amici del bar')).toBe(false);
    // e una lega senza nome non apre la porta a chi scrive niente
    expect(nomiCombaciano('', '')).toBe(false);
  });

  it('regge quello che non è una stringa', () => {
    expect(nomiCombaciano(undefined as unknown as string, 'Lega')).toBe(false);
    expect(nomiCombaciano('Lega', null as unknown as string)).toBe(false);
  });

  it('tiene gli accenti: non sono rumore ortografico', () => {
    expect(nomiCombaciano('Lega perché no', 'Lega perché no')).toBe(true);
    expect(nomiCombaciano('Lega perche no', 'Lega perché no')).toBe(false);
  });
});

describe('normalizzaNomeLega', () => {
  it('riduce spazi e maiuscole', () => {
    expect(normalizzaNomeLega('  Amici   DEL bar ')).toBe('amici del bar');
  });
});
