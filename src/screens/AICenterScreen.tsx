import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getAIActionHistory,
  getAIPredictionHistory,
  getAutomaticRecommendations,
  getAppProfile,
  getExecutiveReport,
  getInventoryAnomalies,
  getPredictiveDashboard,
  getLowStockReportPdfUrl,
  runAutonomousAgentCycle,
} from "../api/apiNeural";
import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type ModuleState = {
  dashboard: unknown;
  recommendations: unknown;
  anomalies: unknown;
  report: unknown;
  agent: unknown;
  profile: unknown;
  predictionHistory: unknown;
  actionHistory: unknown;
};

const asRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const asList = (value: unknown) => (Array.isArray(value) ? value : []);

const firstList = (value: unknown, keys: string[]) => {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  for (const key of keys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const textOf = (value: unknown, fallback = "Sin detalle") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  const record = asRecord(value);
  return String(
    record.mensaje ??
      record.descripcion ??
      record.recomendacion ??
      record.accion ??
      record.titulo ??
      record.nombre ??
      record.medicamento_nombre ??
      record.tipo_accion ??
      record.tipo_prediccion ??
      fallback,
  );
};

const numberOf = (value: unknown, keys: string[]) => {
  const record = asRecord(value);
  for (const key of keys) {
    const candidate = Number(record[key]);
    if (!Number.isNaN(candidate)) return candidate;
  }
  return 0;
};

export const AICenterScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);

  const [data, setData] = useState<ModuleState>({
    dashboard: null,
    recommendations: null,
    anomalies: null,
    report: null,
    agent: null,
    profile: null,
    predictionHistory: null,
    actionHistory: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCenter = useCallback(async () => {
    try {
      setError(null);
      const [
        dashboard,
        recommendations,
        anomalies,
        report,
        agent,
        profile,
        predictionHistory,
        actionHistory,
      ] = await Promise.all([
        getPredictiveDashboard(10),
        getAutomaticRecommendations(8),
        getInventoryAnomalies(100),
        getExecutiveReport(5),
        runAutonomousAgentCycle(false, "app-movil-centro-ia"),
        getAppProfile(),
        getAIPredictionHistory(8),
        getAIActionHistory(8),
      ]);

      setData({
        dashboard,
        recommendations,
        anomalies,
        report,
        agent,
        profile,
        predictionHistory,
        actionHistory,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo cargar el Centro IA.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCenter();
  }, [loadCenter]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadCenter();
  };

  const dashboard = asRecord(data.dashboard);
  const riskScore = numberOf(data.dashboard, ["puntaje_riesgo", "riesgo", "score"]);
  const recommendations = firstList(data.recommendations, [
    "recomendaciones",
    "items",
    "acciones",
  ]).slice(0, 5);
  const anomalies = firstList(data.anomalies, ["anomalias", "items", "alertas"]).slice(0, 5);
  const report = asRecord(data.report);
  const agent = asRecord(data.agent);
  const profile = asRecord(data.profile);
  const iaProfile = asRecord(profile.ia);
  const iaMetrics = asRecord(iaProfile.metricas);
  const empresa = asRecord(profile.empresa);
  const farmacia = asRecord(profile.farmacia);
  const agentActions = firstList(data.agent, ["acciones", "plan", "tareas"]).slice(0, 4);
  const predictionHistory = firstList(data.predictionHistory, ["predicciones"]).slice(0, 5);
  const actionHistory = firstList(data.actionHistory, ["acciones"]).slice(0, 5);

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
            <Text style={styles.eyebrow}>INTELIGENCIA OPERATIVA</Text>
            <Text style={styles.title}>Centro IA</Text>
            <Text style={styles.subtitle}>
              Alertas, anomalías, recomendaciones y agente autónomo en una sola vista.
            </Text>
          </View>

          <Pressable
            onPress={handleRefresh}
            disabled={refreshing || loading}
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
          >
            {refreshing || loading ? (
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
              <Text style={styles.errorTitle}>La IA no respondió</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.statusPanel, { borderLeftColor: getRiskColor(theme, riskScore) }]}>
              <View style={styles.statusTop}>
                <View style={styles.flex}>
                  <Text style={styles.panelLabel}>Estado general</Text>
                  <Text style={styles.statusTitle}>
                    {textOf(dashboard.estado_predictivo, "Inventario en observación")}
                  </Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={[styles.score, { color: getRiskColor(theme, riskScore) }]}>
                    {riskScore}
                  </Text>
                  <Text style={styles.scoreLabel}>riesgo</Text>
                </View>
              </View>
              <Text style={styles.summary}>
                {textOf(
                  dashboard.resumen_ejecutivo ?? report.resumen_ejecutivo ?? report.resumen,
                  "La IA está lista para analizar inventario, ventas, stock y caducidades.",
                )}
              </Text>
            </View>

            <View style={[styles.quickGrid, { gap: layout.gap }]}>
              <QuickAction
                icon="zap"
                title="IA rápida"
                text={`${numberOf(iaMetrics, ["predicciones_guardadas"])} predicciones guardadas`}
                color={theme.colors.success}
                onPress={handleRefresh}
                styles={styles}
              />
              <QuickAction
                icon="message-circle"
                title="Chat IA"
                text="Consultar inventario"
                color="#DC2626"
                onPress={() => navigation.navigate("Chat")}
                styles={styles}
              />
              <QuickAction
                icon="download"
                title="PDF bajo stock"
                text="Descargar reporte"
                color="#2563EB"
                onPress={() => Linking.openURL(getLowStockReportPdfUrl())}
                styles={styles}
              />
              <QuickAction
                icon="bar-chart-2"
                title="Dashboard"
                text="Predicción completa"
                color="#7C3AED"
                onPress={() => navigation.navigate("PredictiveDashboard")}
                styles={styles}
              />
              <QuickAction
                icon="file-text"
                title="Reporte"
                text="Resumen ejecutivo"
                color="#2563EB"
                onPress={handleRefresh}
                styles={styles}
              />
            </View>

            <View style={[styles.grid, { gap: layout.gap }]}>
              <Section
                icon="briefcase"
                title="Perfil conectado"
                count={Number(Boolean(profile))}
                color={theme.colors.primary}
                styles={styles}
              >
                <Text style={styles.agentMode}>
                  {textOf(empresa.nombre, "Empresa sin datos")} · {textOf(farmacia.nombre, "Farmacia sin datos")}
                </Text>
                <Text style={styles.reportText}>
                  Feedback pendiente: {numberOf(iaMetrics, ["feedback_pendiente"])} · Memorias: {numberOf(iaMetrics, ["sesiones_con_memoria"])}
                </Text>
              </Section>

              <Section
                icon="zap"
                title="Recomendaciones automáticas"
                count={recommendations.length}
                color={theme.colors.success}
                styles={styles}
              >
                <List items={recommendations} empty="Sin recomendaciones pendientes." styles={styles} />
              </Section>

              <Section
                icon="alert-triangle"
                title="Anomalías detectadas"
                count={anomalies.length}
                color={theme.colors.warning}
                styles={styles}
              >
                <List items={anomalies} empty="Sin anomalías recientes." styles={styles} />
              </Section>

              <Section
                icon="cpu"
                title="Agente autónomo"
                count={agentActions.length}
                color={theme.colors.primary}
                styles={styles}
              >
                <Text style={styles.agentMode}>
                  {textOf(agent.estado ?? agent.modo, "Modo seguro: solo planifica, no ejecuta cambios.")}
                </Text>
                <List items={agentActions} empty="Sin acciones planificadas." styles={styles} />
              </Section>

              <Section
                icon="clipboard"
                title="Reporte ejecutivo IA"
                count={report ? 1 : 0}
                color="#2563EB"
                styles={styles}
              >
                <Text style={styles.reportText}>
                  {textOf(
                    report.conclusion ?? report.resumen ?? report.resumen_ejecutivo,
                    "Reporte preparado para resumir riesgos, prioridades y compras sugeridas.",
                  )}
                </Text>
              </Section>

              <Section
                icon="trending-up"
                title="Historial de predicciones"
                count={predictionHistory.length}
                color={theme.colors.success}
                styles={styles}
              >
                <List items={predictionHistory} empty="Sin predicciones guardadas." styles={styles} />
              </Section>

              <Section
                icon="activity"
                title="Acciones IA auditadas"
                count={actionHistory.length}
                color={theme.colors.warning}
                styles={styles}
              >
                <List items={actionHistory} empty="Sin acciones ejecutadas o pendientes." styles={styles} />
              </Section>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const QuickAction = ({
  icon,
  title,
  text,
  color,
  onPress,
  styles,
}: {
  icon: FeatherIconName;
  title: string;
  text: string;
  color: string;
  onPress: () => void;
  styles: ReturnType<typeof getStyles>;
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
    <View style={[styles.quickIcon, { backgroundColor: `${color}18` }]}>
      <Feather name={icon} size={18} color={color} />
    </View>
    <View style={styles.flex}>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickText}>{text}</Text>
    </View>
    <Feather name="chevron-right" size={18} color={color} />
  </Pressable>
);

const Section = ({
  icon,
  title,
  count,
  color,
  children,
  styles,
}: {
  icon: FeatherIconName;
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
  styles: ReturnType<typeof getStyles>;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[styles.cardIcon, { backgroundColor: `${color}18` }]}>
        <Feather name={icon} size={17} color={color} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={[styles.countBadge, { backgroundColor: `${color}18` }]}>
        <Text style={[styles.countText, { color }]}>{count}</Text>
      </View>
    </View>
    {children}
  </View>
);

const List = ({
  items,
  empty,
  styles,
}: {
  items: unknown[];
  empty: string;
  styles: ReturnType<typeof getStyles>;
}) => {
  if (!items.length) {
    return <Text style={styles.empty}>{empty}</Text>;
  }

  return (
    <>
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.rowDot} />
          <Text style={styles.rowText}>{textOf(item)}</Text>
        </View>
      ))}
    </>
  );
};

const getRiskColor = (theme: any, score: number) => {
  if (score >= 70) return theme.colors.danger;
  if (score >= 40) return theme.colors.warning;
  return theme.colors.success;
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
    flex: {
      flex: 1,
      minWidth: 0,
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
    statusPanel: {
      borderRadius: 10,
      borderWidth: 1,
      borderLeftWidth: 4,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 16,
      marginBottom: 16,
      ...shadow(theme.colors.cardShadow),
    },
    statusTop: {
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
    statusTitle: {
      color: theme.colors.text,
      fontSize: isPhone ? 20 : 23,
      fontWeight: "700",
      marginTop: 5,
    },
    scoreBox: {
      minWidth: 76,
      minHeight: 64,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      backgroundColor: theme.colors.background,
    },
    score: {
      fontSize: 26,
      fontWeight: "800",
    },
    scoreLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "600",
    },
    summary: {
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 12,
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 16,
    },
    quickAction: {
      flexGrow: 1,
      flexBasis: isPhone ? "100%" : "30%",
      minWidth: isPhone ? "100%" : 220,
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 13,
    },
    quickIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
    },
    quickTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    quickText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginTop: 2,
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
    },
    cardTitle: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    countBadge: {
      minWidth: 28,
      minHeight: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      paddingHorizontal: 8,
    },
    countText: {
      fontSize: 12,
      fontWeight: "800",
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 9,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    rowDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginTop: 6,
      backgroundColor: theme.colors.primary,
    },
    rowText: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    agentMode: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 4,
    },
    reportText: {
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 10,
    },
    empty: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
  });

export default AICenterScreen;
