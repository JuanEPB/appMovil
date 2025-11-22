// import React from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Dimensions,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { BarChart, PieChart } from "react-native-chart-kit";
// import { useStats } from "../hooks/useStats";
// import { useTheme } from "../context/ThemeContext";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { HeaderMenu } from "../components/HeaderMenu";


// const screenWidth = Dimensions.get("window").width - 32;


// export const DashboardScreen = () => {
//   const { theme } = useTheme();
//   const { stats, loading, error } = useStats();
//   const screenHeight = Dimensions.get("window").height;

//   const styles = getStyles(theme);

//   if (loading)
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//       </View>
//     );

//   if (error)
//     return (
//       <View style={styles.loaderContainer}>
//         <Text style={[styles.subtitle, { color: theme.colors.danger }]}>{error}</Text>
//       </View>
//     );

//   if (!stats)
//     return (
//       <View style={styles.loaderContainer}>
//         <Text style={styles.subtitle}>No hay datos disponibles</Text>
//       </View>
//     );

//   // 🔹 Preparamos los datos para las gráficas
//   const categorias = Object.entries(stats.porCategoria).map(([key, value], i) => ({
//     name: key,
//     population: value,
//     color: [
//       theme.colors.primary,
//       "#4CAF50",
//       "#FFC107",
//       "#00897B",
//       "#5E35B1",

//     ][i % 5],
//     legendFontColor: theme.colors.text,
//     legendFontSize: 13,
//   }));

//   const chartConfig = {
//     backgroundGradientFrom: theme.colors.card,
//     backgroundGradientTo: theme.colors.card,
//     decimalPlaces: 0,
//     color: (opacity = 1) =>
//       `${theme.colors.primary}${Math.floor(opacity * 255).toString(16)}`,
//     labelColor: () => theme.colors.text,
//   };

//   return (
    
//     <SafeAreaView style={{...styles.safeArea, height: screenHeight}}>
//       <ScrollView
//         style={{height: screenHeight}}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 40 }}
//       >
//         <HeaderMenu/>
//         {/* 🩺 Encabezado */}
//         <Text style={styles.title}>Panel de Control</Text>
//         <Text style={styles.subtitle}>
//           Bienvenido a tu panel de control de PharmaControl
//         </Text>

//         {/* 🔹 Tarjetas resumen */}
//         <View style={styles.cardsRow}>
//           <View
//             style={[
//               styles.card,
//               { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
//             ]}
//           >
//             <Text style={styles.cardTitle}>Medicamentos Totales</Text>
//             <Text style={[styles.cardValue, { color: theme.colors.primary }]}>
//               {stats.total}
//             </Text>
//           </View>

//           <View
//             style={[
//               styles.card,
//               { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
//             ]}
//           >
//             <Text style={styles.cardTitle}>Por Caducar</Text>
//             <Text style={[styles.cardValue, { color: theme.colors.warning }]}>
//               {stats.porCaducar}
//             </Text>
//           </View>

//           <View
//             style={[
//               styles.card,
//               { backgroundColor:theme.colors.card, borderColor: theme.colors.border },
//             ]}
//           >
//             <Text style={styles.cardTitle}>Caducados</Text>
//             <Text style={[styles.cardValue, { color: "#D32F2F" }]}>
//               {stats.caducados}
//             </Text>
//           </View>
//         </View>

