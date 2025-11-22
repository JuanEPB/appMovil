// import React, { useState } from "react";
// import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Dimensions, Image } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useTheme } from "../context/ThemeContext";
// import { GradientButton } from "../components/GradientButton";
// import { useAuth } from "../hooks/useAuth";

// const h = Dimensions.get("window").height;
// const w = Dimensions.get("window").width;

// export const LoginScreen =() => {
//   const { theme } = useTheme();
//   const { login, isLoading } = useAuth?.() ?? { login: async () => {}, isLoading: false };
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const styles = getStyles(theme);

//   const handleLogin = async () => {
//     await login?.({ email, contraseña: password });
//   };

//   return (
//     <View style={[styles.container, { justifyContent: "center",  }]}>
//       <LinearGradient colors={["#7298c4ff", "#113052ff"]} style={styles.hero} />
//       <View style={{ flex: 0.4, height: h * 0.4, justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
//         <Image source={require("../../assets/logo1.png")} style={{ width: w * 0.5, height: h * 0.2, resizeMode: "contain" }} />
//       </View>
//       <View style={[styles.card, { shadowColor: theme.colors.cardShadow }]}>
//         <Text style={styles.title}>Bienvenido a Pharmacontrol</Text>

//         <TextInput
//           placeholder="Correo Electrónico"
//           placeholderTextColor={theme.colors.textMuted}
//           value={email}
//           onChangeText={setEmail}
//           style={styles.input}
//           autoCapitalize="none"
          
//         />
//         <TextInput
//           placeholder="Contraseña"
//           placeholderTextColor={theme.colors.textMuted}
//           value={password}
//           onChangeText={setPassword}
//           style={styles.input}
//           secureTextEntry
          
//         />

//         <TouchableOpacity>
//           <Text style={{ color: theme.colors.primary, fontWeight: "600", marginBottom: 12, textAlign: "center" }}>
//             ¿Olvidaste tu contraseña? 
//             Contacta a tu administrador
//           </Text>
//         </TouchableOpacity>

//         <GradientButton title={isLoading ? "Ingresando..." : "Iniciar Sesión"} onPress={handleLogin} />
//       </View>
//     </View>
//   );
// }

// const getStyles = (theme: any) =>
//   StyleSheet.create({
//     container: { flex: 1, backgroundColor: theme.colors.background,  },
//     hero: { ...StyleSheet.absoluteFillObject },
//     card: {
//       marginHorizontal: 16,
//       backgroundColor: theme.colors.card,
//       borderRadius: 20,
//       padding: 18,
//       gap: 10,
//       shadowColor: "#000",
//       shadowOpacity: 0.08,
//       shadowRadius: 8,
//       elevation: 3,
//       shadowOffset: { width: 0, height: 4 },
      

//     },
//     title: { fontSize: 20, fontWeight: "800", color: theme.colors.text, marginBottom: 12, textAlign: "center" },
//     input: {
//       backgroundColor: theme.colors.background,
//       padding: 12,
//       borderRadius: 12,
//       borderWidth: 1,
//       borderColor: theme.colors.border,
//       color: theme.colors.text,
//     },
//   });
import React, { useState } from "react";
import { 
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { GradientButton } from "../components/GradientButton";
import { useAuth } from "../hooks/useAuth";

const h = Dimensions.get("window").height;
const w = Dimensions.get("window").width;

export const LoginScreen = () => {
  const { theme } = useTheme();
  const { login, isLoading } = useAuth?.() ?? { login: async () => {}, isLoading: false };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const styles = getStyles(theme);

  const handleLogin = async () => {
    // Validación simple
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      await login?.({ email, contraseña: password });
    } catch (error) {
      Alert.alert("Error", "Usuario o contraseña incorrectos");
    }
  };

  return (
    <KeyboardAvoidingView
      key="login-screen"
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { justifyContent: "center" }]}>
        <LinearGradient colors={["#7298c4ff", "#113052ff"]} style={styles.hero} />

        <View
          style={{
            flex: 0.4,
            height: h * 0.4,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Image
            source={require("../../assets/logo1.png")}
            style={{
              width: w * 0.5,
              height: h * 0.2,
              resizeMode: "contain",
            }}
          />
        </View>

        <View style={[styles.card, { shadowColor: theme.colors.cardShadow }]}>
          <Text style={styles.title}>Bienvenido a Pharmacontrol</Text>

          <TextInput
            placeholder="Correo Electrónico"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Contraseña"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity>
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: "600",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              ¿Olvidaste tu contraseña?
              {"\n"}
              Contacta a tu administrador
            </Text>
          </TouchableOpacity>

          <GradientButton
            title={isLoading ? "Ingresando..." : "Iniciar Sesión"}
            onPress={handleLogin}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    hero: {
      ...StyleSheet.absoluteFillObject,
    },
    card: {
      marginHorizontal: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 18,
      gap: 10,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      shadowOffset: { width: 0, height: 4 },
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: "center",
    },
    input: {
      backgroundColor: theme.colors.background,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
  });
