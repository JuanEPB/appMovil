
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.card },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Documentos') iconName = 'document-text';
          else if (route.name === 'Chat') iconName = 'chatbubble-ellipses';
          else if (route.name === 'Perfil') iconName = 'person';
          else if (route.name === 'Ajustes') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} 
      options={{
          headerShown: false,
          
        }}/>
      <Tab.Screen name="Documentos" component={DocumentsScreen} 
      options={{
          headerShown: false,
          
        }}/>
      <Tab.Screen name="Chat" component={ChatScreen} 
      options={{
          headerShown: false,
          
        }}/>
      <Tab.Screen name="Perfil" component={ProfileScreen} 
      options={{
          headerShown: false,
          
        }}
      />
      <Tab.Screen name="Ajustes" component={SettingsScreen} 
      options={{
          headerShown: false,
          
        }}
        />
    </Tab.Navigator>
  );
};
