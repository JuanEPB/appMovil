
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme.mode === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.optionRow}>
          <Ionicons name="moon" size={22} color={isDarkMode ? theme.colors.primary : theme.colors.textMuted} />
          <Text style={[styles.optionText, { color: theme.colors.text }]}>Tema oscuro</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, borderRadius: 16, elevation: 3 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { fontSize: 18, fontWeight: '600', flex: 1, marginLeft: 10 },
});
