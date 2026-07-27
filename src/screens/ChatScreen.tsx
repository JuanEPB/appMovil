import { Feather } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  sendLearningFeedback,
  sendNeuralChatMessage,
} from "../api/apiNeural";
import { HeaderMenu } from "../components/HeaderMenu";
import { useTheme } from "../context/ThemeContext";
import { getLayout, shadow, webMaxWidthStyle } from "../utils/responsive";

type ChatOption = {
  id: string;
  text: string;
  message: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  sourceMessage?: string;
  intent?: string;
  options?: ChatOption[];
  feedback?: "up" | "down";
};

const SESSION_ID = "app-movil";

const QUICK_PROMPTS: ChatOption[] = [
  {
    id: "compras",
    text: "Qué comprar",
    message: "Qué debo comprar",
  },
  {
    id: "alertas",
    text: "Alertas",
    message: "Muéstrame las alertas",
  },
  {
    id: "agotamiento",
    text: "Agotamiento",
    message: "Cuándo se agotará Paracetamol",
  },
  {
    id: "reporte",
    text: "Reporte",
    message: "Genera un reporte ejecutivo",
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "ai",
    content:
      "Hola. Soy tu IA de inventario. Puedo ayudarte a decidir compras, revisar alertas, predecir agotamientos y preparar reportes.",
    options: QUICK_PROMPTS,
  },
];

const getAssistantText = (data: any) => {
  const response = data?.respuesta;

  if (typeof response === "string") return response;
  if (typeof response?.respuesta === "string") return response.respuesta;

  return "Listo, procesé tu solicitud con la IA.";
};

const getAssistantOptions = (data: any) => {
  const options = data?.opciones || data?.contexto?.opciones;

  if (!Array.isArray(options)) return [];

  return options
    .filter((option) => option?.texto && option?.mensaje_sugerido)
    .map((option) => ({
      id: String(option.id || option.mensaje_sugerido),
      text: String(option.texto),
      message: String(option.mensaje_sugerido),
    }));
};

const getIntent = (data: any) =>
  String(data?.contexto?.tipo || data?.contexto?.intencion || data?.intencion || "");

