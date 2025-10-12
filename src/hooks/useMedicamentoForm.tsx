import { useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPharma } from "../api/apiPharma";

export const useMedicamentoForm = (onSuccess?: () => void) => {
  const [form, setForm] = useState({
    nombre: "",
    lote: "",
    caducidad: "",
    proveedorId: "",
    stock: "",
    precio: "",
    categoriaId: "",
  });

  const [categorias, setCategorias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar listas al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const [catRes, provRes] = await Promise.all([
          apiPharma.get("/api/categorias/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiPharma.get("/api/proveedores/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCategorias(catRes.data);
        setProveedores(provRes.data);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      }
    };
    fetchData();
  }, []);

  // 🧠 Controlar valores
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🚀 Enviar formulario
  const handleSubmit = async () => {
    if (!form.nombre || !form.lote || !form.caducidad || !form.proveedorId || !form.categoriaId) {
      Alert.alert("Campos requeridos", "Completa todos los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      await apiPharma.post(
        "/api/medicamentos/create",
        {
          ...form,
          proveedorId: Number(form.proveedorId),
          categoriaId: Number(form.categoriaId),
          stock: Number(form.stock),
          precio: Number(form.precio),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onSuccess) onSuccess(); // refrescar lista o cerrar modal

      return true;
    } catch (error) {
      console.error("❌ Error al registrar:", error);
      throw new Error("No se pudo registrar el medicamento");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    handleChange,
    handleSubmit,
    categorias,
    proveedores,
    loading,
  };
};
