import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/stores/useAuthStore';

interface LandingScreenProps {
  onNavigate: (
    screen: 'Landing' | 'Onboarding' | 'Login' | 'Register' | 'EmailVerification' | 'LoginVerified',
    params?: any,
  ) => void;
}

const { height: altezzaSchermo } = Dimensions.get('window');
const schermoPiccolo = altezzaSchermo < 750;

/**
 * La schermata d'accesso.
 *
 * Il carosello che spiegava il gioco stava qui, sopra questi stessi bottoni,
 * e per questo non lo scorreva quasi nessuno: chi arriva ha gia' un pulsante
 * sotto il pollice. Ora la spiegazione e' un passo a se' (OnboardingScreen),
 * mostrato alla prima apertura, e qui resta solo la scelta su come entrare.
 *
 * "Registrati" e' il bottone pieno e sta per primo: chi arriva qui dopo
 * l'onboarding e' nuovo, e il bottone piu' in vista deve essere il suo.
 */
export default function LandingScreen({ onNavigate }: LandingScreenProps) {
  const setGuest = useAuthStore((s) => s.setGuest);

  const esploraSenzaAccount = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('[LandingScreen] Error with haptics:', error);
    }
    // Modalita' ospite: AppNavigator passa a MainNavigator (App Store 5.1.1).
    setGuest(true);
  };

  const conTocco = async (azione: () => void) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('[LandingScreen] Error with haptics:', error);
    }
    azione();
  };

  return (
    <View style={styles.container}>
      <View style={styles.marchio}>
        <Text style={styles.title}>swipick</Text>
        <Text style={styles.tagline}>Ogni giornata fai la tua giocata</Text>
      </View>

      <View style={styles.authButtonsContainer}>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => conTocco(() => onNavigate('Register'))}
          activeOpacity={0.8}
        >
          <Text style={styles.registerButtonText}>Registrati</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => conTocco(() => onNavigate('Login'))}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Accedi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={esploraSenzaAccount}
          activeOpacity={0.7}
        >
          <Text style={styles.guestButtonText}>Esplora senza account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.comeFunziona}
          onPress={() => onNavigate('Onboarding')}
          activeOpacity={0.7}
        >
          <Text style={styles.comeFunzionaTesto}>Come funziona</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: schermoPiccolo ? 40 : 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  marchio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#5742a4',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
  },
  authButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  registerButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(111, 73, 247, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#4d32b1ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: '#6f49ff',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  comeFunziona: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  comeFunzionaTesto: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
