import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {DashboardScreen} from "../screens/DashboardScreen";
import {ChatScreen} from "../screens/ChatScreen";
import {SettingsScreen} from "../screens/SettingsScreen";
import {ProfileScreen} from "../screens/ProfileScreen";
// import {DocumentsScreen} from "../screens/DocumentsScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#1abc9c",
        tabBarInactiveTintColor: "#7f8c8d",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse";

          if (route.name === "Dashboard") iconName = "grid-outline";
          else if (route.name === "Chatbot") iconName = "chatbubble-ellipses-outline";
          else if (route.name === "Documentos") iconName = "document-text-outline";
          else if (route.name === "Configuración") iconName = "settings-outline";
          else if (route.name === "Perfil") iconName = "person-circle-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Chatbot" component={ChatScreen} />
      {/* <Tab.Screen name="Documentos" component={DocumentsScreen} /> */}
      <Tab.Screen name="Configuración" component={SettingsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
