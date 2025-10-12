import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Configuración global de notificaciones
 * Define cómo se comportan las notificaciones dentro de la app
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * 🧩 Solicitar permisos de notificación al usuario
 * Retorna true si se otorgaron correctamente
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * 📱 Registrar el dispositivo para recibir notificaciones push
 * Obtiene el token de Expo necesario para el backend
 */
export async function registerForPushNotificationsAsync() {
  let token: string | undefined;

  if (Device.isDevice) {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      alert("❌ No se otorgaron permisos de notificación.");
      return null;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        throw new Error("Project ID no encontrado. Configura extra.eas.projectId en app.json");
      }

      const response = await Notifications.getExpoPushTokenAsync({ projectId });
      token = response.data;
      console.log("✅ Expo Push Token:", token);
    } catch (error) {
      console.error("Error obteniendo token de notificación:", error);
    }
  } else {
    alert("⚠️ Debes usar un dispositivo físico para recibir notificaciones push.");
  }

  // 🔔 Configurar canal por defecto en Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notificaciones de PharmaControl",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00AEEF",
    });
  }

  return token;
}

/**
 * 📅 Programar una notificación local en una fecha específica
 * Usa SchedulableTriggerInputTypes.DATE según Expo SDK 53
 */
export async function scheduleNotification(title: string, body: string, date: Date) {
  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
  };

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      color: "#00AEEF",
    },
    trigger,
  });

  console.log("🕒 Notificación programada:", identifier);
  return identifier;
}

/**
 * 🗑️ Cancelar una notificación programada
 */
export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * 🔄 Cancelar todas las notificaciones programadas
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * 📋 Obtener todas las notificaciones programadas
 */
export async function getAllScheduledNotifications() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log("🔔 Notificaciones programadas:", notifications);
  return notifications;
}
