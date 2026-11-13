import { deveVerificareEmail } from '../verificaEmail';

const utente = (emailVerified: boolean, providers: string[]) =>
  ({ emailVerified, providerData: providers.map((providerId) => ({ providerId })) }) as any;

describe('deveVerificareEmail', () => {
  it('chiede la verifica a chi entra con la password senza averla fatta', () => {
    expect(deveVerificareEmail(utente(false, ['password']))).toBe(true);
  });

  it('anche se ha collegato Google: è la password a volerla', () => {
    expect(deveVerificareEmail(utente(false, ['google.com', 'password']))).toBe(true);
  });

  it('non la chiede a chi ha già verificato', () => {
    expect(deveVerificareEmail(utente(true, ['password']))).toBe(false);
  });

  it('non la chiede a chi entra solo con Google o Apple', () => {
    expect(deveVerificareEmail(utente(false, ['google.com']))).toBe(false);
    expect(deveVerificareEmail(utente(false, ['apple.com']))).toBe(false);
  });

  it('non la chiede a chi non è entrato', () => {
    expect(deveVerificareEmail(null)).toBe(false);
  });
});
