import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export const LoginScreen = () => {
  const { theme } = useTheme();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    await login({ email, contraseña: password });
    if (error) Alert.alert('Error', error);
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>PharmaControl</Text>
        <InputField
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
        />
        <InputField
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title={isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          onPress={handleLogin}
        />
        <TouchableOpacity>
          <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      padding: 20,
    },
    form: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 3,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 20,
    },
    forgot: {
      marginTop: 15,
      textAlign: 'center',
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
