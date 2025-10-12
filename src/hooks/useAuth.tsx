// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPharma } from "../api/apiPharma";
import { User } from "../interfaces/interface";
import { LoginParams } from "../interfaces/interface";

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isLogged: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const savedToken = await AsyncStorage.getItem("token");
      const savedUser = await AsyncStorage.getItem("user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLogged(true);
      }
    };
    loadSession();
  }, []);

  // 🔹 Login
  const login = async ({ email, contraseña }: LoginParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiPharma.post("/api/auth/login", {
        email,
        contraseña,
      });

      if (res.status === 201 && res.data.accessToken) {
        const jwt = res.data.accessToken;
        const usuario = res.data.user;

        await AsyncStorage.setItem("token", jwt);
        await AsyncStorage.setItem("user", JSON.stringify(usuario));

        setToken(jwt);
        setUser(usuario);
        setIsLogged(true);
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err: any) {
      setError("Error en el inicio de sesión");
      setIsLogged(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Logout
  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    setToken(null);
    setUser(null);
    setIsLogged(false);
  };

  // 🔹 Update user info
  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updatedData };
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLogged, isLoading, error, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
