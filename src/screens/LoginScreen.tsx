import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useAuth } from "../hooks/useAuth";

import { InputField } from "../components/InputField";
import { Button } from "../components/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { appTheme } from "../themes/appTheme";

export const LoginScreen = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setemail] = useState("");
  const [contraseña, setcontraseña] = useState("");

  const handleLogin = async () => {
    await login({ email, contraseña });
    if (error) Alert.alert("Error", error);
  };

  return (
    <SafeAreaView style={styles.container}>
    <View>
      <View style={styles.form}>
        <Text style={styles.title}>PharmaControl</Text>
        <InputField placeholder="Correo electrónico" value={email} onChangeText={setemail} />
        <InputField placeholder="Contraseña" value={contraseña} onChangeText={setcontraseña} secureTextEntry />
        <Button title={isLoading ? "Ingresando..." : "Iniciar Sesión"} onPress={handleLogin} />
        <TouchableOpacity>
          <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.background, justifyContent: "center", padding: 20 },
  form: {
    backgroundColor: appTheme.colors.card,
    borderRadius: appTheme.radius.md,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: "bold", color: appTheme.colors.primary, textAlign: "center", marginBottom: 20 },
  forgot: { marginTop: 15, textAlign: "center", color: appTheme.colors.primary, fontWeight: "600" },
});
