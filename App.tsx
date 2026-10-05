import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { validateEnv } from './src/config/env';
import { avviaAnalisi } from './src/services/analytics';

validateEnv();

// Senza chiave non fa nulla: l'app deve partire identica a chi non ha
// configurato l'analisi.
avviaAnalisi();

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
