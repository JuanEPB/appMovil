import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import Feather from '@expo/vector-icons/Feather';

export const HeaderMenu = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const width = Dimensions.get("window").width;

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.card, width: width }]}>
      {/* Botón del menú */}
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}>
        <Feather name="sidebar" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Texto degradado con máscara */}
      <MaskedView
        maskElement={
          <Text style={styles.titleText} numberOfLines={10}>
            Pharmacontrol
          </Text>
        }
      >
        <LinearGradient
          colors={["#8E2DE2", "#C84CFB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          
          <Text style={[styles.titleText, { opacity: 0 }]}>Pharmacontrol </Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  menuButton: {
    marginRight: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800",
    color: "black", // se enmascara, así que no importa
  },
});
