// import React, { useState } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
// import { DrawerContentComponentProps } from "@react-navigation/drawer";
// import { useTheme } from "../context/ThemeContext";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {  useStats } from "../hooks/useStats";
// import { useAuth } from "../hooks/useAuth";
// import { User } from '../interfaces/interface';


// export const Sidebar: React.FC<DrawerContentComponentProps> = (props) => {
//   const { theme } = useTheme();
//   const go = (name: string) => props.navigation.navigate(name as never);
//   const { stats, loading, error } = useStats();
//   const { user, logout } = useAuth();
//     const [nombre, setNombre] = useState(user?.nombre || '');
//     const [correo, setCorreo] = useState(user?.email || '');

//   const styles = getStyles(theme);

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* 🌈 Encabezado con gradiente */}
//     <LinearGradient
//   colors={[theme.colors.primary, theme.colors.secondary]} // Gradiente suave
//   start={{ x: 0, y: 0 }}
//   end={{ x: 1, y: 1 }}
//   style={[
//     styles.header,
//     {
//       paddingVertical: 22,
//       borderBottomLeftRadius: 24,
//       borderBottomRightRadius: 24,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.15,
//       shadowRadius: 8,
//       elevation: 5,
//     },
//   ]}
// >
//   <Image
//     source={require("../../assets/logo1.png")}
//     style={{ width: 42, height: 42, resizeMode: "contain", marginRight: 10 }}
//   />
//   <View>
//     <Text style={[styles.brand, { fontSize: 20 }]}>Pharmacontrol</Text>
//     <Text style={[styles.subBrand, { fontSize: 13, color: "#0b447eff" }]}>
//       Administrador Inteligente
//     </Text>
//   </View>
// </LinearGradient>
// <ScrollView
//   showsVerticalScrollIndicator={false}
//   contentContainerStyle={{ paddingBottom: 20 }}
// >
//   {/* 📁 Navegación */}
//   <Text style={styles.sectionTitle}>NAVEGACIÓN</Text>
//   {[
//     { icon: "home-outline", label: "Inicio", route: "Dashboard", color: "#1A3E6B" },
//     { icon: "medkit-outline", label: "Mis Medicamentos", route: "Medicamentos", color: "#0097A7" },
//     { icon: "document-text-outline", label: "Mis Reportes", route: "Documents", color: "#5D4FFF" },
//     { icon: "calendar-outline", label: "Calendario", route: "Calendar", color: "#FFB74D" },
//     { icon: "chatbubbles-outline", label: "Chat IA", route: "Chat", color: "#FF5252" },
//   ].map((item) => (
//     <TouchableOpacity
//       key={item.route}
//       style={[
//         styles.navItem,
//         {
//           backgroundColor: theme.colors.card || "#FAFAFA",
//           marginVertical: 6,
//           borderRadius: 14,
//           shadowColor: item.color,
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.15,
//           shadowRadius: 6,
//           elevation: 3,
//         },
//       ]}
//       onPress={() => go(item.route)}
//     >
//       <Ionicons
//         name={item.icon as any}
//         size={22}
//         color={item.color}
//         style={{ width: 28 }}
//       />
//       <Text style={styles.navLabel}>{item.label}</Text>
//     </TouchableOpacity>
//   ))}

//   {/* 📊 Resumen rápido */}
//   <Text style={[styles.sectionTitle, { marginTop: 20 }]}>RESUMEN RÁPIDO</Text>
//   <View
//     style={[
//       styles.summaryCard,
//       {
//         backgroundColor: "#E3F2FD",
//         shadowColor: "#0072FF",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.15,
//         shadowRadius: 6,
//         elevation: 3,
//       },
//     ]}
//   >
//     <Ionicons name="pulse-outline" size={22} color="#0072FF" />
//     <View>
//       <Text style={styles.summaryTitle}>Medicamentos Activos</Text>
//       <Text style={styles.summaryValue}>
//         {(stats?.total ?? 0) - (stats?.caducados ?? 0)}
//       </Text>
//     </View>
//   </View>

