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
  const brandAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(brandAnim, {
        toValue: 1,
        duration: 540,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 9,
        tension: 58,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.014,
          duration: 1900,
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [brandAnim, cardAnim, logoPulse]);

  const handleLogin = async () => {
    await login?.({ email, contraseña: password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={theme.dark ? ["#05131A", "#09242B", "#0B1720"] : ["#F7FBFC", "#EEF8F6", "#F8FBFF"]}
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
            paddingVertical: layout.isPhone ? 24 : 44,
          },
        ]}
      >
        <View style={[styles.shell, !layout.isPhone && styles.shellWide]}>
          <Animated.View
            style={[
              styles.brandPanel,
              {
                opacity: brandAnim,
                transform: [
                  {
                    translateY: brandAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.Image
              source={require("../../assets/logo.png")}
              style={[styles.logo, { transform: [{ scale: logoPulse }] }]}
            />

            <View style={styles.copyBlock}>
              <View style={styles.eyebrow}>
                <Feather name="shield" size={14} color="#0F766E" />
                <Text style={styles.eyebrowText}>Acceso clinico seguro</Text>
              </View>
              <Text style={styles.heroTitle}>Gestiona tu farmacia con una experiencia clara y profesional.</Text>
              <Text style={styles.heroText}>
                Inventario, reportes y operacion diaria con una interfaz pensada para equipos de
                salud.
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureChip}>
                <Feather name="check" size={14} color="#0F766E" />
                <Text style={styles.featureText}>Verde clinico</Text>
              </View>
              <View style={styles.featureChip}>
                <Feather name="activity" size={14} color="#0E7490" />
                <Text style={styles.featureText}>Azul medico</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.loginCard,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                  {
                    scale: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.985, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.cardAccent} />

            <View style={styles.loginHeader}>
              <View style={styles.loginIcon}>
                <Feather name="lock" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Iniciar sesion</Text>
              <Text style={styles.subtitle}>Ingresa tus credenciales para continuar.</Text>
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
                  {isLoading ? "Ingresando..." : "Entrar al panel"}
                </Text>
              </LinearGradient>
            </Pressable>

            <TouchableOpacity style={styles.demoButton} onPress={demoLogin} activeOpacity={0.85}>
              <Feather name="play-circle" size={17} color="#0E7490" />
              <Text style={styles.demoButtonText}>Usar modo demo</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.dark ? "#05131A" : "#F7FBFC",
    },
    content: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    shell: {
      width: "100%",
      maxWidth: 1060,
      gap: isPhone ? 20 : 28,
    },
    shellWide: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    brandPanel: {
      flex: 1,
      gap: isPhone ? 18 : 24,
      padding: isPhone ? 0 : 26,
    },
    logo: {
      width: "100%",
      maxWidth: isPhone ? 330 : 430,
      height: isPhone ? 104 : 132,
      resizeMode: "contain",
    },
    copyBlock: {
      maxWidth: 540,
      gap: 11,
    },
    eyebrow: {
      alignSelf: "flex-start",
      minHeight: 34,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderRadius: 10,
      paddingHorizontal: 11,
      backgroundColor: theme.dark ? "rgba(15, 118, 110, 0.16)" : "rgba(15, 118, 110, 0.08)",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(45, 212, 191, 0.18)" : "rgba(15, 118, 110, 0.14)",
    },
    eyebrowText: {
      color: theme.dark ? "#A7F3D0" : "#0F766E",
      fontSize: 12,
      fontWeight: "900",
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: isPhone ? 28 : 44,
      lineHeight: isPhone ? 34 : 51,
      fontWeight: "900",
    },
    heroText: {
      color: theme.colors.textMuted,
      fontSize: isPhone ? 15 : 17,
      lineHeight: isPhone ? 22 : 26,
      maxWidth: 500,
    },
    featureRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    featureChip: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderRadius: 10,
      paddingHorizontal: 12,
      backgroundColor: theme.dark ? "rgba(11, 24, 32, 0.78)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(125, 211, 252, 0.16)" : "#D7E5E6",
    },
    featureText: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "800",
    },
    loginCard: {
      width: "100%",
      maxWidth: isPhone ? "100%" : 410,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: theme.dark ? "#0B1820" : "#FFFFFF",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(125, 211, 252, 0.16)" : "rgba(186, 210, 214, 0.95)",
      padding: isPhone ? 20 : 24,
      gap: 16,
      ...shadow(theme.colors.cardShadow),
    },
    cardAccent: {
      height: 4,
      marginHorizontal: isPhone ? -20 : -24,
      marginTop: isPhone ? -20 : -24,
      marginBottom: 2,
      backgroundColor: "#0E7490",
    },
    loginHeader: {
      alignItems: "flex-start",
      gap: 5,
    },
    loginIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      marginBottom: 4,
      backgroundColor: "#0F766E",
    },
    title: {
      color: theme.colors.text,
      fontSize: 25,
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
    buttonPressed: {
      opacity: 0.84,
      transform: [{ scale: 0.99 }],
    },
    disabled: {
      opacity: 0.72,
    },
  });
