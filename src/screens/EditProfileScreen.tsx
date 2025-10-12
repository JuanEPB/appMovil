import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { apiPharma } from "../api/apiPharma";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: H, width: W } = require("react-native").Dimensions.get("window");

export const EditProfileScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuth();

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const payload = { nombre, email };
      const res = await apiPharma.put(`/api/users/update/${user.id}`, payload);
      if (res.status === 200) {
        await updateUser(res.data);
        navigation.navigate("Profile" as never);
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        height: H,
        width: W,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          height: H,
          width: W,
        }}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { height: H, width: W }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 🔹 Header con icono de regreso */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile" as never)}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          {/* 🔹 Encabezado */}
          <Fade>
            <Text style={styles.title}>Editar Perfil</Text>
          </Fade>

          {/* 🔹 Avatar editable */}
          <Fade delay={100}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity activeOpacity={0.8}>
                <Ionicons
                  name="person-circle-outline"
                  size={100}
                  color={theme.colors.primary}
                />
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera-outline" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </Fade>

          {/* 🔹 Campos de texto */}
          <Fade delay={200}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={theme.colors.textMuted}
            />
          </Fade>

          <Fade delay={300}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              placeholder="Correo electrónico"
              placeholderTextColor={theme.colors.textMuted}
            />
          </Fade>

          {/* 🔹 Botón Guardar */}
          <Fade delay={400}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: saving ? 0.6 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="save-outline" size={22} color="#fff" />
              <Text style={styles.buttonText}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Text>
            </TouchableOpacity>
          </Fade>

          {/* 🔹 Cancelar */}
          <Fade delay={450}>
            <TouchableOpacity
              style={{ alignSelf: "center", marginTop: 16 }}
              onPress={() => navigation.navigate("Profile" as never)}
            >
              <Text style={{ color: theme.colors.textMuted }}>Cancelar</Text>
            </TouchableOpacity>
          </Fade>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
      paddingBottom: 40,
    },
    backButton: {
      alignSelf: "flex-start",
      padding: 8,
      borderRadius: 10,
      backgroundColor: theme.colors.card,
      marginBottom: 8,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: 16,
    },
    avatarContainer: {
      alignItems: "center",
      marginTop: 8,
      marginBottom: 16,
      position: "relative",
    },
    cameraBadge: {
      position: "absolute",
      right: 10,
      bottom: 10,
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      padding: 6,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    label: {
      color: theme.colors.textMuted,
      fontSize: 14,
      marginBottom: 4,
      marginTop: 8,
    },
    input: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 12,
      color: theme.colors.text,
      marginBottom: 10,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 14,
      marginTop: 18,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "700",
      marginLeft: 8,
      fontSize: 16,
    },
  });
