import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { onboardingGiaVisto } from '../utils/onboardingVisto';
import LandingScreen from '../screens/onboarding/LandingScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import NicknameScreen from '../screens/auth/NicknameScreen';
import LoginVerifiedScreen from '../screens/auth/LoginVerifiedScreen';

/**
 * Auth flow without Stack Navigator (to avoid boolean/string error in Expo Go)
 * Uses simple conditional rendering instead
 */

type AuthScreen =
  | 'Landing'
  | 'Onboarding'
  | 'Login'
  | 'Register'
  | 'Nickname'
  | 'EmailVerification'
  | 'LoginVerified';

/** Parametri passati tra le schermate auth. */
export interface AuthNavParams {
  email?: string;
  verificationLink?: string;
  verificationEmailSent?: boolean;
  /** Id backend dell'utente appena registrato: serve al passo 2 (nickname). */
  userId?: string;
}

/**
 * Dove porta il tasto Indietro di Android. Le schermate assenti (Landing,
 * Onboarding) lasciano uscire dall'app; `null` blocca il tasto: il nickname è
 * il passo 2 di una registrazione già avviata e, come su iOS, non ha uscite.
 */
const INDIETRO: Partial<Record<AuthScreen, AuthScreen | null>> = {
  Login: 'Landing',
  Register: 'Landing',
  Nickname: null,
  EmailVerification: 'Register',
  LoginVerified: 'Login',
};

interface NavigationState {
  screen: AuthScreen;
  params?: AuthNavParams;
}

export default function AuthNavigator() {
  // null finché non si sa se l'onboarding è già stato visto: meglio una
  // frazione di secondo di schermo vuoto che il lampo della schermata
  // sbagliata.
  const [navigationState, setNavigationState] = useState<NavigationState | null>(null);

  useEffect(() => {
    let vivo = true;
    onboardingGiaVisto().then((visto) => {
      if (vivo) setNavigationState({ screen: visto ? 'Landing' : 'Onboarding' });
    });
    return () => {
      vivo = false;
    };
  }, []);

  const schermata = navigationState?.screen;
  useEffect(() => {
    if (!schermata) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!(schermata in INDIETRO)) return false;
      const dietro = INDIETRO[schermata];
      if (dietro) setNavigationState({ screen: dietro });
      return true;
    });
    return () => sub.remove();
  }, [schermata]);

  const navigate = (screen: AuthScreen, params?: AuthNavParams) => {
    setNavigationState({ screen, params });
  };

  if (!navigationState) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  switch (navigationState.screen) {
    case 'Onboarding':
      return <OnboardingScreen onFine={() => navigate('Landing')} />;
    case 'Login':
      return <LoginScreen onNavigate={navigate} />;
    case 'Register':
      return <RegisterScreen onNavigate={navigate} />;
    case 'Nickname':
      // Passo 2 della registrazione via email. L'utente non ha ancora una
      // sessione Firebase, quindi l'id backend arriva dalla registrazione e i
      // dati della verifica viaggiano con lui fino alla schermata successiva.
      return (
        <NicknameScreen
          userId={navigationState.params?.userId ?? ''}
          onDone={() =>
            navigate('EmailVerification', {
              email: navigationState.params?.email,
              verificationLink: navigationState.params?.verificationLink,
              verificationEmailSent: navigationState.params?.verificationEmailSent,
            })
          }
        />
      );
    case 'EmailVerification':
      return (
        <EmailVerificationScreen
          route={{
            params: {
              email: navigationState.params?.email ?? '',
              verificationLink: navigationState.params?.verificationLink,
              verificationEmailSent: navigationState.params?.verificationEmailSent,
            },
          }}
          onNavigate={navigate}
        />
      );
    case 'LoginVerified':
      return <LoginVerifiedScreen onNavigate={navigate} />;
    case 'Landing':
    default:
      return <LandingScreen onNavigate={navigate} />;
  }
}
