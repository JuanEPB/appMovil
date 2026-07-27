import React, { useRef } from "react";
import { Animated, Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { shadow } from "../utils/responsive";

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  iconLeft?: React.ReactNode;
};

export const GradientButton: React.FC<Props> = ({ title, onPress, style, iconLeft }) => {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(0.98)}
      onPressOut={() => animate(1)}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.wrapper, style, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, shadow(theme.colors.cardShadow)]}
        >
          {iconLeft}
          <Text style={styles.text}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: { borderRadius: 8, overflow: "hidden" },
  gradient: {
    minHeight: 46,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  text: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
