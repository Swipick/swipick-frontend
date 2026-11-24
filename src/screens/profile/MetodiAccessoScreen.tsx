import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/auth/authService';
import SpazioTastiera from '../../components/common/SpazioTastiera';
import { useTranslation } from 'react-i18next';

type MetodiAccessoScreenProps = {
  navigation?: { goBack: () => void };
  email: string;
};

type Azione = null | 'google' | 'apple' | 'password' | 'reset';

/**
 * Un account, più modi per entrarci.
 *
 * Chi è arrivato da Google può aggiungere una password senza perdere Google,
 * e viceversa. Firebase tiene l'elenco su providerData: è quella la verità,
 * non la colonna authProvider del backend, che registra solo da dove si è
 * passati la prima volta.
 */
export default function MetodiAccessoScreen({ navigation, email }: MetodiAccessoScreenProps) {
  const { t } = useTranslation();
  const [providers, setProviders] = useState<string[]>(() => authService.getLinkedProviders());
  const [azione, setAzione] = useState<Azione>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');

  const hasGoogle = providers.includes('google.com');
  const hasApple = providers.includes('apple.com');
  const hasPassword = providers.includes('password');

  const refresh = () => setProviders(authService.getLinkedProviders());

  const run = async (quale: Exclude<Azione, null>, fn: () => Promise<void>) => {
    try {
      setAzione(quale);
      await fn();
      refresh();
    } catch (error: any) {
      const code = error?.code ?? '';
      // Annullare non è un errore: chi chiude il foglio di Apple o Google
      // non ha bisogno di un avviso che glielo ricordi.
      if (
        code === 'ERR_REQUEST_CANCELED' ||
        error?.message === 'apple-sign-in-cancelled' ||
        error?.message === 'Google sign-in was cancelled'
      ) {
        return;
      }

      if (code === 'auth/credential-already-in-use') {
        Alert.alert(t('metodi.giaInUsoTitolo'), t('metodi.giaInUsoTesto'));
        return;
      }

      console.error('[MetodiAccessoScreen] Azione non riuscita:', error);
      Alert.alert(t('comune.errore'), error?.message || t('metodi.nonRiuscita'));
    } finally {
      setAzione(null);
    }
  };

  const handleAddPassword = () => {
    if (password.length < 8) {
      Alert.alert(t('metodi.passwordCortaTitolo'), t('metodi.passwordCortaTesto'));
      return;
    }

    run('password', async () => {
      await authService.addPassword(password);
      setPassword('');
      setShowPasswordForm(false);
      Alert.alert(
        t('metodi.passwordImpostataTitolo'),
        t('metodi.passwordImpostataTesto', { email }),
      );
    });
  };

  /**
   * Cambiare la password vuol dire riceverne il link via email: la vecchia
   * non la chiediamo, cosi' chi non se la ricorda piu' non resta bloccato.
   */
  const handleResetPassword = () => {
    Alert.alert(t('metodi.cambiarePassword'), t('metodi.tiMandiamoLink', { email }), [
      { text: t('comune.annulla'), style: 'cancel' },
      {
        text: t('metodi.mandamiLink'),
        onPress: () =>
          run('reset', async () => {
            await authService.resetPassword(email.trim().toLowerCase());
            Alert.alert(t('metodi.linkInviatoTitolo'), t('metodi.linkInviatoTesto'));
          }),
      },
    ]);
  };

  const handleUnlink = (providerId: 'google.com' | 'apple.com', nome: string) => {
    Alert.alert(t('metodi.scollegareChi', { nome }), t('metodi.scollegareTesto', { nome }), [
      { text: t('comune.annulla'), style: 'cancel' },
      {
        text: t('metodi.scollega'),
        style: 'destructive',
        onPress: () =>
          run(providerId === 'google.com' ? 'google' : 'apple', () =>
            authService.unlinkProvider(providerId),
          ),
      },
    ]);
  };

  /** Con un metodo solo, staccarne uno chiuderebbe fuori l'utente. */
  const metodiCollegati = providers.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('metodi.titolo')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <SpazioTastiera>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
        >
          <Text style={styles.intro}>{t('metodi.intro')}</Text>

          <View style={styles.card}>
            {/* Google */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowTitle}>Google</Text>
                <Text style={styles.rowSubtitle}>
                  {hasGoogle ? email : t('metodi.nonCollegato')}
                </Text>
              </View>
              {hasGoogle ? (
                <View style={styles.rowActions}>
                  <Text style={styles.linked}>{t('metodi.collegato')}</Text>
                  {metodiCollegati > 1 &&
                    (azione === 'google' ? (
                      <ActivityIndicator size="small" color="#5742a4" />
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleUnlink('google.com', 'Google')}
                        disabled={azione !== null}
                      >
                        <Text style={styles.actionDanger}>{t('metodi.scollega')}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ) : azione === 'google' ? (
                <ActivityIndicator size="small" color="#5742a4" />
              ) : (
                <TouchableOpacity
                  onPress={() => run('google', () => authService.linkGoogle())}
                  disabled={azione !== null}
                >
                  <Text style={styles.action}>{t('metodi.collega')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Apple — solo su iOS: altrove non c'è modo di autenticarsi */}
            {Platform.OS === 'ios' && (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle}>Apple</Text>
                  <Text style={styles.rowSubtitle}>
                    {hasApple ? t('metodi.collegatoMaiuscolo') : t('metodi.nonCollegato')}
                  </Text>
                </View>
                {hasApple ? (
                  <View style={styles.rowActions}>
                    <Text style={styles.linked}>{t('metodi.collegato')}</Text>
                    {metodiCollegati > 1 &&
                      (azione === 'apple' ? (
                        <ActivityIndicator size="small" color="#5742a4" />
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleUnlink('apple.com', 'Apple')}
                          disabled={azione !== null}
                        >
                          <Text style={styles.actionDanger}>{t('metodi.scollega')}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                ) : azione === 'apple' ? (
                  <ActivityIndicator size="small" color="#5742a4" />
                ) : (
                  <TouchableOpacity
                    onPress={() => run('apple', () => authService.linkApple())}
                    disabled={azione !== null}
                  >
                    <Text style={styles.action}>{t('metodi.collega')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Email e password */}
            <View style={[styles.row, styles.rowLast]}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowTitle}>{t('metodi.emailPassword')}</Text>
                <Text style={styles.rowSubtitle}>
                  {hasPassword ? email : t('metodi.nessunaPassword')}
                </Text>
              </View>
              {hasPassword ? (
                <View style={styles.rowActions}>
                  <Text style={styles.linked}>{t('metodi.collegato')}</Text>
                  {azione === 'reset' ? (
                    <ActivityIndicator size="small" color="#5742a4" />
                  ) : (
                    <TouchableOpacity onPress={handleResetPassword} disabled={azione !== null}>
                      <Text style={styles.action}>{t('metodi.cambia')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : azione === 'password' ? (
                <ActivityIndicator size="small" color="#5742a4" />
              ) : (
                <TouchableOpacity
                  onPress={() => setShowPasswordForm((v) => !v)}
                  disabled={azione !== null}
                >
                  <Text style={styles.action}>{showPasswordForm ? 'Chiudi' : 'Imposta'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {showPasswordForm && !hasPassword && (
            <View style={styles.card}>
              <Text style={styles.formLabel}>{t('metodi.scegliPassword')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('metodi.almeno8')}
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={azione === null}
              />
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (password.length < 8 || azione !== null) && styles.buttonDisabled,
                ]}
                onPress={handleAddPassword}
                disabled={password.length < 8 || azione !== null}
              >
                <Text style={styles.primaryButtonText}>{t('metodi.impostaPassword')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.noteCard}>
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color="#6B7280"
              style={styles.noteIcon}
            />
            <Text style={styles.noteText}>
              {hasPassword
                ? t('metodi.notaCambio')
                : t('metodi.notaAggiunta', { metodo: hasGoogle ? 'Google' : 'Apple' })}
            </Text>
          </View>

          {metodiCollegati === 1 && <Text style={styles.warning}>{t('metodi.unSoloMetodo')}</Text>}
        </ScrollView>
      </SpazioTastiera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSpacer: {
    width: 26,
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  intro: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 21,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    color: '#111827',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  linked: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  action: {
    fontSize: 15,
    color: '#5742a4',
    fontWeight: '600',
  },
  actionDanger: {
    fontSize: 15,
    color: '#b91c1c',
    fontWeight: '600',
  },
  formLabel: {
    fontSize: 15,
    color: '#374151',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 10,
  },
  input: {
    height: 48,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  primaryButton: {
    height: 46,
    margin: 16,
    backgroundColor: '#5742a4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
  },
  noteIcon: {
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
  },
  warning: {
    fontSize: 13,
    color: '#b45309',
    lineHeight: 20,
    marginHorizontal: 4,
  },
});
