import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
    useAuth?.() ?? {
      login: async () => {},
      demoLogin: async () => {},
      isLoading: false,
    };

  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(
    () => getStyles(theme, layout.isPhone),
    [theme, layout.isPhone],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const brandAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const accentAnim = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(110, [
      Animated.timing(brandAnim, {
        toValue: 1,
        duration: 460,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 10,
        tension: 52,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(accentAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(accentAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.018,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [accentAnim, brandAnim, cardAnim, logoPulse]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim() || isLoading) return;
    await login?.({ email: email.trim(), contraseña: password });
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Recuperar contraseña",
      "Solicita al administrador que restablezca tu contraseña para poder ingresar nuevamente.",
      [{ text: "Entendido" }],
    );
  };

  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && !isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={
          theme.dark
            ? ["#071425", "#0A2130", "#0B1B28"]
            : ["#F7FBFF", "#EEF9FF", "#ECFDF7"]
        }
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
            paddingVertical: layout.isPhone ? 14 : 38,
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
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.brandTopbar}>
              <Animated.View style={{ transform: [{ scale: logoPulse }] }}>
                <Image source={require("../../assets/logo1.png")} style={styles.brandLogo} />
              </Animated.View>
              <View style={styles.brandBadge}>
                <Feather name="check-circle" size={14} color="#0F766E" />
                <Text style={styles.brandBadgeText}>Gestión farmacéutica</Text>
              </View>
            </View>

            <View style={styles.heroBlock}>
              <View style={styles.eyebrow}>
                <Feather name="shield" size={14} color="#14B8A6" />
                <Text style={styles.eyebrowText}>ACCESO SEGURO</Text>
              </View>

              <Text style={styles.heroTitle}>Control inteligente para una farmacia más ágil.</Text>

              <Text style={styles.heroText}>
                Centraliza inventario, caducidades, reportes y seguimiento diario desde una sola
                experiencia.
              </Text>
            </View>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Feather name="package" size={16} color="#14B8A6" />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Inventario organizado</Text>
                  <Text style={styles.featureText}>Consulta existencias y movimientos rápidamente.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Feather name="clock" size={16} color="#2563EB" />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Caducidades bajo control</Text>
                  <Text style={styles.featureText}>Detecta productos próximos a vencer.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Feather name="bar-chart-2" size={16} color="#2563EB" />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Decisiones con datos</Text>
                  <Text style={styles.featureText}>Visualiza indicadores y reportes esenciales.</Text>
                </View>
              </View>
            </View>

            {!layout.isPhone && (
              <View style={styles.securityNote}>
                <Feather name="lock" size={14} color={theme.dark ? "#99F6E4" : "#0F766E"} />
                <Text style={styles.securityText}>Conexión protegida y acceso controlado.</Text>
              </View>
            )}
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
                      outputRange: [22, 0],
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
            <Animated.View
              style={[
                styles.cardAccentAnimated,
                {
                  opacity: accentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.82, 1],
                  }),
                  transform: [
                    {
                      scaleX: accentAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.96, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={["#2563EB", "#2DD4BF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardAccent}
              />
            </Animated.View>

            <View style={styles.loginHeader}>
              <View style={styles.loginIcon}>
                <Feather name="log-in" size={20} color="#14B8A6" />
              </View>
              <Text style={styles.title}>Bienvenido de nuevo</Text>
              <Text style={styles.subtitle}>Ingresa tus credenciales para acceder al sistema.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <View
                  style={[
                    styles.inputWrap,
                    focusedField === "email" && styles.inputWrapFocused,
                  ]}
                >
                  <Feather
                    name="mail"
                    size={18}
                    color={focusedField === "email" ? "#2563EB" : theme.colors.textMuted}
                  />
                  <TextInput
                    placeholder="usuario@farmacia.com"
                    placeholderTextColor={theme.colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TouchableOpacity activeOpacity={0.72} onPress={handleForgotPassword}>
                    <Text style={styles.recoveryText}>¿La olvidaste?</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.inputWrap,
                    focusedField === "password" && styles.inputWrapFocused,
                  ]}
                >
                  <Feather
                    name="lock"
                    size={18}
                    color={focusedField === "password" ? "#14B8A6" : theme.colors.textMuted}
                  />
                  <TextInput
                    placeholder="Ingresa tu contraseña"
                    placeholderTextColor={theme.colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((current) => !current)}
                    activeOpacity={0.7}
                    accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={18}
                      color={theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Pressable
              disabled={!canSubmit}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.loginButton,
                !canSubmit && styles.disabled,
                pressed && canSubmit && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={["#2563EB", "#2DD4BF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonFill}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Entrar al sistema</Text>
                    <Feather name="arrow-right" size={18} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>O continúa como invitado</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={demoLogin}
              activeOpacity={0.84}
              disabled={isLoading}
            >
              <View style={styles.demoIcon}>
                <Feather name="play" size={15} color="#2563EB" />
              </View>
              <Text style={styles.demoButtonText}>Explorar modo demo</Text>
            </TouchableOpacity>

            <View style={styles.cardFooter}>
              <Feather name="shield" size={13} color={theme.colors.textMuted} />
              <Text style={styles.cardFooterText}>Tus credenciales se procesan de forma segura.</Text>
            </View>
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
      backgroundColor: theme.dark ? "#071425" : "#F7FBFF",
    },
    content: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    shell: {
      width: "100%",
      maxWidth: 1100,
      gap: isPhone ? 14 : 34,
    },
    shellWide: {
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "space-between",
    },
    brandPanel: {
      flex: 1,
      minHeight: isPhone ? undefined : 610,
      justifyContent: "center",
      gap: isPhone ? 12 : 30,
      paddingHorizontal: isPhone ? 2 : 24,
      paddingVertical: isPhone ? 0 : 28,
    },
    brandTopbar: {
      alignItems: isPhone ? "center" : "flex-start",
      gap: isPhone ? 6 : 10,
    },
    brandLogo: {
      width: isPhone ? 300 : 336,
      height: isPhone ? 200 : 108,
      resizeMode: "contain",
    },
    brandBadge: {
      minHeight: 32,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderRadius: 8,
      paddingHorizontal: isPhone ? 9 : 11,
      backgroundColor: theme.dark ? "rgba(15,118,110,0.16)" : "rgba(15,118,110,0.08)",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(45,212,191,0.17)" : "rgba(15,118,110,0.13)",
    },
    brandBadgeText: {
      color: theme.dark ? "#99F6E4" : "#0F766E",
      fontSize: 12,
      fontWeight: "900",
    },
    heroBlock: {
      maxWidth: 560,
      gap: isPhone ? 8 : 12,
      alignItems: isPhone ? "center" : "flex-start",
    },
    eyebrow: {
      alignSelf: isPhone ? "center" : "flex-start",
      minHeight: 32,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.dark ? "rgba(15,118,110,0.16)" : "rgba(15,118,110,0.08)",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(45,212,191,0.17)" : "rgba(15,118,110,0.13)",
    },
    eyebrowText: {
      color: theme.dark ? "#99F6E4" : "#0F766E",
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 1.4,
    },
    heroTitle: {
      maxWidth: 540,
      color: theme.colors.text,
      fontSize: isPhone ? 23 : 46,
      lineHeight: isPhone ? 29 : 53,
      fontWeight: "900",
      letterSpacing: isPhone ? -0.5 : -1.2,
      textAlign: isPhone ? "center" : "left",
    },
    heroText: {
      maxWidth: 500,
      color: theme.colors.textMuted,
      fontSize: isPhone ? 15 : 17,
      lineHeight: isPhone ? 23 : 27,
      fontWeight: "500",
    },
    featureList: {
      maxWidth: 530,
      gap: isPhone ? 6 : 12,
      display: isPhone ? "none" : "flex",
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 4,
    },
    featureIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(255,255,255,0.08)" : "#DCE7F2",
    },
    featureCopy: {
      flex: 1,
      gap: 2,
    },
    featureTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "900",
    },
    featureText: {
      color: theme.colors.textMuted,
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: "500",
    },
    securityNote: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingTop: 4,
    },
    securityText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
    },
    loginCard: {
      width: "100%",
      maxWidth: isPhone ? "100%" : 430,
      alignSelf: "center",
      borderRadius: isPhone ? 18 : 20,
      overflow: "hidden",
      backgroundColor: theme.dark ? "#0B181E" : "#FFFFFF",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(96,165,250,0.16)" : "#DCE7F2",
      paddingHorizontal: isPhone ? 18 : 28,
      paddingBottom: isPhone ? 18 : 28,
      gap: isPhone ? 14 : 18,
      ...shadow(theme.colors.cardShadow),
    },
    cardAccentAnimated: {
      marginHorizontal: isPhone ? -18 : -28,
      overflow: "hidden",
    },
    cardAccent: {
      height: 5,
      marginBottom: 2,
    },
    loginHeader: {
      alignItems: "flex-start",
      gap: 6,
      paddingTop: isPhone ? 2 : 4,
    },
    loginIcon: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
      marginBottom: isPhone ? 2 : 4,
      backgroundColor: theme.dark ? "rgba(45,212,191,0.12)" : "#ECFDF7",
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(45,212,191,0.20)" : "#CFF6EA",
    },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 22 : 28,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    subtitle: {
      maxWidth: 330,
      color: theme.colors.textMuted,
      fontSize: isPhone ? 13 : 14,
      lineHeight: isPhone ? 19 : 21,
      fontWeight: "500",
    },
    form: {
      gap: isPhone ? 12 : 16,
    },
    fieldGroup: {
      gap: 8,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    label: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    inputWrap: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.dark ? "#081724" : "#F8FBFF",
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(96,165,250,0.16)" : "#D8E5F0",
    },
    inputWrapFocused: {
      borderColor: "#2563EB",
      backgroundColor: theme.dark ? "rgba(37,99,235,0.08)" : "#FFFFFF",
      shadowColor: "#2563EB",
      shadowOpacity: 0.09,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    input: {
      flex: 1,
      minWidth: 0,
      color: theme.colors.text,
      fontSize: 15,
      paddingVertical: 13,
      fontWeight: "600",
    },
    recoveryText: {
      color: "#2563EB",
      fontSize: 12.5,
      fontWeight: "800",
    },
    loginButton: {
      minHeight: 54,
      borderRadius: 12,
      overflow: "hidden",
      ...shadow("rgba(37,99,235,0.20)"),
    },
    loginButtonFill: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      paddingHorizontal: 18,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isPhone ? 7 : 10,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.dark ? "rgba(255,255,255,0.08)" : "#E4EBEC",
    },
    dividerText: {
      color: theme.colors.textMuted,
      fontSize: isPhone ? 10.5 : 11.5,
      fontWeight: "700",
    },
    demoButton: {
      minHeight: 52,
      flexDirection: "row",
      gap: 9,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.dark ? "rgba(125,211,252,0.15)" : "#D6E3E5",
      backgroundColor: theme.dark ? "rgba(255,255,255,0.02)" : "#FFFFFF",
    },
    demoIcon: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      backgroundColor: theme.dark ? "rgba(37,99,235,0.14)" : "#EFF6FF",
    },
    demoButtonText: {
      color: "#2563EB",
      fontWeight: "900",
      fontSize: 14,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingTop: isPhone ? 0 : 2,
    },
    cardFooterText: {
      color: theme.colors.textMuted,
      fontSize: 11.5,
      fontWeight: "600",
    },
    buttonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.992 }],
    },
    disabled: {
      opacity: 0.55,
    },
  });
