import { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Navigation type definitions
 */

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Gioca: undefined;
  Risultati: undefined;
  Profilo: undefined;
};

// Game Stack
export type GameStackParamList = {
  ModeSelection: undefined;
  GiocaScreen: { mode: 'live' | 'test' };
  TestGiocaScreen: undefined;
};

// Results Stack
export type ResultsStackParamList = {
  RisultatiScreen: { week?: number; mode?: 'live' | 'test' };
  TestRisultatiScreen: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfiloScreen: undefined;
  ImpostazioniScreen: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Navigation props helpers
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
