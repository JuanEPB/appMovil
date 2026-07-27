import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendNeuralChatMessage } from "../api/apiNeural";
import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

const getAssistantText = (data: any) => {
  const response = data?.respuesta;

  if (typeof response === "string") {
    return response;
  }

  if (typeof response?.respuesta === "string") {
    return response.respuesta;
  }

  return "Solicitud procesada por la IA.";
};

const getAssistantOptions = (data: any) => {
  const options = data?.opciones || data?.contexto?.opciones;

  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .filter((option) => option?.texto && option?.mensaje_sugerido)
    .map((option) => ({
      id: String(option.id || option.mensaje_sugerido),
      text: String(option.texto),
      message: String(option.mensaje_sugerido),
    }));
};

export const ChatScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{
    role: string;
    content: string;
    options?: { id: string; text: string; message: string }[];
  }[]>([]);

  const sendMessage = async (message?: string) => {
    const text = (message ?? input).trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    if (!message) {
      setInput("");
    }

    try {
      const data = await sendNeuralChatMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: getAssistantText(data),
          options: getAssistantOptions(data),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "No se pudo conectar con la IA en este momento." },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderMenu />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View
          style={[
            styles.shell,
            webMaxWidthStyle(width),
            { paddingHorizontal: layout.pagePadding },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Chat IA</Text>
            <Text style={styles.subtitle}>Consulta dudas rapidas sobre inventario y reportes.</Text>
          </View>

          <FlatList
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.messages}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="message-circle" size={32} color={theme.colors.textMuted} />
                <Text style={styles.emptyTitle}>Sin mensajes</Text>
                <Text style={styles.emptyText}>Escribe una consulta para comenzar.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isUser = item.role === "user";
              return (
                <View style={[styles.message, isUser ? styles.userMsg : styles.aiMsg]}>
                  <Text style={[styles.messageText, isUser && styles.userText]}>{item.content}</Text>
                  {!isUser && item.options && item.options.length > 0 && (
                    <View style={styles.optionsWrap}>
                      {item.options.map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          style={styles.optionChip}
                          activeOpacity={0.85}
                          onPress={() => sendMessage(option.message)}
                        >
                          <Text style={styles.optionText}>{option.text}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            }}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor={theme.colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()} activeOpacity={0.85}>
              <Feather name="send" size={19} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isPhone: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    keyboard: { flex: 1 },
    shell: {
      flex: 1,
      alignSelf: "center",
      width: "100%",
      paddingTop: 18,
      paddingBottom: 14,
    },
    header: { marginBottom: 12 },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 28 : 34,
      fontWeight: "800",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 21,
      marginTop: 5,
    },
    messages: {
      flexGrow: 1,
      gap: 10,
      paddingVertical: 10,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 260,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 24,
      ...shadow(theme.colors.cardShadow),
    },
    emptyTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800",
      marginTop: 10,
    },
    emptyText: { color: theme.colors.textMuted, marginTop: 4, textAlign: "center" },
    message: {
      maxWidth: isPhone ? "88%" : "70%",
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    userMsg: {
      alignSelf: "flex-end",
      backgroundColor: theme.colors.primary,
    },
    aiMsg: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    messageText: { color: theme.colors.text, fontSize: 15, lineHeight: 21 },
    userText: { color: "#fff" },
    optionsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    },
    optionChip: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
    },
    optionText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "700",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 10,
      ...shadow(theme.colors.cardShadow),
    },
    input: {
      flex: 1,
      maxHeight: 120,
      minHeight: 44,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 11,
      color: theme.colors.text,
      fontSize: 15,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
  });
