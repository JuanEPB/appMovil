import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { scheduleNotification } from "../utils/notifications";
import { getReminders, saveReminder } from "../utils/storage";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

type Reminder = {
  id: string;
  title: string;
  body: string;
  date: string;
};

export const CalendarScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);

  const styles = useMemo(
    () => getStyles(theme, layout.isPhone),
    [theme, layout.isPhone],
  );

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const loadReminders = async () => {
    const storedReminders = await getReminders();

    const orderedReminders = [...storedReminders].sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    setReminders(orderedReminders);
  };

  useEffect(() => {
    void loadReminders();
  }, []);

  const addReminder = async () => {
    try {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: "Revisión de inventario",
        body: "Verifica existencias, lotes y fechas de caducidad.",
        date: date.toISOString(),
      };

      await scheduleNotification(
        reminder.title,
        reminder.body,
        date,
      );

      await saveReminder(reminder);
      await loadReminders();

      Alert.alert(
        "Recordatorio programado",
        "La notificación se guardó correctamente.",
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        "No se pudo programar",
        "Revisa los permisos de notificaciones e inténtalo nuevamente.",
      );
    }
  };

  const formattedDate = date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderMenu />

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          webMaxWidthStyle(width),
          {
            paddingHorizontal: layout.pagePadding,
          },
        ]}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>
                  ORGANIZACIÓN
                </Text>

                <Text style={styles.title}>
                  Calendario
                </Text>

                <Text style={styles.subtitle}>
                  Programa revisiones de inventario y recibe alertas
                  en el momento indicado.
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <Feather
                  name="calendar"
                  size={22}
                  color={theme.colors.primary}
                />
              </View>
            </View>

            <View style={styles.schedulerCard}>
              <View style={styles.schedulerHeader}>
                <View>
                  <Text style={styles.cardEyebrow}>
                    NUEVO RECORDATORIO
                  </Text>

                  <Text style={styles.cardTitle}>
                    Revisión de inventario
                  </Text>

                  <Text style={styles.cardDescription}>
                    Selecciona la fecha y hora para recibir la alerta.
                  </Text>
                </View>

                <View style={styles.bellBadge}>
                  <Feather
                    name="bell"
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.dateSelector}
                onPress={() => setShowPicker(true)}
              >
                <View style={styles.dateIcon}>
                  <Feather
                    name="calendar"
                    size={19}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.dateInformation}>
                  <Text style={styles.dateLabel}>
                    Fecha seleccionada
                  </Text>

                  <Text
                    style={styles.dateValue}
                    numberOfLines={1}
                  >
                    {formattedDate}
                  </Text>

                  <View style={styles.timeRow}>
                    <Feather
                      name="clock"
                      size={13}
                      color={theme.colors.textMuted}
                    />

                    <Text style={styles.timeValue}>
                      {formattedTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.editDateButton}>
                  <Feather
                    name="edit-3"
                    size={16}
                    color={theme.colors.primary}
                  />
                </View>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  display={
                    Platform.OS === "ios"
                      ? "spinner"
                      : "default"
                  }
                  minimumDate={new Date()}
                  onChange={(_, selectedDate) => {
                    if (Platform.OS !== "ios") {
                      setShowPicker(false);
                    }

                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              )}

              <View style={styles.schedulerFooter}>
                <View style={styles.notificationInfo}>
                  <Feather
                    name="info"
                    size={14}
                    color={theme.colors.textMuted}
                  />

                  <Text style={styles.notificationText}>
                    Recibirás una notificación en tu dispositivo.
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.addButton}
                  onPress={addReminder}
                >
                  <Feather
                    name="bell"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text style={styles.addButtonText}>
                    Programar
                  </Text>

                  <Feather
                    name="arrow-right"
                    size={17}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  AGENDA
                </Text>

                <Text style={styles.sectionTitle}>
                  Próximos recordatorios
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {reminders.length}
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather
                name="calendar"
                size={28}
                color={theme.colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Sin recordatorios programados
            </Text>

            <Text style={styles.emptyText}>
              Selecciona una fecha y programa tu primera revisión
              de inventario.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const reminderDate = new Date(item.date);

          const itemDate = reminderDate.toLocaleDateString(
            "es-MX",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            },
          );

          const itemTime = reminderDate.toLocaleTimeString(
            "es-MX",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          );

          return (
            <View style={styles.reminderCard}>
              <View style={styles.timelineColumn}>
                <View style={styles.reminderIcon}>
                  <Feather
                    name="clock"
                    size={17}
                    color={theme.colors.primary}
                  />
                </View>

                {index < reminders.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.reminderContent}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderTextContent}>
                    <Text style={styles.reminderTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.reminderBody}>
                      {item.body}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />

                    <Text style={styles.statusText}>
                      Programado
                    </Text>
                  </View>
                </View>

                <View style={styles.reminderMeta}>
                  <View style={styles.metaItem}>
                    <Feather
                      name="calendar"
                      size={13}
                      color={theme.colors.textMuted}
                    />

                    <Text style={styles.metaText}>
                      {itemDate}
                    </Text>
                  </View>

                  <View style={styles.metaDivider} />

                  <View style={styles.metaItem}>
                    <Feather
                      name="clock"
                      size={13}
                      color={theme.colors.textMuted}
                    />

                    <Text style={styles.metaText}>
                      {itemTime}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: isPhone ? 16 : 24,
      paddingBottom: 40,
    },

    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 20,
    },

    headerText: {
      flex: 1,
    },

    eyebrow: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 1.8,
      marginBottom: 5,
    },

    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 30 : 36,
      fontWeight: "900",
      letterSpacing: -0.8,
    },

    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 7,
      maxWidth: 560,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...shadow(theme.colors.cardShadow),
    },

    schedulerCard: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 22,
      padding: isPhone ? 16 : 20,
      marginBottom: 24,
      ...shadow(theme.colors.cardShadow),
    },

    schedulerHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 14,
      marginBottom: 18,
    },

    cardEyebrow: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.5,
      marginBottom: 5,
    },

    cardTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
    },

    cardDescription: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },

    bellBadge: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },

    dateSelector: {
      minHeight: 86,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      padding: 14,
      gap: 12,
    },

    dateIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    dateInformation: {
      flex: 1,
      minWidth: 0,
    },

    dateLabel: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },

    dateValue: {
      color: theme.colors.text,
      fontSize: isPhone ? 14 : 16,
      fontWeight: "800",
      marginTop: 3,
      textTransform: "capitalize",
    },

    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 5,
    },

    timeValue: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
    },

    editDateButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    schedulerFooter: {
      flexDirection: isPhone ? "column" : "row",
      alignItems: isPhone ? "stretch" : "center",
      justifyContent: "space-between",
      gap: 14,
      marginTop: 16,
    },

    notificationInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    notificationText: {
      flex: 1,
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
    },

    addButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingHorizontal: 20,
      gap: 8,
      ...shadow(theme.colors.cardShadow),
    },

    addButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 14,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
    },

    sectionEyebrow: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.5,
      marginBottom: 3,
    },

    sectionTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
    },

    countBadge: {
      minWidth: 34,
      height: 30,
      paddingHorizontal: 10,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    countText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "900",
    },

    reminderCard: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },

    timelineColumn: {
      width: 42,
      alignItems: "center",
    },

    reminderIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    timelineLine: {
      width: 2,
      flex: 1,
      minHeight: 52,
      marginTop: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 999,
    },

    reminderContent: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 15,
      ...shadow(theme.colors.cardShadow),
    },

    reminderHeader: {
      flexDirection: isPhone ? "column" : "row",
      alignItems: isPhone ? "flex-start" : "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },

    reminderTextContent: {
      flex: 1,
      minWidth: 0,
    },

    reminderTitle: {
      color: theme.colors.text,
      fontWeight: "900",
      fontSize: 15,
    },

    reminderBody: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 6,
      backgroundColor: theme.colors.background,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: theme.colors.primary,
    },

    statusText: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: "900",
    },

    reminderMeta: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
      paddingTop: 11,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    metaDivider: {
      width: 3,
      height: 3,
      borderRadius: 999,
      backgroundColor: theme.colors.border,
    },

    metaText: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "capitalize",
    },

    empty: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingVertical: 34,
      paddingHorizontal: 24,
    },

    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
      marginBottom: 14,
    },

    emptyTitle: {
      color: theme.colors.text,
      fontWeight: "900",
      fontSize: 18,
      textAlign: "center",
    },

    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 6,
      textAlign: "center",
      maxWidth: 340,
    },
  });
