
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
}

export const InputField = ({ placeholder, value, onChangeText, secureTextEntry, autoCapitalize='none', keyboardType='default' }: Props) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
    />
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 14,
      borderRadius: 8,
      backgroundColor: theme.colors.card,
      fontSize: 15,
      color: theme.colors.text,
    },
  });
