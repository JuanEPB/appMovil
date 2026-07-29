import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { isDemoToken, localDb } from "../data/localDb";
import { webMaxWidthStyle } from "../utils/responsive";
import { OfflineBanner } from "./OfflineBanner";

const HeaderMenu = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadCount = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!isDemoToken(token)) return;
      const alerts = await localDb.getAlerts();
      if (active) setAlertCount(alerts.length);
    };

    void loadCount();
    const interval = setInterval(loadCount, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
            shadowColor: theme.colors.cardShadow,
          },
        ]}
      >
        <View style={[styles.inner, webMaxWidthStyle(width)]}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
            accessibilityHint="Abre el menu lateral"
            activeOpacity={0.75}
            style={[styles.menuTouch, { backgroundColor: theme.colors.background }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="menu" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.titleWrap} pointerEvents="none">
            <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>
              Version 2
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.titleText,
                {
                  color: theme.colors.text,
                  fontSize: width > 420 ? 22 : 18,
                },
              ]}
            >
              PharmaControl
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("AlertsInbox" as never)}
            activeOpacity={0.75}
            style={[styles.statusPill, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
          >
            <Feather name="bell" size={15} color={alertCount > 0 ? theme.colors.danger : theme.colors.success} />
            {width > 520 ? (
              <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>
                {alertCount}
              </Text>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
      <OfflineBanner />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  menuTouch: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 1,
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  titleText: {
    fontWeight: "800",
    textAlign: "center",
    includeFontPadding: false,
  },
  statusPill: {
    minWidth: 44,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
});

export default HeaderMenu;
export { HeaderMenu };
