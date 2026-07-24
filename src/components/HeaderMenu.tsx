import React from "react";
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
import { webMaxWidthStyle } from "../utils/responsive";

const HeaderMenu = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();

  return (
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

        <View style={styles.rightPlaceholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    elevation: 3,
    shadowOpacity: 0.04,
    shadowRadius: 4,
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
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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
  rightPlaceholder: {
    width: 44,
    height: 44,
  },
});

export default HeaderMenu;
export { HeaderMenu };
