import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TabNavigator } from '../navigation/TabNavigator';
import { useTheme } from '../context/ThemeContext'; // ✅ usa tu contexto
import { DrawerNavigator } from './drawerNavigator';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const { isLogged } = useAuth();
  const { theme } = useTheme(); // ✅ ya tiene el tipo correcto

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        animation: 'slide_from_right',
        orientation: 'portrait',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        headerTitleAlign: 'center',

      }}
    >
      {isLogged ? (
        <Stack.Screen name="Home" component={DrawerNavigator} 
        options={{
          headerShown: false,
          
        }}/>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} 
        options={{
          headerShown: false,
          
        }}/>
      )}
    </Stack.Navigator>
  );
}
