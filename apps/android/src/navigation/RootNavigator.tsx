import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Import but don't use
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

function Screen({ title }: { title: string }) {
  return <View style={s.c}><Text style={s.t}>{title}</Text></View>;
}
const s = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  t: { fontSize: 24, fontWeight: '700', color: '#3b82f6' },
});

export function RootNavigator() {
  return <Screen title="No tabs - just import test" />;
}