import { Platform } from "react-native";

export const getLayout = (width: number) => {
  const isPhone = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    isPhone,
    isTablet,
    isDesktop,
    maxWidth: isDesktop ? 1120 : isTablet ? 820 : width,
    pagePadding: isPhone ? 16 : 24,
    gap: isPhone ? 12 : 18,
    columns: isDesktop ? 3 : isTablet ? 2 : 1,
  };
};

export const webMaxWidthStyle = (width: number) => ({
  width: "100%" as const,
  maxWidth: getLayout(width).maxWidth,
  alignSelf: "center" as const,
});

export const shadow = (color = "#000") => ({
  shadowColor: color,
  shadowOpacity: Platform.OS === "web" ? 0.08 : 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
});
