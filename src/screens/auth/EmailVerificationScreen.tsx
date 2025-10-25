import React, { useState } from 'react';
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
} from 'react-native';
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
  const [manualLink, setManualLink] = useState('');
  const isDev = ENV.IS_DEV;

  const handleManualLinkTest = () => {
    // For testing: Simply navigate to LoginVerified screen
    // In production, the email link would trigger deep linking
    Alert.alert(
      '🧪 Dev Mode - Simulate Verification',
      'Simulate email verification success?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Verify',
          onPress: () => {
            // Navigate to LoginVerified screen
            onNavigate('LoginVerified');
          }
        }
      ]
    );
  };

  const handleResendEmail = async () => {
    try {
      setResending(true);

      // Call backend to resend verification email
      await usersApi.resendVerificationEmail(email);

      console.log('[EmailVerification] Verification email resent successfully');

      Alert.alert('Email inviata', 'Controlla la tua casella di posta');
    } catch (error: any) {
      console.error('[EmailVerification] Failed to resend email:', error);
      Alert.alert('Errore', error.message || 'Impossibile inviare email');
    } finally {
      setResending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>📧</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Grazie!</Text>

      {/* Message */}
      <Text style={styles.message}>
        Ti abbiamo inviato un'email di verifica all'indirizzo{' '}
        <Text style={styles.emailText}>{email}</Text>
      </Text>

      <Text style={styles.message}>
        Controlla la tua casella di posta e clicca sul link per
        verificare il tuo account. Dopo la verifica potrai accedere
        con email e password.
      </Text>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>💡</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Non vedi l'email?</Text>
          <Text style={styles.infoText}>
            Controlla la cartella spam o posta indesiderata.
            L'email potrebbe richiedere alcuni minuti per arrivare.
          </Text>
        </View>
      </View>

      {/* Dev Mode - Verification Link */}
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

      {/* Dev Mode - Manual Link Test */}
      {!verificationLink && (
        <TouchableOpacity
          style={styles.devModeManualButton}
          onPress={handleManualLinkTest}
        >
          <Text style={styles.devModeManualButtonText}>
            🧪 Dev: Test with Manual Link
          </Text>
        </TouchableOpacity>
      )}

      {/* Resend Button */}
      <TouchableOpacity
        style={[styles.primaryButton, resending && styles.buttonDisabled]}
        onPress={handleResendEmail}
        disabled={resending}
      >
        {resending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.primaryButtonText}>Invio in corso...</Text>
          </View>
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
        Il link di verifica è valido per 24 ore. Dopo la verifica
        potrai accedere con la tua email e password.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 24,
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
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1D4ED8',
    lineHeight: 20,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
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
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
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
  devModeManualButton: {
    width: '100%',
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  devModeManualButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
