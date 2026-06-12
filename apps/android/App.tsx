import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={s.c}>
        <Text style={s.t}>SafeArea Test</Text>
      </View>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  t: { fontSize: 24, fontWeight: '700', color: '#3b82f6' },
});