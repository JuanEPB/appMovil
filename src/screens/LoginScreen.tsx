import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { getLayout, shadow } from "../utils/responsive";

export const LoginScreen = () => {
  const { theme } = useTheme();
  const { login, demoLogin, isLoading } =
    useAuth?.() ?? { login: async () => {}, demoLogin: async () => {}, isLoading: false };
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await login?.({ email, contraseña: password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={theme.dark ? ["#0D1117", "#123B5A"] : ["#F7FBFF", "#DDF4F7", "#F4FFF9"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topBand} />
      <View style={styles.sideBand} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: layout.pagePadding, gap: layout.gap },
        ]}
      >
        <View style={[styles.brandPanel, !layout.isPhone && styles.brandPanelWide]}>
          <View style={styles.logoShell}>
            <Image source={require("../../assets/logo1.png")} style={styles.logo} />
          </View>

          <Text style={styles.eyebrow}>IA OPERATIVA PARA FARMACIAS</Text>
          <Text style={styles.brand}>PharmaControl</Text>
          <Text style={styles.caption}>Inventario, reportes y decisiones en una sola app.</Text>
        </View>

        <View style={[styles.card, { maxWidth: layout.isPhone ? "100%" : 430 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderCopy}>
              <Text style={styles.title}>Iniciar sesion</Text>
              <Text style={styles.subtitle}>Accede a tu farmacia conectada.</Text>
            </View>

            <View style={styles.secureBadge}>
              <Feather name="shield" size={14} color="#0F766E" />
              <Text style={styles.secureText}>Seguro</Text>
            </View>
          </View>

          <View style={styles.inputWrap}>
            <Feather name="mail" size={17} color={theme.colors.textMuted} />
            <TextInput
              placeholder="Correo electronico"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrap}>
            <Feather name="lock" size={17} color={theme.colors.textMuted} />
            <TextInput
              placeholder="Contrasena"
              placeholderTextColor={theme.colors.textMuted}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
          </View>

          <TouchableOpacity activeOpacity={0.75}>
            <Text style={styles.helpText}>
              Olvidaste tu contrasena? Contacta a tu administrador.
            </Text>
          </TouchableOpacity>

          <Pressable
            disabled={isLoading}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.loginButton,
              isLoading && styles.disabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={["#2563EB", "#0F766E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="log-in" size={16} color="#FFFFFF" />
              )}
              <Text style={styles.loginButtonText}>
                {isLoading ? "Ingresando..." : "Iniciar sesion"}
              </Text>
            </LinearGradient>
          </Pressable>

          <TouchableOpacity style={styles.demoButton} onPress={demoLogin} activeOpacity={0.8}>
            <Feather name="play-circle" size={16} color={theme.colors.primary} />
            <Text style={styles.demoButtonText}>Entrar en modo demo</Text>
          </TouchableOpacity>

          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Feather name="database" size={13} color="#2563EB" />
              <Text style={styles.trustText}>Base conectada</Text>
            </View>
            <View style={styles.trustItem}>
              <Feather name="zap" size={13} color="#0F766E" />
              <Text style={styles.trustText}>IA activa</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    topBand: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: isPhone ? 150 : 210,
      backgroundColor: theme.dark ? "#0F172A" : "rgba(37, 99, 235, 0.08)",
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    sideBand: {
      position: "absolute",
      right: -70,
      top: isPhone ? 80 : 110,
      width: isPhone ? 170 : 240,
      height: isPhone ? 170 : 240,
      borderRadius: 120,
      backgroundColor: theme.dark ? "rgba(15, 118, 110, 0.18)" : "rgba(15, 118, 110, 0.12)",
    },
    content: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: isPhone ? 30 : 52,
    },
    brandPanel: {
      alignItems: "center",
      width: "100%",
      marginBottom: isPhone ? 6 : 10,
    },
    brandPanelWide: {
      marginBottom: 6,
    },
    logoShell: {
      width: isPhone ? 78 : 94,
      height: isPhone ? 78 : 94,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.72)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.9)",
      ...shadow("rgba(15, 23, 42, 0.12)"),
    },
    logo: {
      width: isPhone ? 58 : 72,
      height: isPhone ? 58 : 72,
      resizeMode: "contain",
    },
    eyebrow: {
      color: "#2563EB",
      fontSize: isPhone ? 10 : 11,
      fontWeight: "900",
      letterSpacing: 0.8,
      marginTop: 14,
      textAlign: "center",
    },
    brand: {
      color: theme.colors.text,
      fontSize: isPhone ? 30 : 38,
      fontWeight: "900",
      textAlign: "center",
      marginTop: 3,
    },
    caption: {
      color: theme.colors.textMuted,
      fontSize: isPhone ? 13 : 15,
      lineHeight: isPhone ? 18 : 21,
      textAlign: "center",
      marginTop: 3,
      maxWidth: 310,
    },
    card: {
      width: "100%",
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: isPhone ? 18 : 24,
      gap: 13,
      ...shadow(theme.colors.cardShadow),
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 3,
    },
    cardHeaderCopy: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 22 : 24,
      fontWeight: "900",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 3,
    },
    secureBadge: {
      minHeight: 30,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: 999,
      paddingHorizontal: 9,
      backgroundColor: "rgba(15, 118, 110, 0.1)",
    },
    secureText: {
      color: "#0F766E",
      fontSize: 11,
      fontWeight: "800",
    },
    inputWrap: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 13,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    input: {
      flex: 1,
      minWidth: 0,
      color: theme.colors.text,
      fontSize: 15,
      paddingVertical: 12,
    },
    helpText: {
      color: theme.colors.primary,
      fontWeight: "600",
      lineHeight: 20,
      marginBottom: 2,
      textAlign: "center",
    },
    loginButton: {
      minHeight: 48,
      borderRadius: 12,
      overflow: "hidden",
    },
    loginGradient: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 16,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "900",
    },
    demoButton: {
      minHeight: 46,
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.dark ? theme.colors.background : "#F8FAFC",
    },
    demoButtonText: {
      color: theme.colors.primary,
      fontWeight: "800",
      fontSize: 14,
    },
    trustRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
      paddingTop: 3,
    },
    trustItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    trustText: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
    },
    buttonPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.985 }],
    },
    disabled: {
      opacity: 0.72,
    },
  });
