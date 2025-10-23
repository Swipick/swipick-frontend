import React, { useState } from 'react';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

/**
 * Auth flow without Stack Navigator (to avoid boolean/string error in Expo Go)
 * Uses simple conditional rendering instead
 */

type AuthScreen = 'Welcome' | 'Login' | 'Register';

export default function AuthNavigator() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('Welcome');

  const navigate = (screen: AuthScreen) => {
    setCurrentScreen(screen);
  };

  switch (currentScreen) {
    case 'Login':
      return <LoginScreen onNavigate={navigate} />;
    case 'Register':
      return <RegisterScreen onNavigate={navigate} />;
    case 'Welcome':
    default:
      return <WelcomeScreen onNavigate={navigate} />;
  }
}
