import { Theme } from "@react-navigation/native";

// 1️⃣ Definimos una extensión segura del tema nativo
export interface ExtendedTheme extends Theme {
  mode: "light" | "dark";
  colors: Theme["colors"] & {
    secondary: string;
    textMuted: string;
    success: string;
    warning: string;
    danger: string;
  };
}

// 2️⃣ Tema claro
export const lightTheme: ExtendedTheme = {
  dark: false,
  mode: "light",
  colors: {
    primary: "#1A237E",
    secondary: "#2E7D32",
    background: "#F5F7FB",
    card: "#FFFFFF",
    text: "#212121",
    textMuted: "#757575",
    border: "#E0E0E0",
    success: "#2E7D32",
    warning: "#FFC107",
    danger: "#D32F2F",
    notification: "#1A237E",
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "normal" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "bold" },
    heavy: { fontFamily: "System", fontWeight: "900" },
  },
};

// 3️⃣ Tema oscuro
export const darkTheme: ExtendedTheme = {
  dark: true,
  mode: "dark",
  colors: {
    primary: "#90CAF9",
    secondary: "#A5D6A7",
    background: "#0D1117",
    card: "#161B22",
    text: "#E6EDF3",
    textMuted: "#8B949E",
    border: "#30363D",
    success: "#81C784",
    warning: "#FFD54F",
    danger: "#EF9A9A",
    notification: "#90CAF9",
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "normal" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "bold" },
    heavy: { fontFamily: "System", fontWeight: "900" },
  },
};
