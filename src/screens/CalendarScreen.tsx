import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { scheduleNotification } from "../utils/notifications";
import { saveReminder, getReminders } from "../utils/storage";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { HeaderMenu } from "../components/HeaderMenu";
import { LinearGradient } from "expo-linear-gradient";

const H = Dimensions.get("window").height ;
const W = Dimensions.get("window").width;

export const CalendarScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const data = await getReminders();
    setReminders(data);
  };

  const addReminder = async () => {
    try {
      const reminder = {
        id: Date.now().toString(),
        title: "Revisión de inventario",
        body: "Recuerda verificar existencias y lotes.",
        date: date.toISOString(),
      };

      await scheduleNotification(reminder.title, reminder.body, date);
      await saveReminder(reminder);
      await loadReminders();

      Alert.alert("✅ Recordatorio agregado", "Se ha programado la notificación correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo programar la notificación.");
      console.error(error);
    }
  };

  return (
       <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
         <HeaderMenu/>
         <ScrollView
           showsVerticalScrollIndicator={false}
           style={{ height: H, width: W }}
           contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
         >
           
           {/* 🔹 Header degradado con animación */}
           <Fade delay={50}>
             <LinearGradient colors={[theme.colors.primary, "#5AB4F8"]} style={styles.header}>
               
               <Text style={styles.headerTitle}>Calendario</Text>
               <Text style={styles.headerSubtitle}>Consulta y Agenda tus fechas</Text>
             </LinearGradient>
           </Fade>
   

      <Fade delay={100}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateText}>
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
            minimumDate={new Date()}
          />
        )}
      </Fade>

      <Fade delay={200}>
        <TouchableOpacity style={styles.addButton} onPress={addReminder}>
          <Text style={styles.addButtonText}>Programar Recordatorio</Text>
        </TouchableOpacity>
      </Fade>

      <Fade delay={300}>
        <Text style={styles.subtitle}>Próximos Recordatorios</Text>
      </Fade>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody}>{item.body}</Text>
            <Text style={styles.cardDate}>
              {new Date(item.date).toLocaleString()}
            </Text>
          </View>
        )}
      />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,

    },
      safeArea: { flex: 1 },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: 14,
    },
      headerSubtitle: { color: "#fff", fontSize: 14, marginTop: 4, opacity: 0.85 },
    dateButton: {
      backgroundColor: theme.colors.card,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      marginBottom: 12,
    },
    dateText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 10,
      marginBottom: 18,
    },
    addButtonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "700",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 15,
      marginBottom: 6,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardTitle: { color: theme.colors.text, fontWeight: "700", fontSize: 15 },
    cardBody: { color: theme.colors.textMuted, marginVertical: 4 },
    cardDate: { color: theme.colors.textMuted, fontSize: 13 },
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
