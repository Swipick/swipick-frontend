import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface LoginVerifiedScreenProps {
  onNavigate: (screen: 'Landing' | 'Onboarding' | 'Login' | 'Register') => void;
}

export default function LoginVerifiedScreen({ onNavigate }: LoginVerifiedScreenProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>✅</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{t('verifica.verificataTitolo')}</Text>

      {/* Message */}
      <Text style={styles.message}>{t('verifica.verificataTesto')}</Text>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={() => onNavigate('Login')}>
        <Text style={styles.loginButtonText}>{t('verifica.vaiAlLogin')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconText: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#9333EA',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
