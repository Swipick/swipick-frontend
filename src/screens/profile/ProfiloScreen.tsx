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
import { profileApi } from '../../services/api/profile';
import { UserSummary } from '../../types/profile';
import {
  normalizeSummaryResponse,
  extractDisplayName,
  calculateProfileKPIs,
  avatarToDataUrl,
  getAvatarInitial,
  generateShareMessage,
} from '../../utils/profileCalculations';

type ProfiloScreenProps = {
  navigation?: any;
  onLogout?: () => void;
};

export default function ProfiloScreen({ navigation, onLogout }: ProfiloScreenProps) {
  const { user } = useAuthStore();

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
      setNickname(profile.sopranome);
      setDisplayName(extractDisplayName(profile.nome, profile.email));

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
      const message = generateShareMessage(kpi);
      const url = 'https://swipick.com'; // Replace with actual app URL or deep link

      await Share.share({
        title: 'Swipick',
        message: `${message}\n${url}`,
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Gradient Header */}
        <LinearGradient
          colors={['#554099', '#3d2d73']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.header}
        >
          {/* Settings Button */}
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {getAvatarInitial(displayName, email)}
                </Text>
              </View>
            )}
          </View>

          {/* User Info */}
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userNickname}>
            @{nickname || email.split('@')[0]}
          </Text>
        </LinearGradient>

        {/* Content Container */}
        <View style={styles.content}>
          {/* Average Score Card */}
          <LinearGradient
            colors={['#FFFFFF', '#d8b4fe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.averageCard}
          >
            <Text style={styles.cardLabel}>Punteggio medio</Text>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardValueLarge}>{kpi.average}</Text>
              <Text style={styles.cardSubtitle}>
                {kpi.weeksPlayed} {kpi.weeksPlayed === 1 ? 'giornata giocata' : 'giornate giocate'}
              </Text>
            </View>
          </LinearGradient>

          {/* Best/Worst Week Grid */}
          <View style={styles.gridContainer}>
            {/* Best Week Card */}
            <LinearGradient
              colors={['#e7f8f2', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gridCard}
            >
              <Text style={styles.cardLabel}>Risultato migliore</Text>
              <View style={styles.cardValueContainer}>
                <Text style={styles.cardValueMedium}>{kpi.best.pct}</Text>
                <Text style={styles.cardSubtitle}>giornata {kpi.best.week}</Text>
              </View>
            </LinearGradient>

            {/* Worst Week Card */}
            <LinearGradient
              colors={['#ffeef2', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gridCard}
            >
              <Text style={styles.cardLabel}>Risultato peggiore</Text>
              <View style={styles.cardValueContainer}>
                <Text style={styles.cardValueMedium}>{kpi.worst.pct}</Text>
                <Text style={styles.cardSubtitle}>giornata {kpi.worst.week}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            disabled={loading}
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Condividi profilo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
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
    backgroundColor: colors.backgroundSecondary,
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

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 40,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 128,
    height: 128,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  userNickname: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },

  // Content
  content: {
    padding: spacing.lg,
  },

  // Average Card
  averageCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 132,
    borderWidth: 1,
    borderColor: 'rgba(216, 180, 254, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.lg,
  },
  cardLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  cardValueContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  cardValueLarge: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1f1147',
  },
  cardValueMedium: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1f1147',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: spacing.xl,
  },
  gridCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 162,
    borderWidth: 1,
    borderColor: 'rgba(220, 252, 231, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Share Button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: spacing.xl,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
