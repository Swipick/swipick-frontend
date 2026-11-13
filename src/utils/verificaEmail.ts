import type { User } from 'firebase/auth';

/**
 * Chi deve ancora verificare l'email.
 *
 * Solo chi entra con una password: con Google o Apple è il provider a
 * garantire l'indirizzo. Conta lo stato di Firebase, perché è Firebase a
 * decidere se il link di verifica serve ancora.
 */
export function deveVerificareEmail(user: Pick<User, 'emailVerified' | 'providerData'> | null) {
  if (!user || user.emailVerified) return false;
  return user.providerData.some((p) => p.providerId === 'password');
}
