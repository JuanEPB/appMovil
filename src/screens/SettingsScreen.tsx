import React from 'react';
import { View, Text, Switch, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HeaderMenu } from '../components/HeaderMenu';
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme.mode === 'dark';
  const height = Dimensions.get('window').height;
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, height }]}>
      <HeaderMenu />

      {/* ---------- Card de tema ---------- */}
      <View style={[styles.card, { backgroundColor: theme.colors.card, marginVertical: 16 }]}>
        <View style={styles.optionRow}>
          <Ionicons
            name="moon"
            size={22}
            color={isDarkMode ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text style={[styles.optionText, { color: theme.colors.text }]}>Tema oscuro</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>
      </View>

      {/* ---------- Opción de perfil ---------- */}
      <Fade delay={150}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.colors.card, marginBottom: 16 }]}
          onPress={() => navigation.navigate("Profile" as never)}
          activeOpacity={0.9}
        >
          <View style={styles.optionRow}>
            <FontAwesome5
              name="user-alt"
              size={22}
              color={isDarkMode ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>Perfil</Text>
          </View>
        </TouchableOpacity>
      </Fade>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    padding: 16,
    borderRadius: 16,
    elevation: 3,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
});
