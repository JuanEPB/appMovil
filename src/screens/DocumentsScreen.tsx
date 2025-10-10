import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import { useDocuments } from "../hooks/useDocumentosHook";
import { useTheme } from "../context/ThemeContext";
import { WebView } from "react-native-webview";

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
    downloadFile,
    closeViewer,
  } = useDocuments();

  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);

  // 🧾 Mostrar ticket de venta simulado
  const renderTicket = (venta: any) => (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={styles.ticketTitle}>🧾 Ticket de Venta</Text>
      <Text style={styles.ticketText}>ID Venta: {venta.id}</Text>
      <Text style={styles.ticketText}>
        Cliente: {venta.usuario?.nombre} {venta.usuario?.apellido}
      </Text>
      <Text style={styles.ticketText}>
        Fecha: {new Date(venta.fecha).toLocaleString()}
      </Text>
      <View style={styles.ticketDivider} />

      <Text style={[styles.ticketText, { fontWeight: "700" }]}>Detalles:</Text>
      {venta.detalles.map((item: any, index: number) => (
        <View key={index} style={styles.ticketItem}>
          <Text style={styles.ticketText}>
            {item.medicamento.nombre} ({item.cantidad}x)
          </Text>
          <Text style={styles.ticketText}>${item.precioUnitario}</Text>
        </View>
      ))}

      <View style={styles.ticketDivider} />
      <Text style={[styles.ticketText, { fontSize: 18, fontWeight: "bold" }]}>
        Total: ${venta.total}
      </Text>

      <Text style={[styles.ticketFooter]}>
        Gracias por su compra 💊 PharmaControl
      </Text>

      <Button title="Cerrar Ticket" onPress={() => setSelectedVenta(null)} />
    </ScrollView>
  );

  // 🧾 Si se está visualizando ticket
  if (selectedVenta) {
    return renderTicket(selectedVenta);
  }

  // 🧾 Si se está visualizando archivo PDF o IA
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
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>
          Cargando documentos...
        </Text>
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

  // 📄 Mostrar listas
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>📂 Documentos</Text>

      {/* 🧾 Ventas */}
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Ventas Registradas</Text>
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
                onPress={() => setSelectedVenta(v._id)} // 👁️ Visualizar ticket
              >
                <Text style={styles.buttonText}>👁️ Visualizar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.success }]}
                onPress={() => downloadFile(v._id?.toString(), `venta_${v._id}.json`)} // 💾 Guardar
              >
                <Text style={styles.buttonText}>💾 Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={[styles.empty, { color: theme.colors.textMuted }]}>
          No hay ventas registradas.
        </Text>
      )}

      {/* 🤖 Reportes de IA */}
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Reportes de IA</Text>
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
                onPress={() => downloadAndOpenFile(r._id, r.filename)} // 👁️ Visualizar PDF
              >
                <Text style={styles.buttonText}>👁️ Visualizar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.success }]}
                onPress={() => downloadFile(r._id, r.filename)} // 💾 Guardar PDF
              >
                <Text style={styles.buttonText}>💾 Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={[styles.empty, { color: theme.colors.textMuted }]}>
          No hay reportes IA generados.
        </Text>
      )}

      {/* 📄 Otros Documentos */}
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Otros Documentos</Text>
      {otros.map((r) => (
        <View key={r._id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{r.filename}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => downloadAndOpenFile(r._id, r.filename)}
            >
              <Text style={styles.buttonText}>👁️ Visualizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.success }]}
              onPress={() => downloadFile(r._id, r.filename)}
            >
              <Text style={styles.buttonText}>💾 Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  card: {
    borderRadius: 12,
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

  // 🎟️ Ticket Styles
  ticketTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  ticketText: { fontSize: 16, marginVertical: 2, color: "#333" },
  ticketItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.3,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },
  ticketDivider: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginVertical: 10 },
  ticketFooter: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
    fontSize: 13,
    fontStyle: "italic",
  },
});
