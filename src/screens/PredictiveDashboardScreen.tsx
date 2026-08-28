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
import { SafeAreaView } from "react-native-safe-area-context";

import { getPredictiveDashboard } from "../api/apiNeural";
import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type DashboardPredictivo = {
  estado_predictivo?: string;
  puntaje_riesgo?: number;
  resumen_ejecutivo?: string;
  indicadores?: Record<string, unknown>;
  alertas?: unknown[];
  anomalias?: unknown[];
  recomendaciones?: unknown[];
};

const normalizeList = (value: unknown) => (Array.isArray(value) ? value : []);

const getText = (value: unknown, fallback = "Sin dato") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(
      record.mensaje ??
        record.descripcion ??
        record.recomendacion ??
        record.titulo ??
        record.nombre ??
        fallback,
    );
  }
  return fallback;
};

const getRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getAlertTone = (state: unknown): "danger" | "warning" | "primary" => {
  const normalized = String(state || "").toUpperCase();

  if (["CADUCADO", "AGOTADO"].includes(normalized)) return "danger";
  if (["CRITICO", "PRECAUCION", "PROXIMO_A_CADUCAR"].includes(normalized)) return "warning";
  return "primary";
};

const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const riskTone = (score: number) => {
  if (score >= 70) return "danger";
  if (score >= 40) return "warning";
  return "success";
};

export const PredictiveDashboardScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);

  const [dashboard, setDashboard] = useState<DashboardPredictivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const data = await getPredictiveDashboard(10);
      setDashboard(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo conectar con Pharma Neural.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const riskScore = Number(dashboard?.puntaje_riesgo ?? 0);
  const tone = riskTone(riskScore);
  const toneColor = theme.colors[tone] ?? theme.colors.primary;
  const indicators = Object.entries(dashboard?.indicadores ?? {}).slice(0, 6);
  const alerts = normalizeList(dashboard?.alertas).slice(0, 4);
  const anomalies = normalizeList(dashboard?.anomalias).slice(0, 4);
  const recommendations = normalizeList(dashboard?.recomendaciones).slice(0, 4);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadDashboard();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderMenu />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.centerTitle}>Cargando predicciones</Text>
          <Text style={styles.centerText}>Conectando con la IA de inventario.</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>PHARMA NEURAL</Text>
            <Text style={styles.title}>Dashboard IA</Text>
            <Text style={styles.subtitle}>
              Predice riesgo de agotamiento, anomalías y acciones recomendadas.
            </Text>
          </View>

          <Pressable
            onPress={handleRefresh}
            disabled={refreshing}
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Feather name="refresh-cw" size={16} color={theme.colors.primary} />
            )}
            {!layout.isPhone && <Text style={styles.refreshText}>Actualizar</Text>}
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Feather name="wifi-off" size={24} color={theme.colors.danger} />
            <View style={styles.flex}>
              <Text style={styles.errorTitle}>No se pudo conectar con la IA</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.heroPanel, { borderLeftColor: toneColor }]}>
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.panelLabel}>Estado predictivo</Text>
                  <Text style={styles.statusText}>
                    {dashboard?.estado_predictivo ?? "Inventario en observación"}
                  </Text>
                </View>

                <View style={[styles.scoreBadge, { backgroundColor: withOpacity(toneColor, 0.12) }]}>
                  <Text style={[styles.scoreValue, { color: toneColor }]}>{riskScore}</Text>
                  <Text style={styles.scoreLabel}>riesgo</Text>
                </View>
              </View>

              <View style={styles.riskTrack}>
                <View
                  style={[
                    styles.riskFill,
                    { width: `${Math.min(100, Math.max(0, riskScore))}%`, backgroundColor: toneColor },
                  ]}
                />
              </View>

              <Text style={styles.summaryText}>
                {dashboard?.resumen_ejecutivo ??
                  "La IA todavía no devolvió un resumen ejecutivo para este inventario."}
              </Text>
            </View>

            <View style={[styles.grid, { gap: layout.gap }]}>
              <SectionCard icon="activity" title="Indicadores" styles={styles}>
                {indicators.length ? (
                  indicators.map(([label, value]) => (
                    <MetricRow key={label} label={formatLabel(label)} value={getText(value)} styles={styles} />
                  ))
                ) : (
                  <EmptyText styles={styles} text="Sin indicadores predictivos." />
                )}
              </SectionCard>

              <SectionCard icon="alert-triangle" title="Alertas" styles={styles}>
                {alerts.length ? (
                  alerts.map((item, index) => <AlertBanner key={index} item={item} styles={styles} />)
                ) : (
                  <EmptyText styles={styles} text="Sin alertas activas." />
                )}
              </SectionCard>

              <SectionCard icon="bar-chart-2" title="Anomalías" styles={styles}>
                {anomalies.length ? (
                  anomalies.map((item, index) => <InsightRow key={index} item={item} styles={styles} tone="danger" />)
                ) : (
                  <EmptyText styles={styles} text="Sin anomalías detectadas." />
                )}
              </SectionCard>

              <SectionCard icon="zap" title="Recomendaciones" styles={styles}>
                {recommendations.length ? (
                  recommendations.map((item, index) => (
                    <InsightRow key={index} item={item} styles={styles} tone="success" />
                  ))
                ) : (
                  <EmptyText styles={styles} text="Sin recomendaciones pendientes." />
                )}
              </SectionCard>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionCard = ({
  icon,
  title,
  children,
  styles,
}: {
  icon: FeatherIconName;
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof getStyles>;
}) => {
  const { theme } = useTheme();
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Feather name={icon} size={17} color={theme.colors.primary} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

const MetricRow = ({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof getStyles>;
}) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text numberOfLines={1} style={styles.metricValue}>
      {value}
    </Text>
  </View>
);

