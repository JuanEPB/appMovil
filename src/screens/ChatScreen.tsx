import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderMenu } from "../components/HeaderMenu";

export const ChatScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = { role: "user", content: input };
    setMessages([...messages, newMsg]);
    setInput("");

    try {
      const res = await axios.post("https://tuapi.com/api/chat", { message: input });
      const aiMsg = { role: "ai", content: res.data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "ai", content: "⚠️ Error de conexión con la IA." }]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 50 }}
        >
        <HeaderMenu/>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msg,
              item.role === "user" ? styles.userMsg : styles.aiMsg,
            ]}
          >
            <Text style={styles.msgText}>{item.content}</Text>
          </View>
        )}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor={theme.colors.textMuted}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    msg: {
      marginVertical: 6,
      padding: 10,
      borderRadius: 10,
      maxWidth: "80%",
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
    msgText: { color: theme.colors.text },
    inputRow: {
      flexDirection: "row",
      padding: 10,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      paddingHorizontal: 12,
      color: theme.colors.text,
    },
    sendBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      marginLeft: 8,
      borderRadius: 10,
      justifyContent: "center",
    },
  });
