import React, { useState } from 'react';
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

import { useLeaguesStore } from '../../store/stores/useLeaguesStore';
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

const MIN = 3;
const MAX = 40;

export default function CreaLegaScreen({ navigation }: Props) {
  const createLeague = useLeaguesStore((s) => s.createLeague);

  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pulito = name.trim().replace(/\s+/g, ' ');
  const valido = pulito.length >= MIN && pulito.length <= MAX;

  const crea = async () => {
    if (!valido || busy) return;
    setBusy(true);
    setError(null);
    try {
      const league = await createLeague(pulito);
      // Si atterra sull'invito: una lega da soli non serve a niente, e il
      // codice è la prima cosa che serve.
      navigation?.navigate('invita', { leagueId: league.id });
    } catch (err: any) {
      setError(err?.message ?? 'Non riesco a creare la lega');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={leagueStyles.screen}>
      <SubHeader title="Nuova lega" onBack={() => navigation?.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[leagueStyles.content, styles.scroll]}
          keyboardShouldPersistTaps="handled"
        >
          <ErrorNote message={error} />

          <View>
            <Text style={leagueStyles.label}>Nome della lega</Text>
            <TextInput
              style={leagueStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="Amici del bar"
              placeholderTextColor="#9ca3af"
              maxLength={MAX}
              autoCapitalize="sentences"
              returnKeyType="done"
              onSubmitEditing={crea}
            />
            <Text style={leagueStyles.hint}>Lo vedono tutti i membri. Potrai cambiarlo.</Text>
          </View>

          <View>
            <Text style={leagueStyles.label}>Campionato</Text>
            <View style={[leagueStyles.card, styles.competition]}>
              <View style={styles.competitionBadge}>
                <Text style={styles.competitionBadgeText}>ITA</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.competitionName}>Serie A</Text>
                <Text style={styles.competitionMeta}>10 partite a giornata</Text>
              </View>
            </View>
            <Text style={leagueStyles.hint}>
              Per ora Swipick segue solo la Serie A, quindi non c'è niente da scegliere.
            </Text>
          </View>

          <View style={[leagueStyles.card, styles.info]}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#7c3aed"
              style={styles.infoIcon}
            />
            <View style={styles.flex}>
              <Text style={styles.infoTitle}>Come funziona il punteggio</Text>
              <Text style={styles.infoText}>
                I punti si sommano per tutta la stagione. Chi entra a giornata iniziata conta dalla
                giornata successiva.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Crea lega" onPress={crea} busy={busy} disabled={!valido} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 24,
    gap: 20,
  },
  competition: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  competitionBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  competitionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5b21b6',
    letterSpacing: 0.4,
  },
  competitionName: {
    fontSize: 16,
    color: leagueColors.text,
  },
  competitionMeta: {
    marginTop: 2,
    fontSize: 13,
    color: leagueColors.textMuted,
  },
  info: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: leagueColors.text,
  },
  infoText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: leagueColors.textSoft,
  },
  footer: {
    padding: 16,
    paddingTop: 0,
  },
});