const InsightRow = ({
  item,
  styles,
  tone,
}: {
  item: unknown;
  styles: ReturnType<typeof getStyles>;
  tone: "success" | "warning" | "danger";
}) => {
  const { theme } = useTheme();
  const color = theme.colors[tone] ?? theme.colors.primary;

  return (
    <View style={styles.insightRow}>
      <View style={[styles.insightDot, { backgroundColor: color }]} />
      <Text style={styles.insightText}>{getText(item)}</Text>
    </View>
  );
};

const AlertBanner = ({
  item,
  styles,
}: {
  item: unknown;
  styles: ReturnType<typeof getStyles>;
}) => {
  const { theme } = useTheme();
  const record = getRecord(item);
  const tone = getAlertTone(record.estado);
  const color = theme.colors[tone] ?? theme.colors.warning;
  const title = String(record.nombre || record.medicamento || "Alerta de inventario");
  const status = String(record.estado || "ALERTA");
  const stock = Number(record.stock ?? 0);
  const minimum = Number(record.stock_minimo ?? 0);
  const quantity = Number(record.cantidad_recomendada ?? 0);

  return (
    <View style={[styles.alertBanner, { borderLeftColor: color, backgroundColor: withOpacity(color, 0.08) }]}>
      <View style={[styles.alertIcon, { backgroundColor: withOpacity(color, 0.14) }]}>
        <Feather name="alert-triangle" size={16} color={color} />
      </View>

      <View style={styles.alertCopy}>
        <View style={styles.alertHeader}>
          <Text numberOfLines={1} style={[styles.alertStatus, { color }]}>
            {status}
          </Text>
          {(stock || minimum || quantity) > 0 && (
            <Text style={styles.alertMeta}>
              Stock {stock} / mín. {minimum}
            </Text>
          )}
        </View>

        <Text style={styles.alertTitle}>{title}</Text>

        <Text style={styles.alertText}>
          {getText(record.recomendacion || item, "Revisar esta alerta.")}
        </Text>

        {quantity > 0 && (
          <Text style={[styles.alertAction, { color }]}>
            Comprar sugerido: {quantity} unidades
          </Text>
        )}
      </View>
    </View>
  );
};

const EmptyText = ({ text, styles }: { text: string; styles: ReturnType<typeof getStyles> }) => (
  <Text style={styles.emptyText}>{text}</Text>
);

const withOpacity = (hex: string, opacity: number) => {
  const normalized = String(hex || "#000000").replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;
  const value = Number.parseInt(expanded, 16);

  if (Number.isNaN(value)) return `rgba(0, 0, 0, ${opacity})`;

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: isPhone ? 16 : 22,
      paddingBottom: 38,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: theme.colors.background,
    },
    centerTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "700",
      marginTop: 14,
    },
    centerText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      marginTop: 6,
      textAlign: "center",
    },
    header: {
      flexDirection: isPhone ? "column" : "row",
      alignItems: isPhone ? "stretch" : "center",
      justifyContent: "space-between",
      gap: 14,
      marginBottom: 18,
    },
    headerCopy: {
      flex: 1,
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      marginBottom: 7,
    },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 30 : 36,
      fontWeight: "700",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 5,
    },
    refreshButton: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    refreshText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    pressed: {
      opacity: 0.78,
    },
    errorCard: {
      flexDirection: "row",
      gap: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 16,
      ...shadow(theme.colors.cardShadow),
    },
    flex: {
      flex: 1,
      minWidth: 0,
    },
    errorTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    errorText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },
    heroPanel: {
      borderRadius: 10,
      borderWidth: 1,
      borderLeftWidth: 4,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: isPhone ? 16 : 18,
      marginBottom: 18,
      ...shadow(theme.colors.cardShadow),
    },
    heroTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
    },
    panelLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    statusText: {
      color: theme.colors.text,
      fontSize: isPhone ? 20 : 24,
      fontWeight: "700",
      marginTop: 5,
    },
    scoreBadge: {
      minWidth: 82,
      minHeight: 70,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      paddingHorizontal: 10,
    },
    scoreValue: {
      fontSize: 28,
      fontWeight: "800",
    },
    scoreLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "600",
      marginTop: -2,
    },
    riskTrack: {
      height: 8,
      overflow: "hidden",
      borderRadius: 999,
      backgroundColor: theme.colors.border,
      marginTop: 16,
    },
    riskFill: {
      height: "100%",
      borderRadius: 999,
    },
    summaryText: {
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 14,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
    },
    card: {
      flexGrow: 1,
      flexBasis: isPhone ? "100%" : "47%",
      minWidth: isPhone ? "100%" : 310,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 15,
      ...shadow(theme.colors.cardShadow),
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    cardIcon: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    metricRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      minHeight: 38,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    metricLabel: {
      flex: 1,
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    metricValue: {
      maxWidth: "48%",
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "700",
      textAlign: "right",
    },
    insightRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 9,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    insightDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 5,
    },
    insightText: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    alertBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderLeftWidth: 4,
      borderColor: theme.colors.border,
      padding: 11,
      marginTop: 8,
    },
    alertIcon: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
    },
    alertCopy: {
      flex: 1,
      minWidth: 0,
    },
    alertHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 3,
    },
    alertStatus: {
      fontSize: 11,
      fontWeight: "800",
    },
    alertMeta: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "600",
    },
    alertTitle: {
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
    },
    alertText: {
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 4,
    },
    alertAction: {
      fontSize: 12,
      fontWeight: "800",
      marginTop: 6,
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      paddingTop: 4,
    },
  });

export default PredictiveDashboardScreen;
