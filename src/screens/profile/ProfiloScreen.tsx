import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/stores/useAuthStore';
import GuestCTA from '../../components/common/GuestCTA';
import { profileApi } from '../../services/api/profile';
import { UserSummary } from '../../types/profile';
import {
  normalizeSummaryResponse,
  extractDisplayName,
  calculateProfileKPIs,
  avatarToDataUrl,
  getAvatarInitial,
  generateShareMessage,
  ordinalWeek,
} from '../../utils/profileCalculations';

type ProfiloScreenProps = {
  navigation?: any;
  onLogout?: () => void;
};

export default function ProfiloScreen({ navigation, onLogout }: ProfiloScreenProps) {
  // Selettori: re-render solo su cambi effettivi (azioni Zustand sono stabili)
  const user = useAuthStore((s) => s.user);

  // User info state
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [nickname, setNickname] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Statistics state
  const [summary, setSummary] = useState<UserSummary | null>(null);

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate KPIs using useMemo
  const kpi = useMemo(() => {
    return calculateProfileKPIs(summary);
  }, [summary]);

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user?.uid) {
      setError('Utente non autenticato');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Get user profile by Firebase UID
      console.log('[ProfiloScreen] Loading profile for Firebase UID:', user.uid);
      const profileResponse = await profileApi.getUserByFirebaseUid(user.uid);
      const profile = profileResponse.data;

      // Set user info
      setUserId(profile.id);
      setEmail(profile.email);
      setNickname(profile.nickname);
      setDisplayName(extractDisplayName(profile.name, profile.email));

      // Set avatar URL (Google profile or fallback)
      if (profile.googleProfileUrl) {
        setAvatarUrl(profile.googleProfileUrl);
      }

      // Step 2: Get user summary (predictions & statistics)
      console.log('[ProfiloScreen] Loading summary for Firebase UID:', user.uid);
      const summaryResponse = await profileApi.getUserSummary(user.uid, 'live');
      const normalizedSummary = normalizeSummaryResponse(summaryResponse);
      setSummary(normalizedSummary);

      // Step 3: Try to get uploaded avatar (optional)
      if (profile.id) {
        console.log('[ProfiloScreen] Loading avatar for user ID:', profile.id);
        const avatarResponse = await profileApi.getUserAvatar(profile.id);
        if (avatarResponse?.data) {
          const avatarDataUrl = avatarToDataUrl(
            avatarResponse.data.mimeType,
            avatarResponse.data.base64
          );
          setAvatarUrl(avatarDataUrl); // Override Google avatar if custom exists
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('[ProfiloScreen] Load error:', err);
      setError(err.message || 'Errore nel caricamento del profilo');
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Swipick',
        message: generateShareMessage(kpi),
      });
    } catch (err) {
      console.error('[ProfiloScreen] Share error:', err);
    }
  };

  const handleSettingsPress = () => {
    if (navigation) {
      navigation.navigate('impostazioni');
    } else {
      Alert.alert('Impostazioni', 'Navigazione alle impostazioni non ancora configurata');
    }
  };

  // Guest mode: the profile is entirely account-based → invite to register.
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <GuestCTA
          title="Il tuo profilo Swipick"
          message="Registrati per avere il tuo profilo, i punteggi, lo storico delle giornate e la classifica."
        />
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Caricamento profilo...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
          <Text style={styles.retryButtonText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Altezza delle barre: la più alta occupa tutto, le altre in proporzione.
  // Il riferimento è il massimo del periodo mostrato, non il 100%: con
  // percentuali tutte basse un grafico schiacciato non direbbe niente.
  const chartMax = Math.max(...kpi.chart.map((b) => b.accuracy), 1);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Intestazione */}
        <LinearGradient
          colors={['#554099', '#3d2d73']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {getAvatarInitial(displayName, email)}
              </Text>
            </View>
          )}

          <Text style={styles.userNickname} numberOfLines={1}>
            @{nickname || email.split('@')[0]}
          </Text>
          <Text style={styles.userWeeks}>
            {kpi.weeksPlayed === 0
              ? 'nessuna giornata giocata'
              : kpi.weeksPlayed === 1
                ? '1 giornata giocata'
                : `${kpi.weeksPlayed} giornate giocate`}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Media, con i numeri grezzi sotto: una percentuale senza
              denominatore non si puo' verificare. */}
          <View style={styles.card}>
            <View style={styles.averageRow}>
              <Text style={styles.averageValue}>
                {kpi.hasResults ? kpi.average : '—'}
              </Text>
              <Text style={styles.averageLabel}>di media</Text>
            </View>
            <Text
              style={[styles.averageDetail, !kpi.hasResults && styles.muted]}
            >
              {kpi.hasResults
                ? `${kpi.correct} ${kpi.correct === 1 ? 'pronostico indovinato' : 'pronostici indovinati'} su ${kpi.finished}`
                : 'Nessun pronostico ancora'}
            </Text>
          </View>

          {/* Andamento */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Come stai andando</Text>

            {kpi.chart.length === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="stats-chart-outline" size={30} color="#b6abd8" />
                <Text style={styles.emptyChartText}>
                  Il grafico si riempirà dopo la tua prima giornata giocata.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.chartRow}>
                  {kpi.chart.map((bar) => (
                    <View key={bar.week} style={styles.chartColumn}>
                      {/* Sopra le sei barre le etichette si toccherebbero */}
                      {kpi.chart.length <= 6 && (
                        <Text style={styles.chartValue}>{bar.pct}</Text>
                      )}
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: Math.max(
                              4,
                              (bar.accuracy / chartMax) * CHART_HEIGHT
                            ),
                          },
                        ]}
                      />
                      <Text style={styles.chartWeek}>g{bar.week}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statCell}>
                    <Text style={styles.statLabel}>Migliore</Text>
                    <Text style={styles.statValue}>{kpi.best.pct}</Text>
                    <Text style={styles.statWeek}>
                      {ordinalWeek(kpi.best.week)}
                    </Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statLabel}>Peggiore</Text>
                    <Text style={styles.statValue}>{kpi.worst.pct}</Text>
                    <Text style={styles.statWeek}>
                      {ordinalWeek(kpi.worst.week)}
                    </Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statLabel}>Ultima</Text>
                    <Text
                      style={[
                        styles.statValue,
                        kpi.last.trend === 'up' && styles.statUp,
                        kpi.last.trend === 'down' && styles.statDown,
                      ]}
                    >
                      {kpi.last.pct}
                      {kpi.last.trend === 'up' ? ' ▲' : ''}
                      {kpi.last.trend === 'down' ? ' ▼' : ''}
                    </Text>
                    <Text style={styles.statWeek}>
                      {ordinalWeek(kpi.last.week)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Condividi profilo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/** Altezza massima di una barra, in punti. */
const CHART_HEIGHT = 84;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Intestazione
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#554099',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  // 72 punti invece di 128: l'avatar fa posto ai dati, che sono il motivo
  // per cui si apre questa schermata.
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userNickname: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 14,
    maxWidth: '100%',
  },
  userWeeks: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginTop: 4,
  },

  // Contenuto
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },

  // Media
  averageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  averageValue: {
    fontSize: 44,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 48,
  },
  averageLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  averageDetail: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
  },
  muted: {
    color: '#9ca3af',
  },

  // Grafico
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: CHART_HEIGHT + 36,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  chartBar: {
    width: '100%',
    backgroundColor: '#7c3aed',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  chartWeek: {
    fontSize: 11,
    color: '#9ca3af',
  },
  emptyChart: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ddd7f0',
    borderRadius: 12,
    backgroundColor: '#fbfaff',
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 10,
  },
  emptyChartText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 21,
  },

  // Migliore / Peggiore / Ultima
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statCell: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statUp: {
    color: '#059669',
  },
  statDown: {
    color: '#b91c1c',
  },
  statWeek: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },

  // Condivisione
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 4,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
