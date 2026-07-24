import React, { useMemo, useState } from "react";
import {
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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiPharma } from "../api/apiPharma";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

export const EditProfileScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const res = await apiPharma.put(`/api/users/update/${user.id}`, { nombre, email });
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            webMaxWidthStyle(width),
            { paddingHorizontal: layout.pagePadding },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile" as never)}
            style={styles.backButton}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={44} color="#fff" />
              </View>
              <Text style={styles.title}>Editar perfil</Text>
              <Text style={styles.subtitle}>Actualiza tu nombre y correo de acceso.</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Correo electronico</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="correo@farmacia.com"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary, opacity: saving ? 0.65 : 1 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="save-outline" size={21} color="#fff" />
              <Text style={styles.buttonText}>{saving ? "Guardando..." : "Guardar cambios"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.navigate("Profile" as never)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
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
    card: {
      width: "100%",
      maxWidth: 640,
      alignSelf: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: isPhone ? 18 : 24,
      ...shadow(theme.colors.cardShadow),
    },
    header: { alignItems: "center", marginBottom: 20 },
    avatar: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 24 : 30,
      fontWeight: "800",
      textAlign: "center",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 15,
      textAlign: "center",
      lineHeight: 21,
      marginTop: 4,
    },
    field: { marginBottom: 14 },
    label: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 6,
    },
    input: {
      minHeight: 50,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      color: theme.colors.text,
      fontSize: 15,
    },
    button: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 12,
      marginTop: 6,
    },
    buttonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    cancelButton: { alignItems: "center", paddingVertical: 14 },
    cancelText: { color: theme.colors.textMuted, fontWeight: "700" },
  });
