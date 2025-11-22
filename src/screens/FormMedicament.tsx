import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native"; 
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPharma } from "../api/apiPharma";
import { useTheme } from "../context/ThemeContext";
import { SuccessModal } from "../components/SuccessModal";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import { Categoria, Proveedor } from "../interfaces/interface";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const h = Dimensions.get("window").height;
const w = Dimensions.get("window").width;

export const FormMedicament = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Estados
  const [nombre, setNombre] = useState("");
  const [lote, setLote] = useState("");
  const [stock, setStock] = useState("");
  const [caducidad, setCaducidad] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [proveedorId, setProveedorId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 🔹 Cargar categorías y proveedores
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [catRes, provRes] = await Promise.all([
          apiPharma.get("/api/categorias/all", { headers }),
          apiPharma.get("/api/proveedores/all", { headers }),
        ]);

        setCategorias(catRes.data || []);
        setProveedores(provRes.data || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
  }, []);

    const submit = async () => {
      try {
        
          if (!nombre.trim() || !lote.trim() || !stock.trim() || !caducidad.trim() || !categoriaId || !proveedorId) {
    Alert.alert("Error", "Todos los campos son obligatorios");
    return;
  }
        setSaving(true);
        
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("No token");

        const payload = {
          nombre,
          lote,
          stock: Number(stock || 0),
          caducidad,
          categoriaId,
          proveedorId,
        };

        await apiPharma.post("/api/medicamentos/create", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOk(true);
        setTimeout(() => {
          setOk(false);
          navigation.navigate("Medicamentos" as never)
        }, 1600);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "No se pudo registrar el medicamento");
      } finally {
        setSaving(false);
      }
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1, height: h, width: w }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.container]}
          showsVerticalScrollIndicator={false}
        >
          {/* 🔹 Header animado con degradado */}
          <Fade delay={50}>
            <LinearGradient
              colors={[theme.colors.primary, "#5AB4F8"]}
              style={styles.header}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("Medicamentos" as never)}
                activeOpacity={0.8}
                style={styles.backButton}
              >
                <Feather name="arrow-left" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Agregar Medicamento</Text>
            </LinearGradient>
          </Fade>

          {/* ---------- CAMPOS ---------- */}
          <Fade delay={100}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
                placeholder="Paracetamol 500mg"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </Fade>

          <Fade delay={140}>
            <View style={styles.field}>
              <Text style={styles.label}>Lote</Text>
              <TextInput
                value={lote}
                onChangeText={setLote}
                style={styles.input}
                placeholder="ABC12345"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </Fade>

          <Fade delay={180}>
            <View style={styles.field}>
              <Text style={styles.label}>Stock</Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                style={styles.input}
                placeholder="10"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </Fade>

          {/* ---------- FECHA ---------- */}
          <Fade delay={220}>
            <View style={styles.field}>
              <Text style={styles.label}>Caducidad</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <TextInput
                  value={caducidad}
                  style={[
                    styles.input,
                    {
                      color: caducidad
                        ? theme.colors.text
                        : theme.colors.textMuted,
                    },
                  ]}
                  placeholder="Seleccione la fecha de caducidad"
                  placeholderTextColor={theme.colors.textMuted}
                  editable={false}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={caducidad ? new Date(caducidad) : new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "calendar"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formatted = selectedDate.toISOString().split("T")[0];
                      setCaducidad(formatted);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </Fade>

          {/* ---------- CATEGORÍA ---------- */}
          <Fade delay={260}>
            <View style={styles.field}>
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={categoriaId}
                  onValueChange={(value) => setCategoriaId(value)}
                  style={styles.picker}
                >
                  <Picker.Item
                    label="Seleccione una categoría..."
                    value={null}
                    color={theme.colors.textMuted}
                  />
                  {categorias.map((cat) => (
                    <Picker.Item
                      key={cat.id}
                      label={cat.nombre}
                      value={cat.id}
                      color={theme.colors.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </Fade>

          {/* ---------- PROVEEDOR ---------- */}
          <Fade delay={300}>
            <View style={styles.field}>
              <Text style={styles.label}>Proveedor</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={proveedorId}
                  onValueChange={(value) => setProveedorId(value)}
                  style={styles.picker}
                >
                  <Picker.Item
                    label="Seleccione un proveedor..."
                    value={null}
                    color={theme.colors.textMuted}
                  />
                  {proveedores.map((prov) => (
                    <Picker.Item
                      key={prov.id}
                      label={prov.nombre}
                      value={prov.id}
                      color={theme.colors.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </Fade>

          {/* ---------- BOTONES ---------- */}
          <Fade delay={360}>
            <TouchableOpacity
              disabled={saving}
              onPress={submit}
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: saving ? 0.6 : 1,
                },
              ]}
            >
              <Text style={styles.buttonText}>
                {saving ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </Fade>

          <Fade delay={400}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Medicamentos" as never)}
              style={[styles.button, { backgroundColor: theme.colors.danger }]}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </Fade>
        </ScrollView>

        <SuccessModal
          visible={ok}
          title="¡Guardado!"
          message="El medicamento se registró correctamente."
          onRequestClose={() => setOk(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      padding: 18,
      paddingTop: 10,
      backgroundColor: theme.colors.background,
      flexGrow: 1,
    },
    header: {
      width: "100%",
      height: 120,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: 12,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 3,
      position: "relative",
    },
    backButton: {
      position: "absolute",
      top: 10,
      left: 20,
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      padding: 8,
      borderRadius: 10,
      shadowColor: "#ffffffff",
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 4,
    },
    headerTitle: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 20,
    },
    field: { marginBottom: 12 },
    label: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 6 },
    input: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      color: theme.colors.text,
    },
    pickerContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    picker: { color: theme.colors.text, height: 48 },
    button: {
      marginTop: 8,
      alignSelf: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
      width: "80%",
    },
    buttonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  });
