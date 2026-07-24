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

export const CalendarScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);

  const loadReminders = async () => setReminders(await getReminders());

  useEffect(() => {
    loadReminders();
  }, []);

  const addReminder = async () => {
    try {
      const reminder = {
        id: Date.now().toString(),
        title: "Revision de inventario",
        body: "Recuerda verificar existencias y lotes.",
        date: date.toISOString(),
      };

      await scheduleNotification(reminder.title, reminder.body, date);
      await saveReminder(reminder);
      await loadReminders();
      Alert.alert("Recordatorio agregado", "Se programo la notificacion correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo programar la notificacion.");
      console.error(error);
    }
  };

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
          { paddingHorizontal: layout.pagePadding },
        ]}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Calendario</Text>
              <Text style={styles.subtitle}>Agenda revisiones y recordatorios de inventario.</Text>
            </View>

            <View style={styles.schedulerCard}>
              <Text style={styles.cardLabel}>Fecha seleccionada</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
                <Feather name="calendar" size={18} color={theme.colors.primary} />
                <Text style={styles.dateText}>
                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                  minimumDate={new Date()}
                />
              )}

              <TouchableOpacity style={styles.addButton} onPress={addReminder}>
                <Feather name="bell" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Programar recordatorio</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Proximos recordatorios</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin recordatorios</Text>
            <Text style={styles.emptyText}>Programa una fecha para verla aqui.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.reminderCard}>
            <View style={styles.reminderIcon}>
              <Feather name="clock" size={18} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>{item.title}</Text>
              <Text style={styles.reminderBody}>{item.body}</Text>
              <Text style={styles.reminderDate}>{new Date(item.date).toLocaleString()}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      width: "100%",
      alignSelf: "center",
      paddingTop: 18,
      paddingBottom: 36,
    },
    header: { marginBottom: 16 },
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
    schedulerCard: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 18,
      ...shadow(theme.colors.cardShadow),
    },
    cardLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "800",
      marginBottom: 8,
    },
    dateButton: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 14,
      gap: 10,
      marginBottom: 12,
    },
    dateText: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
    addButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      gap: 8,
    },
    addButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 10,
    },
    reminderCard: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      marginBottom: 10,
    },
    reminderIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    reminderTitle: { color: theme.colors.text, fontWeight: "800", fontSize: 15 },
    reminderBody: { color: theme.colors.textMuted, marginTop: 3 },
    reminderDate: { color: theme.colors.textMuted, fontSize: 12, marginTop: 5, fontWeight: "700" },
    empty: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 24,
    },
    emptyTitle: { color: theme.colors.text, fontWeight: "800", fontSize: 18 },
    emptyText: { color: theme.colors.textMuted, marginTop: 4, textAlign: "center" },
  });
