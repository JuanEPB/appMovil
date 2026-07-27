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

// Tema claro (basado en MedManager / PharmaControl)
export const lightTheme: ExtendedTheme = {
  dark: false,
  mode: "light",
  colors: {
    primary: "#2563EB",
    secondary: "#0F766E",
    gradientStart: "#2563EB",
    gradientEnd: "#0F766E",
    background: "#F6F8FB",
    card: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#64748B",
    border: "#D9E2EC",
    success: "#059669",
    warning: "#D97706",
    danger: "#DC2626",
    info: "#0284C7",
    notification: "#2563EB",
    cardShadow: "rgba(15,23,42,0.10)",
  },
  fonts: {
    regular: { fontFamily: "Inter-Regular", fontWeight: "400" },
    medium: { fontFamily: "Inter-Medium", fontWeight: "500" },
    bold: { fontFamily: "Inter-Bold", fontWeight: "700" },
    heavy: { fontFamily: "Inter-ExtraBold", fontWeight: "800" },
  },
};

// Tema oscuro
export const darkTheme: ExtendedTheme = {
  dark: true,
  mode: "dark",
  colors: {
    primary: "#60A5FA",
    secondary: "#2DD4BF",
    gradientStart: "#1D4ED8",
    gradientEnd: "#0F766E",
    background: "#0A1017",
    card: "#111A24",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "#273545",
    success: "#34D399",
    warning: "#F59E0B",
    danger: "#F87171",
    info: "#38BDF8",
    notification: "#60A5FA",
    cardShadow: "rgba(0,0,0,0.5)",
  },
  fonts: {
    regular: { fontFamily: "Inter-Regular", fontWeight: "400" },
    medium: { fontFamily: "Inter-Medium", fontWeight: "500" },
    bold: { fontFamily: "Inter-Bold", fontWeight: "700" },
    heavy: { fontFamily: "Inter-ExtraBold", fontWeight: "800" },
  },
};

