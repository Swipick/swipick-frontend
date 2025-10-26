import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface BottomNavProps {
  currentMode?: 'live' | 'test';
  selectedWeek?: number | null;
  onNavigateToResults: () => void;
  onNavigateToGioca?: () => void;
  onNavigateToProfile: () => void;
  activeTab?: 'gioca' | 'risultati' | 'profilo';
}

export default function BottomNav({
  currentMode = 'live',
  selectedWeek,
  onNavigateToResults,
  onNavigateToGioca,
  onNavigateToProfile,
  activeTab = 'gioca',
}: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) }
      ]}
    >
      <View style={styles.tabsContainer}>
        {/* Risultati Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={onNavigateToResults}
          activeOpacity={0.7}
        >
          {activeTab === 'risultati' && <View style={styles.activeIndicator} />}
          <View style={styles.iconContainer}>
            <FontAwesome
              name="trophy"
              size={24}
              color={activeTab === 'risultati' ? '#6f49ff' : '#6B7280'}
            />
          </View>
          <Text
            style={[
              styles.label,
              activeTab === 'risultati' && styles.labelActive
            ]}
          >
            Risultati
          </Text>
        </TouchableOpacity>

        {/* Gioca Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={onNavigateToGioca}
          activeOpacity={0.7}
          disabled={!onNavigateToGioca}
        >
          {activeTab === 'gioca' && <View style={styles.activeIndicator} />}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="soccer"
              size={24}
              color={activeTab === 'gioca' ? '#6f49ff' : '#6B7280'}
            />
          </View>
          <Text
            style={[
              styles.label,
              activeTab === 'gioca' && styles.labelActive
            ]}
          >
            Gioca
          </Text>
        </TouchableOpacity>

        {/* Profilo Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={onNavigateToProfile}
          activeOpacity={0.7}
        >
          {activeTab === 'profilo' && <View style={styles.activeIndicator} />}
          <View style={styles.iconContainer}>
            <Ionicons
              name="person"
              size={24}
              color={activeTab === 'profilo' ? '#6f49ff' : '#6B7280'}
            />
          </View>
          <Text
            style={[
              styles.label,
              activeTab === 'profilo' && styles.labelActive
            ]}
          >
            Profilo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#6f49ff',
  },
  iconContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#000000',
  },
  labelActive: {
    color: '#6f49ff',
    fontWeight: '500',
  },
});
