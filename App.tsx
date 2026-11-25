import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import { useLinguaStore } from './src/store/stores/useLinguaStore';
import { validateEnv } from './src/config/env';
import { avviaAnalisi } from './src/services/analytics';

validateEnv();

// Senza chiave non fa nulla: l'app deve partire identica a chi non ha
// configurato l'analisi.
avviaAnalisi();

// La lingua salvata nelle Impostazioni; finché non arriva vale quella del telefono.
useLinguaStore.getState().carica();

export default function App() {
  // Con "Automatica", la lingua del telefono si rilegge quando l'app torna in
  // primo piano: su Android la si può cambiare (anche solo per Swipick) senza
  // che l'app si riavvii.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (stato) => {
      if (stato === 'active') useLinguaStore.getState().riallinea();
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
        {/* L'app è sempre chiara: con "auto", in modalità scura le icone della
            barra di stato diventavano bianche su fondo bianco. */}
        <StatusBar style="dark" />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
