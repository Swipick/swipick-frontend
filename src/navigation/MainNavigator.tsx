import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNav from '../components/navigation/BottomNav';
import GiocaScreen from '../screens/game/GiocaScreen';
import RisultatiScreen from '../screens/results/RisultatiScreen';
import ProfiloScreen from '../screens/profile/ProfiloScreen';
import ImpostazioniScreen from '../screens/profile/ImpostazioniScreen';
import { useGameStore } from '../store/stores/useGameStore';

type ScreenType = 'gioca' | 'risultati' | 'profilo' | 'impostazioni';

export default function MainNavigator() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('gioca');
  const { currentWeek, mode } = useGameStore();

  // Simple navigation object to pass to screens
  const navigation = {
    navigate: (screen: ScreenType) => {
      setActiveScreen(screen);
    },
    goBack: () => {
      // Go back to profilo from impostazioni
      if (activeScreen === 'impostazioni') {
        setActiveScreen('profilo');
      }
    },
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'risultati':
        return <RisultatiScreen mode={mode} />;
      case 'gioca':
        return <GiocaScreen />;
      case 'profilo':
        return <ProfiloScreen navigation={navigation} onLogout={() => {
          // Logout handled by ProfiloScreen
        }} />;
      case 'impostazioni':
        return <ImpostazioniScreen navigation={navigation} />;
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

      {/* Bottom Navigation - Hide on Impostazioni screen */}
      {activeScreen !== 'impostazioni' && (
        <BottomNav
          currentMode={mode}
          selectedWeek={currentWeek}
          onNavigateToResults={() => setActiveScreen('risultati')}
          onNavigateToGioca={() => setActiveScreen('gioca')}
          onNavigateToProfile={() => setActiveScreen('profilo')}
          activeTab={activeScreen}
        />
      )}
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
