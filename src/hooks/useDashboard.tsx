// import { useState, useEffect } from "react";
// import { getMedicamentos } from "../api/apiPharma";
// import { View, Text } from "react-native";
// import { PieChart, BarChart } from "react-native-chart-kit";
// import { Dimensions } from "react-native";
// import { useStats } from "./useStats";
// import { colors } from "../theme/appTheme";


// export const useDashboard = () => {
//   const { stats, loading } = useState();

//   if (loading) return <Text>Cargando estadísticas...</Text>;

//   // Convierte porCategoria en un arreglo compatible con PieChart
//   const categorias = Object.entries(stats.porCategoria).map(([key, value], i) => ({
//     name: key,
//     population: value,
//     color: [colors.primary, colors.success, colors.warning, "#00897B", "#5E35B1"][i % 5],
//     legendFontColor: "#333",
//     legendFontSize: 13,
//   }));

//   return (
//     <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
//       <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 16, color: colors.primary }}>
//         Estadísticas de Inventario
//       </Text>

//       {/* Tarjetas de resumen */}
//       <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
//         <View style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, flex: 1, marginRight: 8 }}>
//           <Text style={{ color: "#fff" }}>Total</Text>
//           <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>{stats.total}</Text>
//         </View>
//         <View style={{ backgroundColor: colors.warning, padding: 16, borderRadius: 12, flex: 1, marginRight: 8 }}>
//           <Text style={{ color: "#fff" }}>Por caducar</Text>
//           <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>{stats.porCaducar}</Text>
//         </View>
//         <View style={{ backgroundColor: colors.danger, padding: 16, borderRadius: 12, flex: 1 }}>
//           <Text style={{ color: "#fff" }}>Caducados</Text>
//           <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>{stats.caducados}</Text>
//         </View>
//       </View>

//       {/* Gráfica de pastel por categoría */}
//       <PieChart
//         data={categorias}
//         width={screenWidth}
//         height={220}
//         accessor={"population"}
//         backgroundColor={"transparent"}
//         paddingLeft={"16"}
//         chartConfig={{
//           backgroundColor: "#fff",
//           backgroundGradientFrom: "#fff",
//           backgroundGradientTo: "#fff",
//           color: () => colors.primary,
//         }}
//         absolute
//       />

//       {/* Gráfica de barras comparativa */}
//       <BarChart
//         data={{
//           labels: ["Total", "Por caducar", "Caducados"],
//           datasets: [
//             {
//               data: [stats.total, stats.porCaducar, stats.caducados],
//             },
//           ],
//         }}
//         width={screenWidth}
//         height={200}
//         yAxisLabel=""
//         chartConfig={{
//           backgroundGradientFrom: "#fff",
//           backgroundGradientTo: "#fff",
//           decimalPlaces: 0,
//           color: (opacity = 1) => `rgba(26, 35, 126, ${opacity})`,
//           labelColor: () => "#333",
//         }}
//         style={{ marginVertical: 16, borderRadius: 8 }}
//       />
//     </View>
//   );

// };
