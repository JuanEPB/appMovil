
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [correo, setCorreo] = useState(user?.email || '');
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
      <Text style={[styles.title, { color: theme.colors.text }]}>{user?.nombre} {user?.apellido}</Text>

      <TextInput style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]} value={nombre} onChangeText={setNombre} />
      <TextInput style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]} value={correo} onChangeText={setCorreo} />

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.saveText}>Guardar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.colors.danger }]} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 12, borderRadius: 14, marginBottom: 12 },
  saveBtn: { padding: 12, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 10 },
  saveText: { color: '#fff', fontWeight: 'bold' },
  logoutBtn: { padding: 12, borderRadius: 14, width: '100%', alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});
