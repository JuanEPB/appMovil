
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const Button = ({ title, onPress, loading=false }: { title: string; onPress: () => void; loading?: boolean; }) => {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
