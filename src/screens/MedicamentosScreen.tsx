import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiPharma } from "../api/apiPharma";
import { useTheme } from "../context/ThemeContext";
import { HeaderMenu } from "../components/HeaderMenu";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

export const MedicamentosScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone, layout.columns), [
    theme,
    layout.isPhone,
    layout.columns,
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const itemsPorPagina = layout.isDesktop ? 9 : 6;

  const fetchMedicamentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No hay token");
      const res = await apiPharma.get("/api/medicamentos/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicamentos(res.data || []);
    } catch {
      setError("No se pudieron cargar los medicamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicamentos();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMedicamentos();
    }, [])
  );

  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  const filtradosTodos = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return medicamentos;
    return medicamentos.filter((m: any) =>
      [m?.nombre, m?.lote, m?.categoria, m?.proveedor, m?.principioActivo, m?.descripcion, m?.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [medicamentos, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtradosTodos.length / itemsPorPagina));
  const inicio = (pagina - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const medicamentosPagina = filtradosTodos.slice(inicio, fin);

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  if (loading || error) {
    return (
      <View style={styles.center}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <Text style={{ color: theme.colors.danger }}>{error}</Text>
        )}
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
          { paddingHorizontal: layout.pagePadding, paddingBottom: 36 },
        ]}
      >
        <Fade delay={50}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Mis medicamentos</Text>
              <Text style={styles.subtitle}>Administra existencias, lotes y caducidades.</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("FormMedicament" as never)}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </Fade>

        <Fade delay={100}>
          <View style={styles.searchWrap}>
            <Feather name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              placeholder="Buscar por nombre, lote, categoria o proveedor"
              placeholderTextColor={theme.colors.textMuted}
              value={busqueda}
              onChangeText={setBusqueda}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda("")} style={styles.clearButton}>
                <Feather name="x" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.resultsText}>
            {filtradosTodos.length} resultados - pagina {pagina} de {totalPaginas}
          </Text>
        </Fade>

        <View style={[styles.grid, { gap: layout.gap }]}>
          {medicamentosPagina.map((med: any, index: number) => (
            <Fade key={med?.id ?? index} delay={120 + index * 25}>
              <MedicineCard med={med} />
            </Fade>
          ))}
        </View>

        {medicamentosPagina.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>Prueba con otro nombre, lote o proveedor.</Text>
          </View>
        )}

        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            style={[styles.pageButton, pagina === 1 && styles.disabledButton]}
          >
            <Feather name="chevron-left" size={18} color={theme.colors.primary} />
            <Text style={styles.pageButtonText}>Anterior</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={fin >= filtradosTodos.length}
            style={[styles.pageButton, fin >= filtradosTodos.length && styles.disabledButton]}
          >
            <Text style={styles.pageButtonText}>Siguiente</Text>
            <Feather name="chevron-right" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MedicineCard = ({ med }: { med: any }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme, false, 1);
  const status =
    Number(med.stock) === 0
      ? { label: "Agotado", bg: "#FDE2E2", color: "#991B1B" }
      : Number(med.stock) < 5
      ? { label: "Bajo stock", bg: "#FEF3C7", color: "#92400E" }
      : { label: "Disponible", bg: "#DFF7EA", color: "#166534" };

  return (
    <View style={styles.medicineCard}>
      <View style={styles.cardTop}>
        <Text numberOfLines={2} style={styles.medicineName}>
          {med.nombre || "Medicamento"}
        </Text>
        <Text style={[styles.statusTag, { backgroundColor: status.bg, color: status.color }]}>
          {status.label}
        </Text>
      </View>
      <View style={styles.metaGrid}>
        <Meta label="Lote" value={med.lote || "-"} />
        <Meta label="Stock" value={String(med.stock ?? "-")} />
        <Meta
          label="Caducidad"
          value={med.caducidad ? new Date(med.caducidad).toLocaleDateString() : "-"}
        />
      </View>
    </View>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => {
  const { theme } = useTheme();
  return (
    <View>
      <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
};

const getStyles = (theme: any, isPhone: boolean, columns: number) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: 18,
    },
    header: {
      flexDirection: isPhone ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isPhone ? "stretch" : "center",
      gap: 14,
      marginBottom: 16,
    },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 28 : 34,
      fontWeight: "800",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 21,
      marginTop: 5,
    },
    addButton: {
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingHorizontal: 18,
      gap: 8,
    },
    addButtonText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 15,
    },
    searchWrap: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 14,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 15,
      paddingVertical: 12,
      minWidth: 0,
    },
    clearButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    resultsText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginTop: 8,
      marginBottom: 14,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    medicineCard: {
      width: columns === 1 ? "100%" : `${100 / columns - 1.5}%`,
      minHeight: 142,
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      ...shadow(theme.colors.cardShadow),
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 16,
    },
    medicineName: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "800",
      lineHeight: 22,
    },
    statusTag: {
      overflow: "hidden",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontSize: 12,
      fontWeight: "800",
    },
    metaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 12,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 24,
    },
    emptyTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      marginTop: 4,
      textAlign: "center",
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginTop: 20,
    },
    pageButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingHorizontal: 14,
      flex: 1,
    },
    disabledButton: {
      opacity: 0.45,
    },
    pageButtonText: {
      color: theme.colors.primary,
      fontWeight: "800",
      fontSize: 14,
    },
  });

export default MedicamentosScreen;
