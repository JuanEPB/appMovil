import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

export const ProfileScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [scale]);

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.muted}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          webMaxWidthStyle(width),
          { paddingHorizontal: layout.pagePadding },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings" as never)}
          activeOpacity={0.75}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.hero}>
          <Animated.View style={[styles.avatar, { transform: [{ scale }] }]}>
            <Ionicons name="person" size={52} color="#fff" />
          </Animated.View>
          <Text style={styles.name}>
            {user.nombre} {user.apellido}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.role}>{user.rol || "Administrador"}</Text>
        </View>

        <View style={styles.details}>
          <Detail label="ID de usuario" value={`#${user.id}`} />
          <Detail label="Farmacia" value={`#${user.farmacia_id ?? "-"}`} />
          <Detail label="Rol" value={user.rol || "Administrador"} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate("EditUser")}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.danger }]}>
              Cerrar sesion
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 180 }}>
      <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "700", marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    muted: { color: theme.colors.textMuted },
    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: 18,
      paddingBottom: 36,
    },
    backButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 14,
    },
    hero: {
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      padding: isPhone ? 20 : 28,
      ...shadow(theme.colors.cardShadow),
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      marginBottom: 14,
    },
    name: {
      color: theme.colors.text,
      fontSize: isPhone ? 24 : 30,
      fontWeight: "800",
      textAlign: "center",
    },
    email: {
      color: theme.colors.textMuted,
      fontSize: 15,
      marginTop: 4,
      textAlign: "center",
    },
    role: {
      color: theme.colors.primary,
      fontWeight: "800",
      marginTop: 8,
    },
    details: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 18,
      marginTop: 16,
      ...shadow(theme.colors.cardShadow),
    },
    actions: {
      flexDirection: isPhone ? "column" : "row",
      gap: 12,
      marginTop: 18,
    },
    primaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    secondaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    secondaryButtonText: { fontWeight: "800", fontSize: 15 },
  });
