import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as AppleAuthentication from "expo-apple-authentication";
import { authService } from "../../services/auth/authService";
import { usersApi } from "../../services/api/users";
import { AUTH_ERROR_MESSAGES } from "../../types/auth.types";

type LoginScreenProps = {
  onNavigate: (
    screen: "Landing" | "Welcome" | "Login" | "Register" | "EmailVerification",
    params?: any
  ) => void;
};

export default function LoginScreen({ onNavigate }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert("Errore", "Inserisci email e password");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Errore", "Formato email non valido");
      return;
    }

    try {
      setLoading(true);
      console.log("[LoginScreen] Attempting login:", { email });

      // Sign in with Firebase
      const user = await authService.signIn({
        email: email.trim().toLowerCase(),
        password: password,
      });

      console.log("[LoginScreen] Login successful:", {
        uid: user.uid,
        emailVerified: user.emailVerified,
      });

      // Check email verification status
      if (!user.emailVerified) {
        console.log("[LoginScreen] Email not verified, showing verification prompt");

        Alert.alert(
          "Email Non Verificata",
          "Devi verificare la tua email prima di accedere. Controlla la tua casella di posta.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to email verification screen
                onNavigate("EmailVerification", { email: email.trim().toLowerCase() });
              },
            },
          ]
        );
        return;
      }

      // Utente verificato: la transizione alla home la fa AppNavigator
      // via onAuthStateChanged (AuthNavigator viene smontato).
    } catch (error: any) {
      console.error("[LoginScreen] Login error:", error);

      // Get user-friendly error message
      const errorMessage = AUTH_ERROR_MESSAGES[error.code] || AUTH_ERROR_MESSAGES.default;

      Alert.alert("Errore di Accesso", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log("[LoginScreen] Google login initiated");

      // Sign in with Google via Firebase
      const user = await authService.signInWithGoogle();

      console.log("[LoginScreen] Google login successful:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      // Get Firebase ID token to sync with backend
      const idToken = await user.getIdToken();
      console.log("[LoginScreen] Got Firebase ID token, syncing with backend...");

      // Sync user to NeonDB via backend
      const syncResult = await usersApi.syncGoogleUser(idToken);
      console.log("[LoginScreen] User synced to backend:", syncResult);

      // Utenti Google già verificati: la transizione alla home la fa
      // AppNavigator via onAuthStateChanged.
    } catch (error: any) {
      console.error("[LoginScreen] Google login error:", error);

      // Check if user cancelled
      if (error.message === 'Google sign-in was cancelled') {
        // Don't show error for cancellation
        return;
      }

      Alert.alert("Errore", error.message || "Accesso con Google non riuscito");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      console.log("[LoginScreen] Apple login initiated");

      await authService.signInWithApple();

      // Transizione alla home gestita da AppNavigator via onAuthStateChanged.
    } catch (error: any) {
      console.error("[LoginScreen] Apple login error:", error);

      // Silently ignore user cancellation
      if (error.code === "ERR_REQUEST_CANCELED" || error.message === "apple-sign-in-cancelled") {
        return;
      }

      const errorMessage = AUTH_ERROR_MESSAGES[error.code] || AUTH_ERROR_MESSAGES[error.message] || AUTH_ERROR_MESSAGES.default;
      Alert.alert("Errore", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    // Prompt user for email
    Alert.prompt(
      "Recupera Password",
      "Inserisci il tuo indirizzo email per ricevere il link di reset password",
      [
        {
          text: "Annulla",
          style: "cancel",
        },
        {
          text: "Invia",
          onPress: async (emailInput?: string) => {
            if (!emailInput || !emailInput.trim()) {
              Alert.alert("Errore", "Inserisci un indirizzo email valido");
              return;
            }

            try {
              setLoading(true);
              await authService.resetPassword(emailInput.trim().toLowerCase());

              Alert.alert(
                "Email Inviata",
                "Ti abbiamo inviato un'email con le istruzioni per reimpostare la password. Controlla anche la cartella spam.",
                [{ text: "OK" }]
              );
            } catch (error: any) {
              Alert.alert(
                "Errore",
                error.message || "Impossibile inviare l'email. Riprova più tardi."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      "plain-text",
      email || ""
    );
  };

  return (
    <View style={styles.container}>
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
        {/* Swipick Logo/Title */}
        <Text style={styles.title}>swipick</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleLogin();
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Accedi</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <Text style={styles.divider}>oppure</Text>

        {/* Google Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleGoogleLogin();
          }}
          disabled={loading}
        >
          <Image
            source={require("../../assets/images/icons/google-logo-icon.png")}
            style={styles.googleLogoImage}
            resizeMode="contain"
          />
          <Text style={styles.googleButtonText}>Accedi con Google</Text>
        </TouchableOpacity>

        {/* Apple Sign-In Button — iOS only (required by App Store guideline 4.8) */}
        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={styles.appleButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleAppleLogin();
            }}
          />
        )}

        {/* Spacer to push forgot password to bottom */}
        <View style={styles.spacer} />

        {/* Forgot Password */}
        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>
            Hai dimenticato la password?
          </Text>
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleForgotPassword();
            }}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordButtonText}>
              Recupera password
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const { height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700; // iPhone XR is ~896, but content area is smaller

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    color: "#5742a4",
    fontWeight: "600",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: isSmallScreen ? 60 : 80,
    alignItems: "center",
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#5742a4",
    marginBottom: isSmallScreen ? 30 : 40,
    letterSpacing: -1,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  input: {
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 16,
    padding: 4,
  },
  eyeText: {
    fontSize: 20,
  },
  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#6f49f7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginVertical: 20,
  },
  googleButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  googleLogoImage: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  appleButton: {
    width: "100%" as any,
    height: 56,
    marginBottom: 32,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  forgotPasswordButton: {
    width: "100%",
    height: 56,
    backgroundColor: "rgba(111, 73, 247, 0.1)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotPasswordButtonText: {
    fontSize: 14,
    color: "#6f49f7",
    fontWeight: "600",
  },
});
