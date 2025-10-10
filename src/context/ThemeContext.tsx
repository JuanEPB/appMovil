import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../themes/appTheme';

type ThemeContextType = {
  theme: typeof lightTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem('theme_mode');
        if (stored === 'dark') setTheme(darkTheme);
        else if (stored === 'light') setTheme(lightTheme);
        else {
          const system = Appearance.getColorScheme();
          setTheme(system === 'dark' ? darkTheme : lightTheme);
        }
      } catch (err) {
        console.error('Error al cargar tema:', err);
        setTheme(lightTheme);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();

    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });

    return () => listener.remove();
  }, []);

  const toggleTheme = async () => {
    const next = theme.mode === 'light' ? darkTheme : lightTheme;
    setTheme(next);
    await AsyncStorage.setItem('theme_mode', next.mode);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
};
