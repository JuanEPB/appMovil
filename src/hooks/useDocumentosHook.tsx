import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { File, Directory, Paths } from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPharma } from "../api/apiPharma";
import { DocumentoBase, VentaData } from "../interfaces/interface";
import { PermissionsAndroid, Platform } from "react-native";


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
  const requestStoragePermission = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      if (
        granted["android.permission.READ_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.WRITE_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("✅ Permisos de almacenamiento concedidos");
        return true;
      } else {
        console.warn("⚠️ Permisos de almacenamiento denegados");
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
  } else {
    return true; // En iOS no se necesitan
  }
};

// 🧩 Crear carpeta si no existe
const ensureDirectoryExists = async (baseDir: Directory, name: string) => {
  try {
    const subDir = new Directory(baseDir, name);
    subDir.list(); // Esto lanza si no existe
    console.log("📂 Carpeta existente:", subDir.uri);
    return subDir;
  } catch {
    console.log("📁 Creando carpeta:", name);
    const newDir = baseDir.createDirectory(name);
    console.log("✅ Carpeta creada:", newDir.uri);
    return newDir;
  }
};

// 🔹 Descargar y abrir archivo temporalmente
const downloadAndOpenFile = async (id: string, filename: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const url = `${apiPharma.defaults.baseURL}/api/documentos/descargar/${id}`;

    const baseDir = new Directory(Paths.cache);
    const dir = await ensureDirectoryExists(baseDir, "pharma_temp");

    console.log("📡 Descargando temporal:", url);

    const downloaded = await File.downloadFileAsync(url, dir, {
      headers: { Authorization: `Bearer ${token}` },
      idempotent: true,
    });

    console.log("✅ Archivo descargado:", downloaded.uri);
    Alert.alert("✅ Descargado", `Guardado en:\n${downloaded.uri}`);
    setOpenedFile(downloaded.uri);
    return downloaded.uri;
  } catch (error) {
    console.error("❌ Error descargando archivo:", error);
    Alert.alert("Error", "No se pudo descargar el archivo");
  }
};

// 🔹 Guardar archivo permanentemente (en Documentos)
const downloadFile = async (id: string, filename: string) => {
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;
    const token = await AsyncStorage.getItem("token");
    const url = `${apiPharma.defaults.baseURL}/api/documentos/descargar/${id}`;

    const baseDir = new Directory(Paths.document);
    const dir = await ensureDirectoryExists(baseDir, "pharma_docs");

    console.log("💾 Guardando archivo:", url);

    const downloaded = await File.downloadFileAsync(url, dir, {
      headers: { Authorization: `Bearer ${token}` },
      idempotent: true,
    });

    console.log("✅ Archivo guardado:", downloaded.uri);
    Alert.alert("💾 Archivo guardado", `Se guardó en:\n${downloaded.uri}`);
    return downloaded.uri;
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
