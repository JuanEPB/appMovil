import { useEffect, useState } from "react";
import { Alert, Platform, PermissionsAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { apiPharma } from "../api/apiPharma";
import { DocumentoBase, VentaData } from "../interfaces/interface";
import { isDemoToken, localDb } from "../data/localDb";

export const useDocuments = () => {
  const [ventas, setVentas] = useState<VentaData[]>([]);
  const [reportesIA, setReportesIA] = useState<DocumentoBase[]>([]);
  const [otros, setOtros] = useState<DocumentoBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openedFile, setOpenedFile] = useState<string | null>(null);

  // 🔹 Cargar documentos desde la API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("No hay token guardado");
        if (isDemoToken(token)) {
          const data = await localDb.getDocuments();
          setVentas(data.ventas);
          setReportesIA(data.documentos.filter((d) => d.tipoReporte === "IA"));
          setOtros(data.documentos.filter((d) => d.tipoReporte !== "venta" && d.tipoReporte !== "IA"));
          setError(null);
          return;
        }

        const res = await apiPharma.get<DocumentoBase[]>("/api/documentos/listar", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        const ventasDocs = data.filter((d) => d.tipoReporte === "venta");
        const iaDocs = data.filter((d) => d.tipoReporte === "IA");
        const otrosDocs = data.filter(
          (d) => d.tipoReporte !== "venta" && d.tipoReporte !== "IA"
        );

        const ventasParsed: VentaData[] = [];
        for (const doc of ventasDocs) {
          if (doc.mimetype === "application/json") {
            const ventaRes = await apiPharma.get(`/api/documentos/descargar/${doc._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            ventasParsed.push({ ...ventaRes.data, _id: doc._id });
          }
        }

        setVentas(ventasParsed);
        setReportesIA(iaDocs);
        setOtros(otrosDocs);
      } catch (err: any) {
        console.error("Error en useDocuments:", err.message);
        setError(err.message);
        Alert.alert("Error", "No se pudieron cargar los documentos");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // 🔒 Pedir permisos (Android)
  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          granted["android.permission.READ_EXTERNAL_STORAGE"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.WRITE_EXTERNAL_STORAGE"] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log("✅ Permisos de almacenamiento concedidos");
          return true;
        } else {
          Alert.alert(
            "Permiso requerido",
            "Debes otorgar permisos de almacenamiento para guardar los archivos."
          );
          return false;
        }
      } catch (err) {
        console.warn("❌ Error solicitando permisos:", err);
        return false;
      }
    }
    return true;
  };

  // 📁 Asegurar carpeta
  const ensureDirectoryExists = async (dirUri: string) => {
    const info = await FileSystem.getInfoAsync(dirUri);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
      console.log("📁 Carpeta creada:", dirUri);
    }
  };

  // 🔹 Descargar y abrir archivo temporalmente
  const downloadAndOpenFile = async (id: string, filename: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (isDemoToken(token)) {
        Alert.alert("Archivo demo", `${filename} esta disponible solo como dato local de prueba.`);
        return null;
      }
      const url = `${apiPharma.defaults.baseURL}/api/documentos/descargar/${id}`;
      const dirUri = FileSystem.cacheDirectory + "pharma_temp/";
      await ensureDirectoryExists(dirUri);

      const fileUri = dirUri + filename;
      console.log("📡 Descargando:", url);

      const res = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Archivo descargado:", res.uri);

      // Abrir si es PDF
      if (res.headers["Content-Type"]?.includes("application/pdf")) {
        setOpenedFile(res.uri);
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(res.uri);
      }

      Alert.alert("Descarga completa", `Archivo listo: ${filename}`);
      return res.uri;
    } catch (error) {
      console.error("❌ Error descargando archivo:", error);
      Alert.alert("Error", "No se pudo descargar el archivo");
    }
  };

  // 🔹 Descargar y guardar en Documentos
  const downloadFile = async (id: string, filename: string) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) return;

      const token = await AsyncStorage.getItem("token");
      if (isDemoToken(token)) {
        Alert.alert("Archivo demo", `${filename} esta disponible solo como dato local de prueba.`);
        return null;
      }
      const url = `${apiPharma.defaults.baseURL}/api/documentos/descargar/${id}`;
      const dirUri = FileSystem.documentDirectory + "pharma_docs/";
      await ensureDirectoryExists(dirUri);

      const fileUri = dirUri + filename;
      console.log("💾 Guardando archivo en:", fileUri);

      const res = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Archivo guardado:", res.uri);

      Alert.alert("Archivo guardado", `Se guardó en:\n${res.uri}`);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(res.uri);
      }

      return res.uri;
    } catch (error) {
      console.error("❌ Error guardando archivo:", error);
      Alert.alert("Error", "No se pudo guardar el archivo");
    }
  };

  const closeViewer = () => setOpenedFile(null);

  return {
    ventas,
    reportesIA,
    otros,
    loading,
    error,
    downloadAndOpenFile,
    openedFile,
    closeViewer,
    downloadFile,
  };
};
