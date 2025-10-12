import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";

export const ProfileScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: theme.colors.textMuted }}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Flecha de retroceso */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Settings" as never)}
        activeOpacity={0.6}
        style={[styles.backButton, { transform: [{ scale: 0.98 }] }]}
      >
        <Feather name="arrow-left" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      {/* 🔹 Encabezado */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>

        {/* Avatar centrado */}
        <Animated.View style={[styles.avatarContainer, { transform: [{ scale }] }]}>
          <Ionicons
            name="person-circle-outline"
            size={100}
            color={theme.mode === "dark" ? "#fff" : theme.colors.primary}
          />
        </Animated.View>
      </View>

      {/* 🔹 Información del usuario */}
      <View style={styles.infoCard}>
        <Text style={styles.name}>
          {user.nombre} {user.apellido}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>Administrador</Text>
      </View>

      {/* 🔹 Detalles */}
      <View style={styles.details}>
        <Text style={styles.detailLabel}>ID de usuario</Text>
        <Text style={styles.detailValue}>#{user.id}</Text>

        <Text style={styles.detailLabel}>Registrado</Text>
        <Text style={styles.detailValue}>12/07/2024</Text>
      </View>

      {/* 🔹 Botones */}
      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("EditUser")}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="red" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    backButton: {
      position: "absolute",
      top: 70, // 👈 ya no 40, ahora respeta el SafeArea
      left: 20,
      backgroundColor: theme.colors.card,
      padding: 8,
      borderRadius: 10,
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 3,
      zIndex: 10,
      alignSelf: "flex-start",
      marginBottom: 10,
    },
    header: {
      width: "100%",
      height: 150,
      alignItems: "center",
      justifyContent: "flex-end",
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      paddingBottom: 45,
    },
    headerTitle: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 25,
      paddingBottom: 5,
    },
    avatarContainer: {
      position: "absolute",
      bottom: -45,
      backgroundColor: theme.colors.card,
      borderRadius: 100,
      padding: 8,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
    infoCard: {
      marginTop: 70,
      alignItems: "center",
    },
    name: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
    email: { color: theme.colors.textMuted, marginVertical: 2 },
    role: { color: theme.colors.primary, fontWeight: "600", fontSize: 14 },
    details: {
      marginTop: 20,
      padding: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      width: "90%",
      alignSelf: "center",
    },
    detailLabel: { color: theme.colors.textMuted, fontSize: 13 },
    detailValue: { color: theme.colors.text, fontSize: 15, fontWeight: "600", marginBottom: 10 },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 12,
      width: "85%",
      marginTop: 20,
    },
    buttonText: { color: "#fff", fontWeight: "700", marginLeft: 8, fontSize: 16 },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    logoutText: { color: "red", fontWeight: "600", marginLeft: 6 },
  });
