import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ActivityIndicator,
  Alert,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPharma } from "../api/apiPharma";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { isDemoToken } from "../data/localDb";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

declare const window: any;

type ScheduleDay = {
  dia: string;
  entrada: string;
  salida: string;
  descanso?: boolean;
};

const demoSchedule: ScheduleDay[] = [
  { dia: "Lunes", entrada: "08:00", salida: "16:00" },
  { dia: "Martes", entrada: "08:00", salida: "16:00" },
  { dia: "Miercoles", entrada: "08:00", salida: "16:00" },
  { dia: "Jueves", entrada: "08:00", salida: "16:00" },
  { dia: "Viernes", entrada: "08:00", salida: "16:00" },
  { dia: "Sabado", entrada: "09:00", salida: "14:00" },
  { dia: "Domingo", entrada: "-", salida: "-", descanso: true },
];

const normalizeSchedule = (data: any): ScheduleDay[] => {
  const source = Array.isArray(data) ? data : data?.horarios;
  if (!Array.isArray(source)) return demoSchedule;

  return source.map((item: any) => ({
    dia: String(item.dia ?? item.day ?? "Dia"),
    entrada: String(item.entrada ?? item.hora_entrada ?? item.start ?? "-"),
    salida: String(item.salida ?? item.hora_salida ?? item.end ?? "-"),
    descanso: Boolean(item.descanso ?? item.rest),
  }));
};

const buildScheduleHtml = ({
  user,
  schedule,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  schedule: ScheduleDay[];
}) => `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; color: #111827; padding: 28px; }
        h1 { margin: 0; color: #0F74BC; font-size: 26px; }
        .meta { color: #6B7280; margin: 6px 0 22px; }
        .card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 18px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; background: #F3F4F6; color: #374151; }
        th, td { border-bottom: 1px solid #E5E7EB; padding: 12px; font-size: 14px; }
        .rest { color: #DC2626; font-weight: 700; }
        .footer { margin-top: 22px; font-size: 12px; color: #6B7280; }
      </style>
    </head>
    <body>
      <h1>Horario de entrada</h1>
      <p class="meta">PharmaControl - ${new Date().toLocaleDateString("es-MX")}</p>
      <div class="card">
        <strong>${user.nombre} ${user.apellido}</strong><br />
        ${user.email}<br />
        Rol: ${user.rol || "Usuario"} | Farmacia: #${user.farmacia_id ?? "-"}
      </div>
      <table>
        <thead>
          <tr>
            <th>Dia</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${schedule
            .map(
              (item) => `
                <tr>
                  <td>${item.dia}</td>
                  <td>${item.entrada}</td>
                  <td>${item.salida}</td>
                  <td class="${item.descanso ? "rest" : ""}">${item.descanso ? "Descanso" : "Programado"}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
      <p class="footer">Documento generado desde el perfil del usuario.</p>
    </body>
  </html>
`;

const printScheduleOnWeb = (html: string) => {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;

  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => printWindow.print();
  return true;
};

export const ProfileScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const scale = useRef(new Animated.Value(0.92)).current;
  const [downloadingSchedule, setDownloadingSchedule] = useState(false);

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [scale]);

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.muted}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  const downloadSchedule = async () => {
    try {
      setDownloadingSchedule(true);
      const token = await AsyncStorage.getItem("token");
      let schedule = demoSchedule;

      if (token && !isDemoToken(token)) {
        const response = await apiPharma.get("/api/usuarios/me/horarios");
        schedule = normalizeSchedule(response.data);
      }

      const html = buildScheduleHtml({ user, schedule });

      if (printScheduleOnWeb(html)) {
        return;
      }

      const pdf = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdf.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Descargar horario",
        });
        return;
      }

      await Print.printAsync({ html });
    } catch {
      Alert.alert(
        "Horario no disponible",
        "No se pudo descargar el horario desde el backend. Intentalo nuevamente.",
      );
    } finally {
      setDownloadingSchedule(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          webMaxWidthStyle(width),
          { paddingHorizontal: layout.pagePadding },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings" as never)}
          activeOpacity={0.75}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.hero}>
          <Animated.View style={[styles.avatar, { transform: [{ scale }] }]}>
            <Ionicons name="person" size={52} color="#fff" />
          </Animated.View>
          <Text style={styles.name}>
            {user.nombre} {user.apellido}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.role}>{user.rol || "Administrador"}</Text>
        </View>

        <View style={styles.details}>
          <Detail label="ID de usuario" value={`#${user.id}`} />
          <Detail label="Farmacia" value={`#${user.farmacia_id ?? "-"}`} />
          <Detail label="Rol" value={user.rol || "Administrador"} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate("EditUser")}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.success }]}
            onPress={downloadSchedule}
            disabled={downloadingSchedule}
          >
            {downloadingSchedule ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#fff" />
            )}
            <Text style={styles.primaryButtonText}>
              {downloadingSchedule ? "Preparando..." : "Descargar horario"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.danger }]}>
              Cerrar sesion
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 180 }}>
      <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "700", marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    muted: { color: theme.colors.textMuted },
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
    hero: {
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      padding: isPhone ? 20 : 28,
      ...shadow(theme.colors.cardShadow),
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      marginBottom: 14,
    },
    name: {
      color: theme.colors.text,
      fontSize: isPhone ? 24 : 30,
      fontWeight: "800",
      textAlign: "center",
    },
    email: {
      color: theme.colors.textMuted,
      fontSize: 15,
      marginTop: 4,
      textAlign: "center",
    },
    role: {
      color: theme.colors.primary,
      fontWeight: "800",
      marginTop: 8,
    },
    details: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 18,
      marginTop: 16,
      ...shadow(theme.colors.cardShadow),
    },
    actions: {
      flexDirection: isPhone ? "column" : "row",
      gap: 12,
      marginTop: 18,
    },
    primaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    secondaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    secondaryButtonText: { fontWeight: "800", fontSize: 15 },
  });
