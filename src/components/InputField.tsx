import React from "react";
import { TextInput, StyleSheet } from "react-native";

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export const InputField = ({ placeholder, value, onChangeText, secureTextEntry }: Props) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#7f8c8d"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#dcdde1",
    padding: 12,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    color: "#2c3e50",
  },
});
