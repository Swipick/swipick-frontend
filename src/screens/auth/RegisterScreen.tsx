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
  Linking,
  Platform,
  Image,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usersApi } from '../../services/api/users';
import { profileApi, needsProfileCompletion } from '../../services/api/profile';
import { authService } from '../../services/auth/authService';
import { useAuthStore } from '../../store/stores/useAuthStore';
import SpazioTastiera from '../../components/common/SpazioTastiera';
import { useTranslation } from 'react-i18next';

type RegisterScreenProps = {
  onNavigate: (
    screen: 'Landing' | 'Onboarding' | 'Login' | 'Register' | 'Nickname' | 'EmailVerification',
    params?: any,
  ) => void;
};

const TERMS_URL = 'https://www.swipick.com/termini-e-condizioni.html';
const PRIVACY_URL = 'https://www.swipick.com/privacy-e-cookie.html';

/**
 * Passo 1 di 2: email e password, oppure Google/Apple.
 * Nome e nickname non si chiedono qui — il nickname arriva al passo 2, il nome
 * non serve a nulla nel gioco. L'accettazione dei termini è implicita nell'atto
 * di iscriversi (consenso passivo), quindi niente casella da spuntare.
 */
export default function RegisterScreen({ onNavigate }: RegisterScreenProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<null | 'google' | 'apple'>(null);

  const setPendingNicknameUserId = useAuthStore((s) => s.setPendingNicknameUserId);

  const busy = loading || socialLoading !== null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!email.trim()) {
      next.email = t('registrazione.inserisciEmail');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = t('accesso.emailNonValida');
    }

    // Nessuna regola di composizione, come sul backend: conta la lunghezza.
    if (!password) {
      next.password = t('registrazione.scegliPassword');
    } else if (password.length < 8) {
      next.password = t('registrazione.passwordCorta');
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // Il backend crea l'utente Firebase, salva il record e manda la verifica.
      // Senza nickname il profilo nasce da completare: è il passo 2.
      const response = await usersApi.registerUser({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('[RegisterScreen] User registered successfully');

      onNavigate('Nickname', {
        userId: response.id,
        email: email.trim().toLowerCase(),
        verificationLink: response.verificationLink,
        verificationEmailSent: response.verificationEmailSent,
      });
    } catch (error: any) {
      console.error('[RegisterScreen] Registration failed:', error);
      const msg: string = error?.message || t('registrazione.nonRiuscita');
      // Conflitti e validazioni del backend vanno sotto al campo giusto, così
      // l'utente può correggere senza uscire dal modulo.
      if (/email/i.test(msg)) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else if (/password/i.test(msg)) {
        setErrors((prev) => ({ ...prev, password: msg }));
      } else {
        Alert.alert(t('comune.errore'), msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSocialLoading('google');
      console.log('[RegisterScreen] Google sign-in initiated');

      const user = await authService.signInWithGoogle();
      const syncResult = await authService.sincronizzaGoogle(user);

      console.log('[RegisterScreen] User synced to backend:', syncResult);

      // L'accesso è già riuscito e AppNavigator è passato all'area di gioco:
      // il passo 2 non può vivere qui dentro, lo alza il gate in AppNavigator.
      if (syncResult.needsProfileCompletion) {
        setPendingNicknameUserId(syncResult.id);
      }
    } catch (error: any) {
      console.error('[RegisterScreen] Google sign-in error:', error);
      if (error.message === 'Google sign-in was cancelled') return;
      Alert.alert(t('comune.errore'), error.message || t('accesso.googleNonRiuscito'));
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setSocialLoading('apple');
      console.log('[RegisterScreen] Apple sign-in initiated');

      // signInWithApple sincronizza già l'utente sul backend e lo attende,
      // quindi qui il profilo esiste di sicuro.
      const user = await authService.signInWithApple();
      const profile = await profileApi.getUserByFirebaseUid(user.uid);

      if (needsProfileCompletion(profile.data)) {
        setPendingNicknameUserId(profile.data.id);
      }
    } catch (error: any) {
      console.error('[RegisterScreen] Apple sign-in error:', error);
      if (error.code === 'ERR_REQUEST_CANCELED' || error.message === 'apple-sign-in-cancelled') {
        return;
      }
      Alert.alert(t('comune.errore'), error.message || t('accesso.appleNonRiuscito'));
    } finally {
      setSocialLoading(null);
    }
  };

  const openTerms = () => Linking.openURL(TERMS_URL);
  const openPrivacy = () => Linking.openURL(PRIVACY_URL);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;

  return (
    <LinearGradient colors={['#52418d', '#7a57f6']} style={styles.gradient}>
      <SpazioTastiera>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {/* Intestazione: indietro, marchio, passo */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerSide}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onNavigate('Landing');
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.wordmark}>SWIPICK</Text>
            <Text style={[styles.headerSide, styles.stepLabel]}>
              {t('registrazione.passo', { n: 1 })}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{t('registrazione.titolo')}</Text>
            <Text style={styles.subtitle}>{t('registrazione.sottotitolo')}</Text>

            {/* Apple per primo: su iOS è il percorso più breve e la 4.8 lo richiede */}
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={8}
                style={styles.appleButton}
                onPress={() => {
                  if (busy) return;
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleAppleSignIn();
                }}
              />
            )}

            <TouchableOpacity
              style={[styles.googleButton, busy && styles.buttonDisabled]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleGoogleSignIn();
              }}
              disabled={busy}
            >
              {socialLoading === 'google' ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#374151" size="small" />
                  <Text style={styles.googleButtonText}>
                    {t('registrazione.accessoGoogleInCorso')}
                  </Text>
                </View>
              ) : (
                <>
                  <Image
                    source={require('../../assets/images/icons/google-logo-icon.png')}
                    style={styles.googleLogoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.googleButtonText}>{t('registrazione.continuaGoogle')}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Consenso passivo: nessuna casella, l'atto di iscriversi è l'assenso */}
            <Text style={styles.consent}>
              {t('registrazione.consensoPrima')}{' '}
              <Text style={styles.link} onPress={openTerms}>
                {t('registrazione.termini')}
              </Text>{' '}
              {t('registrazione.consensoMezzo')}{' '}
              <Text style={styles.link} onPress={openPrivacy}>
                {t('registrazione.privacy')}
              </Text>
              .
            </Text>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('accesso.oppure')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email */}
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder={t('registrazione.tuaEmail')}
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={(text) => {
                setEmail(text.toLowerCase());
                if (errors.email) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.email;
                    return next;
                  });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!busy}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password */}
            <View style={[styles.passwordRow, errors.password && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('accesso.password')}
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.password;
                      return next;
                    });
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                textContentType="newPassword"
                editable={!busy}
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : (
              <Text style={styles.passwordHint}>{t('registrazione.passwordSuggerimento')}</Text>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleSubmit();
              }}
              disabled={!canSubmit}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.primaryButtonText}>{t('registrazione.creazione')}</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>{t('registrazione.continua')}</Text>
              )}
            </TouchableOpacity>

            {loading && <Text style={styles.loadingNote}>{t('registrazione.attesaServer')}</Text>}

            <Text style={styles.loginText}>
              {t('registrazione.haiAccount')}{' '}
              <Text
                style={styles.link}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onNavigate('Login');
                }}
              >
                {t('accesso.accedi')}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </SpazioTastiera>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerSide: {
    width: 80,
  },
  backButtonText: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.85)',
  },
  wordmark: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2.5,
  },
  stepLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  appleButton: {
    height: 48,
    width: '100%',
    marginBottom: 12,
  },
  googleButton: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleLogoImage: {
    width: 18,
    height: 18,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  consent: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordRow: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  eyeText: {
    fontSize: 18,
  },
  passwordHint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 18,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 6,
    marginBottom: 12,
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#9333EA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
  },
  link: {
    color: '#7a57f6',
    textDecorationLine: 'underline',
  },
  loginText: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 14,
    color: '#4B5563',
  },
});
