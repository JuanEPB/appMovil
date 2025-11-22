// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import MaskedView from "@react-native-masked-view/masked-view";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation, DrawerActions } from "@react-navigation/native";
// import { useTheme } from "../context/ThemeContext";
// import Feather from '@expo/vector-icons/Feather';

// export const HeaderMenu = () => {
//   const navigation = useNavigation();
//   const { theme } = useTheme();
//   const width = Dimensions.get("window").width;

//   return (
//     <View style={[styles.header, { backgroundColor: theme.colors.card, width: width }]}>
//       {/* Botón del menú */}
//       <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}>
//         <Feather name="sidebar" size={24} color={theme.colors.text} />
//       </TouchableOpacity>

//       {/* Texto degradado con máscara */}
//       <MaskedView
//         maskElement={
//           <Text style={styles.titleText} numberOfLines={20}>
//             Pharmacontrol
//           </Text>
//         }
//       >
//         <LinearGradient
//           colors={["#1640caff", "#000000ff"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//         >
          
//           <Text style={[styles.titleText, { opacity: 0 }]}>Pharmacontrol </Text>
//         </LinearGradient>
//       </MaskedView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(0,0,0,0.05)",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//   },
//   menuButton: {
//     marginRight: 10,
//   },
//   titleText: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "black", // se enmascara, así que no importa
//   },
// });
// src/components/HeaderMenu.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { Feather } from "@expo/vector-icons";

const HeaderMenu = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();

  const fontSize = width > 420 ? 22 : 18;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
          width,
          shadowColor: theme.colors.cardShadow,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
        accessibilityHint="Abre el menú lateral"
        activeOpacity={0.75}
        style={styles.menuTouch}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="menu" size={22} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.titleWrap} pointerEvents="none">
        <Text
          numberOfLines={1}
          style={[
            styles.titleText,
            { fontSize, color: theme.colors.text, fontWeight: "700" },
          ]}
        >
          Pharmacontrol
        </Text>
        {/* Subtítulo opcional (coméntalo si no lo quieres) */}
        {/* <Text style={[styles.subTitle, { color: theme.colors.textMuted }]}>Módulo Inventario</Text> */}
      </View>

      {/* placeholder derecho para centrar */}
      <View style={styles.rightPlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    elevation: 3,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  menuTouch: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  titleText: {
    textAlign: "center",
    includeFontPadding: false,
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightPlaceholder: {
    width: 46,
    height: 46,
  },
});

export default HeaderMenu;
export { HeaderMenu };
