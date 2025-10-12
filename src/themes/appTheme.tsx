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

// 🌞 Tema claro (basado en MedManager / PharmaControl)
export const lightTheme: ExtendedTheme = {
  dark: false,
  mode: "light",
  colors: {
    primary: "#0072FF", // azul principal
    secondary: "#00C6FF", // celeste verdoso
    gradientStart: "#0072FF",
    gradientEnd: "#00C6FF",
    background: "#F9FAFB", // fondo general claro
    card: "#FFFFFF", // tarjetas blancas
    text: "#212122ff", // texto oscuro
    textMuted: "#636E72", // texto secundario
    border: "#E0E0E0", // bordes suaves
    success: "#00B894", // verde éxito
    warning: "#FFB142", // naranja aviso
    danger: "#FF7675", // rojo alerta
    info: "#74B9FF", // azul informativo
    notification: "#0072FF",
    cardShadow: "rgba(0,0,0,0.08)", // sombra sutil
  },
  fonts: {
    regular: { fontFamily: "Inter-Regular", fontWeight: "400" },
    medium: { fontFamily: "Inter-Medium", fontWeight: "500" },
    bold: { fontFamily: "Inter-Bold", fontWeight: "700" },
    heavy: { fontFamily: "Inter-ExtraBold", fontWeight: "800" },
  },
};

// 🌚 Tema oscuro
export const darkTheme: ExtendedTheme = {
  dark: true,
  mode: "dark",
  colors: {
    primary: "#1E88E5",
    secondary: "#26C6DA",
    gradientStart: "#1565C0",
    gradientEnd: "#00ACC1",
    background: "#0D1117",
    card: "#161B22",
    text: "#E6EDF3",
    textMuted: "#8B949E",
    border: "#30363D",
    success: "#00E676",
    warning: "#FFD54F",
    danger: "#ce3535ff",
    info: "#64B5F6",
    notification: "#2196F3",
    cardShadow: "rgba(0,0,0,0.4)",
  },
  fonts: {
    regular: { fontFamily: "Inter-Regular", fontWeight: "400" },
    medium: { fontFamily: "Inter-Medium", fontWeight: "500" },
    bold: { fontFamily: "Inter-Bold", fontWeight: "700" },
    heavy: { fontFamily: "Inter-ExtraBold", fontWeight: "800" },
  },
};
