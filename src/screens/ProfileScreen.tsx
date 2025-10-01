import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { appTheme } from "../themes/appTheme";
import { useAuth } from "../hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [correo, setCorreo] = useState(user?.email || "");

  return (
    <SafeAreaView style={styles.container}>
    <View >
      
      <Text style={styles.title}>{user?.nombre} { user?.apellido}</Text>

      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} value={correo} onChangeText={setCorreo} />

      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>Guardar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.background, padding: 20, alignItems: "center" },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: "bold", color: appTheme.colors.text, marginBottom: 20 },
  input: { width: "100%", backgroundColor: "#fff", padding: 12, borderRadius: appTheme.radius.md, marginBottom: 15 },
  saveBtn: { backgroundColor: appTheme.colors.primary, padding: 15, borderRadius: appTheme.radius.md, width: "100%", alignItems: "center", marginBottom: 10 },
  saveText: { color: "#fff", fontWeight: "bold" },
  logoutBtn: { backgroundColor: appTheme.colors.danger, padding: 15, borderRadius: appTheme.radius.md, width: "100%", alignItems: "center" },
  logoutText: { color: "#fff", fontWeight: "bold" },
});