export const ChatScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const sendMessage = async (message?: string) => {
    const text = (message ?? input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    if (!message) setInput("");
    scrollToEnd();

    try {
      const data = await sendNeuralChatMessage(text, SESSION_ID);
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: getAssistantText(data),
        sourceMessage: text,
        intent: getIntent(data),
        options: getAssistantOptions(data),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          role: "ai",
          content:
            "No pude conectar con la IA. Revisa que Pharma Neural esté encendido y que la URL de API sea correcta.",
          sourceMessage: text,
        },
      ]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const markFeedback = async (message: ChatMessage, feedback: "up" | "down") => {
    setMessages((prev) =>
      prev.map((item) => (item.id === message.id ? { ...item, feedback } : item)),
    );

    if (!message.sourceMessage) return;

    try {
      await sendLearningFeedback({
        mensaje: message.sourceMessage,
        respuesta: message.content,
        util: feedback === "up",
        sesionId: SESSION_ID,
        intencion: message.intent,
        correccion:
          feedback === "down"
            ? "El usuario indicó que esta respuesta necesita revisión."
            : undefined,
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `feedback-error-${Date.now()}`,
          role: "ai",
          content:
            "Guardé tu reacción en pantalla, pero no pude enviarla al módulo de aprendizaje.",
        },
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
            <View style={styles.headerIcon}>
              <Feather name="cpu" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Chat IA</Text>
              <Text style={styles.subtitle}>
                Respuestas guiadas para compras, alertas, inventario y reportes.
              </Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            {QUICK_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt.id}
                onPress={() => sendMessage(prompt.message)}
                style={({ pressed }) => [styles.quickChip, pressed && styles.pressed]}
              >
                <Text style={styles.quickText}>{prompt.text}</Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messages}
            onContentSizeChange={scrollToEnd}
            renderItem={({ item }) => {
              const isUser = item.role === "user";
              return (
                <View style={[styles.messageRow, isUser && styles.userRow]}>
                  {!isUser && (
                    <View style={styles.avatar}>
                      <Feather name="zap" size={15} color={theme.colors.primary} />
                    </View>
                  )}
                  <View style={[styles.message, isUser ? styles.userMsg : styles.aiMsg]}>
                    <Text style={[styles.messageText, isUser && styles.userText]}>
                      {item.content}
                    </Text>

                    {!isUser && item.options && item.options.length > 0 && (
                      <View style={styles.optionsWrap}>
                        {item.options.map((option) => (
                          <Pressable
                            key={option.id}
                            style={({ pressed }) => [
                              styles.optionChip,
                              pressed && styles.pressed,
                            ]}
                            onPress={() => sendMessage(option.message)}
                          >
                            <Text style={styles.optionText}>{option.text}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}

                    {!isUser && item.sourceMessage && (
                      <View style={styles.feedbackRow}>
                        <Text style={styles.feedbackLabel}>¿Sirvió?</Text>
                        <Pressable
                          accessibilityLabel="Respuesta útil"
                          onPress={() => markFeedback(item, "up")}
                          style={[
                            styles.feedbackButton,
                            item.feedback === "up" && styles.feedbackActive,
                          ]}
                        >
                          <Feather
                            name="thumbs-up"
                            size={14}
                            color={
                              item.feedback === "up"
                                ? "#FFFFFF"
                                : theme.colors.textMuted
                            }
                          />
                        </Pressable>
                        <Pressable
                          accessibilityLabel="Respuesta no útil"
                          onPress={() => markFeedback(item, "down")}
                          style={[
                            styles.feedbackButton,
                            item.feedback === "down" && styles.feedbackActiveDanger,
                          ]}
                        >
                          <Feather
                            name="thumbs-down"
                            size={14}
                            color={
                              item.feedback === "down"
                                ? "#FFFFFF"
                                : theme.colors.textMuted
                            }
                          />
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              loading ? (
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.typingText}>La IA está pensando...</Text>
                </View>
              ) : null
            }
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Pregúntame qué comprar, qué se agota o qué alertas hay..."
              placeholderTextColor={theme.colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!loading}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                (!input.trim() || loading) && styles.sendDisabled,
                pressed && styles.pressed,
              ]}
              disabled={!input.trim() || loading}
              onPress={() => sendMessage()}
            >
              <Feather name="send" size={19} color="#fff" />
            </Pressable>
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
      paddingTop: 16,
      paddingBottom: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    headerIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerCopy: { flex: 1, minWidth: 0 },
    title: {
      color: theme.colors.text,
      fontSize: isPhone ? 27 : 32,
      fontWeight: "700",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 3,
    },
    quickRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
    },
    quickChip: {
      minHeight: 34,
      justifyContent: "center",
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingHorizontal: 12,
    },
    quickText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "700",
    },
    messages: {
      flexGrow: 1,
      gap: 12,
      paddingVertical: 10,
    },
    messageRow: {
      maxWidth: isPhone ? "94%" : "78%",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 9,
    },
    userRow: {
      alignSelf: "flex-end",
      justifyContent: "flex-end",
    },
    avatar: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    message: {
      minWidth: 90,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    userMsg: {
      alignSelf: "flex-end",
      backgroundColor: theme.colors.primary,
    },
    aiMsg: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...shadow(theme.colors.cardShadow),
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
    feedbackRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginTop: 10,
      paddingTop: 9,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    feedbackLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
      marginRight: 2,
    },
    feedbackButton: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 7,
      backgroundColor: theme.colors.background,
    },
    feedbackActive: {
      backgroundColor: theme.colors.success,
    },
    feedbackActiveDanger: {
      backgroundColor: theme.colors.danger,
    },
    typingRow: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 2,
    },
    typingText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      padding: 10,
      ...shadow(theme.colors.cardShadow),
    },
    input: {
      flex: 1,
      maxHeight: 120,
      minHeight: 44,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 11,
      color: theme.colors.text,
      fontSize: 15,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
    sendDisabled: {
      opacity: 0.45,
    },
    pressed: {
      opacity: 0.78,
    },
  });

export default ChatScreen;
