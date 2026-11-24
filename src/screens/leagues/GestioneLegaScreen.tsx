import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useLeaguesStore } from '../../store/stores/useLeaguesStore';
import { leaguesApi } from '../../services/api/leagues';
import { LeagueMemberRow } from '../../types/league.types';
import { oreRimanenti, testoScadenza } from '../../utils/inviteCountdown';
import { nomiCombaciano } from '../../utils/nomeLega';
import {
  SubHeader,
  LeagueAvatar,
  GhostButton,
  ErrorNote,
  leagueStyles,
  leagueColors,
} from '../../components/leagues/LeagueUI';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation?: { navigate: (screen: any, params?: any) => void; goBack: () => void };
  leagueId: string;
};

/**
 * La plancia di chi gestisce la lega.
 *
 * Tutto quello che riguarda gli accessi sta qui e si fa dall'app: nome,
 * codice, chi entra, chi esce, chi rientra, a chi passare la gestione.
 */
export default function GestioneLegaScreen({ navigation, leagueId }: Props) {
  const { t } = useTranslation();
  const detail = useLeaguesStore((s) => s.detail);
  const openLeague = useLeaguesStore((s) => s.openLeague);
  const rename = useLeaguesStore((s) => s.rename);
  const rotateCode = useLeaguesStore((s) => s.rotateCode);
  const closeInvites = useLeaguesStore((s) => s.closeInvites);
  const removeMember = useLeaguesStore((s) => s.removeMember);
  const reinstateMember = useLeaguesStore((s) => s.reinstateMember);
  const remove = useLeaguesStore((s) => s.remove);

  const [members, setMembers] = useState<LeagueMemberRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eliminazioneAperta, setEliminazioneAperta] = useState(false);
  const [nomeDigitato, setNomeDigitato] = useState('');

  const caricaMembri = useCallback(async () => {
    setMembersLoading(true);
    try {
      setMembers(await leaguesApi.members(leagueId));
    } catch (err: any) {
      setError(err?.message ?? t('leghe.errori.caricaMembri'));
    } finally {
      setMembersLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (!detail || detail.id !== leagueId) openLeague(leagueId);
    caricaMembri();
  }, [caricaMembri, detail, leagueId, openLeague]);

  useEffect(() => {
    if (detail?.id === leagueId) setName(detail.name);
  }, [detail, leagueId]);

  const esegui = async (chiave: string, azione: () => Promise<void>) => {
    setBusy(chiave);
    setError(null);
    try {
      await azione();
      await caricaMembri();
    } catch (err: any) {
      setError(err?.message ?? t('legaGestione.nonRiuscita'));
    } finally {
      setBusy(null);
    }
  };

  const confermaRimozione = (member: LeagueMemberRow) =>
    Alert.alert(
      t('legaGestione.rimuovereChi', {
        nickname: member.nickname ?? t('legaGestione.questoMembro'),
      }),
      t('legaGestione.rimuovereTesto'),
      [
        { text: t('comune.annulla'), style: 'cancel' },
        {
          text: t('legaGestione.rimuovi'),
          style: 'destructive',
          onPress: () => esegui(member.userId, () => removeMember(member.userId)),
        },
      ],
    );

  /**
   * Eliminare una lega cancella il lavoro di altre persone e non si annulla.
   * Perciò non basta un bottone: il nome va scritto. Non serve a verificare
   * che l'utente sappia come si chiama la sua lega, serve a dargli il tempo
   * di accorgersi di cosa sta facendo.
   */
  const nomeCombacia = nomiCombaciano(nomeDigitato, detail?.name ?? '');

  const apriEliminazione = () => {
    setNomeDigitato('');
    setEliminazioneAperta(true);
  };

  const elimina = () => {
    if (!nomeCombacia) return;
    setEliminazioneAperta(false);
    esegui('delete', async () => {
      await remove();
      navigation?.navigate('leghe');
    });
  };

  if (!detail || detail.id !== leagueId) {
    return (
      <View style={leagueStyles.screen}>
        <SubHeader title={t('legaGestione.titolo')} onBack={() => navigation?.goBack()} />
        <View style={leagueStyles.center}>
          <ActivityIndicator size="large" color={leagueColors.primary} />
        </View>
      </View>
    );
  }

  const ore = oreRimanenti(detail.inviteCodeExpiresAt);
  const attivi = members.filter((m) => m.status === 'active');
  const nomeCambiato = name.trim() !== detail.name && name.trim().length >= 3;

  return (
    <View style={leagueStyles.screen}>
      <SubHeader title={t('legaGestione.titolo')} onBack={() => navigation?.goBack()} />

      <ScrollView contentContainerStyle={leagueStyles.content}>
        <ErrorNote message={error} />

        <View style={leagueStyles.card}>
          <Text style={leagueStyles.label}>{t('leghePagina.nomeLega')}</Text>
          <View style={styles.renameRow}>
            <TextInput
              style={[leagueStyles.input, styles.renameInput]}
              value={name}
              onChangeText={setName}
              maxLength={40}
            />
            <TouchableOpacity
              style={[styles.saveButton, !nomeCambiato && styles.saveDisabled]}
              onPress={() => esegui('rename', () => rename(name.trim()))}
              disabled={!nomeCambiato || busy === 'rename'}
            >
              {busy === 'rename' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>{t('legaGestione.salva')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={leagueStyles.card}>
          <Text style={[leagueStyles.cardTitle, styles.codeTitle]}>
            {t('legaGestione.codiceInvito')}
          </Text>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{detail.inviteCode ?? '— — — —'}</Text>
            {detail.invitesOpen ? (
              <Text style={styles.codeHours}>{testoScadenza(ore)}</Text>
            ) : (
              <Text style={styles.codeClosed}>{t('legaGestione.chiusi')}</Text>
            )}
          </View>
          <View style={styles.codeButtons}>
            <GhostButton
              label={t('leghePagina.rigenera')}
              onPress={() => esegui('rotate', rotateCode)}
              busy={busy === 'rotate'}
              style={styles.codeButton}
            />
            <GhostButton
              label={t('legaGestione.chiudiInviti')}
              danger
              onPress={() => esegui('close', closeInvites)}
              busy={busy === 'close'}
              disabled={!detail.invitesOpen}
              style={styles.codeButton}
            />
          </View>
          <Text style={[leagueStyles.footnote, styles.codeNote]}>
            {t('legaGestione.chiudendo')}
          </Text>
        </View>

        <View style={[leagueStyles.card, leagueStyles.cardFlush]}>
          <Text style={styles.membersTitle}>Membri · {attivi.length}</Text>

          {membersLoading ? (
            <View style={styles.membersLoading}>
              <ActivityIndicator color={leagueColors.primary} />
            </View>
          ) : (
            members.map((member) => {
              const rimosso = member.status !== 'active';
              return (
                <View key={member.userId} style={styles.memberRow}>
                  <LeagueAvatar nickname={member.nickname} dimmed={rimosso} />
                  <View style={styles.memberName}>
                    <View style={styles.memberNameRow}>
                      <Text style={[styles.memberNick, rimosso && styles.dim]} numberOfLines={1}>
                        @{member.nickname ?? t('legaDettaglio.senzaNickname')}
                      </Text>
                      {member.role === 'owner' && (
                        <Text style={styles.ownerChip}>{t('legaGestione.gestisce')}</Text>
                      )}
                    </View>
                    <Text style={styles.memberMeta}>
                      {member.isMe
                        ? t('legaGestione.seiTu')
                        : member.status === 'removed'
                          ? t('legaGestione.rimosso')
                          : member.status === 'left'
                            ? t('legaGestione.uscito')
                            : t('legaDettaglio.dalla', { n: member.joinedFromWeek })}
                    </Text>
                  </View>

                  {!member.isMe && (
                    <View style={styles.memberActions}>
                      {rimosso ? (
                        <TouchableOpacity
                          style={styles.action}
                          onPress={() =>
                            esegui(member.userId, () => reinstateMember(member.userId))
                          }
                          disabled={busy === member.userId}
                        >
                          <Text style={styles.actionText}>{t('legaGestione.riammetti')}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.action}
                          onPress={() => confermaRimozione(member)}
                          disabled={busy === member.userId}
                        >
                          <Text style={styles.actionTextDanger}>{t('legaGestione.rimuovi')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}

          <Text style={[leagueStyles.footnote, styles.membersNote]}>
            {t('legaGestione.notaRimozione')}
          </Text>
        </View>

        <View style={[leagueStyles.card, leagueStyles.cardTight]}>
          <Text style={styles.passaggioTitolo}>{t('legaGestione.passaGestione')}</Text>
          <Text style={styles.passaggioTesto}>{t('legaGestione.passaSpiegazione')}</Text>
          <GhostButton
            label={t('legaGestione.scegliChi')}
            onPress={() => navigation?.navigate('passa-ruolo', { leagueId })}
            style={styles.passaggioBottone}
          />
        </View>

        <TouchableOpacity
          style={styles.deleteLink}
          onPress={apriEliminazione}
          disabled={busy === 'delete'}
        >
          <Text style={styles.deleteText}>{t('legaGestione.eliminaLega')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={eliminazioneAperta}
        transparent
        animationType="fade"
        onRequestClose={() => setEliminazioneAperta(false)}
      >
        <KeyboardAvoidingView style={styles.velo} behavior="padding">
          <View style={styles.finestra}>
            <Text style={styles.finestraTitolo}>
              {t('legaGestione.eliminareNome', { nome: detail.name })}
            </Text>
            <Text style={styles.finestraTesto}>{t('legaGestione.eliminaSpiegazione')}</Text>
            <Text style={styles.finestraTesto}>{t('legaGestione.nonSiTorna')}</Text>

            <Text style={styles.finestraEtichetta}>
              {t('legaGestione.scriviNome', { nome: detail.name })}
            </Text>
            <TextInput
              style={leagueStyles.input}
              value={nomeDigitato}
              onChangeText={setNomeDigitato}
              placeholder={detail.name}
              placeholderTextColor="#c4c4cc"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={40}
            />

            <TouchableOpacity
              style={[styles.bottoneElimina, !nomeCombacia && styles.bottoneSpento]}
              onPress={elimina}
              disabled={!nomeCombacia}
            >
              <Text style={styles.bottoneEliminaTesto}>{t('legaGestione.eliminaLega')}</Text>
            </TouchableOpacity>

            <GhostButton
              label={t('comune.annulla')}
              onPress={() => setEliminazioneAperta(false)}
              style={styles.annulla}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  renameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  renameInput: {
    flex: 1,
  },
  saveButton: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: leagueColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  codeTitle: {
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  code: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 6,
    color: leagueColors.text,
  },
  codeHours: {
    fontSize: 12,
    fontWeight: '600',
    color: leagueColors.warn,
  },
  codeClosed: {
    fontSize: 12,
    fontWeight: '600',
    color: leagueColors.textFaint,
  },
  codeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  codeButton: {
    flex: 1,
  },
  codeNote: {
    marginTop: 12,
  },
  membersTitle: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    fontSize: 15,
    fontWeight: '600',
    color: leagueColors.text,
  },
  membersLoading: {
    paddingVertical: 24,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: leagueColors.divider,
  },
  memberName: {
    flex: 1,
    minWidth: 0,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberNick: {
    flexShrink: 1,
    fontSize: 15,
    color: leagueColors.text,
  },
  dim: {
    color: leagueColors.textFaint,
  },
  ownerChip: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#5b21b6',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  memberMeta: {
    marginTop: 2,
    fontSize: 12,
    color: leagueColors.textFaint,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: leagueColors.inputBorder,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: leagueColors.brandDeep,
  },
  actionTextDanger: {
    fontSize: 13,
    fontWeight: '600',
    color: leagueColors.danger,
  },
  membersNote: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: leagueColors.divider,
  },
  passaggioTitolo: {
    fontSize: 14,
    fontWeight: '600',
    color: leagueColors.text,
  },
  passaggioTesto: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: leagueColors.textSoft,
  },
  passaggioBottone: {
    marginTop: 12,
  },
  velo: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  finestra: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 10,
  },
  finestraTitolo: {
    fontSize: 19,
    fontWeight: '700',
    color: leagueColors.text,
    textAlign: 'center',
  },
  finestraTesto: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: leagueColors.textSoft,
    textAlign: 'center',
  },
  finestraEtichetta: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  bottoneElimina: {
    marginTop: 16,
    height: 48,
    borderRadius: 8,
    backgroundColor: leagueColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottoneSpento: {
    opacity: 0.4,
  },
  bottoneEliminaTesto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  annulla: {
    marginTop: 10,
  },
  deleteLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: leagueColors.danger,
  },
});
