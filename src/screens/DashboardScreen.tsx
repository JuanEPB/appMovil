import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  ScrollView,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useStats } from "../hooks/useStats";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderMenu } from "../components/HeaderMenu";


const screenWidth = Dimensions.get("window").width - 32;


export const DashboardScreen = () => {
  const { theme } = useTheme();
  const { stats, loading, error } = useStats();
  const screenHeight = Dimensions.get("window").height;

  const styles = getStyles(theme);

  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  if (error)
    return (
      <View style={styles.loaderContainer}>
        <Text style={[styles.subtitle, { color: theme.colors.danger }]}>{error}</Text>
      </View>
    );

  if (!stats)
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.subtitle}>No hay datos disponibles</Text>
      </View>
    );

  // 🔹 Preparamos los datos para las gráficas
  const categorias = Object.entries(stats.porCategoria).map(([key, value], i) => ({
    name: key,
    population: value,
    color: [
      theme.colors.primary,
      "#4CAF50",
      "#FFC107",
      "#00897B",
      "#5E35B1",

    ][i % 5],
    legendFontColor: theme.colors.text,
    legendFontSize: 13,
  }));

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      `${theme.colors.primary}${Math.floor(opacity * 255).toString(16)}`,
    labelColor: () => theme.colors.text,
  };

  return (
    
    <SafeAreaView style={{...styles.safeArea, height: screenHeight}}>
      <ScrollView
        style={{height: screenHeight}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <HeaderMenu/>
        {/* 🩺 Encabezado */}
        <Text style={styles.title}>Panel de Control</Text>
        <Text style={styles.subtitle}>
          Bienvenido a tu panel de control de PharmaControl
        </Text>

        {/* 🔹 Tarjetas resumen */}
        <View style={styles.cardsRow}>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={styles.cardTitle}>Medicamentos Totales</Text>
            <Text style={[styles.cardValue, { color: theme.colors.primary }]}>
              {stats.total}
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={styles.cardTitle}>Por Caducar</Text>
            <Text style={[styles.cardValue, { color: theme.colors.warning }]}>
              {stats.porCaducar}
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor:theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={styles.cardTitle}>Caducados</Text>
            <Text style={[styles.cardValue, { color: "#D32F2F" }]}>
              {stats.caducados}
            </Text>
          </View>
        </View>

        {/* 📊 Gráfica de pastel */}
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={styles.sectionTitle}>Distribución por Categoría</Text>
          <PieChart
            data={categorias}
            width={screenWidth * 0.9}
            height={220}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            hasLegend={false}
            chartConfig={chartConfig}
            center={[0, 0]}
            absolute
          />
          <View style={styles.legendContainer}>
            {categorias.map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: item.color }]}
                />
                <Text style={[styles.legendText, { color: theme.colors.text }]}>
                  {item.population} {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 📈 Gráfica de barras */}
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <BarChart
            data={{
              labels: ["Total", "Por Caducar", "Caducados"],
              datasets: [
                { data: [stats.total, stats.porCaducar, stats.caducados] },
              ],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.barChart}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 🎨 Estilos dinámicos basados en el tema actual
const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,

    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,

    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.colors.primary,
      marginBottom: 4,
      marginTop: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    cardsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    card: {
      flex: 1,
      borderRadius: 18,
      borderWidth: 1,
      paddingVertical: 16,
      paddingHorizontal: 10,
      marginHorizontal: 4,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontSize: 14,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 6,
    },
    cardValue: {
      fontSize: 28,
      fontWeight: "800",
    },
    chartContainer: {
      marginBottom: 24,
      borderRadius: 20,
      paddingVertical: 14,
      paddingHorizontal: 10,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      alignItems: "center",
    },
    legendContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 10,
      gap: 8,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 6,
      marginVertical: 4,
    },
    legendColor: {
      width: 14,
      height: 14,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 14,
      fontWeight: "500",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 10,
      color: theme.colors.text,
      textAlign: "center",
    },
    barChart: {
      borderRadius: 16,
      marginVertical: 8,
    },
  });
