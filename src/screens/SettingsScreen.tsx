import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

export const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const isDarkMode = theme.mode === "dark";
  const styles = getStyles(theme, layout.isPhone);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
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
          <Text style={styles.title}>Configuracion</Text>
          <Text style={styles.subtitle}>Preferencias de apariencia y cuenta.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.optionRow}>
            <View style={styles.iconText}>
              <Ionicons
                name="moon"
                size={22}
                color={isDarkMode ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>Tema oscuro</Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate("Profile" as never)}
          activeOpacity={0.85}
        >
          <View style={styles.optionRow}>
            <View style={styles.iconText}>
              <FontAwesome5 name="user-alt" size={20} color={theme.colors.textMuted} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>Perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.textMuted} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    content: {
      width: "100%",
      alignSelf: "center",
      gap: 14,
      paddingTop: 18,
      paddingBottom: 36,
    },
    header: {
      marginBottom: 2,
    },
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
    card: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      ...shadow(theme.colors.cardShadow),
    },
    optionRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
    },
    iconText: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },
    optionText: {
      fontSize: 17,
      fontWeight: "700",
      flexShrink: 1,
    },
  });
