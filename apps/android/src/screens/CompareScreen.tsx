import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PROVIDERS } from '@shared/providers';
import type { ProviderModel } from '@shared/types';
import { ProviderCard } from '../components/ProviderCard';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

export function CompareScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (m: ProviderModel) => {
    const key = m.provider + ':' + m.model;
    setSelected(prev => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev,key].slice(-2));
  };
  return (
    <ScrollView style={s.c}>
      <Text style={s.title}>Compare Models</Text>
      <Text style={s.sub}>Select up to 2 models to compare side by side</Text>
      <View style={s.grid}>
        {PROVIDERS.map((m,i)=>(
          <TouchableOpacity key={i} style={[s.card,selected.includes(m.provider+':'+m.model)&&s.cardSel]} onPress={()=>toggle(m)}>
            <ProviderCard model={m} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  c:{flex:1,backgroundColor:colors.background,padding:spacing.lg},
  title:{fontSize:24,fontWeight:'700',color:colors.text,marginBottom:4},
  sub:{fontSize:14,color:colors.textSecondary,marginBottom:spacing.lg},
  grid:{gap:8},
  card:{borderRadius:radius.md},
  cardSel:{borderWidth:2,borderColor:colors.primary},
});
