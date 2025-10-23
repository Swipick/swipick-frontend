import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';

// Placeholder screens - to be implemented
import GiocaScreen from '../screens/game/GiocaScreen';
import RisultatiScreen from '../screens/results/RisultatiScreen';
import ProfiloScreen from '../screens/profile/ProfiloScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Gioca"
        component={GiocaScreen}
      />
      <Tab.Screen
        name="Risultati"
        component={RisultatiScreen}
      />
      <Tab.Screen
        name="Profilo"
        component={ProfiloScreen}
      />
    </Tab.Navigator>
  );
}
