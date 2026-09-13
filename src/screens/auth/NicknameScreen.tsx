import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usersApi } from '../../services/api/users';

type NicknameScreenProps = {
  /** Id utente sul backend (UUID), non l'uid Firebase. */
  userId: string;
  /** Chiamata quando il nickname e' salvato: chi ci ha portati qui decide dove andare. */
  onDone: () => void;
};

/** Stesse regole del backend: minuscole, numeri e underscore, 3-50 caratteri. */
const NICKNAME_RE = /^[a-z0-9_]{3,50}$/;

type Availability = 'idle' | 'checking' | 'free' | 'taken';

/**
 * Passo 2 della registrazione: la scelta del nickname.
 * Ci arriva sia chi si e' iscritto con email sia chi ha usato Google o Apple,
 * quindi non conosce il percorso da cui viene.
 */
export default function NicknameScreen({ userId, onDone }: NicknameScreenProps) {
  const [nickname, setNickname] = useState('');
  const [availability, setAvailability] = useState<Availability>('idle');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatOk = NICKNAME_RE.test(nickname);

  // Disponibilità interrogata mentre si scrive, ma solo a formato valido e
  // con mezzo secondo di pausa: il server non deve vedere un colpo per tasto.
  useEffect(() => {
    if (!formatOk) {
      setAvailability('idle');
      return;
    }

    let cancelled = false;
    setAvailability('checking');

    const timer = setTimeout(async () => {
      const free = await usersApi.isNicknameAvailable(nickname);
      // La risposta di una richiesta superata non deve sovrascrivere l'ultima.
      if (cancelled) return;
      setAvailability(free ? 'free' : 'taken');
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nickname, formatOk]);

  const handleSubmit = async () => {
    if (!formatOk || saving) return;

    try {
      setSaving(true);
      setError(null);

      await usersApi.completeProfile(userId, nickname);

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDone();
    } catch (e: any) {
      const msg: string = e?.message || 'Non siamo riusciti a salvare il nickname';
      // Il conflitto è l'errore atteso: va sotto al campo, non in un avviso.
      if (/nickname/i.test(msg)) {
        setError(msg);
        setAvailability('taken');
      } else {
        Alert.alert('Errore', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const hint = () => {
    if (error) return { text: error, tone: styles.hintBad };
    if (nickname.length === 0) {
      return { text: 'Da 3 a 50 caratteri: minuscole, numeri e underscore.', tone: styles.hintNeutral };
    }
    if (!formatOk) {
      return { text: 'Solo minuscole, numeri e underscore (_), da 3 a 50 caratteri.', tone: styles.hintBad };
    }
    if (availability === 'checking') return { text: 'Controllo…', tone: styles.hintNeutral };
    if (availability === 'taken') return { text: 'Questo nickname è già in uso', tone: styles.hintBad };
    if (availability === 'free') return { text: '✓ disponibile', tone: styles.hintOk };
    return { text: ' ', tone: styles.hintNeutral };
  };

  const { text: hintText, tone: hintTone } = hint();
  const canSubmit = formatOk && availability !== 'taken' && !saving;

  return (
    <LinearGradient colors={['#52418d', '#7a57f6']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.wordmark}>SWIPICK</Text>
          <Text style={[styles.headerSide, styles.stepLabel]}>Passo 2 di 2</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Scegli il tuo nickname</Text>
          <Text style={styles.subtitle}>È il nome con cui ti vedono gli altri</Text>

          <View
            style={[
              styles.inputRow,
              availability === 'taken' && styles.inputRowError,
            ]}
          >
            <Text style={styles.at}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="mario_rossi"
              placeholderTextColor="#9ca3af"
              value={nickname}
              onChangeText={(text) => {
                setNickname(text.toLowerCase().trim());
                if (error) setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username-new"
              maxLength={50}
              editable={!saving}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
            {availability === 'checking' && (
              <ActivityIndicator size="small" color="#9ca3af" />
            )}
          </View>

          <Text style={[styles.hint, hintTone]}>{hintText}</Text>

          <TouchableOpacity
            style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleSubmit();
            }}
            disabled={!canSubmit}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Inizia a giocare</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Puoi cambiarlo quando vuoi dalle impostazioni.
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
  inputRow: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inputRowError: {
    borderColor: '#ef4444',
  },
  at: {
    fontSize: 16,
    color: '#9ca3af',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  hint: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 14,
  },
  hintNeutral: {
    color: '#6B7280',
  },
  hintOk: {
    color: '#059669',
  },
  hintBad: {
    color: '#ef4444',
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
  footer: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
    color: '#6B7280',
  },
});
