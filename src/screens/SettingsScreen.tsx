import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderMenu } from "../components/HeaderMenu";
import { checkNeuralApiStatus, getCurrentNeuralApiUrl } from "../api/apiNeural";
import { useTheme } from "../context/ThemeContext";
import {
  DEFAULT_PHARMACY_PROFILE,
  PharmacyProfile,
  getPharmaApiUrl,
  getPharmacyProfile,
  savePharmaApiUrl,
  saveNeuralApiUrl,
  savePharmacyProfile,
} from "../utils/appSettings";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

type ApiState = "idle" | "checking" | "online" | "offline";

export const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const isDarkMode = theme.mode === "dark";
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);

  const [apiUrl, setApiUrl] = useState("");
  const [pharmaApiUrl, setPharmaApiUrl] = useState("");
  const [apiState, setApiState] = useState<ApiState>("idle");
  const [apiMessage, setApiMessage] = useState("Sin verificar");
  const [profile, setProfile] = useState<PharmacyProfile>(DEFAULT_PHARMACY_PROFILE);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    const [storedUrl, storedPharmaUrl, storedProfile] = await Promise.all([
      getCurrentNeuralApiUrl(),
      getPharmaApiUrl(),
      getPharmacyProfile(),
    ]);
    setApiUrl(storedUrl);
    setPharmaApiUrl(storedPharmaUrl);
    setProfile(storedProfile);
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateProfile = (key: keyof PharmacyProfile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await Promise.all([
        saveNeuralApiUrl(apiUrl),
        savePharmaApiUrl(pharmaApiUrl),
        savePharmacyProfile(profile),
      ]);
      Alert.alert("Listo", "Configuracion guardada para la app y los tickets.");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckApi = async () => {
    try {
      setApiState("checking");
      await saveNeuralApiUrl(apiUrl);
      const result = await checkNeuralApiStatus();
      const farmacia = result?.farmacia?.nombre || "Pharma Neural V2";
      setApiState("online");
      setApiMessage(`Conectado a ${farmacia}`);
    } catch (error) {
      setApiState("offline");
      setApiMessage(
        error instanceof Error
          ? error.message
          : "No se pudo conectar con la API.",
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <HeaderMenu />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          webMaxWidthStyle(width),
          { paddingHorizontal: layout.pagePadding },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>VERSION 2</Text>
          <Text style={styles.title}>Ajustes</Text>
          <Text style={styles.subtitle}>Conexion con la API, datos de farmacia y preferencias.</Text>
        </View>

        <View style={styles.grid}>
          <View style={[styles.card, styles.flexCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconText}>
                <Ionicons
                  name="cloud-done"
                  size={22}
                  color={apiState === "online" ? theme.colors.success : theme.colors.primary}
                />
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>Pharma Neural API</Text>
                  <Text style={styles.cardHint}>Estado y URL usada por IA, reportes y PDFs.</Text>
                </View>
              </View>
              <StatusPill state={apiState} styles={styles} theme={theme} />
            </View>

            <Text style={styles.inputLabel}>URL de API</Text>
            <TextInput
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="http://127.0.0.1:8000"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <Text style={styles.statusText}>{apiMessage}</Text>

            <Text style={styles.inputLabel}>URL datos pharmacontrol</Text>
            <TextInput
              value={pharmaApiUrl}
              onChangeText={setPharmaApiUrl}
              placeholder="http://127.0.0.1:8000"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <Text style={styles.statusText}>
              Medicamentos y ventas se leen desde esta API.
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, apiState === "checking" && styles.disabled]}
              onPress={handleCheckApi}
              disabled={apiState === "checking"}
              activeOpacity={0.85}
            >
              {apiState === "checking" ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="pulse" size={18} color="#fff" />
              )}
              <Text style={styles.primaryButtonText}>Probar conexion</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, styles.flexCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconText}>
                <FontAwesome5 name="store-alt" size={18} color={theme.colors.primary} />
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>Perfil de farmacia</Text>
                  <Text style={styles.cardHint}>Estos datos salen en tickets y comprobantes.</Text>
                </View>
              </View>
            </View>

            <Field label="Nombre" value={profile.nombre} onChangeText={(value) => updateProfile("nombre", value)} styles={styles} theme={theme} />
            <Field label="Direccion" value={profile.direccion} onChangeText={(value) => updateProfile("direccion", value)} styles={styles} theme={theme} />
            <Field label="Telefono" value={profile.telefono} onChangeText={(value) => updateProfile("telefono", value)} styles={styles} theme={theme} />
            <Field label="Responsable" value={profile.responsable} onChangeText={(value) => updateProfile("responsable", value)} styles={styles} theme={theme} />
            <Field label="RFC / NIT" value={profile.identificacionFiscal} onChangeText={(value) => updateProfile("identificacionFiscal", value)} styles={styles} theme={theme} />
          </View>
        </View>

        <View style={[styles.card, styles.preferenceCard]}>
          <View style={styles.optionRow}>
            <View style={styles.iconText}>
              <Ionicons
                name="moon"
                size={22}
                color={isDarkMode ? theme.colors.primary : theme.colors.textMuted}
              />
              <View>
                <Text style={styles.optionText}>Tema oscuro</Text>
                <Text style={styles.cardHint}>Apariencia general de la app.</Text>
              </View>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.card, styles.preferenceCard]}
          onPress={() => navigation.navigate("Profile" as never)}
          activeOpacity={0.85}
        >
          <View style={styles.optionRow}>
            <View style={styles.iconText}>
              <FontAwesome5 name="user-alt" size={18} color={theme.colors.textMuted} />
              <View>
                <Text style={styles.optionText}>Perfil de usuario</Text>
                <Text style={styles.cardHint}>Cuenta, rol y datos personales.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.textMuted} />
          </View>
        </TouchableOpacity>

        <View style={[styles.card, styles.preferenceCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconText}>
              <Ionicons name="shield-checkmark" size={22} color={theme.colors.primary} />
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>Aviso de privacidad</Text>
                <Text style={styles.cardHint}>
                  La app usa datos de inventario, ventas, voz transcrita y feedback para operar la IA y mejorar respuestas. Las consultas externas de medicamentos son informativas y no sustituyen indicacion medica. Evita capturar datos sensibles de pacientes.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.88}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="save" size={19} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>Guardar ajustes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  styles: ReturnType<typeof getStyles>;
  theme: any;
};

