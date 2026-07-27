import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { HeaderMenu } from "../components/HeaderMenu";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import { SuccessModal } from "../components/SuccessModal";
import { apiPharma } from "../api/apiPharma";
import { getSaleTicketPdfUrl } from "../api/apiNeural";
import { useTheme } from "../context/ThemeContext";
import { useDocuments } from "../hooks/useDocumentosHook";
import { isDemoToken } from "../data/localDb";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";
import { tw } from "../themes/tailwindTokens";

export const DocumentsScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const { ventas, reportesIA, otros, loading, error, downloadAndOpenFile, openedFile, closeViewer } =
    useDocuments();
  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDownload = async (id: string, filename: string) => {
    try {
      setDownloading(id);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Token no encontrado");

      if (isDemoToken(token)) {
        setSuccessMessage(`El archivo ${filename} esta disponible como dato demo.`);
        setShowSuccess(true);
        return;
      }

      const url = `${apiPharma.defaults.baseURL}/api/documentos/descargar/${id}`;
      const fileUri = FileSystem.cacheDirectory + filename;
      const res = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await FileSystem.readAsStringAsync(res.uri);

      try {
        const venta = JSON.parse(text);
        const pdf = await Print.printToFileAsync({ html: buildTicketHtml(venta) });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(pdf.uri, { mimeType: "application/pdf" });
        else setCurrentFile(pdf.uri);
        setSuccessMessage("Ticket convertido correctamente a PDF.");
      } catch {
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(res.uri, { mimeType: "application/pdf" });
        else setCurrentFile(res.uri);
        setSuccessMessage(`Archivo ${filename} descargado correctamente.`);
      }

      setShowSuccess(true);
    } catch (downloadError) {
      console.error("Error al generar PDF:", downloadError);
      Alert.alert("Error", "No se pudo generar el PDF");
    } finally {
      setDownloading(null);
    }
  };

  const getBackendVentaId = (id: string) => {
    const match = String(id || "").match(/\d+$/);
    return match ? match[0] : null;
  };

  const handleExportVenta = async (venta: any) => {
    const backendVentaId = getBackendVentaId(venta?._id);

    if (!backendVentaId || String(venta?._id || "").includes("demo")) {
      await exportLocalTicket(venta);
      return;
    }

    try {
      setDownloading(venta._id);
      const url = getSaleTicketPdfUrl(backendVentaId);
      const response = await fetch(url);

      if (!response.ok) {
        await exportLocalTicket(venta);
        return;
      }

      await Linking.openURL(url);

      setSuccessMessage("Ticket PDF abierto desde Pharma Neural V2.");
      setShowSuccess(true);
    } catch (downloadError) {
      console.error("Error al abrir PDF del backend:", downloadError);
      await exportLocalTicket(venta);
    } finally {
      setDownloading(null);
    }
  };

  const exportLocalTicket = async (venta: any) => {
    try {
      setDownloading(venta._id);
      const pdf = await Print.printToFileAsync({
        html: buildTicketHtml(venta),
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdf.uri, {
          mimeType: "application/pdf",
        });
      } else {
        setCurrentFile(pdf.uri);
      }

      setSuccessMessage(
        "Ticket convertido correctamente a PDF desde la app."
      );
      setShowSuccess(true);
    } catch (downloadError) {
      console.error("Error al generar PDF local:", downloadError);
      Alert.alert("Error", "No se pudo generar el PDF");
    } finally {
      setDownloading(null);
    }
  };

  if (selectedVenta) {
    return <TicketView venta={selectedVenta} onBack={() => setSelectedVenta(null)} />;
  }

  if (currentFile || openedFile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <TouchableOpacity style={styles.viewerClose} onPress={currentFile ? () => setCurrentFile(null) : closeViewer}>
          <Feather name="x" size={18} color="#fff" />
          <Text style={styles.viewerCloseText}>Cerrar visor</Text>
        </TouchableOpacity>
        <WebView source={{ uri: currentFile || openedFile || "" }} style={{ flex: 1 }} startInLoadingState />
      </SafeAreaView>
    );
  }

  if (loading || error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text, marginTop: 10 }}>Cargando documentos...</Text>
          </>
        ) : (
          <Text style={{ color: theme.colors.danger }}>Error: {error}</Text>
        )}
      </View>
    );
  }

  const totalDocs = ventas.length + reportesIA.length + otros.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <HeaderMenu />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent,
          webMaxWidthStyle(width),
          { paddingHorizontal: layout.pagePadding },
        ]}
      >
        <Fade delay={40}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.hero}>
            <View>
              <Text style={styles.heroEyebrow}>Centro documental</Text>
              <Text style={styles.heroTitle}>Documentos</Text>
              <Text style={styles.heroSubtitle}>Tickets, reportes inteligentes y archivos de operacion.</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{totalDocs}</Text>
              <Text style={styles.heroMetricLabel}>archivos</Text>
            </View>
          </LinearGradient>
        </Fade>

        <View style={[styles.summaryGrid, { gap: layout.gap }]}>
          <SummaryCard label="Ventas" value={ventas.length} icon="shopping-bag" color={theme.colors.primary} />
          <SummaryCard label="Reportes IA" value={reportesIA.length} icon="cpu" color={tw.colors.violet600} />
          <SummaryCard label="Otros" value={otros.length} icon="folder" color={theme.colors.success} />
        </View>

        <DocumentSection title="Ventas registradas">
          {ventas.length ? (
            ventas.map((venta) => (
              <DocumentCard
                key={venta._id}
                title={`Venta #${venta._id}`}
                subtitle={`${new Date(venta.fecha).toLocaleDateString()} - Total $${Number(venta.total || 0).toFixed(2)}`}
                icon="receipt"
                primaryLabel="Ver ticket"
                onPrimary={() => setSelectedVenta(venta)}
                secondaryLabel="Exportar"
                onSecondary={() => handleExportVenta(venta)}
                loading={downloading === venta._id}
              />
            ))
          ) : (
            <EmptyText text="No hay ventas registradas." />
          )}
        </DocumentSection>

        <DocumentSection title="Reportes de IA">
          {reportesIA.length ? (
            reportesIA.map((doc) => (
              <DocumentCard
                key={doc._id}
                title={doc.filename}
                subtitle={`Generado por ${doc.generadoPor || "IA"}`}
                icon="bar-chart-2"
                primaryLabel="Ver"
                onPrimary={() => downloadAndOpenFile(doc._id, doc.filename)}
                secondaryLabel="Guardar"
                onSecondary={() => handleDownload(doc._id, doc.filename)}
                loading={downloading === doc._id}
              />
            ))
          ) : (
            <EmptyText text="No hay reportes generados aun." />
          )}
        </DocumentSection>

        <DocumentSection title="Otros documentos">
          {otros.length ? (
            otros.map((doc) => (
              <DocumentCard
                key={doc._id}
                title={doc.filename}
                subtitle={doc.descripcion || "Archivo disponible"}
                icon="file-text"
                primaryLabel="Ver"
                onPrimary={() => downloadAndOpenFile(doc._id, doc.filename)}
                secondaryLabel="Guardar"
                onSecondary={() => handleDownload(doc._id, doc.filename)}
                loading={downloading === doc._id}
              />
            ))
          ) : (
            <EmptyText text="No hay otros documentos disponibles." />
          )}
        </DocumentSection>
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        title="Exportacion completada"
        message={successMessage}
        onRequestClose={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
};

