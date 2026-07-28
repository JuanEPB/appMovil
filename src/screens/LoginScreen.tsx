import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
  const logoAnim = useRef(new Animated.Value(0)).current;
  const panelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(110, [
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.spring(panelAnim, {
        toValue: 1,
        friction: 9,
        tension: 58,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoAnim, panelAnim]);

  const handleLogin = async () => {
    await login?.({ email, contraseña: password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={theme.dark ? ["#06121A", "#0A1F25", "#0F172A"] : ["#F6FAFB", "#EDF7F6", "#F7FBFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: layout.pagePadding,
            paddingVertical: layout.isPhone ? 24 : 46,
          },
        ]}
      >
        <View style={styles.shell}>
          <Animated.View
            style={[
              styles.logoArea,
              {
                opacity: logoAnim,
                transform: [
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image source={require("../../assets/logo1.png")} style={styles.logo} />
            <Text style={styles.appSubtitle}>Plataforma clinica para farmacia inteligente</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.panel,
              {
                opacity: panelAnim,
                transform: [
                  {
                    translateY: panelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                  {
                    scale: panelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.98, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={theme.dark ? ["#0B5F6B", "#0F766E"] : ["#0E7490", "#0F766E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.panelHeader}
            >
              <View style={styles.panelIcon}>
                <Feather name="lock" size={18} color="#0F766E" />
              </View>
              <View style={styles.panelHeaderCopy}>
                <Text style={styles.headerTitle}>Acceso seguro</Text>
                <Text style={styles.headerText}>Ingresa al panel administrativo</Text>
              </View>
            </LinearGradient>

            <View style={styles.formCard}>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>Iniciar sesion</Text>
                <Text style={styles.subtitle}>Usa tus credenciales asignadas.</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Correo electronico</Text>
                  <View style={styles.inputWrap}>
                    <Feather name="mail" size={18} color="#0E7490" />
                    <TextInput
                      placeholder="usuario@farmacia.com"
                      placeholderTextColor={theme.colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      style={styles.input}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Contrasena</Text>
                  <View style={styles.inputWrap}>
                    <Feather name="shield" size={18} color="#0F766E" />
                    <TextInput
                      placeholder="Ingresa tu contrasena"
                      placeholderTextColor={theme.colors.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      style={styles.input}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.75} style={styles.recoveryButton}>
                <Text style={styles.recoveryText}>Olvidaste tu contrasena?</Text>
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
                  colors={theme.dark ? ["#0E7490", "#0F766E"] : ["#0E7490", "#0F766E"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonFill}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Feather name="arrow-right" size={18} color="#FFFFFF" />
                  )}
                  <Text style={styles.loginButtonText}>
                    {isLoading ? "Ingresando..." : "Entrar"}
                  </Text>
                </LinearGradient>
              </Pressable>

              <TouchableOpacity style={styles.demoButton} onPress={demoLogin} activeOpacity={0.85}>
                <Feather name="play-circle" size={17} color="#0E7490" />
                <Text style={styles.demoButtonText}>Usar modo demo</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Text style={styles.footerText}>Solicita tus credenciales al administrador si aun no tienes acceso.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.dark ? "#06121A" : "#F6FAFB",
    },
    content: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    shell: {
      width: "100%",
      maxWidth: 430,
      alignItems: "center",
      gap: 18,
    },
    logoArea: {
      width: "100%",
      alignItems: "center",
      gap: 10,
    },
    logo: {
      width: "100%",
      maxWidth: 318,
      height: 88,
      resizeMode: "contain",
    },
    appSubtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 20,
      textAlign: "center",
    },
    panel: {
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(125, 211, 252, 0.16)" : "rgba(186, 210, 214, 0.95)",
      ...shadow(theme.colors.cardShadow),
    },
    panelHeader: {
      minHeight: 92,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: isPhone ? 18 : 22,
      paddingVertical: 18,
    },
    panelIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
    },
    panelHeaderCopy: {
      flex: 1,
      minWidth: 0,
    },
    headerTitle: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "900",
    },
    headerText: {
      color: "rgba(255, 255, 255, 0.84)",
      fontSize: 13,
      fontWeight: "700",
      marginTop: 3,
    },
    formCard: {
      padding: isPhone ? 20 : 24,
      gap: 16,
      backgroundColor: theme.dark ? "#0B1820" : "#FFFFFF",
    },
    titleBlock: {
      gap: 4,
    },
    title: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "900",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    form: {
      gap: 13,
    },
    fieldGroup: {
      gap: 7,
    },
    label: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    inputWrap: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.dark ? "#06121A" : "#F7FAFB",
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(125, 211, 252, 0.18)" : "#D7E5E6",
    },
    input: {
      flex: 1,
      minWidth: 0,
      color: theme.colors.text,
      fontSize: 15,
      paddingVertical: 13,
    },
    recoveryButton: {
      alignSelf: "flex-end",
    },
    recoveryText: {
      color: "#0E7490",
      fontSize: 13,
      fontWeight: "900",
    },
    loginButton: {
      minHeight: 52,
      borderRadius: 10,
      overflow: "hidden",
    },
    loginButtonFill: {
      minHeight: 52,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      paddingHorizontal: 16,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },
    demoButton: {
      minHeight: 50,
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(125, 211, 252, 0.18)" : "#D7E5E6",
      backgroundColor: theme.dark ? "#0B1820" : "#FFFFFF",
    },
    demoButtonText: {
      color: "#0E7490",
      fontWeight: "900",
      fontSize: 14,
    },
    footerText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      maxWidth: 340,
    },
    buttonPressed: {
      opacity: 0.84,
      transform: [{ scale: 0.99 }],
    },
    disabled: {
      opacity: 0.72,
    },
  });
