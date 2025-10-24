import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/stores/useAuthStore';

/**
 * Root navigator - switches between Auth and Main based on authentication
 * Syncs Firebase auth state with Zustand store
 */
export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const { user, setUser } = useAuthStore();

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
      {user ? <MainNavigator /> : <AuthNavigator />}
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
