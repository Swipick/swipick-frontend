import i18n from '../i18n';

/**
 * Come si riassumono i metodi di accesso collegati a un account.
 *
 * Gli identificativi arrivano da Firebase (`providerData`): è quella la
 * verità, non la colonna `authProvider` del backend, che registra solo da
 * dove si è passati la prima volta.
 */

const NOMI: Record<string, string> = {
  'google.com': 'Google',
  'apple.com': 'Apple',
};

export function describeProviders(providers: string[]): {
  label: string;
  /** Un metodo solo: chi lo perde perde l'account, e va detto. */
  soloUno: boolean;
} {
  const nomi = ['google.com', 'apple.com', 'password']
    .filter((id) => providers.includes(id))
    .map((id) => NOMI[id] ?? i18n.t('metodi.password'));

  if (nomi.length === 0) return { label: '—', soloUno: false };
  if (nomi.length === 1)
    return { label: i18n.t('metodi.solo', { metodo: nomi[0] }), soloUno: true };

  return {
    label: i18n.t('metodi.elenco', {
      primi: nomi.slice(0, -1).join(', '),
      ultimo: nomi[nomi.length - 1],
    }),
    soloUno: false,
  };
}