//   <View
//     style={[
//       styles.summaryCard,
//       {
//         backgroundColor: "#E8F5E9",
//         shadowColor: "#2E7D32",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.15,
//         shadowRadius: 6,
//         elevation: 3,
//       },
//     ]}
//   >
//     <Ionicons name="calendar-outline" size={22} color="#2E7D32" />
//     <View>
//       <Text style={styles.summaryTitle}>Próxima Toma</Text>
//       <Text style={styles.summaryValue}>No programada</Text>
//     </View>
//   </View>
// </ScrollView>
// <View
//     style={[
//       styles.summaryCard,
//       {
//         backgroundColor: "#E8F5E9",
//         shadowColor: "#2E7D32",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 6,
//         elevation: 3,
//       },
//     ]}
//   >
//     <Ionicons name="calendar-outline" size={22} color="#2E7D32" />
//     <View>
//       <Text style={styles.summaryTitle}>Próxima Toma</Text>
//       <Text style={styles.summaryValue}>No programada</Text>
//     </View>
//   </View>
// </ScrollView>
//       {/* 👤 Usuario abajo
//       <View style={styles.userFooter}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>{user?.nombre.charAt(0).toUpperCase()}</Text>
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.username}>{user?.nombre}</Text>
//           <Text style={styles.userRole}>Gestiona tu inventario</Text>
//         </View>
//         <TouchableOpacity style={{ marginRight: 12 }} onPress={() => go('Settings')}>
//         <Ionicons name="settings-outline" size={20} color={theme.colors.textMuted} />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={{ marginLeft: 12 }}
//           onPress={() => {
//             logout();
//             props.navigation.closeDrawer();
//           }} */}<View style={styles.userFooter}>
//   <View style={styles.avatar}>
//     <Text style={styles.avatarText}>
//       {((user?.nombre ?? '').charAt(0) || '').toUpperCase()}
//     </Text>
//   </View>
//   <View style={{ flex: 1 }}>
//     <Text style={styles.username}>{user?.nombre ?? 'Usuario'}</Text>
//     <Text style={styles.userRole}>Gestiona tu inventario</Text>
//   </View>
//   <TouchableOpacity style={{ marginRight: 12 }} onPress={() => go('Settings')}>
//     <Ionicons name="settings-outline" size={20} color={theme.colors.textMuted} />
//   </TouchableOpacity>
//   <TouchableOpacity
//     style={{ marginLeft: 12 }}
//     onPress={() => {
//       logout();
//       props.navigation.closeDrawer();
//     }}
//   >
//     <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
//   </TouchableOpacity>
// </View>
        
//     </SafeAreaView>
//   );
// };

// const getStyles = (theme: any) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.colors.card,
//       borderRightWidth: 1,
//       borderRightColor: theme.colors.border,
//     },
//     // 🌈 Encabezado con gradiente
//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       padding: 16,
//       paddingVertical: 20,
//       borderBottomLeftRadius: 24,
//       borderBottomRightRadius: 24,
//       marginBottom: 12,
//       gap: 12,
//       backgroundColor: theme.colors.primary, // fallback si no carga gradiente
//     },
//     brand: { color: "#fff", fontWeight: "800", fontSize: 20 },
//     subBrand: { color: "#DDEEFF", fontSize: 13 },
//     sectionTitle: {
//       fontSize: 13,
//       fontWeight: "700",
//       color: theme.colors.textMuted,
//       marginBottom: 8,
//       marginLeft: 16,
//       marginTop: 8,
//       letterSpacing: 0.5,
//     },
//     navItem: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingVertical: 12,
//       paddingHorizontal: 18,
//       borderRadius: 14,
//       marginVertical: 2,
//       backgroundColor: theme.colors.cardElevated || "#FAFAFA",
//     },
//     navLabel: {
//       fontSize: 15,
//       color: theme.colors.text,
//       fontWeight: "600",
//       marginLeft: 10,
//     },
//     summaryCard: {
//       marginHorizontal: 12,
//       marginVertical: 6,
//       padding: 12,
//       borderRadius: 16,
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//       shadowColor: "#000",
//       shadowOpacity: 0.05,
//       shadowOffset: { width: 0, height: 2 },
//       shadowRadius: 6,
//       elevation: 2,
//     },
//     summaryTitle: { fontWeight: "600", color: "#333" },
//     summaryValue: { fontSize: 13, color: "#555" },
//     userFooter: {
//       flexDirection: "row",
//       alignItems: "center",
//       padding: 14,
//       borderTopWidth: 1,
//       borderTopColor: theme.colors.border,
//       backgroundColor: "#F5F7FB",
//     },
//     avatar: {
//       width: 36,
//       height: 36,
//       borderRadius: 18,
//       backgroundColor: theme.colors.g,
//       alignItems: "center",
//       justifyContent: "center",
//       marginRight: 8,
//     },
//     avatarText: { color: "#fff", fontWeight: "700" },
//     username: { fontWeight: "700", color: theme.colors.text },
//     userRole: { fontSize: 12, color: theme.colors.textMuted },
//   });

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStats } from "../hooks/useStats";
import { useAuth } from "../hooks/useAuth";

