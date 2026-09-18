import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import NicknameScreen from '../screens/auth/NicknameScreen';
import { profileApi, needsProfileCompletion } from '../services/api/profile';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/stores/useAuthStore';

/**
 * Root navigator - switches between Auth and Main based on authentication
 * Syncs Firebase auth state with Zustand store
 */
export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const { user, isGuest, setUser, pendingNicknameUserId, setPendingNicknameUserId } =
    useAuthStore();

  useEffect(() => {
    // Listen to Firebase auth state changes and sync with Zustand store
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log(
        '[AppNavigator] Auth state changed:',
        firebaseUser ? firebaseUser.uid : 'No user'
      );
      setUser(firebaseUser);
      if (initializing) {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  // Chi ha l'accesso ma non ha ancora scelto il nickname non entra nell'area di
  // gioco: Google e Apple autenticano prima che il profilo sia completo, e chi
  // abbandona il passo 2 della registrazione si ritrova qui al rientro.
  // Il controllo non blocca l'avvio: l'app si apre e il passo 2 compare quando
  // il backend risponde.
  useEffect(() => {
    if (!user) return;
    // Chi arriva da Google o Apple lo sa già dalla risposta di sync.
    if (useAuthStore.getState().pendingNicknameUserId) return;

    let cancelled = false;

    (async () => {
      try {
        const profile = await profileApi.getUserByFirebaseUid(user.uid);
        if (cancelled) return;
        if (needsProfileCompletion(profile.data)) {
          setPendingNicknameUserId(profile.data.id);
        }
      } catch (error) {
        // Profilo non raggiungibile (backend lento, utente appena creato):
        // meglio lasciar entrare che bloccare davanti a una schermata muta.
        console.warn('[AppNavigator] Controllo profilo non riuscito:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading Swipick...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user && pendingNicknameUserId ? (
        <NicknameScreen
          userId={pendingNicknameUserId}
          onDone={() => setPendingNicknameUserId(null)}
        />
      ) : user || isGuest ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});
