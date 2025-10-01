import React from "react";
import { View, Text, StyleSheet } from "react-native";
import WebView  from "react-native-webview";

export const DocumentsScreen = () => {
  // URL de prueba (puedes poner tu endpoint o archivo generado por NestJS/FastAPI)
  const pdfUrl = "http://www.africau.edu/images/default/sample.pdf";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documentos</Text>
      <WebView
        source={{ uri: pdfUrl }}
        style={styles.webview}
        startInLoadingState
        renderError={(errorName) => (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>No se pudo cargar el PDF</Text>
            <Text style={styles.errorText}>{errorName}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "#2c3e50",
  },
  webview: { flex: 1, marginHorizontal: 10, borderRadius: 10 },
  errorBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontWeight: "bold" },
});
