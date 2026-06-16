import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Clipboard,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usersApi } from '../../services/api/users';
import { ENV } from '../../config/env';

interface EmailVerificationScreenProps {
  route: {
    params: {
      email: string;
      verificationLink?: string;
    };
  };
  onNavigate: (screen: 'Landing' | 'Welcome' | 'Login' | 'Register' | 'LoginVerified', params?: any) => void;
}

export default function EmailVerificationScreen({
  route,
  onNavigate
}: EmailVerificationScreenProps) {
  const { email, verificationLink } = route.params;
  const [resending, setResending] = useState(false);
  // Cooldown to avoid rapid re-clicks that trip Firebase's per-IP throttle.
  const [cooldown, setCooldown] = useState(0);
  const isDev = ENV.IS_DEV;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResendEmail = async () => {
    try {
      setResending(true);

      // Call backend to resend verification email
      await usersApi.resendVerificationEmail(email);

      console.log('[EmailVerification] Verification email resent successfully');

      setCooldown(60);
      Alert.alert('Email inviata', 'Controlla la tua casella di posta');
    } catch (error: any) {
      console.error('[EmailVerification] Failed to resend email:', error);
      setCooldown(30);
      Alert.alert('Errore', error.message || 'Impossibile inviare email');
    } finally {
      setResending(false);
    }
  };

  return (
    <LinearGradient colors={['#52418d', '#7a57f6']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📧</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Controlla la tua email</Text>

          {/* Message */}
          <Text style={styles.message}>
            Ti abbiamo inviato un'email di verifica all'indirizzo{' '}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <Text style={styles.message}>
            Apri l'email e clicca sul link per verificare il tuo account.
            Dopo la verifica potrai accedere con email e password.
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Non vedi l'email?</Text>
              <Text style={styles.infoText}>
                Controlla la cartella spam o posta indesiderata.
                Può richiedere alcuni minuti per arrivare.
              </Text>
            </View>
          </View>

          {/* Dev Mode - Verification Link (only in development) */}
          {isDev && verificationLink && (
            <View style={styles.devModeContainer}>
              <Text style={styles.devModeTitle}>🔧 Dev Mode - Verification Link:</Text>
              <Text style={styles.devModeLink} numberOfLines={3}>
                {verificationLink}
              </Text>
              <View style={styles.devModeButtons}>
                <TouchableOpacity
                  style={styles.devModeButton}
                  onPress={() => {
                    Linking.openURL(verificationLink);
                  }}
                >
                  <Text style={styles.devModeButtonText}>Open Link</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.devModeButton}
                  onPress={() => {
                    Clipboard.setString(verificationLink);
                    Alert.alert('Copiato!', 'Link copiato negli appunti');
                  }}
                >
                  <Text style={styles.devModeButtonText}>Copy Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Resend Button */}
          <TouchableOpacity
            style={[styles.primaryButton, (resending || cooldown > 0) && styles.buttonDisabled]}
            onPress={handleResendEmail}
            disabled={resending || cooldown > 0}
          >
            {resending ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.primaryButtonText}>Invio in corso...</Text>
              </View>
            ) : cooldown > 0 ? (
              <Text style={styles.primaryButtonText}>Riprova tra {cooldown}s</Text>
            ) : (
              <Text style={styles.primaryButtonText}>
                Invia di nuovo l'email di verifica
              </Text>
            )}
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onNavigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>
              Torna alla registrazione
            </Text>
          </TouchableOpacity>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            Il link di verifica è valido per 24 ore.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 448,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.25,
        shadowRadius: 50,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 44,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
    width: '100%',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B21B6',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6D28D9',
    lineHeight: 20,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#9333EA',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  devModeContainer: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  devModeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  devModeLink: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  devModeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  devModeButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  devModeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
