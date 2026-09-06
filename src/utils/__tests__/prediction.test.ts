import { isAnswered } from '../prediction';

describe('isAnswered', () => {
  it('riconosce i tre esiti come risposte', () => {
    expect(isAnswered('1')).toBe(true);
    expect(isAnswered('X')).toBe(true);
    expect(isAnswered('2')).toBe(true);
  });

  it('non considera SKIP una risposta: la partita è rimandata, non giocata', () => {
    expect(isAnswered('SKIP')).toBe(false);
  });

  it('gestisce la card senza pronostico', () => {
    expect(isAnswered(undefined)).toBe(false);
    expect(isAnswered(null)).toBe(false);
  });
});
