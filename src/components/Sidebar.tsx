import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {  useStats } from "../hooks/useStats";
import { useAuth } from "../hooks/useAuth";
import { User } from '../interfaces/interface';


export const Sidebar: React.FC<DrawerContentComponentProps> = (props) => {
  const { theme } = useTheme();
  const go = (name: string) => props.navigation.navigate(name as never);
  const { stats, loading, error } = useStats();
  const { user, logout } = useAuth();
    const [nombre, setNombre] = useState(user?.nombre || '');
    const [correo, setCorreo] = useState(user?.email || '');

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🌈 Encabezado con gradiente */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Image source={require("../../assets/logo1.png")} style={{ width: 40, height: 40, resizeMode: "contain", marginRight: 8 }} />
        <View>
          <Text style={styles.brand}>Pharmacontrol</Text>
          <Text style={styles.subBrand}>Administrador Inteligente</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* 📁 Navegación */}
        <Text style={styles.sectionTitle}>NAVEGACIÓN</Text>
        {[
          { icon: "home-outline", label: "Inicio", route: "Dashboard", color: "#0072FF" },
          { icon: "heart-outline", label: "Mis Medicamentos", route: "Medicamentos", color: "#00C6FF" },
          { icon: "document-text-outline", label: "Mis Reportes", route: "Documents", color: "#6C63FF" },
          { icon: "calendar-outline", label: "Calendario", route: "Calendar", color: "#FF9800" },
          { icon: "chatbubbles", label: "Chat IA", route: "Chat", color: "#FF5252" },
        ].map((item) => (
          <TouchableOpacity key={item.route} style={styles.navItem} onPress={() => go(item.route)}>
            <Ionicons name={item.icon as any} size={20} color={item.color} style={{ width: 26 }} />
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* 📊 Resumen rápido */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>RESUMEN RÁPIDO</Text>
        <View style={[styles.summaryCard, { backgroundColor: "#E3F2FD" }]}>
          <Ionicons name="pulse-outline" size={22} color="#0072FF" />
          <View>
            <Text style={styles.summaryTitle}>Medicamentos Activos</Text>
            <Text style={styles.summaryValue}>{(stats?.total ?? 0) - (stats?.caducados ?? 0)}</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: "#E8F5E9" }]}>
          <Ionicons name="calendar-outline" size={22} color="#2E7D32" />
          <View>
            <Text style={styles.summaryTitle}>Próxima Toma</Text>
            <Text style={styles.summaryValue}>No programada</Text>
          </View>
        </View>
      </ScrollView>

      {/* 👤 Usuario abajo */}
{/* 👤 Usuario abajo */}
<View style={styles.userFooter}>
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>
      {((user?.nombre ?? '').charAt(0) || '').toUpperCase()}
    </Text>
  </View>
  <View style={{ flex: 1 }}>
    <Text style={styles.username}>{user?.nombre ?? 'Usuario'}</Text>
    <Text style={styles.userRole}>Gestiona tu inventario</Text>
  </View>
  <TouchableOpacity style={{ marginRight: 12 }} onPress={() => go('Settings')}>
    <Ionicons name="settings-outline" size={20} color={theme.colors.textMuted} />
  </TouchableOpacity>
  <TouchableOpacity
    style={{ marginLeft: 12 }}
    onPress={() => {
      logout();
      props.navigation.closeDrawer();
    }}
  >
    <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
  </TouchableOpacity>
</View>

    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      paddingVertical: 18,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      marginBottom: 10,
      gap: 10,
    },
    brand: { color: "#fff", fontWeight: "800", fontSize: 18 },
    subBrand: { color: "#E3F2FD", fontSize: 12 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textMuted,
      marginBottom: 6,
      marginLeft: 16,
      marginTop: 6,
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
    },
    navLabel: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: "600",
    },
    summaryCard: {
      marginHorizontal: 12,
      marginVertical: 6,
      padding: 10,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    summaryTitle: { fontWeight: "600", color: "#333" },
    summaryValue: { fontSize: 13, color: "#555" },
    userFooter: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: "#F5F7FB",
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    avatarText: { color: "#fff", fontWeight: "700" },
    username: { fontWeight: "700", color: theme.colors.text },
    userRole: { fontSize: 12, color: theme.colors.textMuted },
  });
