import React, { useState } from 'react';
import LandingScreen from '../screens/onboarding/LandingScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import LoginVerifiedScreen from '../screens/auth/LoginVerifiedScreen';
import ModeSelectionScreen from '../screens/game/ModeSelectionScreen';

/**
 * Auth flow without Stack Navigator (to avoid boolean/string error in Expo Go)
 * Uses simple conditional rendering instead
 */

type AuthScreen = 'Landing' | 'Welcome' | 'Login' | 'Register' | 'EmailVerification' | 'LoginVerified' | 'ModeSelection';

interface NavigationState {
  screen: AuthScreen;
  params?: any;
}

export default function AuthNavigator() {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    screen: 'Landing',
    params: undefined,
  });

  const navigate = (screen: AuthScreen, params?: any) => {
    setNavigationState({ screen, params });
  };

  switch (navigationState.screen) {
    case 'Landing':
      return <LandingScreen onNavigate={navigate} />;
    case 'Login':
      return <LoginScreen onNavigate={navigate} />;
    case 'Register':
      return <RegisterScreen onNavigate={navigate} />;
    case 'EmailVerification':
      return <EmailVerificationScreen route={{ params: navigationState.params }} onNavigate={navigate} />;
    case 'LoginVerified':
      return <LoginVerifiedScreen onNavigate={navigate} />;
    case 'ModeSelection':
      return <ModeSelectionScreen onNavigate={navigate} />;
    case 'Welcome':
    default:
      return <WelcomeScreen onNavigate={navigate} />;
  }
}
