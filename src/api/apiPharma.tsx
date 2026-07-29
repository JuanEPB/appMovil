import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const apiPharma = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_PHARMA_API_URL ||
    "https://api.pharmacontrol.site",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

let authHandler: {
  setTokenExpired: (value: boolean) => void;
} | null = null;

export const registerAuthInterceptor = (handler: {
  setTokenExpired: (value: boolean) => void;
}) => {
  authHandler = handler;
};

apiPharma.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiPharma.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      authHandler?.setTokenExpired(true);

      if (status === 401) {
        await AsyncStorage.multiRemove(["token", "refreshToken"]);
      }
    }

    return Promise.reject(error);
  },
);

export const getMedicamentos = async () =>
  (await apiPharma.get("/api/medicamentos/all")).data;

export const getMedicamentoById = async (id: number) =>
  (await apiPharma.get(`/api/medicamentos/${id}`)).data;

export const createMedicamento = async (data: unknown) =>
  (await apiPharma.post("/api/medicamentos/create", data)).data;

export const getMedicamentosStats = async () =>
  (await apiPharma.get("/api/medicamentos/stats")).data;

export const getVentasStats = async () =>
  (await apiPharma.get("/api/ventas/stats")).data;

export const registerPushToken = async (expoPushToken: string) =>
  (await apiPharma.post("/api/notificaciones/push-token", {
    token: expoPushToken,
  })).data;