//         {/* 📊 Gráfica de pastel */}
//         <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
//           <Text style={styles.sectionTitle}>Distribución por Categoría</Text>
//           <PieChart
//             data={categorias}
//             width={screenWidth * 0.9}
//             height={220}
//             accessor={"population"}
//             backgroundColor={"transparent"}
//             paddingLeft={"15"}
//             hasLegend={false}
//             chartConfig={chartConfig}
//             center={[0, 0]}
//             absolute
//           />
//           <View style={styles.legendContainer}>
//             {categorias.map((item, i) => (
//               <View key={i} style={styles.legendItem}>
//                 <View
//                   style={[styles.legendColor, { backgroundColor: item.color }]}
//                 />
//                 <Text style={[styles.legendText, { color: theme.colors.text }]}>
//                   {item.population} {item.name}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* 📈 Gráfica de barras */}
//         <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
//           <Text style={styles.sectionTitle}>Resumen General</Text>
//           <BarChart
//             data={{
//               labels: ["Total", "Por Caducar", "Caducados"],
//               datasets: [
//                 { data: [stats.total, stats.porCaducar, stats.caducados] },
//               ],
//             }}
//             width={screenWidth}
//             height={220}
//             yAxisLabel=""
//             yAxisSuffix=""
//             chartConfig={chartConfig}
//             style={styles.barChart}
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // 🎨 Estilos dinámicos basados en el tema actual
// const getStyles = (theme: any) =>
//   StyleSheet.create({
//     safeArea: {
//       flex: 1,
//       backgroundColor: theme.colors.background,

//     },
//     scrollContainer: {
//       flex: 1,
//       paddingHorizontal: 16,

//     },
//     loaderContainer: {
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "center",
//       backgroundColor: theme.colors.background,
//     },
//     title: {
//       fontSize: 26,
//       fontWeight: "800",
//       color: theme.colors.primary,
//       marginBottom: 4,
//       marginTop: 10,
//       textAlign: "center",
//     },
//     subtitle: {
//       fontSize: 15,
//       color: theme.colors.text,
//       marginBottom: 20,
//       textAlign: "center",
//     },
//     cardsRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       marginBottom: 20,
//     },
//     card: {
//       flex: 1,
//       borderRadius: 18,
//       borderWidth: 1,
//       paddingVertical: 16,
//       paddingHorizontal: 10,
//       marginHorizontal: 4,
//       shadowColor: "#000",
//       shadowOpacity: 0.08,
//       shadowRadius: 6,
//       elevation: 3,
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     cardTitle: {
//       fontSize: 14,
//       color: theme.colors.text,
//       textAlign: "center",
//       marginBottom: 6,
//     },
//     cardValue: {
//       fontSize: 28,
//       fontWeight: "800",
//     },
//     chartContainer: {
//       marginBottom: 24,
//       borderRadius: 20,
//       paddingVertical: 14,
//       paddingHorizontal: 10,
//       shadowColor: "#000",
//       shadowOpacity: 0.05,
//       shadowRadius: 6,
//       elevation: 2,
//       alignItems: "center",
//     },
//     legendContainer: {
//       flexDirection: "row",
//       flexWrap: "wrap",
//       justifyContent: "center",
//       marginTop: 10,
//       gap: 8,
//     },
//     legendItem: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginHorizontal: 6,
//       marginVertical: 4,
//     },
//     legendColor: {
//       width: 14,
//       height: 14,
//       borderRadius: 4,
//       marginRight: 6,
//     },
//     legendText: {
//       fontSize: 14,
//       fontWeight: "500",
//     },
//     sectionTitle: {
//       fontSize: 18,
//       fontWeight: "700",
//       marginBottom: 10,
//       color: theme.colors.text,
//       textAlign: "center",
//     },
//     barChart: {
//       borderRadius: 16,
//       marginVertical: 8,
//     },
//   });
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useStats } from "../hooks/useStats";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderMenu } from "../components/HeaderMenu";

const screenWidth = Dimensions.get("window").width - 32;

/**
 * Paleta formal por defecto (fallback si theme no define colores)
 */
const FORMAL = {
  primary: "#1E3A8A",      // azul corporativo
  border: "#E6EEF8",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textMuted: "#475569",
  warning: "#92400E",
  danger: "#991B1B",
  success: "#166534",
};

function hexToRgba(hex: string, opacity = 1) {
  try {
    const c = hex.replace("#", "");
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } catch {
    return hex;
  }
}

