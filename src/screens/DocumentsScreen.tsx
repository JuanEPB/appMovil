import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Button,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { useDocuments } from "../hooks/useDocumentosHook";
import { useTheme } from "../context/ThemeContext";
import { WebView } from "react-native-webview";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { HeaderMenu } from "../components/HeaderMenu";

export const DocumentsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const {
    ventas,
    reportesIA,
    otros,
    loading,
    error,
    downloadAndOpenFile,
    openedFile,
    downloadFile,
    closeViewer,
  } = useDocuments();

  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);
  const H = Dimensions.get("window").height;
  const W = Dimensions.get("window").width;

  // 🧾 Mostrar ticket de venta
// 🧾 Mostrar ticket de venta
const renderTicket = (venta: any) => (
  <SafeAreaView style={[styles.ticketSafeArea, { backgroundColor: theme.colors.background }]}>
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      showsVerticalScrollIndicator={false}
    >
      <Fade delay={100}>
        <View style={[styles.ticketWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border || "#ccc" }]}>
          {/* Encabezado degradado */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + "CC"]}
            style={styles.ticketHeader}
          >
            <View style={[styles.ticketLogo]}> 
              <Image
                source={require("../../assets/logo1.png")}
                style={{ width: 80, height: 80, resizeMode: "contain" }}
              />
              
            </View>
            <Text style={[styles.ticketSubtitle, { color: "#f9f9f9" }]}>Comprobante de Venta</Text>
          </LinearGradient>

          <View style={[styles.ticketDivider, { borderBottomColor: theme.colors.border || "#ccc" }]} />

          {/* Información general */}
          <View style={styles.ticketInfo}>
            <Text style={[styles.ticketLine, { color: theme.colors.text }]}>ID Venta: {venta._id}</Text>
            <Text style={[styles.ticketLine, { color: theme.colors.text }]}>
              Cliente: {venta.usuario?.nombre} {venta.usuario?.apellido}
            </Text>
            <Text style={[styles.ticketLine, { color: theme.colors.text }]}>
              Fecha: {new Date(venta.fecha).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.ticketDivider, { borderBottomColor: theme.colors.border || "#ccc" }]} />

          {/* Tabla encabezado */}
          <View style={styles.ticketHeaderRow}>
            <Text style={[styles.ticketHeaderText, { color: theme.colors.textMuted }]}>Medicamento</Text>
            <Text style={[styles.ticketHeaderText, { color: theme.colors.textMuted }]}>Cant.</Text>
            <Text style={[styles.ticketHeaderText, { color: theme.colors.textMuted }]}>Precio</Text>
          </View>

          {/* Filas */}
          {venta.detalles.map((item: any, index: number) => (
            <View key={index} style={styles.ticketRow}>
              <Text style={[styles.ticketItemName, { color: theme.colors.text }]}>{item.medicamento.nombre}</Text>
              <Text style={[styles.ticketItemQty, { color: theme.colors.text }]}>{item.cantidad}</Text>
              <Text style={[styles.ticketItemPrice, { color: theme.colors.text }]}>${item.precioUnitario}</Text>
            </View>
          ))}

          <View style={[styles.ticketDividerDashed, { borderBottomColor: theme.colors.border || "#bbb" }]} />

          {/* Total */}
          <View style={styles.ticketTotalRow}>
            <Text style={[styles.ticketTotalLabel, { color: theme.colors.text }]}>TOTAL</Text>
            <Text style={[styles.ticketTotalAmount, { color: theme.colors.primary }]}>
              ${venta.total.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.ticketDivider, { borderBottomColor: theme.colors.border || "#ccc" }]} />

          {/* Footer */}
          <Text style={[styles.ticketThanks, { color: theme.colors.primary }]}>¡Gracias por su compra!</Text>
          <Text style={[styles.ticketFooter, { color: theme.colors.textMuted }]}>
            “Control inteligente para tu farmacia”
          </Text>

          <TouchableOpacity
            style={[styles.ticketCloseBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => setSelectedVenta(null)}
          >
            <Feather name="arrow-left" size={18} color="#fff" />
            <Text style={styles.ticketCloseText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </Fade>
    </ScrollView>
  </SafeAreaView>
);



  // 📄 Si se está visualizando ticket
  if (selectedVenta) return renderTicket(selectedVenta);

  // 📄 Si se está visualizando PDF o reporte IA
  if (openedFile) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <Button title="Cerrar visor" onPress={closeViewer} />
        <WebView source={{ uri: openedFile }} style={{ flex: 1 }} startInLoadingState />
      </View>
    );
  }

  // ⏳ Cargando
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>Cargando documentos...</Text>
      </View>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.danger }}>Error: {error}</Text>
      </View>
    );
  }

  // 📑 Contenido principal
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <HeaderMenu/>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ height: H, width: W }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
      >
        
        {/* 🔹 Header degradado con animación */}
        <Fade delay={50}>
          <LinearGradient colors={[theme.colors.primary, "#5AB4F8"]} style={styles.header}>
            
            <Text style={styles.headerTitle}>Documentos</Text>
            <Text style={styles.headerSubtitle}>Consulta, descarga y visualiza tus reportes</Text>
          </LinearGradient>
        </Fade>

        {/* 🧾 Ventas */}
        <Fade delay={150}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ventas Registradas</Text>
          {ventas.length > 0 ? (
            ventas.map((v, i) => (
              <View key={i} style={[styles.card, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Venta #{v._id} — {v.usuario.nombre}
                </Text>
                <Text style={[styles.cardText, { color: theme.colors.textMuted }]}>
                  Fecha: {new Date(v.fecha).toLocaleDateString()} | Total: ${v.total}
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setSelectedVenta(v)}
                  >
                    <Text style={styles.buttonText}>👁️ Ver ticket</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.success }]}
                    onPress={() => downloadFile(v._id?.toString(), `venta_${v._id}.json`)}
                  >
                    <Text style={styles.buttonText}>💾 Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>No hay ventas registradas.</Text>
          )}
        </Fade>

        {/* 🤖 Reportes de IA */}
        <Fade delay={250}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Reportes de IA</Text>
          {reportesIA.length > 0 ? (
            reportesIA.map((r) => (
              <View key={r._id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{r.filename}</Text>
                <Text style={[styles.cardText, { color: theme.colors.textMuted }]}>
                  Generado por: {r.generadoPor}
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={() => downloadAndOpenFile(r._id, r.filename)}
                  >
                    <Text style={styles.buttonText}>👁️ Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.success }]}
                    onPress={() => downloadFile(r._id, r.filename)}
                  >
                    <Text style={styles.buttonText}>💾 Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>
              No hay reportes generados aún.
            </Text>
          )}
        </Fade>

        {/* 📄 Otros Documentos */}
        <Fade delay={350}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Otros Documentos</Text>
          {otros.length > 0 ? (
            otros.map((r) => (
              <View key={r._id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{r.filename}</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={() => downloadAndOpenFile(r._id, r.filename)}
                  >
                    <Text style={styles.buttonText}>👁️ Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.success }]}
                    onPress={() => downloadFile(r._id, r.filename)}
                  >
                    <Text style={styles.buttonText}>💾 Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>
              No hay otros documentos disponibles.
            </Text>
          )}
        </Fade>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    width: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 40,
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
    elevation: 4,
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: "#fff", fontSize: 14, marginTop: 4, opacity: 0.85 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 10, marginBottom: 6 },
  card: {
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardText: { fontSize: 14, marginTop: 4 },
  empty: { fontSize: 14, fontStyle: "italic", marginVertical: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
// 🎟️ Estilos de ticket tipo recibo
ticketSafeArea: {
  flex: 1,
  paddingTop: Platform.OS === "android" ? 40 : 20,
},
ticketWrapper: {
  width: "88%",
  alignSelf: "center",
  padding: 18,
  borderRadius: 12,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  borderWidth: 1,
},
ticketHeader: {
  borderRadius: 10,
  paddingVertical: 12,
  marginBottom: 8,
},
ticketLogo: {
alignSelf: "center",
},
ticketSubtitle: {
  textAlign: "center",
  fontSize: 14,
  marginTop: 2,
},
ticketDivider: {
  borderBottomWidth: 1,
  marginVertical: 10,
},
ticketDividerDashed: {
  borderBottomWidth: 1,
  borderStyle: "dashed",
  marginVertical: 10,
},
ticketLine: {
  fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  fontSize: 13,
},
ticketHeaderRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  borderBottomWidth: 1,
  paddingBottom: 4,
  marginBottom: 4,
},
ticketHeaderText: {
  fontWeight: "700",
  fontSize: 13,
  flex: 1,
  textAlign: "center",
},
ticketRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginVertical: 2,
},
ticketItemName: {
  flex: 2,
  fontSize: 13,
  fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
},
ticketItemQty: {
  flex: 0.5,
  textAlign: "center",
  fontSize: 13,
},
ticketItemPrice: {
  flex: 1,
  textAlign: "right",
  fontSize: 13,
},
ticketTotalRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 6,
  alignItems: "center",
},
ticketTotalLabel: {
  fontWeight: "800",
  fontSize: 15,
},
ticketTotalAmount: {
  fontWeight: "800",
  fontSize: 16,
},
ticketThanks: {
  textAlign: "center",
  marginTop: 10,
  fontSize: 14,
  fontWeight: "600",
},
ticketFooter: {
  textAlign: "center",
  fontSize: 12,
  marginTop: 4,
  fontStyle: "italic",
},
ticketCloseBtn: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 18,
  borderRadius: 10,
  paddingVertical: 10,
},
ticketCloseText: {
  color: "#fff",
  fontWeight: "700",
  marginLeft: 6,
  fontSize: 14,
},
ticketInfo: { 
  marginBottom: 6,
}


});
