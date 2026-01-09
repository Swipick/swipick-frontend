import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/stores/useAuthStore';
import { authService } from '../../services/auth/authService';
import { profileApi } from '../../services/api/profile';
import { UserPreferences, PreferencesUpdate } from '../../types/settings';

type ImpostazioniScreenProps = {
  navigation?: any;
};

export default function ImpostazioniScreen({ navigation }: ImpostazioniScreenProps) {
  const { user } = useAuthStore();

  // User info state
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [nickname, setNickname] = useState<string | null>(null);

  // Preference state
  const [notifResults, setNotifResults] = useState<boolean>(true);
  const [notifMatches, setNotifMatches] = useState<boolean>(true);
  const [notifGoals, setNotifGoals] = useState<boolean>(true);

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Load settings data
  useEffect(() => {
    loadSettingsData();
  }, [user]);

  const loadSettingsData = async () => {
    if (!user?.uid) {
      setError('Utente non autenticato');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Get user profile
      console.log('[ImpostazioniScreen] Loading profile for Firebase UID:', user.uid);
      const profileResponse = await profileApi.getUserByFirebaseUid(user.uid);
      const profile = profileResponse.data;

      setUserId(profile.id);
      setEmail(profile.email);
      setNickname(profile.sopranome);

      // Step 2: Get user preferences
      console.log('[ImpostazioniScreen] Loading preferences for user ID:', profile.id);
      const prefsResponse = await profileApi.getUserPreferences(profile.id);
      const prefs = prefsResponse.data;

      setNotifResults(prefs.results);
      setNotifMatches(prefs.matches);
      setNotifGoals(prefs.goals);

      setLoading(false);
    } catch (err: any) {
      console.error('[ImpostazioniScreen] Load error:', err);
      setError(err.message || 'Errore nel caricamento delle impostazioni');
      setLoading(false);
    }
  };

  // Optimistic UI update for preferences
  const optimisticUpdate = async (patch: PreferencesUpdate) => {
    if (!userId) return;

    // Save previous state for rollback
    const prev = {
      results: notifResults,
      matches: notifMatches,
      goals: notifGoals,
    };

    // Apply optimistic state IMMEDIATELY
    if (patch.results !== undefined) setNotifResults(patch.results);
    if (patch.matches !== undefined) setNotifMatches(patch.matches);
    if (patch.goals !== undefined) setNotifGoals(patch.goals);

    try {
      // Send to server
      await profileApi.updateUserPreferences(userId, patch);

      // Success: Show confirmation
      showToast('Preferenze aggiornate');
    } catch (error: any) {
      console.error('[ImpostazioniScreen] Update failed:', error);

      // ROLLBACK on error
      setNotifResults(prev.results);
      setNotifMatches(prev.matches);
      setNotifGoals(prev.goals);

      Alert.alert('Errore', 'Impossibile aggiornare le preferenze');
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!userId) return;

    try {
      // Request permission first
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permesso richiesto',
            'Swipick necessita l\'accesso alla tua libreria fotografica per caricare un\'immagine del profilo.'
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        base64: false,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      // Client-side validation
      if (!asset.mimeType || !['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType)) {
        Alert.alert('Errore', 'Formato immagine non supportato. Usa JPEG, PNG o WebP.');
        return;
      }

      // Check file size (5MB max)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('Errore', 'Immagine troppo grande (max 5MB)');
        return;
      }

      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      // Upload
      await profileApi.uploadUserAvatar(userId, formData);

      // Success feedback
      showToast('Avatar aggiornato');
    } catch (error: any) {
      console.error('[ImpostazioniScreen] Avatar upload failed:', error);
      Alert.alert('Errore', 'Caricamento avatar fallito');
    } finally {
      setUploading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userId) return;

    try {
      setDeleting(true);

      // Get fresh Firebase ID token
      const token = await authService.getIdToken();
      if (!token) {
        Alert.alert('Errore', 'Autenticazione richiesta per eliminare l\'account');
        setDeleting(false);
        return;
      }

      // Delete account
      await profileApi.deleteAccount(userId, token);

      // Logout locally
      await authService.signOut();

      // Close modal
      setShowDeleteModal(false);

      // Navigate to welcome (handled by auth flow)
    } catch (error: any) {
      console.error('[ImpostazioniScreen] Delete account failed:', error);
      Alert.alert('Errore', error.message || 'Eliminazione account fallita');
      setDeleting(false);
    }
  };

  // Show "prossimamente" toast for disabled features
  const showProssimamente = () => {
    showToast('prossimamente', 1500);
  };

  // Toast helper
  const showToast = (message: string, duration: number = 1800) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Caricamento impostazioni...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSettingsData}>
          <Text style={styles.retryButtonText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Impostazioni</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            {/* Email (read-only) */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>email</Text>
              <Text style={styles.rowValue}>{email}</Text>
            </View>

            {/* Username (disabled) */}
            <View style={[styles.row, styles.disabledRow]}>
              <Text style={styles.rowLabel}>username</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{nickname || '—'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </View>

            {/* Password (disabled) */}
            <View style={[styles.row, styles.disabledRow]}>
              <Text style={styles.rowLabel}>password</Text>
              <View style={styles.rowRight}>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </View>

            {/* Avatar Upload (active) */}
            <TouchableOpacity
              style={[styles.row, uploading && styles.disabledRow]}
              onPress={handleAvatarUpload}
              disabled={uploading}
            >
              <Text style={styles.rowLabel}>immagine profilo</Text>
              <View style={styles.rowRight}>
                {uploading && <ActivityIndicator size="small" color={colors.primary} />}
                {uploading && <Text style={styles.rowValue}>Caricamento...</Text>}
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifiche</Text>
          <View style={styles.sectionContent}>
            {/* Risultati (Active) */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Risultati</Text>
                <Text style={styles.toggleDescription}>
                  Scopri il tuo punteggio a fine giornata
                </Text>
              </View>
              <Switch
                value={notifResults}
                onValueChange={(value) => optimisticUpdate({ results: value })}
                trackColor={{ false: '#e5e7eb', true: '#9333ea' }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Partite (Disabled) */}
            <TouchableOpacity
              style={[styles.toggleRow, styles.disabledRow]}
              onPress={showProssimamente}
            >
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Partite</Text>
                <Text style={styles.toggleDescription}>Ti avvisiamo al 90°</Text>
              </View>
              <Switch
                value={false}
                disabled={true}
                trackColor={{ false: '#e5e7eb', true: '#9333ea' }}
                thumbColor="#ffffff"
              />
            </TouchableOpacity>

            {/* Gol (Disabled) */}
            <TouchableOpacity
              style={[styles.toggleRow, styles.disabledRow]}
              onPress={showProssimamente}
            >
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Gol</Text>
                <Text style={styles.toggleDescription}>
                  Ad ogni marcatura sarai il primo a saperlo
                </Text>
              </View>
              <Switch
                value={false}
                disabled={true}
                trackColor={{ false: '#e5e7eb', true: '#9333ea' }}
                thumbColor="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pericolo</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={[styles.deleteButton, deleting && styles.disabledRow]}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              <Text style={styles.deleteButtonText}>ELIMINA ACCOUNT</Text>
            </TouchableOpacity>
            <Text style={styles.deleteDisclaimer}>
              Questa azione è irreversibile e rimuoverà il tuo account e la tua cronologia.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      {toast && (
        <View style={styles.toastContainer}>
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !deleting && setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Conferma eliminazione</Text>
            <Text style={styles.modalMessage}>
              Sei sicuro di voler eliminare definitivamente il tuo account? Questa azione
              non può essere annullata.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Elimina</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
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
    height: 125,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 20,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    top: 60,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  // Section
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  rowValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledRow: {
    opacity: 0.6,
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  toggleLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Delete Button
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    margin: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  deleteDisclaimer: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  toast: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: spacing.md,
  },
  modalMessage: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#dc2626',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
