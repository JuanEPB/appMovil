import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AuthProvider, useAuth,  } from "./src/hooks/useAuth";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import StackNavigator from "./src/navigation/stackNavigator";
import { navigationRef } from "./src/navigation/NavigationService";
import { TokenExpiredModal } from "./src/components/TokenExpiredModal";
import { registerAuthInterceptor } from "./src/api/apiPharma";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function MainApp() {
  const { theme } = useTheme();
  const { setTokenExpired, bumpActivity } = useAuth(); // 👈 NUEVO: bumpActivity

  useEffect(() => {
    registerAuthInterceptor({ setTokenExpired });
  }, [setTokenExpired]);

  return (
    <>
      <NavigationContainer
        theme={theme}
        ref={navigationRef}
        onStateChange={bumpActivity} // 👈 cada navegación reinicia inactividad
      >
        <StatusBar style={theme.dark ? "light" : "dark"} />
        <StackNavigator />
      </NavigationContainer>

      <TokenExpiredModal />
    </>
  );
}
