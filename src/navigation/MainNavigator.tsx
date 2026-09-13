import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNav from '../components/navigation/BottomNav';
import GiocaScreen from '../screens/game/GiocaScreen';
import RisultatiScreen from '../screens/results/RisultatiScreen';
import ProfiloScreen from '../screens/profile/ProfiloScreen';
import ImpostazioniScreen from '../screens/profile/ImpostazioniScreen';
import CambiaNicknameScreen from '../screens/profile/CambiaNicknameScreen';
import EliminaAccountScreen from '../screens/profile/EliminaAccountScreen';
import MetodiAccessoScreen from '../screens/profile/MetodiAccessoScreen';
import { useGameStore } from '../store/stores/useGameStore';

type ScreenType =
  | 'gioca'
  | 'risultati'
  | 'profilo'
  | 'impostazioni'
  | 'nickname'
  | 'elimina'
  | 'accesso';

/** Schermate che stanno dentro le impostazioni: niente barra in fondo. */
const SOTTO_IMPOSTAZIONI: ScreenType[] = ['nickname', 'elimina', 'accesso'];

export default function MainNavigator() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('gioca');
  const { currentWeek, mode } = useGameStore();

  // Dati del profilo tenuti qui: le schermate figlie ne hanno bisogno e il
  // render a switch le smonta a ogni passaggio, quindi non possono tenerli loro.
  const [profileInfo, setProfileInfo] = useState<{
    userId: string;
    email: string;
    nickname: string | null;
  } | null>(null);

  const navigation = {
    navigate: (screen: ScreenType) => {
      setActiveScreen(screen);
    },
    goBack: () => {
      if (SOTTO_IMPOSTAZIONI.includes(activeScreen)) {
        setActiveScreen('impostazioni');
      } else if (activeScreen === 'impostazioni') {
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
        return <ProfiloScreen navigation={navigation} />;
      case 'impostazioni':
        return (
          <ImpostazioniScreen
            navigation={navigation}
            nickname={profileInfo?.nickname ?? null}
            onProfileLoaded={setProfileInfo}
          />
        );
      case 'nickname':
        if (!profileInfo) return null;
        return (
          <CambiaNicknameScreen
            navigation={navigation}
            userId={profileInfo.userId}
            current={profileInfo.nickname}
            onChanged={(nickname) =>
              setProfileInfo((prev) => (prev ? { ...prev, nickname } : prev))
            }
          />
        );
      case 'accesso':
        if (!profileInfo) return null;
        return (
          <MetodiAccessoScreen navigation={navigation} email={profileInfo.email} />
        );
      case 'elimina':
        if (!profileInfo) return null;
        return (
          <EliminaAccountScreen
            navigation={navigation}
            userId={profileInfo.userId}
            nickname={profileInfo.nickname}
          />
        );
      default:
        return null;
    }
  };

  const mostraBarra =
    activeScreen !== 'impostazioni' &&
    !SOTTO_IMPOSTAZIONI.includes(activeScreen);

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {mostraBarra && (
        <BottomNav
          currentMode={mode}
          selectedWeek={currentWeek}
          onNavigateToResults={() => setActiveScreen('risultati')}
          onNavigateToGioca={() => setActiveScreen('gioca')}
          onNavigateToProfile={() => setActiveScreen('profilo')}
          activeTab={activeScreen as 'gioca' | 'risultati' | 'profilo'}
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
