import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { useStats } from "../hooks/useStats";
import { useTheme } from "../context/ThemeContext";
import { shadow } from "../utils/responsive";

const navItems = [
  { icon: "home-outline", label: "Inicio", route: "Dashboard", color: "#1D4ED8" },
  { icon: "analytics-outline", label: "Dashboard IA", route: "PredictiveDashboard", color: "#7C3AED" },
  { icon: "medkit-outline", label: "Medicamentos", route: "Medicamentos", color: "#00897B" },
  { icon: "cart-outline", label: "Ventas", route: "Sales", color: "#0EA5E9" },
  { icon: "document-text-outline", label: "Documentos", route: "Documents", color: "#6D5BD0" },
  { icon: "calendar-outline", label: "Calendario", route: "Calendar", color: "#C27803" },
  { icon: "chatbubbles-outline", label: "Chat IA", route: "Chat", color: "#DC2626" },
];

export const Sidebar: React.FC<DrawerContentComponentProps> = ({ navigation, state }) => {
  const { theme } = useTheme();
  const { stats } = useStats();
  const { user, logout } = useAuth();
  const styles = getStyles(theme);
  const currentRoute = state.routeNames[state.index];
  const activeMedicines = Math.max(0, (stats?.total ?? 0) - (stats?.caducados ?? 0));
  const initial = (user?.nombre?.charAt(0) || "U").toUpperCase();

  const go = (name: string) => navigation.navigate(name as never);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Image source={require("../../assets/logo1.png")} style={styles.logo} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={styles.brand}>
            PharmaControl
          </Text>
          <Text numberOfLines={1} style={styles.subBrand}>
            Gestion de farmacia
          </Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Navegacion</Text>
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, isActive && { borderColor: item.color, backgroundColor: theme.colors.background }]}
              onPress={() => go(item.route)}
              activeOpacity={0.82}
            >
              <View style={[styles.navIcon, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.navLabel}>{item.label}</Text>
              {isActive && <View style={[styles.activeDot, { backgroundColor: item.color }]} />}
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Resumen</Text>
        <View style={styles.summaryCard}>
          <Ionicons name="pulse-outline" size={21} color={theme.colors.primary} />
          <View>
            <Text style={styles.summaryTitle}>Medicamentos activos</Text>
            <Text style={styles.summaryValue}>{activeMedicines}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="alert-circle-outline" size={21} color={theme.colors.warning} />
          <View>
            <Text style={styles.summaryTitle}>Por caducar</Text>
            <Text style={styles.summaryValue}>{stats?.porCaducar ?? 0}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.userFooter}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={styles.username}>
            {user?.nombre ?? "Usuario"}
          </Text>
          <Text numberOfLines={1} style={styles.userRole}>
            Gestiona tu inventario
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => go("Settings")}>
          <Ionicons name="settings-outline" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            logout();
            navigation.closeDrawer();
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
      padding: 18,
      gap: 12,
      margin: 12,
      borderRadius: 16,
      ...shadow(theme.colors.cardShadow),
    },
    logo: { width: 46, height: 46, resizeMode: "contain" },
    brand: { color: "#fff", fontWeight: "800", fontSize: 20 },
    subBrand: { color: "#EAF6FF", fontSize: 13, marginTop: 2 },
    scrollContent: { paddingHorizontal: 12, paddingBottom: 20 },
    sectionTitle: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      marginBottom: 8,
      marginLeft: 4,
    },
    navItem: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "transparent",
      paddingHorizontal: 10,
      gap: 10,
      marginBottom: 6,
    },
    navIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    navLabel: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    activeDot: { width: 8, height: 8, borderRadius: 4 },
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
    },
    summaryTitle: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "700" },
    summaryValue: { color: theme.colors.text, fontSize: 18, fontWeight: "800", marginTop: 1 },
    userFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: "#fff", fontWeight: "800" },
    username: { color: theme.colors.text, fontWeight: "800" },
    userRole: { color: theme.colors.textMuted, fontSize: 12, marginTop: 1 },
    iconButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      backgroundColor: theme.colors.background,
    },
  });
