import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  iconLeft?: React.ReactNode;
};

export const GradientButton: React.FC<Props> = ({ title, onPress, style, iconLeft }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.wrapper, style]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {iconLeft}
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { borderRadius: 14, overflow: "hidden" },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  text: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