export const DashboardScreen = () => {
  const { theme } = useTheme();
  const { stats, loading, error } = useStats();
  const screenHeight = Dimensions.get("window").height;

  // resolved colors: prefer theme, fallback to FORMAL
  const colors = {
    primary: theme?.colors?.primary ?? FORMAL.primary,
    border: theme?.colors?.border ?? FORMAL.border,
    background: theme?.colors?.background ?? FORMAL.bg,
    card: theme?.colors?.card ?? FORMAL.card,
    text: theme?.colors?.text ?? FORMAL.text,
    textMuted: theme?.colors?.textMuted ?? FORMAL.textMuted,
    warning: theme?.colors?.warning ?? FORMAL.warning,
    danger: theme?.colors?.danger ?? FORMAL.danger,
    success: theme?.colors?.success ?? FORMAL.success,
  };

  const styles = getStyles(colors);

  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (error)
    return (
      <View style={styles.loaderContainer}>
        <Text style={[styles.subtitle, { color: colors.danger }]}>{error}</Text>
      </View>
    );

  if (!stats)
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.subtitle}>No hay datos disponibles</Text>
      </View>
    );

  // datos para pastel
  const categorias = Object.entries(stats.porCategoria).map(([key, value], i) => ({
    name: key,
    population: value,
    color: [
      colors.primary,
      "#4CAF50",
      "#FFC107",
      "#00897B",
      "#5E35B1",
    ][i % 5],
  }));

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => hexToRgba(colors.primary, opacity),
    labelColor: () => colors.text,
  };

  return (
    <SafeAreaView key="dashboard-screen" style={{ ...styles.safeArea, height: screenHeight }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={{ height: screenHeight }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <HeaderMenu />

          {/* Header */}
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Panel de Control</Text>
            <Text style={styles.subtitle}>Información consolidada del inventario y alertas</Text>
          </View>

          {/* Cards */}
          <View style={styles.cardsRow}>
            <StatCard label="Medicamentos Totales" value={stats.total} color={colors.primary} styles={styles} />
            <StatCard label="Por Caducar" value={stats.porCaducar} color={colors.warning} styles={styles} />
            <StatCard label="Caducados" value={stats.caducados} color={colors.danger} styles={styles} />
          </View>

          {/* Pie */}
          <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
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
                <View key={`legend-${i}`} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendText, { color: colors.text }]}>
                    <Text style={styles.legendNumber}>{item.population}</Text> {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bar */}
          <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
            <Text style={styles.sectionTitle}>Resumen General</Text>
            <BarChart
              data={{
                labels: ["Total", "Por Caducar", "Caducados"],
                datasets: [{ data: [stats.total, stats.porCaducar, stats.caducados] }],
              }}
              width={screenWidth}
              height={240}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                propsForLabels: { fontSize: 12 },
              }}
              style={styles.barChart}
              fromZero
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* small reusable stat card */
const StatCard = ({ label, value, color, styles }: any) => (
  <View style={[styles.card, { marginHorizontal: 6 }]}>
    <Text style={styles.cardTitle}>{label}</Text>
    <Text style={[styles.cardValue, { color }]}>{value}</Text>
  </View>
);

const getStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerWrap: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      alignItems: "center",
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.primary,
      marginBottom: 6,
      textAlign: "center",
      letterSpacing: 0.2,
      lineHeight: 34,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 14,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    cardsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 12,
      marginBottom: 18,
    },
    card: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 16,
      paddingHorizontal: 14,
      marginHorizontal: 6,
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 4,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 92,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 13,
      color: colors.text,
      textAlign: "center",
      marginBottom: 6,
      fontWeight: "600",
    },
    cardValue: {
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    chartContainer: {
      marginHorizontal: 16,
      marginBottom: 22,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 12,
      shadowColor: "#000",
      shadowOpacity: 0.02,
      shadowRadius: 8,
      elevation: 3,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 10,
      color: colors.text,
      textAlign: "center",
    },
    legendContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 12,
      gap: 10,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 6,
      marginVertical: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: colors.background === "#fff" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.01)",
    },
    legendColor: {
      width: 14,
      height: 14,
      borderRadius: 4,
      marginRight: 8,
    },
    legendText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    legendNumber: {
      fontWeight: "700",
      marginRight: 6,
      color: colors.primary,
    },
    barChart: {
      borderRadius: 12,
      marginVertical: 8,
    },
  });

export default DashboardScreen;
