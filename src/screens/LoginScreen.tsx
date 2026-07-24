import React, { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { GradientButton } from "../components/GradientButton";
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
        colors={theme.dark ? ["#0D1117", "#123B5A"] : ["#EAF6FF", "#BDE7F6", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: layout.pagePadding, gap: layout.gap },
        ]}
      >
        <View style={[styles.brandPanel, !layout.isPhone && styles.brandPanelWide]}>
          <Image source={require("../../assets/logo1.png")} style={styles.logo} />
          <Text style={styles.brand}>PharmaControl</Text>
          <Text style={styles.caption}>Control inteligente para tu farmacia</Text>
        </View>

        <View style={[styles.card, { maxWidth: layout.isPhone ? "100%" : 430 }]}>
          <Text style={styles.title}>Iniciar sesion</Text>
          <Text style={styles.subtitle}>Accede a tu inventario, reportes y recordatorios.</Text>

          <TextInput
            placeholder="Correo electronico"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Contrasena"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity activeOpacity={0.75}>
            <Text style={styles.helpText}>
              Olvidaste tu contrasena? Contacta a tu administrador.
            </Text>
          </TouchableOpacity>

          <GradientButton
            title={isLoading ? "Ingresando..." : "Iniciar sesion"}
            onPress={handleLogin}
          />

          <TouchableOpacity style={styles.demoButton} onPress={demoLogin} activeOpacity={0.8}>
            <Text style={styles.demoButtonText}>Entrar en modo demo</Text>
          </TouchableOpacity>
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
    content: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: isPhone ? 28 : 48,
    },
    brandPanel: {
      alignItems: "center",
      width: "100%",
    },
    brandPanelWide: {
      marginBottom: 6,
    },
    logo: {
      width: isPhone ? 132 : 170,
      height: isPhone ? 132 : 170,
      resizeMode: "contain",
    },
    brand: {
      color: theme.colors.text,
      fontSize: isPhone ? 28 : 34,
      fontWeight: "800",
      textAlign: "center",
      marginTop: 4,
    },
    caption: {
      color: theme.colors.textMuted,
      fontSize: 15,
      textAlign: "center",
      marginTop: 4,
    },
    card: {
      width: "100%",
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: isPhone ? 18 : 24,
      gap: 12,
      ...shadow(theme.colors.cardShadow),
    },
    title: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      marginBottom: 4,
    },
    input: {
      minHeight: 48,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      fontSize: 15,
    },
    helpText: {
      color: theme.colors.primary,
      fontWeight: "600",
      lineHeight: 20,
      marginBottom: 2,
      textAlign: "center",
    },
    demoButton: {
      minHeight: 46,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    demoButtonText: {
      color: theme.colors.text,
      fontWeight: "800",
      fontSize: 15,
    },
  });
