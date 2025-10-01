import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

interface SettingsContextProps {
  darkMode: boolean;
  notifications: boolean;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
}

const SettingsContext = createContext<SettingsContextProps>({} as SettingsContextProps);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Cargar settings guardados
  useEffect(() => {
    (async () => {
      const savedDarkMode = await AsyncStorage.getItem("darkMode");
      const savedNotifications = await AsyncStorage.getItem("notifications");

      if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");
      if (savedNotifications !== null) setNotifications(savedNotifications === "true");
    })();
  }, []);

  // Guardar tema
  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    await AsyncStorage.setItem("darkMode", newValue.toString());
  };

  // Guardar notificaciones + pedir permisos
  const toggleNotifications = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    await AsyncStorage.setItem("notifications", newValue.toString());

    if (newValue) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        setNotifications(false);
        await AsyncStorage.setItem("notifications", "false");
        alert("Permiso de notificaciones denegado");
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ darkMode, notifications, toggleDarkMode, toggleNotifications }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
