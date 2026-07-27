
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
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
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginBottom: 6,
        },
        tabBarIconStyle: {
          marginTop: 7,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 76 : 66,
          paddingTop: 4,
          paddingBottom: Platform.OS === 'ios' ? 18 : 8,
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: theme.colors.cardShadow,
          shadowOpacity: 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
        },
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
