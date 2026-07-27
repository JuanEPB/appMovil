import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getInventoryAlerts,
  getLowStockReport,
} from "../api/apiNeural";
import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

type AlertItem = {
  id?: number | string;
  nombre?: string;
  lote?: string;
  estado?: string;
  stock?: number;
  stock_minimo?: number;
  cantidad_recomendada?: number;
  dias_para_caducar?: number;
  recomendacion?: string;
};

const statusColor = (theme: any, status?: string) => {
  if (status === "CADUCADO" || status === "AGOTADO") return theme.colors.danger;
  if (status === "CRITICO" || status === "PRECAUCION") return theme.colors.warning;
  return theme.colors.primary;
};

export const AlertsInboxScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setError(null);
      const data = await getInventoryAlerts(100);
      setAlerts(Array.isArray(data?.alertas) ? data.alertas : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar las alertas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const exportLowStockPdf = async () => {
    try {
      setExporting(true);
      const report = await getLowStockReport(100);
      const html = String(report?.html || "");

      if (!html) {
        throw new Error("El reporte no devolvió contenido imprimible.");
      }

      const file = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Reporte de bajo stock",
        });
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo generar el PDF de bajo stock.",
      );
    } finally {
      setExporting(false);
    }
  };

  const lowStockCount = alerts.filter((alert) =>
    ["AGOTADO", "CRITICO", "PRECAUCION"].includes(String(alert.estado || "")),
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <View style={styles.headerIcon}>
            <Feather name="bell" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>BANDEJA INTERNA</Text>
            <Text style={styles.title}>Alertas</Text>
            <Text style={styles.subtitle}>
              Prioriza bajo stock, caducidades y acciones recomendadas.
            </Text>
          </View>
        </View>

        <View style={[styles.actions, { gap: layout.gap }]}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{alerts.length}</Text>
            <Text style={styles.metricLabel}>alertas activas</Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: theme.colors.warning }]}>
              {lowStockCount}
            </Text>
            <Text style={styles.metricLabel}>bajo stock</Text>
          </View>
          <Pressable
            onPress={exportLowStockPdf}
            disabled={exporting}
            style={({ pressed }) => [styles.pdfButton, pressed && styles.pressed]}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="file-text" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.pdfButtonText}>PDF bajo stock</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.centerText}>Cargando alertas...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Feather name="alert-triangle" size={22} color={theme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="check-circle" size={28} color={theme.colors.success} />
            <Text style={styles.emptyTitle}>Sin alertas activas</Text>
            <Text style={styles.emptyText}>
              El inventario no tiene bajo stock ni caducidades urgentes.
            </Text>
          </View>
        ) : (
          <View style={[styles.grid, { gap: layout.gap }]}>
            {alerts.map((alert, index) => {
              const color = statusColor(theme, alert.estado);

              return (
                <View
                  key={`${alert.id ?? alert.nombre ?? "alert"}-${index}`}
                  style={[styles.card, { borderLeftColor: color }]}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.statusBadge, { backgroundColor: `${color}18` }]}>
                      <Text style={[styles.statusText, { color }]}>
                        {alert.estado || "ALERTA"}
                      </Text>
                    </View>
                    <Text style={styles.lotText}>Lote {alert.lote || "N/A"}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{alert.nombre || "Medicamento"}</Text>

                  <View style={styles.stockRow}>
                    <View>
                      <Text style={styles.smallLabel}>Stock</Text>
                      <Text style={styles.stockValue}>{Number(alert.stock ?? 0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.smallLabel}>Mínimo</Text>
                      <Text style={styles.stockValue}>{Number(alert.stock_minimo ?? 0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.smallLabel}>Comprar</Text>
                      <Text style={[styles.stockValue, { color }]}>
                        {Number(alert.cantidad_recomendada ?? 0)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.recommendation}>
                    {alert.recomendacion || "Revisar este medicamento."}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: isPhone ? 16 : 22,
      paddingBottom: 36,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
    },
    headerIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    headerCopy: { flex: 1, minWidth: 0 },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      marginBottom: 5,
    },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 30 : 36,
      fontWeight: "700",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 4,
    },
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
      marginBottom: 16,
    },
    metric: {
      flexGrow: 1,
      flexBasis: isPhone ? "47%" : "24%",
      minWidth: 140,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 13,
    },
    metricValue: {
      color: theme.colors.primary,
      fontSize: 27,
      fontWeight: "800",
    },
    metricLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
      marginTop: 2,
    },
    pdfButton: {
      flexGrow: 1,
      flexBasis: isPhone ? "100%" : "28%",
      minHeight: 62,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 14,
    },
    pdfButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
    center: {
      minHeight: 220,
      alignItems: "center",
      justifyContent: "center",
    },
    centerText: {
      color: theme.colors.textMuted,
      marginTop: 10,
      fontWeight: "600",
    },
    errorCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
    },
    errorText: {
      flex: 1,
      color: theme.colors.danger,
      fontSize: 13,
      lineHeight: 19,
    },
    empty: {
      minHeight: 240,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 24,
      ...shadow(theme.colors.cardShadow),
    },
    emptyTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 10,
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginTop: 5,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
    },
    card: {
      flexGrow: 1,
      flexBasis: isPhone ? "100%" : "47%",
      minWidth: isPhone ? "100%" : 320,
      borderRadius: 10,
      borderWidth: 1,
      borderLeftWidth: 4,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 15,
      ...shadow(theme.colors.cardShadow),
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 10,
    },
    statusBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "800",
    },
    lotText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "700",
      lineHeight: 22,
    },
    stockRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      padding: 12,
      marginTop: 12,
    },
    smallLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    stockValue: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "800",
      marginTop: 2,
    },
    recommendation: {
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 12,
    },
    pressed: { opacity: 0.78 },
  });

export default AlertsInboxScreen;
