import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/hooks/useAuth";
import { SettingsProvider } from "./src/hooks/useSettings";
import StackNavigator from "./src/navigation/stackNavigator";

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SettingsProvider>
  );
}
