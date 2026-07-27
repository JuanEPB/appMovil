import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import type { Medicamento } from "../interfaces/interface";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiPharma } from "../api/apiPharma";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { isDemoToken, localDb } from "../data/localDb";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

type InventoryFilter = "Todos" | "Disponible" | "Bajo stock" | "Agotado";


interface MedicineStatus {
  label: Exclude<InventoryFilter, "Todos">;
  color: string;
  backgroundColor: string;
  dotColor: string;
}

interface MedicineCardProps {
  med: Medicamento;
  onRefresh: () => Promise<void>;
}

interface MetaItemProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  accent?: string;
}

const FILTERS: InventoryFilter[] = [
  "Todos",
  "Disponible",
  "Bajo stock",
  "Agotado",
];

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getCategoriaNombre = (categoria: Medicamento["categoria"]) => {
  if (!categoria) return "";

  if (typeof categoria === "string") {
    return categoria;
  }

  return categoria.nombre ?? "";
};

const getStatus = (stockValue: unknown, theme: any): MedicineStatus => {
  const stock = Number(stockValue ?? 0);

  if (stock <= 0) {
    return {
      label: "Agotado",
      color: theme.colors.danger,
      backgroundColor: withOpacity(theme.colors.danger, 0.1),
      dotColor: theme.colors.danger,
    };
  }

  if (stock < 5) {
    return {
      label: "Bajo stock",
      color: theme.colors.warning,
      backgroundColor: withOpacity(theme.colors.warning, 0.12),
      dotColor: theme.colors.warning,
    };
  }

  return {
    label: "Disponible",
    color: theme.colors.success,
    backgroundColor: withOpacity(theme.colors.success, 0.1),
    dotColor: theme.colors.success,
  };
};

const withOpacity = (hex: string, opacity: number) => {
  const normalized = String(hex || "#000000").replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;

  const value = Number.parseInt(expanded, 16);

  if (Number.isNaN(value)) {
    return `rgba(0, 0, 0, ${opacity})`;
  }

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getDaysUntilExpiration = (value?: string) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
};