const TicketView = ({ venta, onBack }: { venta: any; onBack: () => void }) => {
  const { theme } = useTheme();
  const total = Number(venta.total || 0);

  return (
    <SafeAreaView style={[styles.ticketSafeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.ticketContent} showsVerticalScrollIndicator={false}>
        <Fade delay={50}>
          <View style={[styles.ticketWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.ticketTopBar}>
              <TouchableOpacity style={[styles.ticketIconButton, { backgroundColor: theme.colors.background }]} onPress={onBack}>
                <Feather name="arrow-left" size={18} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={[styles.ticketScreenTitle, { color: theme.colors.text }]}>Vista de ticket</Text>
              <View style={styles.ticketIconButtonPlaceholder} />
            </View>

            <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.ticketHeader}>
              <View style={styles.ticketLogo}>
                <Image source={require("../../assets/logo1.png")} style={{ width: 56, height: 56, resizeMode: "contain" }} />
              </View>
              <Text style={styles.ticketBrand}>PharmaControl</Text>
              <Text style={styles.ticketSubtitle}>Comprobante de venta</Text>
            </LinearGradient>

            <View style={styles.ticketMetaGrid}>
              <TicketMeta label="Folio" value={String(venta._id ?? "N/A")} />
              <TicketMeta label="Cliente" value={`${venta.usuario?.nombre || "Cliente"} ${venta.usuario?.apellido || ""}`.trim()} />
              <TicketMeta label="Fecha" value={new Date(venta.fecha).toLocaleString()} />
            </View>

            <View style={styles.ticketTableHead}>
              <Text style={[styles.ticketHeadText, styles.ticketProductCol]}>Producto</Text>
              <Text style={styles.ticketHeadText}>Cant.</Text>
              <Text style={[styles.ticketHeadText, { textAlign: "right" }]}>Importe</Text>
            </View>

            {(venta.detalles || []).map((item: any, index: number) => (
              <View key={index} style={styles.ticketRow}>
                <View style={styles.ticketProductCol}>
                  <Text style={[styles.ticketItemName, { color: theme.colors.text }]}>{item.medicamento?.nombre || "Producto"}</Text>
                  <Text style={styles.ticketItemMeta}>${Number(item.precioUnitario || 0).toFixed(2)} c/u</Text>
                </View>
                <Text style={[styles.ticketItemQty, { color: theme.colors.text }]}>{item.cantidad}</Text>
                <Text style={[styles.ticketItemPrice, { color: theme.colors.text }]}>
                  ${Number(item.total ?? (item.cantidad || 0) * (item.precioUnitario || 0)).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.ticketTotalRow}>
              <View>
                <Text style={styles.ticketTotalLabel}>Total</Text>
                <Text style={styles.ticketTotalHint}>IVA incluido cuando aplique</Text>
              </View>
              <Text style={[styles.ticketTotalAmount, { color: theme.colors.primary }]}>${total.toFixed(2)}</Text>
            </View>

            <View style={styles.ticketFooterBox}>
              <Feather name="check-circle" size={20} color={theme.colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.ticketThanks, { color: theme.colors.text }]}>Gracias por su compra</Text>
                <Text style={styles.ticketFooter}>Control inteligente para tu farmacia</Text>
              </View>
            </View>
          </View>
        </Fade>
      </ScrollView>
    </SafeAreaView>
  );
};

const TicketMeta = ({ label, value }: { label: string; value: string }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.ticketMetaItem}>
      <Text style={styles.ticketMetaLabel}>{label}</Text>
      <Text style={[styles.ticketMetaValue, { color: theme.colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

const SummaryCard = ({ label, value, icon, color }: any) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}18` }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
};

const DocumentSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {children}
    </View>
  );
};

const DocumentCard = ({ title, subtitle, icon, primaryLabel, secondaryLabel, onPrimary, onSecondary, loading }: any) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.cardMain}>
        <View style={[styles.docIcon, { backgroundColor: theme.colors.background }]}>
          <Feather name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text numberOfLines={2} style={[styles.cardText, { color: theme.colors.textMuted }]}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={onPrimary}>
          <Text style={styles.buttonText}>{primaryLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.success }]} onPress={onSecondary} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>{secondaryLabel}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EmptyText = ({ text }: { text: string }) => {
  const { theme } = useTheme();
  return <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{text}</Text>;
};

const buildTicketHtml = (venta: any) => `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { size: 80mm auto; margin: 6mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
          background: #eef4fb;
        }
        .ticket {
          width: 100%;
          border: 1px solid #d8e0ea;
          border-radius: 8px;
          padding: 12px;
          background: #ffffff;
        }
        .header {
          background: #2563eb;
          color: #fff;
          border-radius: 8px;
          padding: 13px;
        }
        .brand { font-size: 19px; font-weight: 800; letter-spacing: 0; }
        .subtitle { margin-top: 2px; font-size: 11px; color: #dbeafe; }
        .folio { margin-top: 9px; font-size: 10px; font-weight: 700; }
        .meta {
          margin: 10px 0;
          padding: 9px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          font-size: 10.5px;
          color: #334155;
          line-height: 1.45;
        }
        .label {
          display: inline-block;
          min-width: 44px;
          color: #64748b;
          font-weight: 800;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
        }
        th {
          color: #475569;
          text-align: left;
          background: #eff6ff;
          border-bottom: 1px solid #dbeafe;
          padding: 7px 4px;
          font-size: 9.5px;
          text-transform: uppercase;
        }
        td {
          border-bottom: 1px solid #edf2f7;
          padding: 7px 4px;
          vertical-align: top;
        }
        .product { font-weight: 700; }
        .unit { color: #64748b; font-size: 9.5px; margin-top: 2px; }
        .right { text-align: right; }
        .total-box {
          margin-top: 11px;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          background: #eff6ff;
          padding: 9px;
          text-align: right;
        }
        .total-label { color: #64748b; font-size: 9.5px; font-weight: 800; text-transform: uppercase; }
        .total { color: #1d4ed8; font-size: 19px; font-weight: 800; margin-top: 2px; }
        .footer {
          margin-top: 11px;
          padding-top: 9px;
          border-top: 1px dashed #cbd5e1;
          text-align: center;
          color: #64748b;
          font-size: 10px;
          line-height: 1.35;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <div class="brand">PharmaControl</div>
          <div class="subtitle">Comprobante profesional de venta</div>
          <div class="folio">Folio ${venta._id ?? "N/A"}</div>
        </div>
        <div class="meta">
          <span class="label">Fecha</span> ${new Date(venta.fecha).toLocaleString()}<br/>
          <span class="label">Cliente</span> ${venta.usuario?.nombre ?? "Cliente"} ${venta.usuario?.apellido ?? ""}<br/>
          <span class="label">Sistema</span> Pharma Neural V2
        </div>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th class="right">Cant.</th>
              <th class="right">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${(venta.detalles || [])
              .map(
                (d: any) =>
                  `<tr><td><div class="product">${d.medicamento?.nombre ?? "Producto"}</div><div class="unit">$${Number(
                    d.precioUnitario || 0
                  ).toFixed(2)} c/u</div></td><td class="right">${d.cantidad}</td><td class="right"><b>$${Number(
                    d.total ?? (d.cantidad || 0) * (d.precioUnitario || 0)
                  ).toFixed(2)}</b></td></tr>`
              )
              .join("")}
          </tbody>
        </table>
        <div class="total-box">
          <div class="total-label">Total pagado</div>
          <div class="total">$${Number(venta.total || 0).toFixed(2)}</div>
        </div>
        <div class="footer">
          Gracias por su compra<br/>
          Control inteligente para tu farmacia
        </div>
      </div>
    </body>
  </html>
`;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainContent: { width: "100%", alignSelf: "center", paddingTop: 18, paddingBottom: 40 },
  hero: {
    borderRadius: tw.radius.xl,
    padding: tw.spacing[5],
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    ...shadow("#000"),
  },
  heroEyebrow: { color: "#EAF6FF", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  heroTitle: { color: "#fff", fontSize: 32, fontWeight: "800", marginTop: 4 },
  heroSubtitle: { color: "#EAF6FF", fontSize: 14, lineHeight: 20, marginTop: 4, maxWidth: 460 },
  heroMetric: {
    minWidth: 96,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  heroMetricValue: { color: "#fff", fontSize: 28, fontWeight: "800" },
  heroMetricLabel: { color: "#EAF6FF", fontSize: 12, fontWeight: "700" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  summaryCard: { flex: 1, minWidth: 150, borderWidth: 1, borderRadius: 16, padding: 14, ...shadow("#000") },
  summaryIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryValue: { fontSize: 26, fontWeight: "800", marginTop: 10 },
  summaryLabel: { color: tw.colors.slate500, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 19, fontWeight: "800", marginBottom: 8 },
  card: { borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, ...shadow("#000") },
  cardMain: { flexDirection: "row", alignItems: "center", gap: 12 },
  docIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardText: { fontSize: 14, marginTop: 4, lineHeight: 19 },
  empty: { fontSize: 14, fontStyle: "italic", marginVertical: 10 },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  button: { flex: 1, minWidth: 120, minHeight: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "800" },
  viewerClose: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#111827",
  },
  viewerCloseText: { color: "#fff", fontWeight: "800" },
  ticketSafeArea: { flex: 1, paddingTop: Platform.OS === "android" ? 24 : 0 },
  ticketContent: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
  ticketWrapper: { width: "92%", maxWidth: 560, alignSelf: "center", padding: 16, borderRadius: 20, borderWidth: 1, ...shadow("#000") },
  ticketTopBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  ticketIconButton: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  ticketIconButtonPlaceholder: { width: 40, height: 40 },
  ticketScreenTitle: { fontSize: 15, fontWeight: "800" },
  ticketHeader: { borderRadius: 18, padding: 18, alignItems: "center", marginBottom: 14 },
  ticketLogo: { width: 68, height: 68, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  ticketBrand: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 10 },
  ticketSubtitle: { color: "#EAF6FF", fontWeight: "700", marginTop: 2 },
  ticketMetaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, backgroundColor: tw.colors.slate50, borderRadius: 14, padding: 12 },
  ticketMetaItem: { flex: 1, minWidth: 130 },
  ticketMetaLabel: { color: tw.colors.slate500, fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  ticketMetaValue: { fontSize: 13, fontWeight: "700", marginTop: 3 },
  ticketTableHead: { flexDirection: "row", alignItems: "center", backgroundColor: tw.colors.slate100, borderRadius: 12, padding: 10, marginTop: 12 },
  ticketHeadText: { flex: 1, color: tw.colors.slate500, fontSize: 11, fontWeight: "800", textAlign: "center", textTransform: "uppercase" },
  ticketProductCol: { flex: 2, textAlign: "left" },
  ticketRow: { flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: tw.colors.slate100, paddingVertical: 12 },
  ticketItemName: { fontSize: 14, fontWeight: "800" },
  ticketItemMeta: { color: tw.colors.slate500, fontSize: 12, marginTop: 2 },
  ticketItemQty: { flex: 1, textAlign: "center", fontSize: 14, fontWeight: "700" },
  ticketItemPrice: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: "800" },
  ticketTotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: tw.colors.sky50, borderRadius: 16, padding: 14, marginTop: 14 },
  ticketTotalLabel: { color: tw.colors.slate900, fontSize: 15, fontWeight: "800" },
  ticketTotalHint: { color: tw.colors.slate500, fontSize: 11, marginTop: 2 },
  ticketTotalAmount: { fontSize: 24, fontWeight: "800" },
  ticketFooterBox: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: tw.colors.slate200, borderRadius: 14, padding: 12, marginTop: 14 },
  ticketThanks: { fontSize: 14, fontWeight: "800" },
  ticketFooter: { color: tw.colors.slate500, fontSize: 12, marginTop: 2 },
});

export default DocumentsScreen;
