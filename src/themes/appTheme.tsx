import { Theme } from "@react-navigation/native";

export interface ExtendedTheme extends Theme {
  mode: "light" | "dark";
  colors: Theme["colors"] & {
    secondary: string;
    gradientStart: string;
    gradientEnd: string;
    textMuted: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    cardShadow: string;
  };
  fonts: {
    regular: { fontFamily: string; fontWeight: "400" | "500" | "700" | "800" | "normal" | "bold" | "100" | "200" | "300" | "600" | "900" };
    medium: { fontFamily: string; fontWeight: "400" | "500" | "700" | "800" | "normal" | "bold" | "100" | "200" | "300" | "600" | "900" };
    bold: { fontFamily: string; fontWeight: "400" | "500" | "700" | "800" | "normal" | "bold" | "100" | "200" | "300" | "600" | "900" };
    heavy: { fontFamily: string; fontWeight: "400" | "500" | "700" | "800" | "normal" | "bold" | "100" | "200" | "300" | "600" | "900" };
  };
}

// ðŸŒž Tema claro (basado en MedManager / PharmaControl)
export const lightTheme: ExtendedTheme = {
  dark: false,
  mode: "light",
  colors: {
    primary: "#2563EB", // azul principal
    secondary: "#059669", // celeste verdoso
    gradientStart: "#2563EB",
    gradientEnd: "#059669",
    background: "#F4F7FB", // fondo general claro
    card: "#FFFFFF", // tarjetas blancas
    text: "#111827", // texto oscuro
    textMuted: "#64748B", // texto secundario
    border: "#D8E0EA", // bordes suaves
    success: "#059669", // verde Ã©xito
    warning: "#D97706", // naranja aviso
    danger: "#DC2626", // rojo alerta
    info: "#0284C7", // azul informativo
    notification: "#2563EB",
    cardShadow: "rgba(15,23,42,0.08)", // sombra sutil
  },
  fonts: {
    regular: { fontFamily: "Inter-Regular", fontWeight: "400" },
    medium: { fontFamily: "Inter-Medium", fontWeight: "500" },
    bold: { fontFamily: "Inter-Bold", fontWeight: "700" },
    heavy: { fontFamily: "Inter-ExtraBold", fontWeight: "800" },
  },
};

// ðŸŒš Tema oscuro
export const darkTheme: ExtendedTheme = {
  dark: true,
  mode: "dark",
  colors: {
    primary: "#60A5FA",
    secondary: "#34D399",
    gradientStart: "#2563EB",
    gradientEnd: "#059669",
    background: "#0B1118",
    card: "#121A24",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "#263241",
    success: "#34D399",
    warning: "#F59E0B",
    danger: "#F87171",
    info: "#38BDF8",
    notification: "#60A5FA",
    cardShadow: "rgba(0,0,0,0.4)",
  },
  fonts: {
    regular: { fontFamily: "Inter-Regular", fontWeight: "400" },
    medium: { fontFamily: "Inter-Medium", fontWeight: "500" },
    bold: { fontFamily: "Inter-Bold", fontWeight: "700" },
    heavy: { fontFamily: "Inter-ExtraBold", fontWeight: "800" },
  },
};

