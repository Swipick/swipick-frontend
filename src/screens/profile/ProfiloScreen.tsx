import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/stores/useAuthStore';
import { authService } from '../../services/auth/authService';

type ProfiloScreenProps = {
  onLogout?: () => void;
};

export default function ProfiloScreen({ onLogout }: ProfiloScreenProps) {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('[ProfiloScreen] Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Profilo</Text>
          {user && (
            <Text style={styles.email}>{user.email}</Text>
          )}
        </View>

        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>👤</Text>
          <Text style={styles.placeholderTitle}>Profilo Utente</Text>
          <Text style={styles.placeholderText}>
            Qui vedrai le tue statistiche, impostazioni e profilo
          </Text>
        </View>

        {user && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        )}
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
    padding: spacing.lg,
    paddingBottom: 80,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
