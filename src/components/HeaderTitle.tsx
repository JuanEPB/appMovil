import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export const HeaderTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    wrapper: { marginBottom: 12 },
    title: { fontSize: 26, fontWeight: "800", color: theme.colors.text },
    subtitle: { color: theme.colors.textMuted, marginTop: 2 },
  });
