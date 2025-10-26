import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNav from '../components/navigation/BottomNav';
import GiocaScreen from '../screens/game/GiocaScreen';
import RisultatiScreen from '../screens/results/RisultatiScreen';
import ProfiloScreen from '../screens/profile/ProfiloScreen';
import { useGameStore } from '../store/stores/useGameStore';

export default function MainNavigator() {
  const [activeTab, setActiveTab] = useState<'gioca' | 'risultati' | 'profilo'>('gioca');
  const { currentWeek, mode } = useGameStore();

  const renderScreen = () => {
    switch (activeTab) {
      case 'risultati':
        return <RisultatiScreen mode={mode} week={currentWeek} />;
      case 'gioca':
        return <GiocaScreen />;
      case 'profilo':
        return <ProfiloScreen onLogout={() => {
          // Logout handled by ProfiloScreen
        }} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Content */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      <BottomNav
        currentMode={mode}
        selectedWeek={currentWeek}
        onNavigateToResults={() => setActiveTab('risultati')}
        onNavigateToGioca={() => setActiveTab('gioca')}
        onNavigateToProfile={() => setActiveTab('profilo')}
        activeTab={activeTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
