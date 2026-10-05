import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 750;

/**
 * I pezzi comuni alle schermate delle leghe.
 *
 * Non è un design system nuovo: sono le stesse misure già in uso altrove
 * nell'app (header con raggio 16 e ombra viola come Risultati e Profilo, card
 * bianche a 16, bottoni alti 48). Stanno qui perché sette schermate che le
 * ricopiano a mano divergono alla prima modifica.
 */

export const leagueColors = {
  page: '#F9FAFB',
  card: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.05)',
  divider: '#f3f4f6',
  text: '#111827',
  textSoft: '#4b5563',
  textMuted: '#6B7280',
  textFaint: '#9ca3af',
  primary: '#9333EA',
  brandDeep: '#5742a4',
  inputBorder: '#D1D5DB',
  danger: '#b91c1c',
  good: '#059669',
  warn: '#92400e',
} as const;

/** La tavolozza degli avatar: tinte del brand, tutte scure quanto basta per il bianco sopra. */
const AVATAR_TINTS = ['#8b5cf6', '#6366f1', '#7c3aed', '#6f49ff', '#a855f7'];

export function avatarTint(seed: string): string {
  let total = 0;
  for (let i = 0; i < seed.length; i++) total += seed.charCodeAt(i);
  return AVATAR_TINTS[total % AVATAR_TINTS.length];
}

/** Avatar quadrato con l'iniziale, come quello del profilo ma in piccolo. */
export function LeagueAvatar({
  nickname,
  size = 32,
  dimmed = false,
}: {
  nickname: string | null;
  size?: number;
  dimmed?: boolean;
}) {
  const label = (nickname ?? '?').replace(/^@/, '').charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: dimmed ? '#C4B5FD' : avatarTint(nickname ?? '?'),
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.42 }]}>{label}</Text>
    </View>
  );
}

/** L'intestazione viola delle schermate di dati (Risultati, Profilo, Leghe). */
export function GradientHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient colors={['#554099', '#3d2d73']} style={[styles.gradientHeader, style]}>
      {children}
    </LinearGradient>
  );
}

/** L'intestazione bianca con la freccia, come nelle impostazioni. */
export function SubHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.subHeader}>
      <TouchableOpacity
        onPress={onBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityLabel="Indietro"
      >
        <Ionicons name="chevron-back" size={26} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.subHeaderTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.subHeaderRight}>{right}</View>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  busy,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const off = disabled || busy;
  return (
    <TouchableOpacity
      style={[styles.primaryButton, off && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={off}
      activeOpacity={0.8}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryButtonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function GhostButton({
  label,
  onPress,
  busy,
  disabled,
  danger,
  style,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  danger?: boolean;
  style?: ViewStyle;
}) {
  const off = disabled || busy;
  return (
    <TouchableOpacity
      style={[
        styles.ghostButton,
        danger && styles.ghostButtonDanger,
        off && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={off}
      activeOpacity={0.7}
    >
      {busy ? (
        <ActivityIndicator color={danger ? leagueColors.danger : leagueColors.brandDeep} />
      ) : (
        <Text style={[styles.ghostButtonText, danger && styles.ghostButtonTextDanger]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/** Il banner d'errore: una riga, leggibile, senza modali. */
export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.errorNote}>
      <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
      <Text style={styles.errorNoteText}>{message}</Text>
    </View>
  );
}

export const leagueStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: leagueColors.page,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: leagueColors.card,
    borderWidth: 1,
    borderColor: leagueColors.cardBorder,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTight: {
    padding: 16,
  },
  cardFlush: {
    padding: 0,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: leagueColors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: leagueColors.inputBorder,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
    color: leagueColors.text,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: leagueColors.textMuted,
    marginTop: 8,
    marginLeft: 2,
  },
  footnote: {
    fontSize: 12,
    lineHeight: 17,
    color: leagueColors.textFaint,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
});

const styles = StyleSheet.create({
  gradientHeader: {
    paddingTop: isSmallScreen ? 40 : 60,
    paddingHorizontal: 16,
    paddingBottom: isSmallScreen ? 14 : 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#554099',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  subHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: isSmallScreen ? 40 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subHeaderRight: {
    width: 26,
    alignItems: 'flex-end',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  primaryButton: {
    height: 48,
    backgroundColor: leagueColors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ghostButton: {
    height: 48,
    borderWidth: 1,
    borderColor: leagueColors.inputBorder,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonDanger: {
    borderColor: '#fecaca',
  },
  ghostButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: leagueColors.brandDeep,
  },
  ghostButtonTextDanger: {
    color: leagueColors.danger,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
  },
  errorNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#991b1b',
  },
});
