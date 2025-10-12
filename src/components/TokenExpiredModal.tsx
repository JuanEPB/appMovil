import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

export const TokenExpiredModal = () => {
  const { tokenExpired, refreshSession, logout, setTokenExpired, isLogged } = useAuth();
  const { theme } = useTheme();

  if (!tokenExpired || !isLogged) return null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // 🔹 Animación de entrada/salida
  useEffect(() => {
    if (tokenExpired) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [tokenExpired]);

  if (!tokenExpired) return null;

  // 🎨 Colores dinámicos según tema
  const isDark = theme.dark;
  const textColor = isDark ? "#FFFFFF" : "#1E1E1E";
  const messageColor = isDark ? "#E6E6E6" : "#444";
  const iconColor = isDark ? "#FFD166" : "#FF8C00";
  const blurIntensity = isDark ? 60 : 40;

  return (
    <Modal
      visible={tokenExpired}
      transparent
      animationType="none"
      onRequestClose={() => setTokenExpired(false)}
    >
      {/* Fondo semitransparente */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* BlurView con glass effect */}
        <BlurView intensity={blurIntensity} tint={isDark ? "dark" : "light"} style={styles.blurBackground} />

        {/* Contenedor principal */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: isDark
                ? "rgba(30, 30, 30, 0.75)"
                : "rgba(255, 255, 255, 0.8)",
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={52} color={iconColor} />
          </View>

          <Text style={[styles.title, { color: textColor }]}>Sesión expirada</Text>
          <Text style={[styles.message, { color: messageColor }]}>
            Tu sesión ha expirado por seguridad.{"\n"}
            ¿Deseas continuar en la sesión o cerrar?
          </Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.refreshButton]}
              onPress={async () => {
                await refreshSession();
              }}
            >
              <Text style={styles.buttonText}>Seguir en sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={async () => {
                await logout();
              }}
            >
              <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: "85%",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshButton: {
    backgroundColor: "#06D6A0",
  },
  logoutButton: {
    backgroundColor: "#EF476F",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
