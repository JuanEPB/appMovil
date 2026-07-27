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
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    title: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
    subtitle: { color: theme.colors.textMuted, marginTop: 4 },
    chip: {
      alignSelf: "flex-start",
      marginTop: 8,
      backgroundColor: theme.colors.background,
      color: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      overflow: "hidden",
      fontSize: 12,
      fontWeight: "600",
    },
  });
