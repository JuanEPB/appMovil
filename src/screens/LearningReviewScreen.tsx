import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getLearningEvents,
  reviewLearningEvent,
} from "../api/apiNeural";
import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

type LearningEvent = {
  id: string;
  timestamp?: string;
  mensaje?: string;
  respuesta?: string;
  intencion?: string;
  intencion_detectada?: string;
  util?: boolean;
  correccion?: string;
  estado?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const LearningReviewScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);

  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await getLearningEvents("pendiente_revision", 100);
      setEvents(Array.isArray(data?.eventos) ? data.eventos : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar los aprendizajes.",
      );
    } finally {
      setLoading(false);
      setReviewingId(null);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const review = async (
    eventId: string,
    estado: "aprobado_para_entrenamiento" | "rechazado",
  ) => {
    try {
      setReviewingId(eventId);
      await reviewLearningEvent(eventId, estado);
      setEvents((current) => current.filter((event) => event.id !== eventId));
    } catch {
      setError("No se pudo actualizar el aprendizaje.");
    } finally {
      setReviewingId(null);
    }
  };

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
          <View style={styles.headerIcon}>
            <Feather name="check-square" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>APRENDIZAJE IA</Text>
            <Text style={styles.title}>Revisión</Text>
            <Text style={styles.subtitle}>
              Aprueba ejemplos útiles antes de usarlos para mejorar futuras respuestas.
            </Text>
          </View>
          <Pressable
            onPress={loadEvents}
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
          >
            <Feather name="refresh-cw" size={16} color={theme.colors.primary} />
          </Pressable>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryValue}>{events.length}</Text>
          <Text style={styles.summaryLabel}>pendientes de revisión</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.centerText}>Cargando aprendizajes...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Feather name="alert-triangle" size={22} color={theme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="thumbs-up" size={28} color={theme.colors.success} />
            <Text style={styles.emptyTitle}>Sin pendientes</Text>
            <Text style={styles.emptyText}>
              Cuando alguien marque una respuesta como no útil o haya baja confianza, aparecerá aquí.
            </Text>
          </View>
        ) : (
          <View style={[styles.grid, { gap: layout.gap }]}>
            {events.map((event) => (
              <View key={event.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.intentBadge}>
                    <Text style={styles.intentText}>
                      {event.intencion || event.intencion_detectada || "sin_intencion"}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(event.timestamp)}</Text>
                </View>

                <Text style={styles.label}>Mensaje</Text>
                <Text style={styles.mainText}>{event.mensaje || "Sin mensaje"}</Text>

                {!!event.respuesta && (
                  <>
                    <Text style={styles.label}>Respuesta IA</Text>
                    <Text style={styles.secondaryText}>{event.respuesta}</Text>
                  </>
                )}

                {!!event.correccion && (
                  <>
                    <Text style={styles.label}>Corrección</Text>
                    <Text style={styles.secondaryText}>{event.correccion}</Text>
                  </>
                )}

                <View style={styles.actions}>
                  <Pressable
                    disabled={reviewingId === event.id}
                    onPress={() => review(event.id, "aprobado_para_entrenamiento")}
                    style={({ pressed }) => [
                      styles.approveButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Feather name="check" size={15} color="#FFFFFF" />
                    <Text style={styles.actionText}>Aprobar</Text>
                  </Pressable>

                  <Pressable
                    disabled={reviewingId === event.id}
                    onPress={() => review(event.id, "rechazado")}
                    style={({ pressed }) => [
                      styles.rejectButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Feather name="x" size={15} color={theme.colors.danger} />
                    <Text style={styles.rejectText}>Rechazar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: isPhone ? 16 : 22,
      paddingBottom: 36,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
    },
    headerIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    headerCopy: { flex: 1, minWidth: 0 },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      marginBottom: 5,
    },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 30 : 36,
      fontWeight: "700",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 4,
    },
    refreshButton: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    summary: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
      marginBottom: 16,
      ...shadow(theme.colors.cardShadow),
    },
    summaryValue: {
      color: theme.colors.primary,
      fontSize: 28,
      fontWeight: "800",
    },
    summaryLabel: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    center: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 220,
    },
    centerText: {
      color: theme.colors.textMuted,
      marginTop: 10,
      fontWeight: "600",
    },
    errorCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
    },
    errorText: {
      flex: 1,
      color: theme.colors.danger,
      fontSize: 13,
      lineHeight: 19,
    },
    empty: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 24,
      ...shadow(theme.colors.cardShadow),
    },
    emptyTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 10,
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginTop: 5,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
    },
    card: {
      flexGrow: 1,
      flexBasis: isPhone ? "100%" : "47%",
      minWidth: isPhone ? "100%" : 320,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 15,
      ...shadow(theme.colors.cardShadow),
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12,
    },
    intentBadge: {
      flex: 1,
      minHeight: 28,
      justifyContent: "center",
      borderRadius: 999,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 10,
    },
    intentText: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "700",
    },
    dateText: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "600",
    },
    label: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 3,
      textTransform: "uppercase",
    },
    mainText: {
      color: theme.colors.text,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "700",
    },
    secondaryText: {
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    approveButton: {
      flex: 1,
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      borderRadius: 8,
      backgroundColor: theme.colors.success,
    },
    rejectButton: {
      flex: 1,
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
    rejectText: {
      color: theme.colors.danger,
      fontSize: 13,
      fontWeight: "700",
    },
    pressed: { opacity: 0.78 },
  });

export default LearningReviewScreen;
