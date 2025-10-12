import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "../context/ThemeContext";

export const ThemedView: React.FC<ViewProps> = ({ style, ...rest }) => {
  const { theme } = useTheme();
  return <View style={[{ backgroundColor: theme.colors.background }, style]} {...rest} />;
};
