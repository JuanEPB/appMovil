// src/api/apiPharma.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { navigationRef } from '../navigation/NavigationService';
import { CommonActions } from '@react-navigation/native';

export const apiPharma = axios.create({
  baseURL: 'http://192.168.100.11:3000',
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

// 🚨 Manejar expiración (401)
apiPharma.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detectar token inválido
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      Alert.alert(
        'Sesión expirada',
        'Tu sesión ha expirado. ¿Deseas mantenerla abierta?',
        [
          {
            text: 'Cerrar sesión',
            style: 'cancel',
            onPress: async () => {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('refreshToken');

              navigationRef.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            },
          },
          {
            text: 'Renovar sesión',
            onPress: async () => {
              try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const res = await axios.post('http://192.168.100.11:3000/api/auth/refresh', {
                  refreshToken,
                });

                const newToken = res.data.accessToken;
                await AsyncStorage.setItem('token', newToken);

                // Reintentar la petición original
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiPharma(originalRequest);
              } catch (refreshError) {
                await AsyncStorage.removeItem('token');
                navigationRef.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  })
                );
              }
            },
          },
        ]
      );
    }

    return Promise.reject(error);
  }
);

// 🧩 Endpoints
export const getMedicamentos = async () => (await apiPharma.get('/api/medicamentos/all')).data;
export const getMedicamentoById = async (id: number) => (await apiPharma.get(`/api/medicamentos/${id}`)).data;
export const createMedicamento = async (data: any) => (await apiPharma.post('/api/medicamentos/create', data)).data;
export const getMedicamentosStats = async () => (await apiPharma.get('/api/medicamentos/stats')).data;
