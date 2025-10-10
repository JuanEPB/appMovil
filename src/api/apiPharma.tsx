import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiPharma = axios.create({
    baseURL: 'http://192.168.100.11:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a cada solicitud
apiPharma.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token agregado:", token.slice(0, 20) + "..."); // DEBUG
    } else {
      console.warn("⚠️ No hay token en AsyncStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getMedicamentos = async () => {
  const res = await apiPharma.get("/api/medicamentos/all");
  return res.data;
};

export const getMedicamentoById = async (id: number) => {
  const res = await apiPharma.get(`/api/medicamentos/${id}`);
  console.log(res.data);
  return res.data;
};

export const createMedicamento = async (data: any) => {
  const res = await apiPharma.post("/api/medicamentos/create", data);
  return res.data;
};

export const getMedicamentosStats = async () => {
  const res = await apiPharma.get("/api/medicamentos/stats");
  return res.data;
};
