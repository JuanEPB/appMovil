import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { useStats } from "../hooks/useStats";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];
type Tone = "primary" | "success" | "warning" | "danger";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: FeatherIconName;
  tone: Tone;
}

interface StatusRow {
  label: string;
  status: string;
  value: number;
  tone: Tone;
  icon: FeatherIconName;
}

function hexToRgba(hex: string, opacity = 1) {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  const value = Number.parseInt(expanded, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export const DashboardScreen = () => {
  const { theme } = useTheme();
  const { stats, loading, error } = useStats();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);

  const styles = useMemo(
    () => getStyles(theme, layout.isPhone),
    [theme, layout.isPhone],
  );

  const contentWidth =
    Math.min(layout.maxWidth, width) - layout.pagePadding * 2;

  const chartWidth = layout.isDesktop
    ? Math.max(300, Math.min(440, contentWidth / 2 - layout.gap))
    : Math.max(280, contentWidth);

  if (loading || error || !stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderMenu />

        <View style={styles.center}>
          {loading ? (
            <>
              <View style={styles.loadingBox}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.primary}
                />
              </View>

              <Text style={styles.loadingTitle}>
                Cargando información
              </Text>

              <Text style={styles.loadingText}>
                Preparando el resumen del inventario.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.errorBox}>
                <Feather
                  name="alert-triangle"
                  size={26}
                  color={theme.colors.danger}
                />
              </View>

              <Text style={styles.loadingTitle}>
                No se pudieron cargar los datos
              </Text>

              <Text style={styles.errorText}>
                {error || "No hay información disponible."}
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const healthy = Math.max(
    0,
    stats.total - stats.porCaducar - stats.caducados,
  );

  const healthyPercent =
    stats.total > 0
      ? Math.round((healthy / stats.total) * 100)
      : 0;

  const stockRisk =
    (stats.bajoStock ?? 0) + (stats.agotados ?? 0);

  const inventoryStatus = [
    {
      name: "Saludable",
      population: healthy,
      color: theme.colors.success,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
    {
      name: "Por caducar",
      population: stats.porCaducar,
      color: theme.colors.warning,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
    {
      name: "Caducado",
      population: stats.caducados,
      color: theme.colors.danger,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
  ];

  const categoryColors = [
    theme.colors.primary,
    theme.colors.success,
    theme.colors.warning,
    "#7C3AED",
    "#0891B2",
  ];

  const categories = Object.entries(stats.porCategoria)
    .map(([name, value], index) => ({
      name,
      value: Number(value),
      color: categoryColors[index % categoryColors.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const maxCategory = Math.max(
    ...categories.map((item) => item.value),
    1,
  );

  const statusRows: StatusRow[] = [
    {
      label: "Por caducar",
      status: "Atención",
      value: stats.porCaducar,
      tone: "warning",
      icon: "clock",
    },
    {
      label: "Caducados",
      status: "Crítico",
      value: stats.caducados,
      tone: "danger",
      icon: "alert-octagon",
    },
    {
      label: "Bajo stock",
      status: "Revisar",
      value: stats.bajoStock ?? 0,
      tone: "warning",
      icon: "trending-down",
    },
    {
      label: "Agotados",
      status: "Sin stock",
      value: stats.agotados ?? 0,
      tone: "danger",
      icon: "archive",
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      hexToRgba(theme.colors.primary, opacity),
    labelColor: () => theme.colors.textMuted,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderMenu />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          webMaxWidthStyle(width),
          {
            paddingHorizontal: layout.pagePadding,
            paddingBottom: 40,
          },
        ]}
      >
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowIcon}>
                <Feather
                  name="activity"
                  size={14}
                  color={theme.colors.primary}
                />
              </View>

              <Text style={styles.eyebrow}>
                INVENTARIO
              </Text>
            </View>

            <Text style={styles.title}>
              Centro de inventario
            </Text>

            <Text style={styles.subtitle}>
              Supervisa existencias, alertas y valor del inventario desde un solo lugar.
            </Text>
          </View>

          <View style={styles.healthSummary}>
            <View style={styles.healthIcon}>
              <Feather
                name="check-circle"
                size={20}
                color={theme.colors.success}
              />
            </View>

            <View style={styles.healthCopy}>
              <Text style={styles.healthLabel}>
                Inventario saludable
              </Text>

              <Text style={styles.healthValue}>
                {healthyPercent}%
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.metricsGrid,
            { gap: layout.gap },
          ]}
        >
          <MetricCard
            title="Medicamentos"
            value={stats.total}
            icon="package"
            tone="primary"
          />

          <MetricCard
            title="Por caducar"
            value={stats.porCaducar}
            icon="clock"
            tone="warning"
          />

          <MetricCard
            title="Caducados"
            value={stats.caducados}
            icon="alert-circle"
            tone="danger"
          />

          <MetricCard
            title="Bajo stock"
            value={stats.bajoStock ?? 0}
            icon="trending-down"
            tone="warning"
          />
        </View>

        <View
          style={[
            styles.mainGrid,
            { gap: layout.gap },
          ]}
        >
          <View style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Feather
                  name="pie-chart"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>
                  Estado general
                </Text>

                <Text style={styles.cardSubtitle}>
                  Vista rápida del estado actual.
                </Text>
              </View>
            </View>

            <View style={styles.donutWrapper}>
              <PieChart
                data={inventoryStatus}
                width={chartWidth}
                height={205}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="8"
                hasLegend={false}
                chartConfig={chartConfig}
                center={[0, 0]}
                absolute
              />

              <View style={styles.donutCenter}>
                <Text style={styles.donutValue}>
                  {healthyPercent}%
                </Text>

                <Text style={styles.donutLabel}>
                  saludable
                </Text>
              </View>
            </View>

            <View style={styles.statusLegend}>
              {inventoryStatus.map((item) => (
                <View
                  key={item.name}
                  style={styles.legendRow}
                >
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: item.color },
                    ]}
                  />

                  <Text style={styles.legendName}>
                    {item.name}
                  </Text>

                  <Text style={styles.legendValue}>
                    {item.population}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Feather
                  name="bar-chart-2"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>
                  Distribución por categoría
                </Text>

                <Text style={styles.cardSubtitle}>
                  Principales grupos del inventario.
                </Text>
              </View>
            </View>

            <View style={styles.categoryChart}>
              {categories.length > 0 ? (
                categories.map((item) => {
                  const percent =
                    (item.value / maxCategory) * 100;

                  return (
                    <View
                      key={item.name}
                      style={styles.categoryRow}
                    >
                      <View style={styles.categoryInfo}>
                        <Text
                          style={styles.categoryName}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>

                        <Text style={styles.categoryValue}>
                          {item.value}
                        </Text>
                      </View>

                      <View style={styles.categoryTrack}>
                        <View
                          style={[
                            styles.categoryFill,
                            {
                              width: `${percent}%`,
                              backgroundColor: item.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyChart}>
                  <Feather
                    name="bar-chart"
                    size={26}
                    color={theme.colors.textMuted}
                  />

                  <Text style={styles.emptyChartText}>
                    No hay categorías registradas.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View
          style={[
            styles.bottomGrid,
            { gap: layout.gap },
          ]}
        >
          <View style={styles.tableCard}>
            <View style={styles.tableTitleRow}>
              <View>
                <Text style={styles.cardTitle}>
                  Alertas prioritarias
                </Text>

                <Text style={styles.cardSubtitle}>
                  Elementos que necesitan atención.
                </Text>
              </View>

              <View style={styles.alertCount}>
                <Text style={styles.alertCountText}>
                  {statusRows.reduce(
                    (total, item) => total + item.value,
                    0,
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.tableHeaderText,
                  styles.tableMainColumn,
                ]}
              >
                Indicador
              </Text>

              <Text
                style={[
                  styles.tableHeaderText,
                  styles.tableStatusColumn,
                ]}
              >
                Estado
              </Text>

              <Text
                style={[
                  styles.tableHeaderText,
                  styles.tableValueColumn,
                ]}
              >
                Total
              </Text>
            </View>

            {statusRows.map((row, index) => (
              <StatusTableRow
                key={row.label}
                row={row}
                isLast={index === statusRows.length - 1}
              />
            ))}
          </View>

          <View style={styles.valueCard}>
            <View style={styles.valueIcon}>
              <Feather
                name="dollar-sign"
                size={21}
                color={theme.colors.success}
              />
            </View>

            <Text style={styles.valueLabel}>
              Valor del inventario
            </Text>

            <Text
              style={styles.valueAmount}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(stats.valorInventario ?? 0)}
            </Text>

            <Text style={styles.valueDescription}>
              Valor total aproximado del inventario registrado.
            </Text>

            <View style={styles.valueDivider} />

            <View style={styles.valueFooter}>
              <Text style={styles.valueFooterLabel}>
                Productos en riesgo
              </Text>

              <Text style={styles.valueFooterValue}>
                {stockRisk}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MetricCard = ({
  title,
  value,
  icon,
  tone,
}: MetricCardProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme, false);

  const toneColor = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  }[tone];

  return (
    <View style={styles.metricCard}>
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor: hexToRgba(toneColor, 0.1),
          },
        ]}
      >
        <Feather name={icon} size={18} color={toneColor} />
      </View>

      <View style={styles.metricCopy}>
        <Text style={styles.metricLabel}>{title}</Text>

        <Text
          style={[
            styles.metricValue,
            { color: toneColor },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const StatusTableRow = ({
  row,
  isLast,
}: {
  row: StatusRow;
  isLast: boolean;
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme, false);

  const toneColor = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  }[row.tone];

  return (
    <View
      style={[
        styles.tableRow,
        isLast && styles.tableRowLast,
      ]}
    >
      <View
        style={[
          styles.tableMainColumn,
          styles.tableIndicator,
        ]}
      >
        <View
          style={[
            styles.tableIcon,
            {
              backgroundColor: hexToRgba(toneColor, 0.1),
            },
          ]}
        >
          <Feather
            name={row.icon}
            size={15}
            color={toneColor}
          />
        </View>

        <Text style={styles.tableLabel}>
          {row.label}
        </Text>
      </View>

      <View style={styles.tableStatusColumn}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: hexToRgba(toneColor, 0.1),
            },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: toneColor },
            ]}
          >
            {row.status}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.tableValueColumn,
          styles.tableValue,
        ]}
      >
        {row.value}
      </Text>
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
      padding: 24,
      backgroundColor: theme.colors.background,
    },

    loadingBox: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 14,
      ...shadow(theme.colors.cardShadow),
    },

    errorBox: {
      width: 60,
      height: 60,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: hexToRgba(theme.colors.danger, 0.1),
      marginBottom: 14,
    },

    loadingTitle: {
      color: theme.colors.text,
      fontSize: 19,
      fontWeight: "600",
      textAlign: "center",
    },

    loadingText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      marginTop: 5,
      textAlign: "center",
    },

    errorText: {
      color: theme.colors.danger,
      fontSize: 14,
      marginTop: 5,
      textAlign: "center",
    },

    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: isPhone ? 16 : 22,
    },

    hero: {
      flexDirection: isPhone ? "column" : "row",
      alignItems: isPhone ? "stretch" : "center",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 20,
    },

    heroText: {
      flex: 1,
    },

    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginBottom: 6,
    },

    eyebrowIcon: {
      width: 25,
      height: 25,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: hexToRgba(
        theme.colors.primary,
        0.1,
      ),
    },

    eyebrow: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.2,
    },

    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 29 : 36,
      fontWeight: "700",
      letterSpacing: -0.6,
    },

    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
    },

    healthSummary: {
      minWidth: isPhone ? undefined : 225,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 13,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      ...shadow(theme.colors.cardShadow),
    },

    healthIcon: {
      width: 42,
      height: 42,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: hexToRgba(
        theme.colors.success,
        0.1,
      ),
    },

    healthCopy: {
      flex: 1,
    },

    healthLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
    },

    healthValue: {
      color: theme.colors.success,
      fontSize: 23,
      fontWeight: "700",
      marginTop: 2,
    },

    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 18,
    },

    metricCard: {
      flexGrow: 1,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
      flexBasis: isPhone ? "47%" : "22%",
      minWidth: isPhone ? 145 : 190,
      minHeight: 92,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },

    metricIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },

    metricCopy: {
      flex: 1,
    },

    metricLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
    },

    metricValue: {
      fontSize: 24,
      fontWeight: "700",
      marginTop: 2,
    },

    mainGrid: {
      flexDirection: isPhone ? "column" : "row",
      marginBottom: 18,
    },

    chartCard: {
      flex: 1,
      minWidth: 0,
      borderTopWidth: 3,
      borderTopColor: theme.colors.primary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: isPhone ? 14 : 17,
      overflow: "hidden",
      ...shadow(theme.colors.cardShadow),
    },

    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 8,
    },

    cardHeaderIcon: {
      width: 38,
      height: 38,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: hexToRgba(
        theme.colors.primary,
        0.1,
      ),
    },

    cardHeaderText: {
      flex: 1,
    },

    cardTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "700",
    },

    cardSubtitle: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 3,
    },

    donutWrapper: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 205,
    },

    donutCenter: {
      position: "absolute",
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    donutValue: {
      color: theme.colors.text,
      fontSize: 23,
      fontWeight: "700",
    },

    donutLabel: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: "700",
      marginTop: 2,
    },

    statusLegend: {
      gap: 7,
      marginTop: 3,
    },

    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 38,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: theme.colors.background,
    },

    legendDot: {
      width: 9,
      height: 9,
      borderRadius: 4,
      marginRight: 9,
    },

    legendName: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "700",
    },

    legendValue: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
    },

    categoryChart: {
      gap: 18,
      paddingTop: 14,
      minHeight: 290,
      justifyContent: "center",
    },

    categoryRow: {
      width: "100%",
    },

    categoryInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 7,
    },

    categoryName: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "capitalize",
    },

    categoryValue: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
    },

    categoryTrack: {
      height: 9,
      borderRadius: 999,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
    },

    categoryFill: {
      height: "100%",
      borderRadius: 999,
    },

    emptyChart: {
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    emptyChartText: {
      color: theme.colors.textMuted,
      fontSize: 13,
    },

    bottomGrid: {
      flexDirection: isPhone ? "column" : "row",
      alignItems: "stretch",
    },

    tableCard: {
      flex: 1.65,
      borderTopWidth: 3,
      borderTopColor: theme.colors.primary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      overflow: "hidden",
      ...shadow(theme.colors.cardShadow),
    },

    tableTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    alertCount: {
      minWidth: 38,
      height: 31,
      paddingHorizontal: 9,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: hexToRgba(
        theme.colors.warning,
        0.12,
      ),
    },

    alertCountText: {
      color: theme.colors.warning,
      fontSize: 13,
      fontWeight: "700",
    },

    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 39,
      paddingHorizontal: 14,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    tableHeaderText: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 56,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    tableRowLast: {
      borderBottomWidth: 0,
    },

    tableMainColumn: {
      flex: 1.6,
    },

    tableStatusColumn: {
      flex: 1,
      alignItems: "flex-start",
    },

    tableValueColumn: {
      width: 50,
      textAlign: "right",
    },

    tableIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    tableIcon: {
      width: 31,
      height: 31,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },

    tableLabel: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "600",
    },

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
    },

    statusBadgeText: {
      fontSize: 10,
      fontWeight: "700",
    },

    tableValue: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
    },

    valueCard: {
      flex: 0.8,
      borderTopWidth: 3,
      borderTopColor: theme.colors.success,
      minWidth: isPhone ? undefined : 240,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 17,
      ...shadow(theme.colors.cardShadow),
    },

    valueIcon: {
      width: 43,
      height: 43,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: hexToRgba(
        theme.colors.success,
        0.1,
      ),
      marginBottom: 15,
    },

    valueLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    valueAmount: {
      color: theme.colors.success,
      fontSize: 27,
      fontWeight: "700",
      marginTop: 5,
    },

    valueDescription: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 7,
    },

    valueDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 16,
    },

    valueFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    valueFooterLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
    },

    valueFooterValue: {
      color: theme.colors.warning,
      fontSize: 17,
      fontWeight: "700",
    },
  });

export default DashboardScreen;
