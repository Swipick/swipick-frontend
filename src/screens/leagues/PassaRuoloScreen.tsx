import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLeaguesStore } from '../../store/stores/useLeaguesStore';
import { leaguesApi } from '../../services/api/leagues';
import { LeagueMemberRow } from '../../types/league.types';
import {
  SubHeader,
  LeagueAvatar,
  PrimaryButton,
  ErrorNote,
  leagueStyles,
  leagueColors,
} from '../../components/leagues/LeagueUI';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation?: {
    navigate: (screen: any, params?: any) => void;
    goBack: () => void;
  };
  leagueId: string;
};

/**
 * Passaggio della gestione.
 *
 * Ha una schermata sua e non una voce di menu perché non è una preferenza:
 * cambia chi comanda sulla lega, e chi la passa non può tornare indietro da
 * solo. Perciò dice cosa comporta prima della scelta, e la conferma nomina
 * la persona che riceve.
 */
export default function PassaRuoloScreen({ navigation, leagueId }: Props) {
  const { t } = useTranslation();
  const detail = useLeaguesStore((s) => s.detail);
  const transferOwner = useLeaguesStore((s) => s.transferOwner);

  const [members, setMembers] = useState<LeagueMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scelto, setScelto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carica = useCallback(async () => {
    setLoading(true);
    try {
      const righe = await leaguesApi.members(leagueId);
      // Solo chi è dentro adesso: a un rimosso non si passa la lega.
      setMembers(righe.filter((m) => m.status === 'active' && !m.isMe));
    } catch (err: any) {
      setError(err?.message ?? t('leghe.errori.caricaMembri'));
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    carica();
  }, [carica]);

  const destinatario = members.find((m) => m.userId === scelto) ?? null;

  const conferma = () => {
    if (!destinatario) return;
    const nome = `@${destinatario.nickname ?? t('legaGestione.questoMembro')}`;
    Alert.alert(t('legaPassa.passareA', { nome }), t('legaPassa.passareTesto'), [
      { text: t('comune.annulla'), style: 'cancel' },
      { text: t('legaGestione.passaGestione'), onPress: passa },
    ]);
  };

  const passa = async () => {
    if (!destinatario || busy) return;
    setBusy(true);
    setError(null);
    try {
      await transferOwner(destinatario.userId);
      // Si torna alla lega, non alla gestione: quella schermata adesso non è
      // più sua.
      navigation?.navigate('dettaglio-lega', { leagueId });
    } catch (err: any) {
      setError(err?.message ?? t('leghe.errori.passaGestione'));
      setBusy(false);
    }
  };

  return (
    <View style={leagueStyles.screen}>
      <SubHeader title={t('legaGestione.passaGestione')} onBack={() => navigation?.goBack()} />

      <ScrollView contentContainerStyle={leagueStyles.content}>
        <ErrorNote message={error} />

        <View style={[leagueStyles.card, leagueStyles.cardTight, styles.avviso]}>
          <Ionicons
            name="warning-outline"
            size={20}
            color={leagueColors.warn}
            style={styles.avvisoIcona}
          />
          <Text style={styles.avvisoTesto}>
            {t('legaPassa.avviso', {
              lega: detail ? `«${detail.name}»` : t('legaPassa.laLega'),
            })}
          </Text>
        </View>

        <View style={[leagueStyles.card, leagueStyles.cardFlush]}>
          <Text style={styles.titolo}>{t('legaPassa.aChi')}</Text>

          {loading ? (
            <View style={styles.caricamento}>
              <ActivityIndicator color={leagueColors.primary} />
            </View>
          ) : members.length === 0 ? (
            <Text style={styles.vuoto}>{t('legaPassa.nessunAltro')}</Text>
          ) : (
            members.map((member) => {
              const selezionato = member.userId === scelto;
              return (
                <TouchableOpacity
                  key={member.userId}
                  style={styles.riga}
                  onPress={() => setScelto(member.userId)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selezionato }}
                >
                  <View style={[styles.pallino, selezionato && styles.pallinoPieno]} />
                  <LeagueAvatar nickname={member.nickname} />
                  <View style={styles.nomeBox}>
                    <Text style={styles.nome} numberOfLines={1}>
                      @{member.nickname ?? t('legaDettaglio.senzaNickname')}
                    </Text>
                    <Text style={styles.meta}>
                      {t('legaPassa.nellaLegaDalla', { n: member.joinedFromWeek })}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <Text style={[leagueStyles.footnote, styles.nota]}>{t('legaPassa.soloAttivi')}</Text>
        </View>

        <PrimaryButton
          label={
            destinatario
              ? t('legaPassa.passaA', {
                  nickname: destinatario.nickname ?? t('legaGestione.questoMembro'),
                })
              : t('legaPassa.scegliMembro')
          }
          onPress={conferma}
          busy={busy}
          disabled={!destinatario}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avviso: {
    flexDirection: 'row',
    gap: 12,
  },
  avvisoIcona: {
    marginTop: 1,
  },
  avvisoTesto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: leagueColors.textSoft,
  },
  titolo: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    fontSize: 15,
    fontWeight: '600',
    color: leagueColors.text,
  },
  caricamento: {
    paddingVertical: 24,
  },
  vuoto: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    color: leagueColors.textSoft,
  },
  riga: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: leagueColors.divider,
  },
  pallino: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: leagueColors.inputBorder,
  },
  pallinoPieno: {
    borderWidth: 7,
    borderColor: leagueColors.primary,
  },
  nomeBox: {
    flex: 1,
    minWidth: 0,
  },
  nome: {
    fontSize: 15,
    color: leagueColors.text,
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: leagueColors.textFaint,
  },
  nota: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: leagueColors.divider,
  },
});
