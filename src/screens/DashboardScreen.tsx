import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { appTheme } from "../themes/appTheme";
import { SafeAreaView } from "react-native-safe-area-context";

export const DashboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <Text style={styles.title}>Dashboard</Text>

      <View style={[styles.card, { borderLeftColor: appTheme.colors.primary }]}>
        <Text style={styles.cardTitle}>Medicamentos en stock</Text>
        <Text style={styles.cardValue}>1250</Text>
      </View>

      <View style={[styles.card, { borderLeftColor: appTheme.colors.warning }]}>
        <Text style={styles.cardTitle}>Por caducar</Text>
        <Text style={styles.cardValue}>12</Text>
      </View>

      <View style={[styles.card, { borderLeftColor: appTheme.colors.danger }]}>
        <Text style={styles.cardTitle}>Stock crítico</Text>
        <Text style={styles.cardValue}>8</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: appTheme.colors.text },
  card: {
    backgroundColor: appTheme.colors.card,
    padding: 20,
    borderRadius: appTheme.radius.md,
    marginBottom: 16,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, color: appTheme.colors.muted },
  cardValue: { fontSize: 22, fontWeight: "bold", color: appTheme.colors.text, marginTop: 4 },
});
