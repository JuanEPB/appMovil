import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView } from "react-native";
import { appTheme } from "../themes/appTheme";
import { SafeAreaView } from "react-native-safe-area-context";

export const ChatScreen = () => {
  const [messages, setMessages] = useState([{ id: "1", from: "bot", text: "Hola 👋 ¿En qué puedo ayudarte?" }]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now().toString(), from: "user", text: input },
      { id: Date.now() + "_bot", from: "bot", text: "Respuesta simulada 🤖" },
    ]);
    setInput("");
  };

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === "user" ? styles.userBubble : styles.botBubble]}>
            <Text style={{ color: item.from === "user" ? "#fff" : appTheme.colors.text }}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Escribe tu mensaje..." />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>➤</Text>
        </TouchableOpacity>
      </View>
    
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.background, padding: 10 },
  bubble: { padding: 12, marginVertical: 6, borderRadius: 12, maxWidth: "75%" },
  userBubble: { backgroundColor: appTheme.colors.primary, alignSelf: "flex-end" },
  botBubble: { backgroundColor: "#ecf0f1", alignSelf: "flex-start" },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  input: { flex: 1, padding: 10 },
  sendBtn: { backgroundColor: appTheme.colors.primary, padding: 10, borderRadius: 50, marginLeft: 5 },
});
