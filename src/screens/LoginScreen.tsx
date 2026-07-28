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
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.spring(formAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [formAnim, headerAnim]);

  const handleLogin = async () => {
    await login?.({ email, contraseña: password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={theme.dark ? ["#07120F", "#0F1F1A", "#101827"] : ["#F8FAF9", "#EEF7F2", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={theme.dark ? ["#0F766E", "#16A34A"] : ["#0F766E", "#22C55E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topAccent}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: layout.pagePadding,
            paddingVertical: layout.isPhone ? 26 : 46,
          },
        ]}
      >
        <View style={styles.shell}>
          <Animated.View
            style={[
              styles.brandHeader,
              {
                opacity: headerAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.logoBox}>
              <Image source={require("../../assets/logo1.png")} style={styles.logo} />
            </View>
            <Text style={styles.appSubtitle}>Gestion profesional para tu farmacia</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [26, 0],
                    }),
                  },
                  {
                    scale: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.97, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <Feather name="shield" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Bienvenida</Text>
              <Text style={styles.subtitle}>Ingresa tus datos para entrar al panel.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Correo electronico</Text>
                <View style={styles.inputWrap}>
                  <Feather name="mail" size={18} color={theme.colors.textMuted} />
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
                  <Feather name="lock" size={18} color={theme.colors.textMuted} />
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
                colors={theme.dark ? ["#0F766E", "#15803D"] : ["#0F766E", "#16A34A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonFill}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="log-in" size={18} color="#FFFFFF" />
                )}
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Ingresando..." : "Entrar"}
                </Text>
              </LinearGradient>
            </Pressable>

            <TouchableOpacity style={styles.demoButton} onPress={demoLogin} activeOpacity={0.85}>
              <Feather name="play-circle" size={17} color={theme.colors.primary} />
              <Text style={styles.demoButtonText}>Usar modo demo</Text>
            </TouchableOpacity>
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
      backgroundColor: theme.dark ? "#07120F" : "#F8FAF9",
    },
    topAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 5,
    },
    content: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    shell: {
      width: "100%",
      maxWidth: 440,
      alignItems: "center",
      gap: 18,
    },
    brandHeader: {
      width: "100%",
      alignItems: "center",
      gap: 6,
      marginBottom: isPhone ? 2 : 8,
    },
    logoBox: {
      width: "100%",
      maxWidth: 310,
      height: 96,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      backgroundColor: theme.dark ? "rgba(255, 255, 255, 0.96)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(134, 239, 172, 0.18)" : "rgba(209, 224, 216, 0.92)",
      paddingHorizontal: 18,
      paddingVertical: 12,
      marginBottom: 10,
      ...shadow(theme.colors.cardShadow),
    },
    logo: {
      width: "100%",
      height: 72,
      resizeMode: "contain",
    },
    appSubtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 20,
      textAlign: "center",
      maxWidth: 330,
    },
    card: {
      width: "100%",
      borderRadius: 18,
      padding: isPhone ? 22 : 26,
      backgroundColor: theme.dark ? "rgba(13, 24, 22, 0.98)" : "rgba(255, 255, 255, 0.98)",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(134, 239, 172, 0.14)" : "rgba(209, 224, 216, 0.95)",
      gap: 16,
      ...shadow(theme.colors.cardShadow),
    },
    cardHeader: {
      alignItems: "center",
      gap: 4,
      marginBottom: 2,
    },
    iconBadge: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: "#0F766E",
    },
    title: {
      color: theme.colors.text,
      fontSize: 25,
      fontWeight: "900",
      textAlign: "center",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
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
      backgroundColor: theme.dark ? "#07120F" : "#F7FAF8",
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "900",
    },
    loginButton: {
      minHeight: 52,
      borderRadius: 12,
      overflow: "hidden",
    },
    loginButtonFill: {
      minHeight: 52,
      flexDirection: "row",
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
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.dark ? "rgba(7, 18, 15, 0.72)" : "#FFFFFF",
    },
    demoButtonText: {
      color: theme.colors.primary,
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