export const MedicamentosScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);

  const styles = useMemo(
    () => getStyles(theme, layout.isPhone, layout.columns),
    [theme, layout.isPhone, layout.columns],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<InventoryFilter>("Todos");

  const itemsPorPagina = layout.isDesktop ? 9 : 6;

  const fetchMedicamentos = useCallback(async () => {
    try {
      setError(null);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No hay una sesión activa.");
      }

      if (isDemoToken(token)) {
        const data = await localDb.getMedicamentos();
        setMedicamentos(Array.isArray(data) ? data : []);
        return;
      }

      const response = await apiPharma.get("/api/medicamentos/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMedicamentos(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar los medicamentos.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchMedicamentos();
  }, [fetchMedicamentos]);

  useFocusEffect(
    useCallback(() => {
      void fetchMedicamentos();
    }, [fetchMedicamentos]),
  );

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtro]);

  const resumen = useMemo(() => {
    return medicamentos.reduce(
      (accumulator, medicamento) => {
        const status = getStatus(medicamento.stock, theme).label;

        accumulator.total += 1;

        if (status === "Disponible") accumulator.disponibles += 1;
        if (status === "Bajo stock") accumulator.bajoStock += 1;
        if (status === "Agotado") accumulator.agotados += 1;

        return accumulator;
      },
      {
        total: 0,
        disponibles: 0,
        bajoStock: 0,
        agotados: 0,
      },
    );
  }, [medicamentos, theme]);

  const filtradosTodos = useMemo(() => {
    const query = normalizeText(busqueda);

    return medicamentos.filter((medicamento) => {
      const status = getStatus(medicamento.stock, theme).label;

      const matchesFilter = filtro === "Todos" || status === filtro;

      if (!matchesFilter) return false;
      if (!query) return true;

      const searchableText = [
  medicamento.nombre,
  medicamento.lote,
  getCategoriaNombre(medicamento.categoria),
  medicamento.proveedor,
  medicamento.principioActivo,
  medicamento.descripcion,
  medicamento.id,
]
        .filter(Boolean)
        .map(normalizeText)
        .join(" ");

      return searchableText.includes(query);
    });
  }, [medicamentos, busqueda, filtro, theme]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradosTodos.length / itemsPorPagina),
  );

  const inicio = (pagina - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const medicamentosPagina = filtradosTodos.slice(inicio, fin);

  useEffect(() => {
    if (pagina > totalPaginas) {
      setPagina(totalPaginas);
    }
  }, [pagina, totalPaginas]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMedicamentos();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderMenu />

        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackIcon}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>

          <Text style={styles.feedbackTitle}>Cargando medicamentos</Text>

          <Text style={styles.feedbackText}>
            Estamos preparando la información del inventario.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderMenu />

        <View style={styles.feedbackContainer}>
          <View
            style={[
              styles.feedbackIcon,
              {
                backgroundColor: withOpacity(theme.colors.danger, 0.1),
              },
            ]}
          >
            <Feather
              name="alert-triangle"
              size={26}
              color={theme.colors.danger}
            />
          </View>

          <Text style={styles.feedbackTitle}>No pudimos cargar la lista</Text>

          <Text style={styles.feedbackText}>{error}</Text>

          <Pressable
            onPress={() => {
              setLoading(true);
              void fetchMedicamentos();
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Feather name="refresh-cw" size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
          {
            paddingHorizontal: layout.pagePadding,
            paddingBottom: 40,
          },
        ]}
      >
        <Fade delay={40}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowIcon}>
                  <Feather
                    name="package"
                    size={14}
                    color={theme.colors.primary}
                  />
                </View>

                <Text style={styles.eyebrow}>INVENTARIO</Text>
              </View>

              <Text style={styles.title}>Medicamentos</Text>

              <Text style={styles.subtitle}>
                Administra existencias, lotes y fechas de caducidad.
              </Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                onPress={() => void handleRefresh()}
                disabled={refreshing}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                {refreshing ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                ) : (
                  <Feather
                    name="refresh-cw"
                    size={16}
                    color={theme.colors.primary}
                  />
                )}

                {!layout.isPhone && (
                  <Text style={styles.secondaryButtonText}>Actualizar</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("FormMedicament")}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Feather name="plus" size={17} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Nuevo medicamento</Text>
              </Pressable>
            </View>
          </View>
        </Fade>

        <Fade delay={70}>
          <View style={[styles.summaryGrid, { gap: layout.gap }]}>
            <SummaryCard
              label="Registrados"
              value={resumen.total}
              icon="database"
              color={theme.colors.primary}
            />

            <SummaryCard
              label="Disponibles"
              value={resumen.disponibles}
              icon="check-circle"
              color={theme.colors.success}
            />

            <SummaryCard
              label="Bajo stock"
              value={resumen.bajoStock}
              icon="trending-down"
              color={theme.colors.warning}
            />

            <SummaryCard
              label="Agotados"
              value={resumen.agotados}
              icon="alert-circle"
              color={theme.colors.danger}
            />
          </View>
        </Fade>

        <Fade delay={95}>
          <View style={styles.toolbar}>
            <View style={styles.searchWrap}>
              <Feather
                name="search"
                size={18}
                color={theme.colors.textMuted}
              />

              <TextInput
                placeholder="Buscar nombre, lote, categoría o proveedor"
                placeholderTextColor={theme.colors.textMuted}
                value={busqueda}
                onChangeText={setBusqueda}
                style={styles.searchInput}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {busqueda.length > 0 && (
                <Pressable
                  accessibilityLabel="Limpiar búsqueda"
                  onPress={() => setBusqueda("")}
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.iconButtonPressed,
                  ]}
                >
                  <Feather
                    name="x"
                    size={17}
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {FILTERS.map((item) => {
                const isActive = filtro === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setFiltro(item)}
                    style={({ pressed }) => [
                      styles.filterChip,
                      isActive && styles.filterChipActive,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.filterDot,
                        {
                          backgroundColor:
                            item === "Todos"
                              ? theme.colors.primary
                              : getStatus(
                                  item === "Disponible"
                                    ? 10
                                    : item === "Bajo stock"
                                      ? 3
                                      : 0,
                                  theme,
                                ).dotColor,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.resultsBar}>
              <Text style={styles.resultsText}>
                {filtradosTodos.length}{" "}
                {filtradosTodos.length === 1 ? "resultado" : "resultados"}
              </Text>

              <Text style={styles.pageInfo}>
                Página {pagina} de {totalPaginas}
              </Text>
            </View>
          </View>
        </Fade>

        {medicamentosPagina.length > 0 ? (
          <View style={[styles.grid, { gap: layout.gap }]}>
            {medicamentosPagina.map((medicamento, index) => (
              <Fade
                key={String(medicamento.id ?? index)}
                delay={110 + index * 25}
              >
                <MedicineCard
                  med={medicamento}
                  onRefresh={fetchMedicamentos}
                />
              </Fade>
            ))}
          </View>
        ) : (
          <Fade delay={120}>
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather
                  name="search"
                  size={25}
                  color={theme.colors.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>No encontramos resultados</Text>

              <Text style={styles.emptyText}>
                Cambia el término de búsqueda o selecciona otro filtro.
              </Text>

              <Pressable
                onPress={() => {
                  setBusqueda("");
                  setFiltro("Todos");
                }}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Feather
                  name="rotate-ccw"
                  size={15}
                  color={theme.colors.primary}
                />

                <Text style={styles.secondaryButtonText}>Limpiar filtros</Text>
              </Pressable>
            </View>
          </Fade>
        )}

        {filtradosTodos.length > 0 && (
          <View style={styles.pagination}>
            <Pressable
              onPress={() => setPagina((current) => Math.max(1, current - 1))}
              disabled={pagina === 1}
              style={({ pressed }) => [
                styles.pageButton,
                pagina === 1 && styles.disabledButton,
                pressed && pagina !== 1 && styles.buttonPressed,
              ]}
            >
              <Feather
                name="chevron-left"
                size={17}
                color={theme.colors.primary}
              />

              <Text style={styles.pageButtonText}>Anterior</Text>
            </Pressable>

            <View style={styles.pageCounter}>
              <Text style={styles.pageCounterCurrent}>{pagina}</Text>
              <Text style={styles.pageCounterDivider}>/</Text>
              <Text style={styles.pageCounterTotal}>{totalPaginas}</Text>
            </View>

            <Pressable
              onPress={() =>
                setPagina((current) => Math.min(totalPaginas, current + 1))
              }
              disabled={fin >= filtradosTodos.length}
              style={({ pressed }) => [
                styles.pageButton,
                fin >= filtradosTodos.length && styles.disabledButton,
                pressed &&
                  fin < filtradosTodos.length &&
                  styles.buttonPressed,
              ]}
            >
              <Text style={styles.pageButtonText}>Siguiente</Text>

              <Feather
                name="chevron-right"
                size={17}
                color={theme.colors.primary}
              />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, false, 4), [theme]);

  return (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor: withOpacity(color, 0.1),
          },
        ]}
      >
        <Feather name={icon} size={17} color={color} />
      </View>

      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
};

const MedicineCard = ({ med, onRefresh }: MedicineCardProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => getStyles(theme, false, 1), [theme]);
  const status = getStatus(med.stock, theme);
  const stock = Math.max(0, Number(med.stock ?? 0));
  const daysUntilExpiration = getDaysUntilExpiration(med.caducidad);

  const expirationLabel =
    daysUntilExpiration === null
      ? "Sin fecha"
      : daysUntilExpiration < 0
        ? `Caducó hace ${Math.abs(daysUntilExpiration)} días`
        : daysUntilExpiration === 0
          ? "Caduca hoy"
          : `Caduca en ${daysUntilExpiration} días`;

  const expirationColor =
    daysUntilExpiration !== null && daysUntilExpiration <= 30
      ? theme.colors.warning
      : theme.colors.textMuted;

  const stockProgress = Math.min(100, (stock / 20) * 100);

  const adjustStock = async (amount: number) => {
    try {
      await localDb.adjustStock(med.id, amount);
      await onRefresh();
    } catch {
      Alert.alert(
        "No se pudo actualizar",
        "Ocurrió un problema al modificar el stock.",
      );
    }
  };

  const deleteMedicine = () => {
    Alert.alert(
      "Eliminar medicamento",
      `¿Deseas eliminar "${med.nombre || "este medicamento"}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await localDb.deleteMedicamento(med.id);
              await onRefresh();
            } catch {
              Alert.alert(
                "No se pudo eliminar",
                "Ocurrió un problema al eliminar el medicamento.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.medicineCard}>
      <View
        style={[
          styles.cardAccent,
          {
            backgroundColor: status.dotColor,
          },
        ]}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={styles.cardIdentity}>
            <View
              style={[
                styles.medicineIcon,
                {
                  backgroundColor: withOpacity(theme.colors.primary, 0.1),
                },
              ]}
            >
              <Feather
                name="package"
                size={18}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.cardTitleCopy}>
              <Text numberOfLines={2} style={styles.medicineName}>
                {med.nombre || "Medicamento sin nombre"}
              </Text>

              <Text numberOfLines={1} style={styles.categoryText}>
                {getCategoriaNombre(med.categoria) || "Sin categoría"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusTag,
              {
                backgroundColor: status.backgroundColor,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: status.dotColor,
                },
              ]}
            />

            <Text
              style={[
                styles.statusTagText,
                {
                  color: status.color,
                },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.stockSection}>
          <View style={styles.stockHeader}>
            <View>
              <Text style={styles.stockLabel}>Stock actual</Text>

              <View style={styles.stockValueRow}>
                <Text style={styles.stockValue}>{stock}</Text>
                <Text style={styles.stockUnit}>piezas</Text>
              </View>
            </View>

            <View style={styles.expirationSummary}>
              <Feather
                name="calendar"
                size={14}
                color={expirationColor}
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.expirationSummaryText,
                  {
                    color: expirationColor,
                  },
                ]}
              >
                {expirationLabel}
              </Text>
            </View>
          </View>

          <View style={styles.stockTrack}>
            <View
              style={[
                styles.stockFill,
                {
                  width: `${stockProgress}%`,
                  backgroundColor: status.dotColor,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.metaGrid}>
          <MetaItem
            icon="hash"
            label="Lote"
            value={med.lote || "Sin lote"}
          />

          <MetaItem
            icon="calendar"
            label="Caducidad"
            value={formatDate(med.caducidad)}
            accent={expirationColor}
          />

          <MetaItem
            icon="dollar-sign"
            label="Precio"
            value={formatCurrency(med.precio)}
          />
        </View>

        <View style={styles.cardActions}>
          <Pressable
            accessibilityLabel="Editar medicamento"
            onPress={() =>
              navigation.navigate("FormMedicament", {
                medicamento: med,
              })
            }
            style={({ pressed }) => [
              styles.editAction,
              pressed && styles.actionPressed,
            ]}
          >
            <Feather
              name="edit-3"
              size={15}
              color={theme.colors.primary}
            />

            <Text style={styles.editActionText}>Editar</Text>
          </Pressable>

          <View style={styles.stockActions}>
            <Pressable
              accessibilityLabel="Reducir stock"
              onPress={() => void adjustStock(-1)}
              disabled={stock <= 0}
              style={({ pressed }) => [
                styles.iconAction,
                stock <= 0 && styles.disabledButton,
                pressed && stock > 0 && styles.actionPressed,
              ]}
            >
              <Feather
                name="minus"
                size={16}
                color={theme.colors.warning}
              />
            </Pressable>

            <Pressable
              accessibilityLabel="Aumentar stock"
              onPress={() => void adjustStock(1)}
              style={({ pressed }) => [
                styles.iconAction,
                pressed && styles.actionPressed,
              ]}
            >
              <Feather
                name="plus"
                size={16}
                color={theme.colors.success}
              />
            </Pressable>

            <View style={styles.actionDivider} />

            <Pressable
              accessibilityLabel="Eliminar medicamento"
              onPress={deleteMedicine}
              style={({ pressed }) => [
                styles.deleteAction,
                pressed && styles.actionPressed,
              ]}
            >
              <Feather
                name="trash-2"
                size={15}
                color={theme.colors.danger}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const MetaItem = ({ icon, label, value, accent }: MetaItemProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, false, 1), [theme]);

  return (
    <View style={styles.metaItem}>
      <View style={styles.metaLabelRow}>
        <Feather
          name={icon}
          size={13}
          color={accent || theme.colors.textMuted}
        />

        <Text style={styles.metaLabel}>{label}</Text>
      </View>

      <Text numberOfLines={1} style={styles.metaValue}>
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

    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: isPhone ? 16 : 22,
    },

    feedbackContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: theme.colors.background,
    },

    feedbackIcon: {
      width: 62,
      height: 62,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
      ...shadow(theme.colors.cardShadow),
    },

    feedbackTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
    },

    feedbackText: {
      maxWidth: 380,
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      marginTop: 6,
      marginBottom: 18,
    },

    header: {
      flexDirection: isPhone ? "column" : "row",
      alignItems: isPhone ? "stretch" : "center",
      justifyContent: "space-between",
      gap: 18,
      marginBottom: 18,
    },

    headerCopy: {
      flex: 1,
    },

    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 7,
    },

    eyebrowIcon: {
      width: 26,
      height: 26,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 7,
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
    },

    eyebrow: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.15,
    },

    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 29 : 36,
      fontWeight: "700",
      letterSpacing: -0.5,
    },

    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 5,
    },

    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    primaryButton: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 16,
      borderRadius: 7,
      backgroundColor: theme.colors.primary,
    },

    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "600",
    },

    secondaryButton: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingHorizontal: 14,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },

    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },

    buttonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.985 }],
    },

    iconButtonPressed: {
      backgroundColor: theme.colors.background,
    },

    chipPressed: {
      opacity: 0.75,
    },

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 18,
    },

    summaryCard: {
      flexGrow: 1,
      flexBasis: isPhone ? "47%" : "22%",
      minWidth: isPhone ? 145 : 185,
      minHeight: 82,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      padding: 13,
      borderRadius: 9,
      borderWidth: 1,
      borderLeftWidth: 3,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },

    summaryIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
    },

    summaryCopy: {
      flex: 1,
    },

    summaryLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "600",
    },

    summaryValue: {
      fontSize: 22,
      fontWeight: "700",
      marginTop: 2,
    },

    toolbar: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: isPhone ? 12 : 14,
      marginBottom: 18,
      ...shadow(theme.colors.cardShadow),
    },

    searchWrap: {
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
    },

    searchInput: {
      flex: 1,
      minWidth: 0,
      color: theme.colors.text,
      fontSize: 14,
      paddingVertical: 11,
    },

    clearButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 6,
    },

    filters: {
      gap: 8,
      paddingTop: 12,
      paddingBottom: 2,
    },

    filterChip: {
      minHeight: 34,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 11,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },

    filterChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: withOpacity(theme.colors.primary, 0.08),
    },

    filterDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    filterChipText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
    },

    filterChipTextActive: {
      color: theme.colors.primary,
    },

    resultsBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingTop: 12,
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    resultsText: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "600",
    },

    pageInfo: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
    },

    medicineCard: {
      width: columns === 1 ? "100%" : `${100 / columns - 1.5}%`,
      position: "relative",
      overflow: "hidden",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      ...shadow(theme.colors.cardShadow),
    },

    cardAccent: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: 3,
    },

    cardContent: {
      padding: 15,
      paddingLeft: 17,
    },

    cardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 15,
    },

    cardIdentity: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    medicineIcon: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
    },

    cardTitleCopy: {
      flex: 1,
      minWidth: 0,
    },

    medicineName: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 21,
    },

    categoryText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginTop: 3,
      textTransform: "capitalize",
    },

    statusTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 999,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    statusTagText: {
      fontSize: 10,
      fontWeight: "700",
    },

    stockSection: {
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      padding: 12,
      marginBottom: 13,
    },

    stockHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 10,
    },

    stockLabel: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    stockValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 5,
      marginTop: 2,
    },

    stockValue: {
      color: theme.colors.text,
      fontSize: 23,
      fontWeight: "700",
    },

    stockUnit: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "500",
    },

    expirationSummary: {
      maxWidth: "53%",
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingTop: 3,
    },

    expirationSummaryText: {
      flexShrink: 1,
      fontSize: 11,
      fontWeight: "600",
      textAlign: "right",
    },

    stockTrack: {
      height: 6,
      overflow: "hidden",
      borderRadius: 999,
      backgroundColor: theme.colors.border,
    },

    stockFill: {
      height: "100%",
      borderRadius: 999,
    },

    metaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    metaItem: {
      flexGrow: 1,
      flexBasis: "29%",
      minWidth: 90,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 10,
    },

    metaLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    metaLabel: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.35,
    },

    metaValue: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "600",
      marginTop: 6,
    },

    cardActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    editAction: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingHorizontal: 12,
      borderRadius: 7,
      backgroundColor: withOpacity(theme.colors.primary, 0.08),
    },

    editActionText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "600",
    },

    stockActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    iconAction: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },

    actionDivider: {
      width: 1,
      height: 24,
      backgroundColor: theme.colors.border,
      marginHorizontal: 2,
    },

    deleteAction: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 7,
      backgroundColor: withOpacity(theme.colors.danger, 0.08),
    },

    actionPressed: {
      opacity: 0.72,
      transform: [{ scale: 0.96 }],
    },

    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 28,
      ...shadow(theme.colors.cardShadow),
    },

    emptyIcon: {
      width: 54,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
      marginBottom: 13,
    },

    emptyTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "700",
    },

    emptyText: {
      maxWidth: 380,
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginTop: 5,
      marginBottom: 16,
    },

    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginTop: 20,
    },

    pageButton: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 14,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },

    pageButtonText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "600",
    },

    pageCounter: {
      minWidth: 70,
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      borderRadius: 7,
      backgroundColor: theme.colors.background,
    },

    pageCounterCurrent: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },

    pageCounterDivider: {
      color: theme.colors.textMuted,
      fontSize: 13,
    },

    pageCounterTotal: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },

    disabledButton: {
      opacity: 0.4,
    },
  });

export default MedicamentosScreen;
