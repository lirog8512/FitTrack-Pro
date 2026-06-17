import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>FitTrack Pro ✅</Text>
      <Text style={styles.sub}>App cargando correctamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#22C55E', fontSize: 28, fontWeight: 'bold' },
  sub: { color: '#9CA3AF', fontSize: 16, marginTop: 8 },
});
