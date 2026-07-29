import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPharma } from "../api/apiPharma";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { SuccessModal } from "../components/SuccessModal";
import { FadeSlideIn as Fade } from "../components/FadeSlideIn";
import { Categoria, Proveedor } from "../interfaces/interface";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";
import { isDemoToken, localDb } from "../data/localDb";
import { canManageInventory } from "../utils/permissions";

export const FormMedicament = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editing = route.params?.medicamento;
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);

  // Estados
  const [nombre, setNombre] = useState(editing?.nombre || "");
  const [lote, setLote] = useState(editing?.lote || "");
  const [stock, setStock] = useState(editing?.stock !== undefined ? String(editing.stock) : "");
  const [precio, setPrecio] = useState(editing?.precio !== undefined ? String(editing.precio) : "");
  const [caducidad, setCaducidad] = useState(editing?.caducidad || "");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(editing?.categoria?.id || null);
  const [proveedorId, setProveedorId] = useState<number | null>(editing?.proveedor?.id || null);

  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateForm = async () => {
    const cleanName = nombre.trim();
    const cleanLot = lote.trim();
    const stockValue = Number(stock);
    const priceValue = Number(precio);
    const expiryDate = new Date(caducidad);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    if (!cleanName || !cleanLot || !caducidad || !categoriaId || !proveedorId) {
      return "Completa nombre, lote, caducidad, categoria y proveedor.";
    }

    if (!Number.isFinite(stockValue) || stockValue < 0) {
      return "El stock debe ser un numero mayor o igual a 0.";
    }

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      return "El precio debe ser mayor a 0.";
    }

    if (Number.isNaN(expiryDate.getTime()) || expiryDate < today) {
      return "La fecha de caducidad debe ser valida y futura.";
    }

    const token = await AsyncStorage.getItem("token");

    if (isDemoToken(token)) {
      const meds = await localDb.getMedicamentos();
      const duplicate = meds.some(
        (med) =>
          med.id !== editing?.id &&
          med.nombre.trim().toLowerCase() === cleanName.toLowerCase() &&
          med.lote.trim().toLowerCase() === cleanLot.toLowerCase(),
      );

      if (duplicate) {
        return "Ya existe un medicamento con el mismo nombre y lote.";
      }
    }

    return null;
  };

  // 🔹 Cargar categorías y proveedores
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (isDemoToken(token)) {
          const [localCategorias, localProveedores] = await Promise.all([
            localDb.getCategorias(),
            localDb.getProveedores(),
          ]);
          setCategorias(localCategorias);
          setProveedores(localProveedores);
          return;
        }
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
      setSaving(true);
      setFormError(null);

      if (!canManageInventory(user)) {
        setFormError("Tu usuario no tiene permiso para modificar inventario.");
        return;
      }

      const validationError = await validateForm();

      if (validationError) {
        setFormError(validationError);
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token");
      const payload = {
        nombre: nombre.trim(),
        lote: lote.trim(),
        stock: Number(stock),
        precio: Number(precio),
        caducidad,
        categoriaId,
        proveedorId,
      };
      if (isDemoToken(token)) {
        if (editing?.id) await localDb.updateMedicamento(editing.id, payload);
        else await localDb.createMedicamento(payload);
        setOk(true);
        setTimeout(() => {
          setOk(false);
          navigation.navigate("Medicamentos" as never);
        }, 900);
        return;
      }

      if (editing?.id) {
        await apiPharma.put(`/api/medicamentos/update/${editing.id}`, payload);
      } else {
        await apiPharma.post("/api/medicamentos/create", payload);
      }

      setOk(true);
      setTimeout(() => {
        setOk(false);
        navigation.navigate("Medicamentos" as never)
      }, 1600);
    } catch (e) {
      console.error(e);
      setFormError(e instanceof Error ? e.message : "No se pudo guardar el medicamento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingHorizontal: layout.pagePadding }]}
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
              <Text style={styles.headerTitle}>{editing ? "Editar medicamento" : "Agregar medicamento"}</Text>
              <Text style={styles.headerSubtitle}>
                {editing ? "Actualiza datos, precio y stock." : "Registra lote, stock y caducidad."}
              </Text>
            </LinearGradient>
          </Fade>

          {/* ---------- CAMPOS ---------- */}
          <View style={[styles.formCard, webMaxWidthStyle(width)]}>
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

          <Fade delay={200}>
            <View style={styles.field}>
              <Text style={styles.label}>Precio</Text>
              <TextInput
                value={precio}
                onChangeText={setPrecio}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="35.00"
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
          {formError ? (
            <View style={styles.errorBox}>
              <Feather name="alert-triangle" size={16} color={theme.colors.danger} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

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
                {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
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
          </View>
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

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    container: {
      paddingVertical: isPhone ? 16 : 24,
      backgroundColor: theme.colors.background,
      flexGrow: 1,
      alignItems: "center",
    },
    header: {
      width: "100%",
      maxWidth: 1120,
      minHeight: isPhone ? 116 : 140,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      padding: 18,
      marginBottom: 16,
      position: "relative",
      ...shadow(theme.colors.cardShadow),
    },
    backButton: {
      position: "absolute",
      top: 14,
      left: 14,
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
      fontSize: isPhone ? 22 : 28,
      textAlign: "center",
    },
    headerSubtitle: {
      color: "#fff",
      fontSize: 14,
      marginTop: 6,
      opacity: 0.9,
      textAlign: "center",
    },
    formCard: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: isPhone ? 16 : 22,
      maxWidth: 720,
      ...shadow(theme.colors.cardShadow),
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
      minHeight: 48,
      fontSize: 15,
    },
    pickerContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    picker: { color: theme.colors.text, height: 48 },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.danger,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    errorText: {
      flex: 1,
      color: theme.colors.danger,
      fontWeight: "700",
      fontSize: 13,
    },
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
      width: "100%",
      maxWidth: 360,
    },
    buttonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  });
