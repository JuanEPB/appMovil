
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ChatScreen = () => {
  const [messages, setMessages] = useState([{ id: '1', from: 'bot', text: 'Hola 👋 ¿En qué puedo ayudarte?' }]);
  const [input, setInput] = useState('');
  const { theme } = useTheme();

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), from: 'user', text: input },
      { id: Date.now() + '_bot', from: 'bot', text: 'Respuesta simulada 🤖' },
    ]);
    setInput('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={{ color: item.from === 'user' ? '#fff' : theme.colors.text }}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      />
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Escribe tu mensaje..." />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  bubble: { padding: 12, marginVertical: 6, borderRadius: 12, maxWidth: '75%' },
  userBubble: { backgroundColor: '#0EA5E9', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#ecf0f1', alignSelf: 'flex-start' },
  inputContainer: { flexDirection: 'row', borderRadius: 20, paddingHorizontal: 10, alignItems: 'center', margin: 10 },
  input: { flex: 1, padding: 10 },
  sendBtn: { backgroundColor: '#0EA5E9', padding: 10, borderRadius: 50, marginLeft: 5 },
});
