import { describeProviders } from '../authProviders';

describe('describeProviders — come si riassumono i metodi di accesso', () => {
  it('segnala il metodo unico, che è la condizione da cui mettere in guardia', () => {
    expect(describeProviders(['google.com'])).toEqual({
      label: 'Solo Google',
      soloUno: true,
    });
    expect(describeProviders(['password'])).toEqual({
      label: 'Solo password',
      soloUno: true,
    });
  });

  it('elenca i metodi quando sono più di uno', () => {
    expect(describeProviders(['google.com', 'password'])).toEqual({
      label: 'Google e password',
      soloUno: false,
    });
    expect(describeProviders(['google.com', 'apple.com', 'password'])).toEqual({
      label: 'Google, Apple e password',
      soloUno: false,
    });
  });

  it("non inventa un allarme quando l'elenco è vuoto", () => {
    expect(describeProviders([])).toEqual({ label: '—', soloUno: false });
  });

  it('ignora i provider che non sappiamo mostrare', () => {
    expect(describeProviders(['google.com', 'facebook.com'])).toEqual({
      label: 'Solo Google',
      soloUno: true,
    });
  });
});
