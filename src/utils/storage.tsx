import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "pharma_recordatorios";

export async function saveReminder(reminder: any) {
  try {
    const current = await getReminders();
    const updated = [...current, reminder];
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error al guardar recordatorio:", e);
  }
}

export async function getReminders() {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error al leer recordatorios:", e);
    return [];
  }
}

export async function clearReminders() {
  await AsyncStorage.removeItem(KEY);
}
