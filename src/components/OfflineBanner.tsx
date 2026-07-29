import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { checkConnection } from "../utils/network";
import { offlineQueue } from "../utils/offlineQueue";

export const OfflineBanner = () => {
  const { theme } = useTheme();
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const [isOnline, pendingCount] = await Promise.all([
        checkConnection(),
        offlineQueue.count(),
      ]);

      if (!active) return;
      setOnline(isOnline);
      setPending(pendingCount);
    };

    void refresh();
    const interval = setInterval(refresh, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (online && pending === 0) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
        },
      ]}
    >
      <Feather
        name={online ? "upload-cloud" : "wifi-off"}
        size={16}
        color={online ? theme.colors.warning : theme.colors.danger}
      />
      <Text style={[styles.text, { color: theme.colors.text }]}>
        {online
          ? `${pending} operacion(es) pendientes de sincronizar`
          : "Sin conexion. Las acciones criticas se guardan como pendientes."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
});
