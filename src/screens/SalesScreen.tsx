import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderMenu } from "../components/HeaderMenu";
import { SuccessModal } from "../components/SuccessModal";
import { useTheme } from "../context/ThemeContext";
import { isDemoToken, localDb } from "../data/localDb";
import { Medicamento } from "../interfaces/interface";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";
import { tw } from "../themes/tailwindTokens";

type Cart = Record<number, number>;

export const SalesScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const load = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    if (isDemoToken(token)) setMedicamentos(await localDb.getMedicamentos());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const items = medicamentos.filter((med) => (cart[med.id] || 0) > 0);
  const total = items.reduce((sum, med) => sum + (cart[med.id] || 0) * Number(med.precio || 0), 0);

  const updateQty = (id: number, amount: number) => {
    const med = medicamentos.find((item) => item.id === id);
    if (!med) return;
    setCart((prev) => {
      const next = Math.max(0, Math.min(med.stock, (prev[id] || 0) + amount));
      return { ...prev, [id]: next };
    });
  };

  const submit = async () => {
    if (!items.length) return;
    setSaving(true);
    await localDb.createVenta(items.map((med) => ({ medicamentoId: med.id, cantidad: cart[med.id] })));
    setCart({});
    await load();
    setSaving(false);
    setSuccess(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderMenu />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          webMaxWidthStyle(width),
          { paddingHorizontal: layout.pagePadding },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Punto de venta</Text>
            <Text style={styles.title}>Registrar venta</Text>
            <Text style={styles.subtitle}>Selecciona productos, calcula total y descuenta stock local.</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={[styles.grid, { gap: layout.gap }]}>
          <View style={styles.productsPanel}>
            <Text style={styles.sectionTitle}>Medicamentos disponibles</Text>
            {medicamentos.map((med) => {
              const qty = cart[med.id] || 0;
              return (
                <View key={med.id} style={styles.productRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={styles.productName}>{med.nombre}</Text>
                    <Text style={styles.productMeta}>Stock {med.stock} - ${Number(med.precio || 0).toFixed(2)}</Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity style={styles.stepButton} onPress={() => updateQty(med.id, -1)}>
                      <Feather name="minus" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.qty}>{qty}</Text>
                    <TouchableOpacity
                      style={[styles.stepButton, med.stock <= 0 && { opacity: 0.4 }]}
                      onPress={() => updateQty(med.id, 1)}
                      disabled={med.stock <= 0}
                    >
                      <Feather name="plus" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.ticketPanel}>
            <Text style={styles.sectionTitle}>Resumen</Text>
            {items.length ? (
              items.map((med) => (
                <View key={med.id} style={styles.cartRow}>
                  <Text style={styles.cartName}>{med.nombre}</Text>
                  <Text style={styles.cartAmount}>
                    {cart[med.id]} x ${Number(med.precio || 0).toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyBox}>
                <Feather name="shopping-cart" size={28} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Agrega productos para iniciar la venta.</Text>
              </View>
            )}

            <View style={styles.totalLine}>
              <Text style={styles.totalLineLabel}>Total a cobrar</Text>
              <Text style={styles.totalLineValue}>${total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, (!items.length || saving) && { opacity: 0.55 }]}
              onPress={submit}
              disabled={!items.length || saving}
            >
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.submitText}>{saving ? "Guardando..." : "Finalizar venta"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <SuccessModal
        visible={success}
        title="Venta registrada"
        message="El stock se actualizo y el ticket quedo disponible en documentos."
        onRequestClose={() => setSuccess(false)}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
    content: { width: "100%", alignSelf: "center", paddingTop: 18, paddingBottom: 36 },
    header: { flexDirection: isPhone ? "column" : "row", justifyContent: "space-between", gap: 14, marginBottom: 16 },
    eyebrow: { color: theme.colors.primary, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
    title: { color: theme.colors.text, fontSize: isPhone ? 28 : 34, fontWeight: "800", marginTop: 4 },
    subtitle: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 21, marginTop: 5 },
    totalCard: { minWidth: 180, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, padding: 16, ...shadow(theme.colors.cardShadow) },
    totalLabel: { color: theme.colors.textMuted, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
    totalValue: { color: theme.colors.primary, fontSize: 30, fontWeight: "800", marginTop: 4 },
    grid: { flexDirection: isPhone ? "column" : "row", alignItems: "flex-start" },
    productsPanel: { flex: 1.4, width: "100%", backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, padding: 16, ...shadow(theme.colors.cardShadow) },
    ticketPanel: { flex: 1, width: "100%", backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, padding: 16, ...shadow(theme.colors.cardShadow) },
    sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", marginBottom: 12 },
    productRow: { flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: 12 },
    productName: { color: theme.colors.text, fontSize: 15, fontWeight: "800" },
    productMeta: { color: theme.colors.textMuted, marginTop: 3, fontSize: 13 },
    stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
    stepButton: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
    qty: { color: theme.colors.text, minWidth: 22, textAlign: "center", fontWeight: "800" },
    cartRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    cartName: { flex: 1, color: theme.colors.text, fontWeight: "700" },
    cartAmount: { color: theme.colors.textMuted, fontWeight: "700" },
    emptyBox: { alignItems: "center", justifyContent: "center", minHeight: 140, borderRadius: 14, backgroundColor: theme.colors.background, padding: 18 },
    emptyText: { color: theme.colors.textMuted, textAlign: "center", marginTop: 8 },
    totalLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: tw.colors.sky50, borderRadius: 14, padding: 14, marginTop: 14 },
    totalLineLabel: { color: tw.colors.slate700, fontWeight: "800" },
    totalLineValue: { color: tw.colors.blue600, fontSize: 22, fontWeight: "800" },
    submitButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: theme.colors.primary, borderRadius: 12, marginTop: 14 },
    submitText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  });

export default SalesScreen;
