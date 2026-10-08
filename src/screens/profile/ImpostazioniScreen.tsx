import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Application from 'expo-application';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/stores/useAuthStore';
import { authService } from '../../services/auth/authService';
import { profileApi } from '../../services/api/profile';
import { describeProviders } from '../../utils/authProviders';
import { PRIVACY_URL, TERMS_URL } from '../../config/links';

type ImpostazioniScreenProps = {
  navigation?: { navigate: (screen: any) => void; goBack: () => void };
  /** Nickname corrente, tenuto dal navigatore così sopravvive al cambio schermata. */
  nickname: string | null;
  onProfileLoaded: (info: { userId: string; email: string; nickname: string | null }) => void;
};

/**
 * Lato dell'avatar dopo il ritaglio, in pixel: lo decide il server, che
 * ritaglia al centro e riduce a questa misura in webp.
 * L'avatar più grande nell'app è 72 punti, cioè 216 pixel su uno schermo a
 * tripla densità: 256 li copre, e oltre si pagherebbero pixel che nessuno
 * vedrà. Il numero è qui solo per dirlo all'utente.
 */
const AVATAR_PX = 256;

/** Oltre questa dimensione non ha senso spedire: il server ridurrebbe comunque. */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Una riga della lista: etichetta, eventuale nota, valore e freccia. */
function Riga({
  label,
  note,
  value,
  valueStyle,
  onPress,
  busy,
  last,
}: {
  label: string;
  note?: string;
  value?: string;
  valueStyle?: any;
  onPress?: () => void;
  busy?: boolean;
  last?: boolean;
}) {
  const content = (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {note ? <Text style={styles.rowNote}>{note}</Text> : null}
      </View>
      {busy ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      {value ? (
        <Text
          style={[styles.rowValue, valueStyle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      ) : null}
      {onPress ? (
        <Ionicons name="chevron-forward" size={18} color="#c4c4cc" />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} disabled={busy}>
      {content}
    </TouchableOpacity>
  );
}

export default function ImpostazioniScreen({
  navigation,
  nickname,
  onProfileLoaded,
}: ImpostazioniScreenProps) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const providers = describeProviders(authService.getLinkedProviders());

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

      const profileResponse = await profileApi.getUserByFirebaseUid(user.uid);
      const profile = profileResponse.data;

      setUserId(profile.id);
      setEmail(profile.email);
      onProfileLoaded({
        userId: profile.id,
        email: profile.email,
        nickname: profile.nickname,
      });

      setLoading(false);
    } catch (err: any) {
      console.error('[ImpostazioniScreen] Load error:', err);
      setError(err.message || 'Errore nel caricamento delle impostazioni');
      setLoading(false);
    }
  };

  const showToast = (message: string, duration: number = 1800) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  const handleAvatarUpload = async () => {
    if (!userId) return;

    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permesso richiesto',
            "Swipick ha bisogno di accedere alle tue foto per cambiare l'immagine del profilo."
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (
        asset.mimeType &&
        !['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType)
      ) {
        Alert.alert('Formato non supportato', 'Usa una foto JPEG, PNG o WebP.');
        return;
      }

      if (asset.fileSize && asset.fileSize > MAX_UPLOAD_BYTES) {
        Alert.alert('Foto troppo grande', 'Scegline una sotto i 5 MB.');
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      await profileApi.uploadUserAvatar(userId, formData);
      showToast('Foto aggiornata');
    } catch (err: any) {
      console.error('[ImpostazioniScreen] Avatar upload failed:', err);
      Alert.alert('Errore', 'Caricamento della foto non riuscito');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Disconnetti', 'Vuoi uscire dal tuo account?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Disconnetti',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err: any) {
            console.error('[ImpostazioniScreen] Logout error:', err);
            Alert.alert('Errore', err?.message || 'Uscita non riuscita');
          }
        },
      },
    ]);
  };

  // Letti dal binario, non da app.json: con appVersionSource "remote" il
  // build number lo incrementa EAS sui suoi server, e la copia in configurazione
  // resta indietro. Mostrarla voleva dire dare ai tester un numero che non
  // corrisponde a nessuna build.
  const versione = `${Application.nativeApplicationVersion ?? '—'} (${
    Application.nativeBuildVersion ?? '—'
  })`;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Caricamento impostazioni…</Text>
      </View>
    );
  }

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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Impostazioni</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Le prime due righe sono come appari, le ultime due come entri. */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Riga
            label="Nickname"
            value={nickname ? `@${nickname}` : '—'}
            onPress={() => navigation?.navigate('nickname')}
          />
          <Riga
            label="Foto profilo"
            note={`Ritagliata a ${AVATAR_PX} × ${AVATAR_PX} px`}
            onPress={handleAvatarUpload}
            busy={uploading}
          />
          <Riga label="Email" note="Non modificabile" value={email} />
          <Riga
            label="Metodi di accesso"
            value={providers.label}
            valueStyle={providers.soloUno && styles.valueWarning}
            onPress={() => navigation?.navigate('accesso')}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>Informazioni</Text>
        <View style={styles.card}>
          <Riga
            label="Privacy e cookie"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <Riga
            label="Termini e condizioni"
            onPress={() => Linking.openURL(TERMS_URL)}
          />
          <Riga label="Versione" value={versione} last />
        </View>

        <View style={[styles.card, styles.logoutCard]}>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.6}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.logoutLabel}>Disconnetti</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteLink}
          onPress={() => navigation?.navigate('elimina')}
        >
          <Text style={styles.deleteLinkText}>Elimina account</Text>
        </TouchableOpacity>
      </ScrollView>

      {toast && (
        <View style={styles.toastContainer}>
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#F5F5F7',
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
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 4,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  logoutCard: {
    marginTop: 2,
  },
  // Niente larghezze fisse: l'etichetta prende lo spazio che resta e il
  // valore si accorcia. È quello che tiene in piedi la riga dell'email
  // lunga su uno schermo da 375 punti.
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexShrink: 0,
  },
  rowLabel: {
    fontSize: 16,
    color: '#111827',
  },
  rowNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    color: '#6B7280',
  },
  valueWarning: {
    color: '#b45309',
  },
  logoutLabel: {
    fontSize: 16,
    color: '#5742a4',
  },
  deleteLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteLinkText: {
    fontSize: 15,
    color: '#b91c1c',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: 'rgba(17,24,39,0.92)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
