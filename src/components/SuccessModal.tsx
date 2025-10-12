import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  onRequestClose?: () => void; // 👈 importante para manejar cierre seguro
};

export const SuccessModal: React.FC<Props> = ({
  visible,
  title = "Listo",
  message = "Operación realizada con éxito",
  onRequestClose,
}) => {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const animate = async () => {
      if (!isMounted) return;

      if (visible) {
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.9,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    animate();

    return () => {
      isMounted = false; // 👈 evita llamadas async al desmontar
    };
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose} // 👈 evita “dismiss undefined” cuando se desmonta
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            {title}
          </Text>
          <Text style={[styles.msg, { color: theme.colors.text }]}>{message}</Text>

          {onRequestClose && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.colors.primary }]}
              onPress={onRequestClose}
            >
              <Text style={styles.btnText}>Aceptar</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  msg: { fontSize: 14, opacity: 0.9, textAlign: "center", marginBottom: 12 },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
