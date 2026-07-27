import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { shadow } from '../utils/responsive';

export const Button = ({ title, onPress, loading=false }: { title: string; onPress: () => void; loading?: boolean; }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.btn, loading && styles.disabled]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.82}
      accessibilityRole="button"
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    btn: {
      minHeight: 48,
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow(theme.colors.cardShadow),
    },
    disabled: {
      opacity: 0.72,
    },
    text: { color: '#fff', fontWeight: '800', fontSize: 15 },
  });
