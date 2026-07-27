import AsyncStorage from "@react-native-async-storage/async-storage";

export type PharmacyProfile = {
  nombre: string;
  direccion: string;
  telefono: string;
  responsable: string;
  identificacionFiscal: string;
};

export type ExportHistoryItem = {
  id: string;
  tipo: "ticket" | "reporte";
  origen: "api" | "local" | "web";
  descripcion: string;
  fecha: string;
};

export const DEFAULT_PHARMACY_PROFILE: PharmacyProfile = {
  nombre: "PharmaControl",
  direccion: "Direccion no configurada",
  telefono: "Telefono no configurado",
  responsable: "Administrador",
  identificacionFiscal: "Sin RFC/NIT",
};

export const DEFAULT_NEURAL_API_URL =
  process.env.EXPO_PUBLIC_PHARMA_NEURAL_URL || "http://127.0.0.1:8000";

export const DEFAULT_PHARMA_API_URL =
  process.env.EXPO_PUBLIC_PHARMA_API_URL || "http://127.0.0.1:8000";

const PHARMACY_PROFILE_KEY = "pharma_settings_profile";
const NEURAL_API_URL_KEY = "pharma_settings_neural_api_url";
const PHARMA_API_URL_KEY = "pharma_settings_pharma_api_url";
const EXPORT_HISTORY_KEY = "pharma_export_history";

export const getPharmacyProfile = async (): Promise<PharmacyProfile> => {
  const stored = await AsyncStorage.getItem(PHARMACY_PROFILE_KEY);

  if (!stored) return DEFAULT_PHARMACY_PROFILE;

  try {
    return {
      ...DEFAULT_PHARMACY_PROFILE,
      ...JSON.parse(stored),
    };
  } catch {
    return DEFAULT_PHARMACY_PROFILE;
  }
};

export const savePharmacyProfile = async (profile: PharmacyProfile) => {
  await AsyncStorage.setItem(PHARMACY_PROFILE_KEY, JSON.stringify(profile));
};

export const getNeuralApiUrl = async () => {
  const stored = await AsyncStorage.getItem(NEURAL_API_URL_KEY);
  return (stored || DEFAULT_NEURAL_API_URL).trim().replace(/\/+$/, "");
};

export const saveNeuralApiUrl = async (url: string) => {
  await AsyncStorage.setItem(NEURAL_API_URL_KEY, url.trim().replace(/\/+$/, ""));
};

export const getPharmaApiUrl = async () => {
  const stored = await AsyncStorage.getItem(PHARMA_API_URL_KEY);
  return (stored || DEFAULT_PHARMA_API_URL).trim().replace(/\/+$/, "");
};

export const savePharmaApiUrl = async (url: string) => {
  await AsyncStorage.setItem(PHARMA_API_URL_KEY, url.trim().replace(/\/+$/, ""));
};

export const addExportHistoryItem = async (
  item: Omit<ExportHistoryItem, "id" | "fecha">,
) => {
  const history = await getExportHistory();
  const nextItem: ExportHistoryItem = {
    ...item,
    id: `${Date.now()}`,
    fecha: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    EXPORT_HISTORY_KEY,
    JSON.stringify([nextItem, ...history].slice(0, 30)),
  );

  return nextItem;
};

export const getExportHistory = async (): Promise<ExportHistoryItem[]> => {
  const stored = await AsyncStorage.getItem(EXPORT_HISTORY_KEY);

  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
