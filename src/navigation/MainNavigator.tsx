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
import LegheScreen from '../screens/leagues/LegheScreen';
import CreaLegaScreen from '../screens/leagues/CreaLegaScreen';
import UniscitiScreen from '../screens/leagues/UniscitiScreen';
import ConfermaInvitoScreen from '../screens/leagues/ConfermaInvitoScreen';
import DettaglioLegaScreen from '../screens/leagues/DettaglioLegaScreen';
import InvitaScreen from '../screens/leagues/InvitaScreen';
import GestioneLegaScreen from '../screens/leagues/GestioneLegaScreen';
import PassaRuoloScreen from '../screens/leagues/PassaRuoloScreen';
import { useGameStore } from '../store/stores/useGameStore';
import { InvitePreview } from '../types/league.types';

type ScreenType =
  | 'gioca'
  | 'risultati'
  | 'profilo'
  | 'impostazioni'
  | 'nickname'
  | 'elimina'
  | 'accesso'
  | 'leghe'
  | 'crea-lega'
  | 'unisciti'
  | 'conferma-invito'
  | 'dettaglio-lega'
  | 'invita'
  | 'gestione-lega'
  | 'passa-ruolo';

/** Quello che una schermata può passare a quella dopo. */
type ScreenParams = {
  leagueId?: string;
  code?: string;
  preview?: InvitePreview;
};

/** Schermate che stanno dentro le impostazioni: niente barra in fondo. */
const SOTTO_IMPOSTAZIONI: ScreenType[] = ['nickname', 'elimina', 'accesso'];

/**
 * Schermate che stanno dentro le leghe. Come per le impostazioni, la barra
 * sparisce: sono percorsi con un inizio e una fine, e la barra inviterebbe a
 * uscirne a metà.
 */
const SOTTO_LEGHE: ScreenType[] = [
  'crea-lega',
  'unisciti',
  'conferma-invito',
  'dettaglio-lega',
  'invita',
  'gestione-lega',
  'passa-ruolo',
];

/** Dove porta "indietro" da ciascuna schermata figlia. */
const INDIETRO: Partial<Record<ScreenType, ScreenType>> = {
  nickname: 'impostazioni',
  elimina: 'impostazioni',
  accesso: 'impostazioni',
  impostazioni: 'profilo',
  'crea-lega': 'leghe',
  unisciti: 'leghe',
  'conferma-invito': 'unisciti',
  'dettaglio-lega': 'leghe',
  invita: 'dettaglio-lega',
  'gestione-lega': 'dettaglio-lega',
  'passa-ruolo': 'gestione-lega',
};

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

  // I parametri di navigazione vivono qui per la stessa ragione dei dati del
  // profilo: il render a switch smonta la schermata precedente, e con lei
  // qualunque cosa tenesse in mano.
  const [params, setParams] = useState<ScreenParams>({});

  const navigation = {
    navigate: (screen: ScreenType, next?: ScreenParams) => {
      if (next) setParams((prev) => ({ ...prev, ...next }));
      setActiveScreen(screen);
    },
    goBack: () => {
      setActiveScreen(INDIETRO[activeScreen] ?? 'profilo');
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
        return <MetodiAccessoScreen navigation={navigation} email={profileInfo.email} />;
      case 'elimina':
        if (!profileInfo) return null;
        return (
          <EliminaAccountScreen
            navigation={navigation}
            userId={profileInfo.userId}
            nickname={profileInfo.nickname}
          />
        );
      case 'leghe':
        return <LegheScreen navigation={navigation} />;
      case 'crea-lega':
        return <CreaLegaScreen navigation={navigation} />;
      case 'unisciti':
        return <UniscitiScreen navigation={navigation} />;
      case 'conferma-invito':
        if (!params.code || !params.preview) return null;
        return (
          <ConfermaInvitoScreen
            navigation={navigation}
            code={params.code}
            preview={params.preview}
          />
        );
      case 'dettaglio-lega':
        if (!params.leagueId) return null;
        return (
          <DettaglioLegaScreen
            navigation={navigation}
            leagueId={params.leagueId}
            nickname={profileInfo?.nickname ?? null}
          />
        );
      case 'invita':
        if (!params.leagueId) return null;
        return <InvitaScreen navigation={navigation} leagueId={params.leagueId} />;
      case 'gestione-lega':
        if (!params.leagueId) return null;
        return <GestioneLegaScreen navigation={navigation} leagueId={params.leagueId} />;
      case 'passa-ruolo':
        if (!params.leagueId) return null;
        return <PassaRuoloScreen navigation={navigation} leagueId={params.leagueId} />;
      default:
        return null;
    }
  };

  const mostraBarra =
    activeScreen !== 'impostazioni' &&
    !SOTTO_IMPOSTAZIONI.includes(activeScreen) &&
    !SOTTO_LEGHE.includes(activeScreen);

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {mostraBarra && (
        <BottomNav
          currentMode={mode}
          selectedWeek={currentWeek}
          onNavigateToResults={() => setActiveScreen('risultati')}
          onNavigateToGioca={() => setActiveScreen('gioca')}
          onNavigateToLeghe={() => setActiveScreen('leghe')}
          onNavigateToProfile={() => setActiveScreen('profilo')}
          activeTab={activeScreen as 'gioca' | 'risultati' | 'leghe' | 'profilo'}
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
