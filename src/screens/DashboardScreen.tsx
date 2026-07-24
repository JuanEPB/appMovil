import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStats } from "../hooks/useStats";
import { useTheme } from "../context/ThemeContext";
import { HeaderMenu } from "../components/HeaderMenu";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";
import { tw } from "../themes/tailwindTokens";

function hexToRgba(hex: string, opacity = 1) {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized.length === 3 ? normalized.repeat(2) : normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const DashboardScreen = () => {
  const { theme } = useTheme();
  const { stats, loading, error } = useStats();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const contentWidth = Math.min(layout.maxWidth, width) - layout.pagePadding * 2;
  const chartWidth = Math.max(280, Math.min(contentWidth, layout.isDesktop ? 520 : contentWidth));

  if (loading || error || !stats) {
    return (
      <View style={styles.center}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <Text style={[styles.subtitle, error && { color: theme.colors.danger }]}>
            {error || "No hay datos disponibles"}
          </Text>
        )}
      </View>
    );
  }

  const categorias = Object.entries(stats.porCategoria).map(([key, value], i) => ({
    name: key,
    population: Number(value),
    color: [theme.colors.primary, theme.colors.success, theme.colors.warning, "#00897B", "#6D5BD0"][
      i % 5
    ],
  }));

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => hexToRgba(theme.colors.primary, opacity),
    labelColor: () => theme.colors.text,
    propsForLabels: { fontSize: 12 },
  };
  const healthy = Math.max(0, stats.total - stats.porCaducar - stats.caducados);
  const healthyPercent = stats.total > 0 ? Math.round((healthy / stats.total) * 100) : 0;
  const riskPercent = stats.total > 0 ? Math.round(((stats.porCaducar + stats.caducados) / stats.total) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderMenu />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          webMaxWidthStyle(width),
          { paddingHorizontal: layout.pagePadding, paddingBottom: 36 },
        ]}
      >
        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>Resumen operativo</Text>
            <Text style={styles.title}>Panel de control</Text>
            <Text style={styles.subtitle}>Inventario, alertas y distribucion de medicamentos.</Text>
          </View>
          <View style={styles.healthPill}>
            <Text style={styles.healthValue}>{healthyPercent}%</Text>
            <Text style={styles.healthLabel}>inventario sano</Text>
          </View>
        </View>

        <View style={[styles.cardsGrid, { gap: layout.gap }]}>
          <StatCard title="Medicamentos" value={stats.total} color={theme.colors.primary} />
          <StatCard title="Por caducar" value={stats.porCaducar} color={theme.colors.warning} />
          <StatCard title="Caducados" value={stats.caducados} color={theme.colors.danger} />
        </View>

        <View style={[styles.insightsGrid, { gap: layout.gap }]}>
          <InsightCard
            label="Inventario sano"
            value={`${healthy} unidades`}
            tone="success"
            percent={healthyPercent}
          />
          <InsightCard
            label="Riesgo operativo"
            value={`${riskPercent}% requiere atencion`}
            tone={riskPercent > 30 ? "danger" : "warning"}
            percent={riskPercent}
          />
        </View>

        <View style={[styles.chartsGrid, { gap: layout.gap }]}>
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Distribucion por categoria</Text>
            <PieChart
              data={categorias}
              width={chartWidth}
              height={220}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="14"
              hasLegend={false}
              chartConfig={chartConfig}
              absolute
            />
            <View style={styles.legendContainer}>
              {categorias.map((item) => (
                <View key={item.name} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>
                    {item.population} {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Resumen general</Text>
            <BarChart
              data={{
                labels: ["Total", "Por caducar", "Caducados"],
                datasets: [{ data: [stats.total, stats.porCaducar, stats.caducados] }],
              }}
              width={chartWidth}
              height={240}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.barChart}
              fromZero
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme, false);

  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
};

const InsightCard = ({
  label,
  value,
  tone,
  percent,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "danger";
  percent: number;
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme, false);
  const color =
    tone === "success" ? tw.colors.emerald600 : tone === "warning" ? tw.colors.amber600 : tw.colors.rose600;

  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightLabel}>{label}</Text>
        <Text style={[styles.insightPercent, { color }]}>{percent}%</Text>
      </View>
      <Text style={styles.insightValue}>{value}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, percent)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: 18,
    },
    hero: {
      flexDirection: isPhone ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isPhone ? "stretch" : "center",
      gap: 14,
      marginBottom: 18,
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      marginBottom: 5,
      textAlign: isPhone ? "left" : "center",
    },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 28 : 34,
      fontWeight: "800",
      textAlign: isPhone ? "left" : "center",
    },
    healthPill: {
      minWidth: 156,
      borderRadius: tw.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingVertical: 12,
      paddingHorizontal: 14,
      alignItems: "center",
      ...shadow(theme.colors.cardShadow),
    },
    healthValue: {
      color: theme.colors.primary,
      fontSize: 26,
      fontWeight: "800",
    },
    healthLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 2,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 21,
      marginTop: 6,
      textAlign: isPhone ? "left" : "center",
    },
    cardsGrid: {
      flexDirection: isPhone ? "column" : "row",
      marginBottom: 18,
    },
    statCard: {
      flex: 1,
      minHeight: 102,
      backgroundColor: theme.colors.card,
      borderRadius: tw.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      justifyContent: "center",
      ...shadow(theme.colors.cardShadow),
    },
    insightsGrid: {
      flexDirection: isPhone ? "column" : "row",
      marginBottom: 18,
    },
    insightCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: tw.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      ...shadow(theme.colors.cardShadow),
    },
    insightHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    insightLabel: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "800",
    },
    insightPercent: {
      fontSize: 18,
      fontWeight: "800",
    },
    insightValue: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginTop: 8,
    },
    progressTrack: {
      height: 8,
      borderRadius: 999,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
      marginTop: 14,
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
    },
    statLabel: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    statValue: {
      fontSize: 34,
      fontWeight: "800",
      marginTop: 8,
    },
    chartsGrid: {
      flexDirection: isPhone ? "column" : "row",
      alignItems: "stretch",
    },
    chartCard: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: isPhone ? 12 : 16,
      overflow: "hidden",
      ...shadow(theme.colors.cardShadow),
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "800",
      marginBottom: 10,
      textAlign: "center",
    },
    legendContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
      marginTop: 10,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    legendColor: {
      width: 10,
      height: 10,
      borderRadius: 3,
      marginRight: 7,
    },
    legendText: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    barChart: {
      borderRadius: 12,
      marginVertical: 4,
    },
  });

export default DashboardScreen;
