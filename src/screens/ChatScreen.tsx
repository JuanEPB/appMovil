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
  getMedicineSupportInfo,
  sendLearningFeedback,
  sendNeuralChatMessage,
  sendVoiceTranscript,
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
  medicineInfo?: any;
};

const SESSION_ID = "app-movil";

declare const window: any;

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

const detectMedicineQuery = (message: string) => {
  const clean = message.trim();
  const normalized = clean
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const triggers = [
    "medicamento",
    "medicina",
    "pastilla",
    "tableta",
    "capsula",
    "capsulas",
    "jarabe",
    "inyeccion",
    "info de",
    "informacion de",
    "busca",
    "revisa",
  ];

  if (!triggers.some((trigger) => normalized.includes(trigger))) return "";

  const directMatch = clean.match(
    /\b(?:info|informacion|datos|recomendacion|recomendaciones)\s+(?:de|del|sobre)\s+(.+)$/i,
  );
  const directName = directMatch?.[1]
    ?.replace(/\b(por favor|gracias)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (directName && directName.length >= 3) return directName;

  const cleanedName = clean
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(busca|revisa|consulta|dime|dame|quiero|necesito|muestrame|ensename)\s+/i, "")
    .replace(/\b(info|informacion|datos|recomendacion|recomendaciones)\b\s*(de|del|sobre)?/gi, "")
    .replace(/\b(medicamento|medicina|pastilla|tableta|capsula|capsulas|jarabe|inyeccion)\b/gi, "")
    .replace(/\b(para|con|el|la|un|una|por favor)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleanedName.length >= 3 ? cleanedName : "";
};

const formatMedicineSupportText = (info: any) => {
  const local = info?.medicamento_local || {};
  const lines = [
    info?.mensaje_usuario,
    local?.nombre
      ? `Base local: ${local.nombre} | stock ${local.stock ?? 0} | precio $${Number(
          local.precio || 0,
        ).toFixed(2)}`
      : "",
    local?.lote || local?.caducidad
      ? `Lote ${local.lote || "sin lote"} | caducidad ${local.caducidad || "sin fecha"}`
      : "",
    ...(info?.informacion?.indicaciones || []),
    ...(info?.informacion?.advertencias || []),
    ...(info?.informacion?.no_usar_en || []),
    ...(info?.recomendaciones_seguras || []),
    info?.aviso_medico,
    ...(info?.errores || []),
  ].filter(Boolean);

  return lines.join("\n\n");
};

const MedicineSupportCard = ({
  info,
  styles,
  theme,
}: {
  info: any;
  styles: ReturnType<typeof getStyles>;
  theme: any;
}) => {
  const local = info?.medicamento_local || {};
  const recommendations = [
    ...(info?.informacion?.indicaciones || []),
    ...(info?.informacion?.advertencias || []),
    ...(info?.informacion?.no_usar_en || []),
    ...(info?.recomendaciones_seguras || []),
  ].filter(Boolean);
  const errors = (info?.errores || []).filter(Boolean);

  return (
    <View style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <View style={styles.medicineIcon}>
          <Feather name="shield" size={16} color={theme.colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.medicineEyebrow}>Consulta de medicamento</Text>
          <Text style={styles.medicineName}>
            {local?.nombre || info?.normalizacion?.nombre_normalizado || info?.consulta}
          </Text>
        </View>
      </View>

      {info?.mensaje_usuario ? (
        <Text style={styles.medicineMessage}>{info.mensaje_usuario}</Text>
      ) : null}

      {local?.nombre ? (
        <View style={styles.medicineMetrics}>
          <Metric label="Stock" value={String(local.stock ?? 0)} styles={styles} />
          <Metric
            label="Precio"
            value={`$${Number(local.precio || 0).toFixed(2)}`}
            styles={styles}
          />
          <Metric label="Lote" value={String(local.lote || "Sin lote")} styles={styles} />
          <Metric
            label="Caducidad"
            value={String(local.caducidad || "Sin fecha")}
            styles={styles}
          />
        </View>
      ) : null}

      {recommendations.length > 0 ? (
        <View style={styles.medicineSection}>
          <Text style={styles.medicineSectionTitle}>Recomendaciones</Text>
          {recommendations.slice(0, 5).map((item: string, index: number) => (
            <View key={`${item}-${index}`} style={styles.medicineBullet}>
              <View style={styles.medicineDot} />
              <Text style={styles.medicineBulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {errors.length > 0 ? (
        <View style={styles.medicineSection}>
          <Text style={styles.medicineSectionTitle}>Avisos tecnicos</Text>
          {errors.map((item: string, index: number) => (
            <Text key={`${item}-${index}`} style={styles.medicineError}>
              {item}
            </Text>
          ))}
        </View>
      ) : null}

      <Text style={styles.medicineDisclaimer}>{info?.aviso_medico}</Text>
    </View>
  );
};

const Metric = ({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof getStyles>;
}) => (
  <View style={styles.metricBox}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

export const ChatScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const layout = getLayout(width);
  const styles = useMemo(() => getStyles(theme, layout.isPhone), [theme, layout.isPhone]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [input, setInput] = useState("");
  const [voiceInput, setVoiceInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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
      const medicineName = detectMedicineQuery(text);
      const data = medicineName
        ? await getMedicineSupportInfo(medicineName)
        : await sendNeuralChatMessage(text, SESSION_ID);
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: medicineName ? formatMedicineSupportText(data) : getAssistantText(data),
        sourceMessage: text,
        intent: medicineName ? "consulta_medicamento" : getIntent(data),
        options: medicineName ? [] : getAssistantOptions(data),
        medicineInfo: medicineName ? data : undefined,
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

  const sendVoiceMessage = async () => {
    const transcript = voiceInput.trim();
    if (!transcript || loading || voiceLoading) return;

    const userMessage: ChatMessage = {
      id: `voice-user-${Date.now()}`,
      role: "user",
      content: `Voz: ${transcript}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setVoiceLoading(true);
    setVoiceInput("");
    scrollToEnd();

    try {
      const medicineName = detectMedicineQuery(transcript);
      const data = medicineName
        ? await getMedicineSupportInfo(medicineName)
        : await sendVoiceTranscript(transcript, "app-movil-voz");
      const assistantMessage: ChatMessage = {
        id: `voice-ai-${Date.now()}`,
        role: "ai",
        content: medicineName
          ? formatMedicineSupportText(data)
          : data?.respuesta_texto || getAssistantText(data?.resultado || data),
        sourceMessage: transcript,
        intent: medicineName ? "consulta_medicamento" : getIntent(data?.resultado || data),
        options: medicineName ? [] : getAssistantOptions(data?.resultado || data),
        medicineInfo: medicineName ? data : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `voice-error-${Date.now()}`,
          role: "ai",
          content:
            "No pude procesar la transcripcion de voz. Revisa la API Neural.",
          sourceMessage: transcript,
        },
      ]);
    } finally {
      setVoiceLoading(false);
      scrollToEnd();
    }
  };

  const startVoiceRecognition = () => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      setMessages((prev) => [
        ...prev,
        {
          id: `voice-native-${Date.now()}`,
          role: "ai",
          content:
            "El reconocimiento por micrófono directo está disponible en navegador. En app nativa falta agregar permisos y módulo de audio.",
        },
      ]);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          id: `voice-unsupported-${Date.now()}`,
          role: "ai",
          content:
            "Este navegador no permite reconocimiento de voz. Prueba Chrome o Edge.",
        },
      ]);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-MX";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setVoiceInput("");
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      setVoiceInput(transcript);

      const lastResult = event.results[event.results.length - 1];
      if (lastResult?.isFinal && transcript) {
        recognition.stop();
        void sendVoiceTranscriptToAi(transcript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
      setMessages((prev) => [
        ...prev,
        {
          id: `voice-recognition-error-${Date.now()}`,
          role: "ai",
          content:
            "No pude escuchar el micrófono. Revisa permisos del navegador.",
        },
      ]);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const sendVoiceTranscriptToAi = async (transcript: string) => {
    const cleanTranscript = transcript.trim();
    if (!cleanTranscript || loading || voiceLoading) return;

    const userMessage: ChatMessage = {
      id: `voice-user-${Date.now()}`,
      role: "user",
      content: `Voz: ${cleanTranscript}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setVoiceLoading(true);
    scrollToEnd();

    try {
      const medicineName = detectMedicineQuery(cleanTranscript);
      const data = medicineName
        ? await getMedicineSupportInfo(medicineName)
        : await sendVoiceTranscript(cleanTranscript, "app-movil-voz");
      const assistantMessage: ChatMessage = {
        id: `voice-ai-${Date.now()}`,
        role: "ai",
        content: medicineName
          ? formatMedicineSupportText(data)
          : data?.respuesta_texto || getAssistantText(data?.resultado || data),
        sourceMessage: cleanTranscript,
        intent: medicineName ? "consulta_medicamento" : getIntent(data?.resultado || data),
        options: medicineName ? [] : getAssistantOptions(data?.resultado || data),
        medicineInfo: medicineName ? data : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `voice-error-${Date.now()}`,
          role: "ai",
          content:
            "Escuché la voz, pero no pude enviar la transcripción a la IA.",
          sourceMessage: cleanTranscript,
        },
      ]);
    } finally {
      setVoiceLoading(false);
      setVoiceInput("");
      scrollToEnd();
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

          <View style={styles.voicePanel}>
            <View style={styles.voiceHeader}>
              <View style={styles.voiceIcon}>
                <Feather name="mic" size={16} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.voiceTitle}>Modo voz</Text>
                <Text style={styles.voiceHint}>Toca el micrófono, habla y la IA procesa tu pedido.</Text>
              </View>
            </View>
            <View style={styles.voiceInputRow}>
              <TextInput
                style={styles.voiceInput}
                placeholder="Ej. revisa medicamentos con bajo stock"
                placeholderTextColor={theme.colors.textMuted}
                value={voiceInput}
                onChangeText={setVoiceInput}
                editable={!voiceLoading && !loading}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.voiceButton,
                  listening && styles.voiceButtonListening,
                  (voiceLoading || loading) && styles.sendDisabled,
                  pressed && styles.pressed,
                ]}
                disabled={voiceLoading || loading}
                onPress={startVoiceRecognition}
              >
                {voiceLoading || listening ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="mic" size={17} color="#fff" />
                )}
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.voiceSendButton,
                  (!voiceInput.trim() || voiceLoading || loading) && styles.sendDisabled,
                  pressed && styles.pressed,
                ]}
                disabled={!voiceInput.trim() || voiceLoading || loading}
                onPress={sendVoiceMessage}
              >
                <Feather name="send" size={16} color="#fff" />
              </Pressable>
            </View>
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
                    {item.medicineInfo ? (
                      <MedicineSupportCard
                        info={item.medicineInfo}
                        styles={styles}
                        theme={theme}
                      />
                    ) : (
                      <Text style={[styles.messageText, isUser && styles.userText]}>
                        {item.content}
                      </Text>
                    )}

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
    flex: {
      flex: 1,
      minWidth: 0,
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
    voicePanel: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 12,
      marginBottom: 10,
      ...shadow(theme.colors.cardShadow),
    },
    voiceHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    voiceIcon: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: theme.colors.background,
    },
    voiceTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
    },
    voiceHint: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 2,
    },
    voiceInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    voiceInput: {
      flex: 1,
      minHeight: 42,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      paddingHorizontal: 12,
      fontSize: 14,
    },
    voiceButton: {
      width: 44,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
    },
    voiceButtonListening: {
      backgroundColor: theme.colors.danger,
    },
    voiceSendButton: {
      width: 44,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: theme.colors.success,
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
    medicineCard: {
      gap: 10,
      minWidth: isPhone ? 250 : 360,
    },
    medicineHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    medicineIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    medicineEyebrow: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    medicineName: {
      color: theme.colors.text,
      fontSize: isPhone ? 16 : 18,
      lineHeight: isPhone ? 21 : 23,
      fontWeight: "800",
      marginTop: 2,
    },
    medicineMessage: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
    medicineMetrics: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    metricBox: {
      flexGrow: 1,
      flexBasis: isPhone ? "45%" : "22%",
      minWidth: isPhone ? 112 : 120,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 10,
      paddingVertical: 9,
    },
    metricLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    metricValue: {
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "800",
      marginTop: 3,
    },
    medicineSection: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 10,
      gap: 7,
    },
    medicineSectionTitle: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    medicineBullet: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    medicineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginTop: 6,
      backgroundColor: theme.colors.success,
    },
    medicineBulletText: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    medicineError: {
      color: theme.colors.warning,
      fontSize: 12,
      lineHeight: 18,
    },
    medicineDisclaimer: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 9,
    },
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
