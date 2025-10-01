import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appTheme } from "../themes/appTheme";
import { useSettings } from "../hooks/useSettings";

export const SettingsScreen = () => {
  const { darkMode, notifications, toggleDarkMode, toggleNotifications } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      <View style={styles.item}>
        <Text style={styles.itemText}>Modo oscuro</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.item}>
        <Text style={styles.itemText}>Notificaciones</Text>
        <Switch value={notifications} onValueChange={toggleNotifications} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: appTheme.colors.text, marginBottom: 20 },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: appTheme.radius.md,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: { fontSize: 16, color: appTheme.colors.text },
});