const Field = ({ label, value, onChangeText, styles, theme }: FieldProps) => (
  <View>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={label}
      placeholderTextColor={theme.colors.textMuted}
      style={styles.input}
    />
  </View>
);

const StatusPill = ({ state, styles, theme }: any) => {
  const color =
    state === "online"
      ? theme.colors.success
      : state === "offline"
        ? theme.colors.danger
        : theme.colors.warning;
  const label =
    state === "online"
      ? "En linea"
      : state === "offline"
        ? "Sin conexion"
        : state === "checking"
          ? "Probando"
          : "Pendiente";

  return (
    <View style={[styles.statusPill, { borderColor: color, backgroundColor: `${color}16` }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusLabel, { color }]}>{label}</Text>
    </View>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    content: {
      width: "100%",
      alignSelf: "center",
      gap: 14,
      paddingTop: 18,
      paddingBottom: 36,
    },
    header: { marginBottom: 2 },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 28 : 34,
      fontWeight: "800",
      marginTop: 3,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 21,
      marginTop: 5,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
    },
    flexCard: {
      flex: 1,
      minWidth: isPhone ? "100%" : 320,
    },
    flex: { flex: 1, minWidth: 0 },
    card: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 16,
      ...shadow(theme.colors.cardShadow),
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "800",
    },
    cardHint: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 2,
    },
    inputLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "800",
      marginBottom: 6,
      marginTop: 8,
      textTransform: "uppercase",
    },
    input: {
      minHeight: 44,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      paddingHorizontal: 12,
      fontSize: 14,
      fontWeight: "600",
    },
    statusText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      marginTop: 8,
      lineHeight: 18,
    },
    statusPill: {
      minHeight: 30,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
    },
    statusLabel: {
      fontSize: 12,
      fontWeight: "800",
    },
    primaryButton: {
      minHeight: 44,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      marginTop: 14,
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "800",
    },
    preferenceCard: { padding: 16 },
    optionRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
    },
    iconText: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },
    optionText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "800",
      flexShrink: 1,
    },
    saveButton: {
      minHeight: 50,
      borderRadius: 8,
      backgroundColor: theme.colors.success,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "800",
    },
    disabled: {
      opacity: 0.65,
    },
  });