export const Sidebar: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const go = (name: string) => navigation.navigate(name as never);
  const { stats } = useStats();
  const { user, logout } = useAuth();

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado formal con gradiente */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Image
          source={require("../../assets/logo1.png")}
          style={styles.logo}
        />
        <View>
          <Text style={styles.brand}>Pharmacontrol</Text>
          <Text style={styles.subBrand}>Administrador Inteligente</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Navegación */}
        <Text style={styles.sectionTitle}>NAVEGACIÓN</Text>
        {[
          { icon: "home-outline", label: "Inicio", route: "Dashboard", color: "#183e6b" },
          { icon: "medkit-outline", label: "Mis Medicamentos", route: "Medicamentos", color: "#007B8F" },
          { icon: "document-text-outline", label: "Mis Reportes", route: "Documents", color: "#5D4FFF" },
          { icon: "calendar-outline", label: "Calendario", route: "Calendar", color: "#FFB74D" },
          { icon: "chatbubbles-outline", label: "Chat IA", route: "Chat", color: "#D32F2F" },
        ].map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[styles.navItem, { shadowColor: item.color }]}
            onPress={() => go(item.route)}
          >
            <Ionicons name={item.icon as any} size={22} color={item.color} style={{ width: 28 }} />
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Resumen rápido */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>RESUMEN RÁPIDO</Text>
        <View style={[styles.summaryCard, { backgroundColor: "#E3F2FD", shadowColor: "#0072FF" }]}>
          <Ionicons name="pulse-outline" size={22} color="#0072FF" />
          <View>
            <Text style={styles.summaryTitle}>Medicamentos Activos</Text>
            <Text style={styles.summaryValue}>
              {(stats?.total ?? 0) - (stats?.caducados ?? 0)}
            </Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: "#E8F5E9", shadowColor: "#2E7D32" }]}>
          <Ionicons name="calendar-outline" size={22} color="#2E7D32" />
          <View>
            <Text style={styles.summaryTitle}>Próxima Toma</Text>
            <Text style={styles.summaryValue}>No programada</Text>
          </View>
        </View>
      </ScrollView>

      {/* 👤 Usuario abajo */}
      <View style={styles.userFooter}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.nombre.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{user?.nombre}</Text>
          <Text style={styles.userRole}>Gestiona tu inventario</Text>
        </View>
        <TouchableOpacity style={{ marginRight: 12 }} onPress={() => go('Settings')}>
        <Ionicons name="settings-outline" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: 12 }}
          onPress={() => {
            logout();
            props.navigation.closeDrawer();
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      marginBottom: 12,
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    logo: { width: 42, height: 42, resizeMode: "contain", marginRight: 10 },
    brand: { color: "#fff", fontWeight: "800", fontSize: 20 },
    subBrand: { color: "#DDEEFF", fontSize: 13 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textMuted,
      marginBottom: 8,
      marginLeft: 16,
      marginTop: 8,
      letterSpacing: 0.5,
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 14,
      marginVertical: 4,
      backgroundColor: theme.colors.card,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    navLabel: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: "600",
      marginLeft: 10,
    },
    summaryCard: {
      marginHorizontal: 12,
      marginVertical: 6,
      padding: 12,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    summaryTitle: { fontWeight: "600", color: "#333" },
    summaryValue: { fontSize: 13, color: "#555" },
    userFooter: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: "#F5F7FB",
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    avatarText: { color: "#fff", fontWeight: "700" },
    username: { fontWeight: "700", color: theme.colors.text },
    userRole: { fontSize: 12, color: theme.colors.textMuted },
  });
