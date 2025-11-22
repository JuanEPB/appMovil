// src/api/apiPharma.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { navigationRef } from '../navigation/NavigationService';
import { CommonActions } from '@react-navigation/native';

export const apiPharma = axios.create({
  baseURL: 'https://api.pharmacontrol.site',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Agregar token en cada solicitud
apiPharma.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
// 🔹 Variable temporal para acceder al setter del contexto
let authHandler: {
  setTokenExpired: (v: boolean) => void;
} | null = null;

// 🔹 Permite registrar el contexto global (llamado desde AuthProvider)
export const registerAuthInterceptor = (handler: {
  setTokenExpired: (v: boolean) => void;
}) => {
  authHandler = handler;
};

// 🔹 Interceptor: agrega token a cada request
apiPharma.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Interceptor: detecta token vencido (401)
apiPharma.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Token caducado detectado (401)");
      if (authHandler) {
        authHandler.setTokenExpired(true); // Activa el modal global
      }
    }
    return Promise.reject(error);
  }
);

// 🧩 Endpoints
export const getMedicamentos = async () => (await apiPharma.get('/api/medicamentos/all')).data;
export const getMedicamentoById = async (id: number) => (await apiPharma.get(`/api/medicamentos/${id}`)).data;
export const createMedicamento = async (data: any) => (await apiPharma.post('/api/medicamentos/create', data)).data;
export const getMedicamentosStats = async () => (await apiPharma.get('/api/medicamentos/stats')).data;
