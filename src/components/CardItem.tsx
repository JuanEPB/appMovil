import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  chip?: string;
  style?: ViewStyle;
};

export const CardItem: React.FC<Props> = ({ title, subtitle, right, chip, style }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={[styles.card, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {chip ? <Text style={styles.chip}>{chip}</Text> : null}
      </View>
      {right}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    title: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
    subtitle: { color: theme.colors.textMuted, marginTop: 4 },
    chip: {
      alignSelf: "flex-start",
      marginTop: 8,
      backgroundColor: "#EEF2FF",
      color: "#4F46E5",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: "hidden",
      fontSize: 12,
      fontWeight: "600",
    },
  });
