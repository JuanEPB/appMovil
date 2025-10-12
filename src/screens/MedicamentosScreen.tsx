import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPharma } from "../api/apiPharma";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import { HeaderMenu } from "../components/HeaderMenu";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const H = Dimensions.get("window").height ;
const W = Dimensions.get("window").width;

export const MedicamentosScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const itemsPorPagina = 6;

  const styles = useMemo(() => getStyles(theme), [theme]);

  const fetchMedicamentos = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No hay token");
      const res = await apiPharma.get("/api/medicamentos/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicamentos(res.data || []);
    } catch (e: any) {
      setError("No se pudieron cargar los medicamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicamentos(); }, []);
  useFocusEffect(React.useCallback(() => { fetchMedicamentos(); }, []));

  const inicio = (pagina - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const medicamentosPagina = medicamentos.slice(inicio, fin);
  const filtrados = medicamentosPagina.filter((m:any) =>
    (m?.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const siguiente = () => fin < medicamentos.length && setPagina(p => p + 1);
  const anterior = () => pagina > 1 && setPagina(p => p - 1);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: theme.colors.danger }}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { height: H }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ height: H, width: W }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <HeaderMenu/>
       <Fade delay={50}>
            <LinearGradient
              colors={[theme.colors.primary, "#5AB4F8"]}
              style={styles.header}
            >

              <Text style={styles.headerTitle}>Mis Medicamentos</Text>
              <Text style={styles.subtitle}> Administra y gestiona tus medicamentos</Text>
            </LinearGradient>
          </Fade>
        <Fade delay={150}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate("FormMedicament" as never)}
            activeOpacity={0.9}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Agregar Medicamento</Text>
          </TouchableOpacity>
        </Fade>

        <Fade delay={200}>
          <TextInput
            placeholder="Buscar medicamento..."
            placeholderTextColor={theme.colors.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
            style={styles.searchBox}
          />
        </Fade>

        {filtrados.map((med: any, i: number) => (
          <Fade key={i} delay={220 + i * 40}>
            <View style={styles.medicineCard}>
              <View>
                <Text style={styles.medicineName}>{med.nombre}</Text>
                <Text style={styles.medicineInfo}>
                  Lote: {med.lote} | Stock: {med.stock}
                </Text>
                <Text style={styles.medicineInfo}>
                  Caducidad: {med.caducidad ? new Date(med.caducidad).toLocaleDateString() : "-"}
                </Text>
              </View>
              <Text
                style={[
                  styles.statusTag,
                  {
                    backgroundColor:
                      med.stock === 0 ? "#FFCDD2" : med.stock < 5 ? "#FFF8E1" : "#C8E6C9",
                    color: med.stock === 0 ? "#C62828" : med.stock < 5 ? "#F57F17" : "#2E7D32",
                  },
                ]}
              >
                {med.stock === 0 ? "Agotado" : med.stock < 5 ? "Bajo Stock" : "Disponible"}
              </Text>
            </View>
          </Fade>
        ))}

        <Fade delay={200}>
          <View style={styles.pagination}>
            <TouchableOpacity onPress={anterior} disabled={pagina === 1}>
              <Text style={[styles.pageButton, pagina === 1 && { opacity: 0.5 }]}>◀ Anterior</Text>
            </TouchableOpacity>
            <Text style={{ color: theme.colors.text }}>
              Página {pagina} de {Math.ceil(medicamentos.length / itemsPorPagina) || 1}
            </Text>
            <TouchableOpacity onPress={siguiente} disabled={fin >= medicamentos.length}>
              <Text style={[styles.pageButton, fin >= medicamentos.length && { opacity: 0.5 }]}>
                Siguiente ▶
              </Text>
            </TouchableOpacity>
          </View>
        </Fade>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.colors.primary,
      marginTop: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    addButton: {
      alignSelf: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 14,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    searchBox: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
      marginHorizontal: 16,
    },
    medicineCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 14,
      marginVertical: 6,
      marginHorizontal: 12,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    medicineName: { fontWeight: "700", color: theme.colors.text, fontSize: 15 },
    medicineInfo: { color: theme.colors.textMuted, fontSize: 12 },
    statusTag: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 10,
      fontSize: 12,
      fontWeight: "700",
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      marginBottom: 36,
      paddingHorizontal: 16,
    },
    pageButton: { color: theme.colors.primary, fontWeight: "700" },
        header: {
      width: "100%",
      height: 120,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: 12,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 3,
      position: "relative",
    },
    backButton: {
      position: "absolute",
      top: 10,
      left: 20,
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      padding: 8,
      borderRadius: 10,
      shadowColor: "#ffffffff",
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 4,
    },
    headerTitle: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 20,
    },
  });
