import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CheckBox from 'expo-checkbox';
import * as Haptics from 'expo-haptics';
import { usersApi } from '../../services/api/users';
import { authService } from '../../services/auth/authService';

type RegisterScreenProps = {
  onNavigate: (screen: 'Landing' | 'Welcome' | 'Login' | 'Register' | 'EmailVerification', params?: any) => void;
};

const TERMS_URL = "https://www.iubenda.com/terms-and-conditions/55491947?ifr=false#terms-of-use";
const PRIVACY_URL = "https://www.iubenda.com/terms-and-conditions/55491947?ifr=false#user-rights";

export default function RegisterScreen({ onNavigate }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    nome: '',
    sopranome: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Real-time password validation
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Le password non corrispondono'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  }, [formData.password, formData.confirmPassword]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: -6, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 6, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -4, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 4, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nome validation
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome è richiesto';
    } else if (formData.nome.length < 2) {
      newErrors.nome = 'Nome deve avere almeno 2 caratteri';
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.nome)) {
      newErrors.nome = 'Solo lettere e spazi sono consentiti';
    }

    // Sopranome validation
    if (!formData.sopranome.trim()) {
      newErrors.sopranome = 'Sopranome è richiesto';
    } else if (formData.sopranome.length < 2) {
      newErrors.sopranome = 'Sopranome deve avere almeno 2 caratteri';
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.sopranome)) {
      newErrors.sopranome = 'Solo lettere e spazi sono consentiti';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email è richiesta';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password è richiesta';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password deve avere almeno 8 caratteri';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password deve contenere almeno una lettera minuscola';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password deve contenere almeno una lettera maiuscola';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password deve contenere almeno un numero';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Conferma password è richiesta';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Devi accettare i termini di servizio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Call backend API to register user
      // Backend will:
      // 1. Create Firebase user
      // 2. Create database record
      // 3. Generate verification link
      // 4. Send email via Aruba SMTP (noreply@swipick.com)
      const response = await usersApi.registerUser({
        email: formData.email.toLowerCase(),
        name: formData.nome,
        nickname: formData.sopranome,
        password: formData.password,
      });

      console.log('[RegisterScreen] User registered successfully');

      // Navigate to email verification screen
      // Pass verification link if available (dev mode)
      onNavigate('EmailVerification', {
        email: formData.email,
        verificationLink: response.verificationLink
      });
    } catch (error: any) {
      console.error('[RegisterScreen] Registration failed:', error);
      Alert.alert('Errore', error.message || 'Registrazione non riuscita');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!formData.agreeToTerms) {
      triggerShake();
      Alert.alert('Attenzione', 'Devi accettare i termini di servizio prima di continuare');
      return;
    }

    try {
      setGoogleLoading(true);
      console.log('[RegisterScreen] Google sign-in initiated');

      // Sign in with Google via Firebase
      const user = await authService.signInWithGoogle();

      console.log('[RegisterScreen] Google sign-in successful:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      // Get Firebase ID token to sync with backend
      const idToken = await user.getIdToken();
      console.log('[RegisterScreen] Got Firebase ID token, syncing with backend...');

      // Sync user to NeonDB via backend
      const syncResult = await usersApi.syncGoogleUser(idToken);
      console.log('[RegisterScreen] User synced to backend:', syncResult);

      // Google users are automatically verified
      // Navigate to email verification screen (which handles the mode selection flow)
      onNavigate('EmailVerification', {
        email: user.email,
        isGoogleSignIn: true
      });
    } catch (error: any) {
      console.error('[RegisterScreen] Google sign-in error:', error);

      // Check if user cancelled
      if (error.message === 'Google sign-in was cancelled') {
        // Don't show error for cancellation
        return;
      }

      Alert.alert('Errore', error.message || 'Accesso con Google non riuscito');
    } finally {
      setGoogleLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.nome.trim() &&
      formData.sopranome.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.confirmPassword &&
      formData.agreeToTerms &&
      Object.keys(errors).length === 0
    );
  };

  const openTerms = () => {
    Linking.openURL(TERMS_URL);
  };

  const openPrivacy = () => {
    Linking.openURL(PRIVACY_URL);
  };

  return (
    <LinearGradient colors={['#52418d', '#7a57f6']} style={styles.gradient}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNavigate("Landing");
        }}
      >
        <Text style={styles.backButtonText}>← Indietro</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.title}>Crea Account</Text>
          <Text style={styles.subtitle}>
            Unisciti a Swipick e inizia a giocare
          </Text>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Nome */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.nome && styles.inputError]}
                placeholder="Nome"
                placeholderTextColor="#9ca3af"
                value={formData.nome}
                onChangeText={(text) => setFormData({ ...formData, nome: text })}
                autoCapitalize="words"
                editable={!loading}
              />
              {errors.nome && (
                <Text style={styles.errorText}>{errors.nome}</Text>
              )}
            </View>

            {/* Sopranome */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.sopranome && styles.inputError]}
                placeholder="Sopranome"
                placeholderTextColor="#9ca3af"
                value={formData.sopranome}
                onChangeText={(text) => setFormData({ ...formData, sopranome: text })}
                autoCapitalize="words"
                editable={!loading}
              />
              {errors.sopranome && (
                <Text style={styles.errorText}>{errors.sopranome}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="email@example.com"
                placeholderTextColor="#9ca3af"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase() })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Conferma Password"
                  placeholderTextColor="#9ca3af"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms Checkbox */}
            <Animated.View
              style={[
                styles.checkboxContainer,
                { transform: [{ translateX: shakeAnimation }] }
              ]}
            >
              <CheckBox
                value={formData.agreeToTerms}
                onValueChange={(value: boolean) => setFormData({ ...formData, agreeToTerms: value })}
                color={formData.agreeToTerms ? '#9333EA' : undefined}
                style={styles.checkbox}
              />
              <Text style={styles.checkboxLabel}>
                Accetto i{' '}
                <Text style={styles.link} onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  openTerms();
                }}>
                  termini di servizio
                </Text>
                {' '}di Swipick
              </Text>
            </Animated.View>
            {errors.agreeToTerms && (
              <Text style={styles.errorText}>{errors.agreeToTerms}</Text>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!isFormValid() || loading) && styles.buttonDisabled
              ]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleSubmit();
              }}
              disabled={!isFormValid() || loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.primaryButtonText}>Creazione account...</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Crea Account</Text>
              )}
            </TouchableOpacity>

            {/* Loading Note */}
            {loading && (
              <Text style={styles.loadingNote}>
                Il server potrebbe richiedere fino a 2 minuti per rispondere.
                Attendi per favore...
              </Text>
            )}

            {/* Divider */}
            <Text style={styles.divider}>oppure</Text>

            {/* Google Button */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                googleLoading && styles.buttonDisabled
              ]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleGoogleSignIn();
              }}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#374151" size="small" />
                  <Text style={styles.googleButtonText}>Accesso con Google...</Text>
                </View>
              ) : (
                <>
                  <Image
                    source={require('../../assets/images/icons/google-logo-icon.png')}
                    style={styles.googleLogoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.googleButtonText}>Accedi con Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>
                Hai già un account?{' '}
                <Text style={styles.link} onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onNavigate('Login');
                }}>
                  Accedi
                </Text>
              </Text>
            </View>

            {/* Footer Links */}
            <Text style={styles.footer}>
              Creando un account accetti i nostri{' '}
              <Text style={styles.smallLink} onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openTerms();
              }}>
                Termini di Servizio
              </Text>
              {' '}e la{' '}
              <Text style={styles.smallLink} onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openPrivacy();
              }}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  eyeText: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  link: {
    color: '#9333EA',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#9333EA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 16,
  },
  googleButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleLogoImage: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#374151',
  },
  footer: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  smallLink: {
    color: '#9333EA',
    textDecorationLine: 'underline',
  },
  loadingNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
