import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/stores/useAuthStore';
import { useTranslation } from 'react-i18next';

interface GuestCTAProps {
  title?: string;
  message?: string;
  /** Compact inline variant (no large icon, lighter padding) for banners. */
  compact?: boolean;
}

/**
 * Invito alla registrazione mostrato in modalità ospite dove servirebbe un
 * account (salvataggio pronostici, statistiche personali, profilo).
 * Allineato alla visual identity Swipick (viola del brand, bottone pieno
 * in stile Landing). Il bottone esce dalla modalità ospite (setGuest(false))
 * riportando al flusso di registrazione/login.
 */
export default function GuestCTA({ title, message, compact = false }: GuestCTAProps) {
  const { t } = useTranslation();
  const setGuest = useAuthStore((s) => s.setGuest);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {!compact && (
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      )}
      <Text style={[styles.title, compact && styles.titleCompact]}>
        {title ?? t('ospite.titolo')}
      </Text>
      <Text style={styles.message}>{message ?? t('ospite.messaggio')}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setGuest(false)} activeOpacity={0.85}>
        <Text style={styles.buttonText}>{t('ospite.pulsante')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  containerCompact: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand.purpleDeep,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  titleCompact: {
    fontSize: 16,
    marginTop: 0,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  button: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    backgroundColor: colors.brand.purpleDark,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
