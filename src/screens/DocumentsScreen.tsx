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
  Alert,
} from "react-native";
import { useDocuments } from "../hooks/useDocumentosHook";
import { useTheme } from "../context/ThemeContext";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import Feather from "@expo/vector-icons/Feather";
import { HeaderMenu } from "../components/HeaderMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { apiPharma } from "../api/apiPharma";
import * as Print from "expo-print";
import { SuccessModal } from "../components/SuccessModal";


export const DocumentsScreen = () => {
  const { theme } = useTheme();
  const {
    ventas,
    reportesIA,
    otros,
    loading,
    error,
    downloadAndOpenFile,
    openedFile,
    closeViewer,
  } = useDocuments();

  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showSucces, setShowSuccess] = useState(false);
  const [successMessage, setSuccesMessage] = useState("");
  const H = Dimensions.get("window").height;
  const W = Dimensions.get("window").width;

  // ✅ Descargar → compartir o abrir visor
// ✅ Versión que convierte JSON a PDF cuando sea necesario
// ✅ Versión que convierte JSON a PDF cuando sea necesario
const handleDownload = async (id: string, filename: string) => {
  try {
    setDownloading(id);
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Token no encontrado");

    const url = `${apiPharma.defaults.baseURL}/api/documentos/descargar/${id}`;
    const fileUri = FileSystem.cacheDirectory + filename;

    console.log("📡 Descargando temporal:", url);

    const res = await FileSystem.downloadAsync(url, fileUri, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Archivo descargado:", res.uri);

    // Leer contenido descargado
    const text = await FileSystem.readAsStringAsync(res.uri);
    let isJson = false;

    try {
      JSON.parse(text);
      isJson = true;
    } catch {
      isJson = false;
    }

    if (isJson) {
      // 🧾 Generar ticket con mismo diseño que la visualización
      const venta = JSON.parse(text);

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              @page { size: 80mm auto; margin: 8mm; }
              body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                color: #222;
                background: #f9f9fb;
              }
              .ticket {
                border: 1px solid #ccc;
                border-radius: 10px;
                padding: 12px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                background: #fff;
              }
              .header {
                background: linear-gradient(135deg, #0096ff, #0078d7);
                border-radius: 10px;
                text-align: center;
                padding: 8px 0;
                color: #fff;
              }
              .subtitle {
                font-size: 13px;
                opacity: 0.9;
              }
              .divider {
                border-top: 1px solid #ddd;
                margin: 8px 0;
              }
              .info {
                font-size: 12px;
                margin-bottom: 6px;
              }
              .table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                font-size: 11px;
                padding: 4px 0;
              }
              th {
                text-align: left;
                border-bottom: 1px dashed #bbb;
              }
              td {
                border-bottom: 1px dotted #eee;
              }
              .right {
                text-align: right;
              }
              .total {
                margin-top: 8px;
                text-align: right;
                font-weight: bold;
                font-size: 13px;
                color: #0078d7;
              }
              .footer {
                text-align: center;
                margin-top: 12px;
                font-size: 11px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">
                <h2 style="margin:0;">PharmaControl</h2>
                <div class="subtitle">Control inteligente para tu farmacia</div>
              </div>

              <div class="info">
                <b>Folio:</b> ${venta._id ?? "N/A"}<br/>
                <b>Fecha:</b> ${new Date(venta.fecha).toLocaleString()}<br/>
                <b>Vendedor:</b> ${venta.usuario?.nombre ?? "Desconocido"}
              </div>

              <div class="divider"></div>

              <table class="table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th class="right">Cant.</th>
                    <th class="right">P/U</th>
                    <th class="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${(venta.detalles || [])
                    .map(
                      (d: any) => `
                      <tr>
                        <td>${d.medicamento?.nombre ?? ""}</td>
                        <td class="right">${d.cantidad}</td>
                        <td class="right">$${Number(d.precioUnitario || 0).toFixed(2)}</td>
                        <td class="right">$${Number(d.total).toFixed(2)}</td>
                      </tr>`
                    )
                    .join("")}
                </tbody>
              </table>

              <div class="divider"></div>

              <div class="total">TOTAL: $${Number(venta.total || 0).toFixed(2)}</div>

              <div class="footer">
                ¡Gracias por su compra!<br/>
                “Control inteligente para tu farmacia”
              </div>
            </div>
          </body>
        </html>
      `;

      const pdf = await Print.printToFileAsync({ html });
      console.log("✅ PDF generado:", pdf.uri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdf.uri, {
          mimeType: "application/pdf",
          dialogTitle: `Ticket de venta`,
        });
      } else {
        setCurrentFile(pdf.uri);
      }

      // ✅ Modal de confirmación (PDF generado desde JSON)
      setSuccesMessage("El ticket se ha convertido correctamente en PDF y está listo para compartir.");
      setShowSuccess(true);
    } else {
      // 📄 Si ya es PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(res.uri, {
          mimeType: "application/pdf",
          dialogTitle: `Archivo: ${filename}`,
        });
      } else {
        setCurrentFile(res.uri);
      }

      // ✅ Modal de confirmación (PDF existente)
      setSuccesMessage(`El archivo ${filename} se ha descargado correctamente.`);
      setShowSuccess(true);
    }
  } catch (error) {
    console.error("❌ Error al generar PDF:", error);
    Alert.alert("Error", "No se pudo generar el PDF");
  } finally {
    setDownloading(null);
  }
};


  // 🧾 Renderizar ticket visual
  const renderTicket = (venta: any) => (
    <SafeAreaView
      style={[styles.ticketSafeArea, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <Fade delay={100}>
          <View
            style={[
              styles.ticketWrapper,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border || "#ccc",
              },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primary + "CC"]}
              style={styles.ticketHeader}
            >
              <View style={styles.ticketLogo}>
                <Image
                  source={require("../../assets/logo1.png")}
                  style={{ width: 80, height: 80, resizeMode: "contain" }}
                />
              </View>
              <Text style={[styles.ticketSubtitle, { color: "#f9f9f9" }]}>
                Comprobante de Venta
              </Text>
            </LinearGradient>

            <View
              style={[
                styles.ticketDivider,
                { borderBottomColor: theme.colors.border || "#ccc" },
              ]}
            />

            {/* Info general */}
            <View style={styles.ticketInfo}>
              <Text style={[styles.ticketLine, { color: theme.colors.text }]}>
                ID Venta: {venta._id}
              </Text>
              <Text style={[styles.ticketLine, { color: theme.colors.text }]}>
                Cliente: {venta.usuario?.nombre || "Cliente"}{" "}
                {venta.usuario?.apellido || ""}
              </Text>
              <Text style={[styles.ticketLine, { color: theme.colors.text }]}>
                Fecha: {new Date(venta.fecha).toLocaleString()}
              </Text>
            </View>

            <View
              style={[
                styles.ticketDivider,
                { borderBottomColor: theme.colors.border || "#ccc" },
              ]}
            />

            {/* Tabla encabezado */}
            <View style={styles.ticketHeaderRow}>
              <Text
                style={[
                  styles.ticketHeaderText,
                  { color: theme.colors.textMuted },
                ]}
              >
                Medicamento
              </Text>
              <Text
                style={[
                  styles.ticketHeaderText,
                  { color: theme.colors.textMuted },
                ]}
              >
                Cant.
              </Text>
              <Text
                style={[
                  styles.ticketHeaderText,
                  { color: theme.colors.textMuted },
                ]}
              >
                Precio
              </Text>
            </View>

            {(venta.detalles || []).map((item: any, index: number) => (
              <View key={index} style={styles.ticketRow}>
                <Text style={[styles.ticketItemName, { color: theme.colors.text }]}>
                  {item.medicamento?.nombre || "Producto"}
                </Text>
                <Text style={[styles.ticketItemQty, { color: theme.colors.text }]}>
                  {item.cantidad}
                </Text>
                <Text style={[styles.ticketItemPrice, { color: theme.colors.text }]}>
                  ${Number(item.precioUnitario || 0).toFixed(2)}
                </Text>
              </View>
            ))}

            <View
              style={[
                styles.ticketDividerDashed,
                { borderBottomColor: theme.colors.border || "#bbb" },
              ]}
            />

            {/* Total */}
            <View style={styles.ticketTotalRow}>
              <Text style={[styles.ticketTotalLabel, { color: theme.colors.text }]}>
                TOTAL
              </Text>
              <Text
                style={[
                  styles.ticketTotalAmount,
                  { color: theme.colors.primary },
                ]}
              >
                ${Number(venta.total || 0).toFixed(2)}
              </Text>
            </View>

            <View
              style={[
                styles.ticketDivider,
                { borderBottomColor: theme.colors.border || "#ccc" },
              ]}
            />

            <Text style={[styles.ticketThanks, { color: theme.colors.primary }]}>
              ¡Gracias por su compra!
            </Text>
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

  // 📄 Renderizadores de visor PDF
  if (selectedVenta) return renderTicket(selectedVenta);

  if (currentFile) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <Button title="Cerrar visor" onPress={() => setCurrentFile(null)} />
        <WebView source={{ uri: currentFile }} style={{ flex: 1 }} startInLoadingState />
      </View>
    );
  }

  if (openedFile) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <Button title="Cerrar visor" onPress={closeViewer} />
        <WebView source={{ uri: openedFile }} style={{ flex: 1 }} startInLoadingState />
      </View>
    );
  }

  // ⏳ Loading o error
  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>
          Cargando documentos...
        </Text>
      </View>
    );

  if (error)
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.danger }}>Error: {error}</Text>
      </View>
    );

  // 📚 Vista principal
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <HeaderMenu />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ height: H, width: W }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
      >
        <Fade delay={50}>
          <LinearGradient colors={[theme.colors.primary, "#5AB4F8"]} style={styles.header}>
            <Text style={styles.headerTitle}>Documentos</Text>
            <Text style={styles.headerSubtitle}>
              Consulta, descarga y visualiza tus reportes
            </Text>
          </LinearGradient>
        </Fade>

        {/* 🧾 Ventas */}
        <Fade delay={150}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Ventas Registradas
          </Text>
          {ventas.length > 0 ? (
            ventas.map((v) => (
              <View
                key={v._id}
                style={[styles.card, { backgroundColor: theme.colors.card }]}
              >
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Venta #{v._id} — {v.usuario?.nombre || "Cliente"}
                </Text>
                <Text
                  style={[styles.cardText, { color: theme.colors.textMuted }]}
                >
                  Fecha: {new Date(v.fecha).toLocaleDateString()} | Total: $
                  {Number(v.total || 0).toFixed(2)}
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => setSelectedVenta(v)}
                  >
                    <Text style={styles.buttonText}>Ver ticket</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: theme.colors.success },
                    ]}
                    onPress={() =>
                      handleDownload(v._id, `venta_${v._id}.pdf`)
                    }
                    disabled={downloading === v._id}
                  >
                    {downloading === v._id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text
              style={[styles.empty, { color: theme.colors.textMuted }]}
            >
              No hay ventas registradas.
            </Text>
          )}
        </Fade>

        {/* 🤖 Reportes de IA */}
        <Fade delay={250}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Reportes de IA
          </Text>
          {reportesIA.length > 0 ? (
            reportesIA.map((r) => (
              <View
                key={r._id}
                style={[styles.card, { backgroundColor: theme.colors.card }]}
              >
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {r.filename}
                </Text>
                <Text
                  style={[styles.cardText, { color: theme.colors.textMuted }]}
                >
                  Generado por: {r.generadoPor || "IA"}
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => downloadAndOpenFile(r._id, r.filename)}
                  >
                    <Text style={styles.buttonText}>👁️ Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: theme.colors.success },
                    ]}
                    onPress={() => handleDownload(r._id, r.filename)}
                    disabled={downloading === r._id}
                  >
                    {downloading === r._id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>💾 Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text
              style={[styles.empty, { color: theme.colors.textMuted }]}
            >
              No hay reportes generados aún.
            </Text>
          )}
        </Fade>

        {/* 📄 Otros Documentos */}
        <Fade delay={350}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Otros Documentos
          </Text>
          {otros.length > 0 ? (
            otros.map((r) => (
              <View
                key={r._id}
                style={[styles.card, { backgroundColor: theme.colors.card }]}
              >
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {r.filename}
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() =>
                      downloadAndOpenFile(r._id, r.filename)
                    }
                  >
                    <Text style={styles.buttonText}>👁️ Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: theme.colors.success },
                    ]}
                    onPress={() => handleDownload(r._id, r.filename)}
                    disabled={downloading === r._id}
                  >
                    {downloading === r._id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>💾 Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text
              style={[styles.empty, { color: theme.colors.textMuted }]}
            >
              No hay otros documentos disponibles.
            </Text>
          )}
        </Fade>
      </ScrollView>
             {/* ✅ Modal de confirmación */}
      <SuccessModal
        visible={showSucces}
        title="✅ Exportación completada"
        message={successMessage}
        onRequestClose={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
};

// 🎨 Estilos completos
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
    elevation: 4,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: "#fff", fontSize: 14, marginTop: 4, opacity: 0.85 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 6,
  },
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  ticketSafeArea: { flex: 1, paddingTop: Platform.OS === "android" ? 40 : 20 },
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
  ticketHeader: { borderRadius: 10, paddingVertical: 12, marginBottom: 8 },
  ticketLogo: { alignSelf: "center" },
  ticketSubtitle: { textAlign: "center", fontSize: 14, marginTop: 2 },
  ticketDivider: { borderBottomWidth: 1, marginVertical: 10 },
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
  ticketItemQty: { flex: 0.5, textAlign: "center", fontSize: 13 },
  ticketItemPrice: { flex: 1, textAlign: "right", fontSize: 13 },
  ticketTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    alignItems: "center",
  },
  ticketTotalLabel: { fontWeight: "800", fontSize: 15 },
  ticketTotalAmount: { fontWeight: "800", fontSize: 16 },
  ticketThanks: { textAlign: "center", marginTop: 10, fontSize: 14, fontWeight: "600" },
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
  ticketInfo: { marginBottom: 6 },
});
