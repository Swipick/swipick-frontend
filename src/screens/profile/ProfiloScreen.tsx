import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../store/stores/useAuthStore';
import { colors } from '../../theme';

export default function ProfiloScreen() {
  const { user, signOut, loading } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.label}>Display Name</Text>
          <Text style={styles.value}>{user?.displayName || 'Not set'}</Text>

          <Text style={[styles.label, styles.labelMargin]}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>

          <Text style={[styles.label, styles.labelMargin]}>User ID</Text>
          <Text style={styles.valueSmall}>{user?.uid}</Text>

          <View style={[styles.statusContainer, styles.labelMargin]}>
            <Text style={styles.label}>Email Verified</Text>
            <View
              style={[
                styles.badge,
                user?.emailVerified ? styles.badgeSuccess : styles.badgeWarning,
              ]}
            >
              <Text style={styles.badgeText}>
                {user?.emailVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={loading}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  userInfo: {
    backgroundColor: colors.backgroundSecondary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelMargin: {
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
  },
  valueSmall: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
    fontFamily: 'Courier',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  badgeWarning: {
    backgroundColor: colors.warning,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
