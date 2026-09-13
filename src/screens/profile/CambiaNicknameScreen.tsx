import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { usersApi } from '../../services/api/users';

type CambiaNicknameScreenProps = {
  navigation?: { goBack: () => void };
  userId: string;
  /** Nickname attuale: rimetterlo uguale non è un conflitto con se stessi. */
  current: string | null;
  onChanged: (nickname: string) => void;
};

const NICKNAME_RE = /^[a-z0-9_]{3,50}$/;

type Availability = 'idle' | 'checking' | 'free' | 'taken';

export default function CambiaNicknameScreen({
  navigation,
  userId,
  current,
  onChanged,
}: CambiaNicknameScreenProps) {
  const [nickname, setNickname] = useState(current ?? '');
  const [availability, setAvailability] = useState<Availability>('idle');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatOk = NICKNAME_RE.test(nickname);
  const unchanged = nickname === (current ?? '');

  useEffect(() => {
    if (!formatOk || unchanged) {
      setAvailability('idle');
      return;
    }

    let cancelled = false;
    setAvailability('checking');

    const timer = setTimeout(async () => {
      const free = await usersApi.isNicknameAvailable(nickname);
      if (cancelled) return;
      setAvailability(free ? 'free' : 'taken');
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nickname, formatOk, unchanged]);

  const handleSave = async () => {
    if (!formatOk || unchanged || saving) return;

    try {
      setSaving(true);
      setError(null);

      await usersApi.updateNickname(userId, nickname);
      onChanged(nickname);
      navigation?.goBack();
    } catch (e: any) {
      const msg: string = e?.message || 'Non siamo riusciti a salvare il nickname';
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
    if (unchanged) {
      return { text: 'È il tuo nickname attuale.', tone: styles.hintNeutral };
    }
    if (!formatOk) {
      return {
        text: 'Solo minuscole, numeri e underscore (_), da 3 a 50 caratteri.',
        tone: styles.hintBad,
      };
    }
    if (availability === 'checking') return { text: 'Controllo…', tone: styles.hintNeutral };
    if (availability === 'taken') return { text: 'Questo nickname è già in uso', tone: styles.hintBad };
    if (availability === 'free') return { text: '✓ disponibile', tone: styles.hintOk };
    return { text: ' ', tone: styles.hintNeutral };
  };

  const { text: hintText, tone: hintTone } = hint();
  const canSave = formatOk && !unchanged && availability !== 'taken' && !saving;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nickname</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={styles.intro}>
          È il nome con cui ti vedono gli altri giocatori.
        </Text>

        <View style={styles.card}>
          <View
            style={[styles.inputRow, availability === 'taken' && styles.inputRowError]}
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
              maxLength={50}
              editable={!saving}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            {availability === 'checking' && (
              <ActivityIndicator size="small" color="#9ca3af" />
            )}
          </View>
          <Text style={[styles.hint, hintTone]}>{hintText}</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !canSave && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Salva</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    padding: 16,
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
  },
  hintNeutral: { color: '#6B7280' },
  hintOk: { color: '#059669' },
  hintBad: { color: '#ef4444' },
  primaryButton: {
    height: 48,
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
});
