import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

import { apiPharma } from "../api/apiPharma";
import { LoginParams, User } from "../interfaces/interface";

const STORAGE_KEYS = {
  token: "token",
  refreshToken: "refreshToken",
  user: "user",
} as const;

const INACTIVITY_LIMIT = 5 * 60 * 1000;
const INACTIVITY_CHECK_INTERVAL = 30 * 1000;

interface DecodedToken {
  exp?: number;
  iat?: number;
}

interface SessionData {
  token: string;
  refreshToken: string | null;
  user: User;
}

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: User;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLogged: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpired: boolean;

  login: (data: LoginParams) => Promise<boolean>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setTokenExpired: React.Dispatch<React.SetStateAction<boolean>>;
  bumpActivity: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Inicia en true mientras se restaura la sesión.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  // No necesita provocar un render en cada actividad.
  const lastActivityRef = useRef(Date.now());

  const isLogged = Boolean(user && token && !tokenExpired);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateToken = useCallback((jwt: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(jwt);

      if (!decoded.exp) {
        return false;
      }

      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, []);

  const applySession = useCallback((session: SessionData) => {
    setToken(session.token);
    setRefreshToken(session.refreshToken);
    setUser(session.user);
    setTokenExpired(false);
    lastActivityRef.current = Date.now();
  }, []);

  const persistSession = useCallback(async (session: SessionData) => {
    const entries: [string, string][] = [
      [STORAGE_KEYS.token, session.token],
      [STORAGE_KEYS.user, JSON.stringify(session.user)],
    ];

    if (session.refreshToken) {
      entries.push([
        STORAGE_KEYS.refreshToken,
        session.refreshToken,
      ]);
    }

    await AsyncStorage.multiSet(entries);

    if (!session.refreshToken) {
      await AsyncStorage.removeItem(STORAGE_KEYS.refreshToken);
    }
  }, []);

  const clearSession = useCallback(async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));

    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setTokenExpired(false);
    setError(null);

    lastActivityRef.current = Date.now();
  }, []);

  const logout = useCallback(async () => {
    try {
      await clearSession();
    } catch (logoutError) {
      console.error("Error al cerrar sesión:", logoutError);

      // Aunque falle el almacenamiento, limpia el estado local.
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setTokenExpired(false);
    }
  }, [clearSession]);

  const getErrorMessage = useCallback((requestError: unknown): string => {
    if (
      typeof requestError === "object" &&
      requestError !== null &&
      "response" in requestError
    ) {
      const response = (
        requestError as {
          response?: {
            status?: number;
            data?: {
              message?: string | string[];
            };
          };
        }
      ).response;

      if (response?.status === 401) {
        return "Correo o contraseña incorrectos.";
      }

      const message = response?.data?.message;

      if (Array.isArray(message)) {
        return message.join("\n");
      }

      if (typeof message === "string") {
        return message;
      }
    }

    return "No fue posible iniciar sesión. Inténtalo nuevamente.";
  }, []);

  const login = useCallback(
    async ({
      email,
      contraseña,
    }: LoginParams): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiPharma.post<LoginResponse>(
          "/api/auth/login",
          {
            email: email.trim().toLowerCase(),
            contraseña,
          },
        );

        const accessToken =
          response.data.accessToken ??
          response.data.access_token;

        const newRefreshToken =
          response.data.refreshToken ??
          response.data.refresh_token ??
          null;

        const authenticatedUser = response.data.user;

        if (!accessToken || !authenticatedUser) {
          throw new Error("La respuesta de autenticación está incompleta.");
        }

        if (!validateToken(accessToken)) {
          throw new Error("El servidor devolvió un token inválido.");
        }

        const session: SessionData = {
          token: accessToken,
          refreshToken: newRefreshToken,
          user: authenticatedUser,
        };

        await persistSession(session);
        applySession(session);

        return true;
      } catch (loginError) {
        console.error("Error al iniciar sesión:", loginError);

        setError(getErrorMessage(loginError));
        setToken(null);
        setRefreshToken(null);
        setUser(null);

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [
      applySession,
      getErrorMessage,
      persistSession,
      validateToken,
    ],
  );

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) {
      await logout();
      return false;
    }

    try {
      const response = await apiPharma.post<LoginResponse>(
        "/api/auth/refresh",
        {
          refresh_token: refreshToken,
        },
      );

      const newToken =
        response.data.accessToken ??
        response.data.access_token;

      if (!newToken || !validateToken(newToken)) {
        throw new Error("No se recibió un token válido.");
      }

      // Conserva el refresh token anterior si no llega uno nuevo.
      const newRefreshToken =
        response.data.refreshToken ??
        response.data.refresh_token ??
        refreshToken;

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.token, newToken],
        [STORAGE_KEYS.refreshToken, newRefreshToken],
      ]);

      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setTokenExpired(false);
      lastActivityRef.current = Date.now();

      return true;
    } catch (refreshError) {
      console.error("Error al renovar la sesión:", refreshError);

      await logout();
      return false;
    }
  }, [logout, refreshToken, validateToken]);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const values = await AsyncStorage.multiGet(
        Object.values(STORAGE_KEYS),
      );

      const storage = Object.fromEntries(values);

      const savedToken = storage[STORAGE_KEYS.token];
      const savedRefreshToken =
        storage[STORAGE_KEYS.refreshToken] ?? null;
      const savedUser = storage[STORAGE_KEYS.user];

      if (!savedToken || !savedUser) {
        await clearSession();
        return;
      }

      let parsedUser: User;

      try {
        parsedUser = JSON.parse(savedUser) as User;
      } catch {
        await clearSession();
        return;
      }

      if (validateToken(savedToken)) {
        applySession({
          token: savedToken,
          refreshToken: savedRefreshToken,
          user: parsedUser,
        });

        return;
      }

      /*
       * El access token expiró, pero todavía puede existir un
       * refresh token. Se coloca temporalmente para intentar
       * renovar la sesión.
       */
      if (savedRefreshToken) {
        setUser(parsedUser);
        setRefreshToken(savedRefreshToken);
        setToken(savedToken);
        setTokenExpired(true);
        return;
      }

      await clearSession();
    } catch (restoreError) {
      console.error("Error al restaurar la sesión:", restoreError);
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [applySession, clearSession, validateToken]);

  const updateUser = useCallback(
    async (updatedData: Partial<User>) => {
      if (!user) {
        return;
      }

      const updatedUser: User = {
        ...user,
        ...updatedData,
      };

      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(updatedUser),
        );

        setUser(updatedUser);
      } catch (updateError) {
        console.error(
          "Error al actualizar el usuario:",
          updateError,
        );

        setError("No fue posible actualizar la información.");
      }
    },
    [user],
  );

  const bumpActivity = useCallback(() => {
    if (!tokenExpired) {
      lastActivityRef.current = Date.now();
    }
  }, [tokenExpired]);

  const demoLogin = useCallback(async () => {
    const demoUser: User = {
      id: 1,
      nombre: "Admin",
      apellido: "Demo",
      email: "admin@pharmacontrol.demo",
      rol: "Administrador",
      farmacia_id: 1,
    };

    const demoToken =
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0." +
      "eyJpYXQiOjE3MjAwMDAwMDAsImV4cCI6NDEwMjQ0NDgwMH0.demo";

    const session: SessionData = {
      token: demoToken,
      refreshToken: "demo-refresh-token",
      user: demoUser,
    };

    try {
      setIsLoading(true);
      setError(null);

      await persistSession(session);
      applySession(session);
    } catch (demoError) {
      console.error("Error al iniciar el modo demo:", demoError);
      setError("No fue posible iniciar el modo demostración.");
    } finally {
      setIsLoading(false);
    }
  }, [applySession, persistSession]);

  // Restaura la sesión una sola vez al iniciar la aplicación.
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  // Verifica la inactividad sin provocar renders cada minuto.
  useEffect(() => {
    if (!token || !user || tokenExpired) {
      return;
    }

    const interval = setInterval(() => {
      const inactivityTime =
        Date.now() - lastActivityRef.current;

      if (inactivityTime >= INACTIVITY_LIMIT) {
        setTokenExpired(true);
      }
    }, INACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [token, tokenExpired, user]);

  // Revisa el estado cuando la aplicación vuelve al primer plano.
  useEffect(() => {
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state !== "active" || !token) {
        return;
      }

      if (!validateToken(token)) {
        setTokenExpired(true);
        return;
      }

      const inactivityTime =
        Date.now() - lastActivityRef.current;

      if (inactivityTime >= INACTIVITY_LIMIT) {
        setTokenExpired(true);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => subscription.remove();
  }, [token, validateToken]);

  const contextValue = useMemo<AuthContextProps>(
    () => ({
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
      bumpActivity,
      clearError,
    }),
    [
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
      bumpActivity,
      clearError,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextProps {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de un AuthProvider.",
    );
  }

  return context;
}
