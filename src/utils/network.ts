import { Platform } from "react-native";

export const checkConnection = async () => {
  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    return navigator.onLine;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    await fetch("https://clients3.google.com/generate_204", {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
};
