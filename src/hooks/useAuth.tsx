import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPharma } from "../api/apiPharma";
import {jwtDecode} from "jwt-decode";
import { AppState } from "react-native";
import { User, LoginParams } from "../interfaces/interface";

interface DecodedToken {
  exp: number;
  iat: number;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLogged: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpired: boolean;
  login: (data: LoginParams) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<void>;
  setTokenExpired: (value: boolean) => void;
  bumpActivity: () => void; // 👈 NUEVO
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const bumpActivity = () => setLastActivity(Date.now()); // 👈 NUEVO

  const validateToken = (jwt: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(jwt);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedRefresh = await AsyncStorage.getItem("refreshToken");
        const savedUser = await AsyncStorage.getItem("user");

        if (savedToken && savedUser) {
          if (validateToken(savedToken)) {
            setToken(savedToken);
            setRefreshToken(savedRefresh);
            setUser(JSON.parse(savedUser));
            setIsLogged(true);
          } else {
            await logout();
          }
        }
      } catch (e) {
        console.log("Error al cargar sesión:", e);
      }
    };
    loadSession();
  }, []);

  const login = async ({ email, contraseña }: LoginParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiPharma.post("/api/auth/login", { email, contraseña });

      if (res.status === 201 && res.data.accessToken) {
        const jwt = res.data.accessToken;
        const usuario = res.data.user;
        const refresh = res.data.refreshToken;

        await AsyncStorage.setItem("token", jwt);
        if (refresh) await AsyncStorage.setItem("refreshToken", refresh);
        await AsyncStorage.setItem("user", JSON.stringify(usuario));

        setToken(jwt);
        setRefreshToken(refresh || null);
        setUser(usuario);
        setIsLogged(true);
        setTokenExpired(false);
        setLastActivity(Date.now());
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err: any) {
      console.error("Error en login:", err);
      setError("Error en el inicio de sesión");
      setIsLogged(false);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    const demoUser: User = {
      id: 1,
      nombre: "Admin",
      apellido: "Demo",
      email: "admin@pharmacontrol.demo",
      rol: "Administrador",
      farmacia_id: 1,
    };
    const demoToken =
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpYXQiOjE3MjAwMDAwMDAsImV4cCI6NDEwMjQ0NDgwMH0.demo";

    await AsyncStorage.setItem("token", demoToken);
    await AsyncStorage.setItem("refreshToken", "demo-refresh-token");
    await AsyncStorage.setItem("user", JSON.stringify(demoUser));

    setToken(demoToken);
    setRefreshToken("demo-refresh-token");
    setUser(demoUser);
    setIsLogged(true);
    setTokenExpired(false);
    setLastActivity(Date.now());
  };

  const refreshSession = async () => {
    if (!refreshToken || !isLogged) return;
    try {
      const res = await apiPharma.post("/api/auth/refresh", {
        refresh_token: refreshToken,
      });

      if (res.data.access_token) {
        const newToken = res.data.access_token;
        const newRefresh = res.data.refresh_token;

        await AsyncStorage.setItem("token", newToken);
        if (newRefresh) await AsyncStorage.setItem("refreshToken", newRefresh);

        setToken(newToken);
        setRefreshToken(newRefresh);
        setTokenExpired(false);
        setIsLogged(true);
        setLastActivity(Date.now());
      }
    } catch (error) {
      console.error("Error al refrescar token:", error);
      await logout();
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "refreshToken", "user"]);
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsLogged(false);
      setTokenExpired(false);
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // ⏱️ Inactividad 5 min
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLogged && Date.now() - lastActivity > 5 * 60 * 1000) {
        setTokenExpired(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastActivity, isLogged]);

  // 📲 App vuelve al primer plano → actividad
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isLogged) bumpActivity();
    });
    return () => sub.remove();
  }, [isLogged]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isLogged,
        isLoading,
        error,
        tokenExpired,
        login,
        demoLogin,
        logout,
        updateUser,
        refreshSession,
        setTokenExpired,
        bumpActivity, // 👈 NUEVO
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
