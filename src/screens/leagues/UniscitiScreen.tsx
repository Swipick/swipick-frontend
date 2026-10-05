import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { leaguesApi } from '../../services/api/leagues';
import {
  SubHeader,
  PrimaryButton,
  ErrorNote,
  leagueStyles,
  leagueColors,
} from '../../components/leagues/LeagueUI';

type Props = {
  navigation?: { navigate: (screen: any, params?: any) => void; goBack: () => void };
};

const LENGTH = 4;

/**
 * Inserimento del codice.
 *
 * Quattro caselle invece di un campo solo: si vede quanto manca, e l'errore di
 * battitura si corregge sul carattere sbagliato invece che riscrivendo tutto.
 */
export default function UniscitiScreen({ navigation }: Props) {
  const [chars, setChars] = useState<string[]>(Array(LENGTH).fill(''));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  const code = chars.join('');
  const completo = code.length === LENGTH && !chars.includes('');

  const scrivi = (index: number, value: string) => {
    const char = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(-1);
    const next = [...chars];
    next[index] = char;
    setChars(next);
    setError(null);

    // Avanti da soli solo quando si scrive: cancellando si resta fermi, così
    // si può correggere la casella che si sta guardando.
    if (char && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const cancellaIndietro = (index: number) => {
    if (chars[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const cerca = async () => {
    if (!completo || busy) return;
    setBusy(true);
    setError(null);
    try {
      const preview = await leaguesApi.previewInvite(code);
      navigation?.navigate('conferma-invito', { code, preview });
    } catch (err: any) {
      setError(err?.message ?? 'Codice non valido');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={leagueStyles.screen}>
      <SubHeader title="Ho un invito" onBack={() => navigation?.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[leagueStyles.content, styles.scroll]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Inserisci il codice</Text>
          <Text style={styles.subtitle}>Quattro caratteri, te li dà chi ti ha invitato.</Text>

          <View style={styles.cells}>
            {chars.map((char, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                style={[styles.cell, char ? styles.cellFilled : null]}
                value={char}
                onChangeText={(value) => scrivi(index, value)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') cancellaIndietro(index);
                }}
                maxLength={1}
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType={index === LENGTH - 1 ? 'done' : 'next'}
                onSubmitEditing={cerca}
                accessibilityLabel={`Carattere ${index + 1}`}
                selectTextOnFocus
              />
            ))}
          </View>

          <Text style={styles.alphabet}>
            Nel codice non compaiono mai 0, O, 1, I ed L: si somigliano troppo.
          </Text>

          <ErrorNote message={error} />

          <PrimaryButton label="Cerca la lega" onPress={cerca} busy={busy} disabled={!completo} />

          <View style={[leagueStyles.card, styles.info]}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={leagueColors.textMuted}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Prima di entrare vedrai nome, campionato e membri della lega.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: leagueColors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: -8,
  },
  cells: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  cell: {
    width: 62,
    height: 72,
    borderWidth: 1.5,
    borderColor: leagueColors.inputBorder,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '700',
    color: leagueColors.text,
  },
  cellFilled: {
    borderColor: leagueColors.primary,
  },
  alphabet: {
    fontSize: 13,
    color: leagueColors.textMuted,
    textAlign: 'center',
    marginTop: -8,
  },
  info: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: leagueColors.textSoft,
  },
});
