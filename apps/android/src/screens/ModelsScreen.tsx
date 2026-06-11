import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PROVIDERS, recommendModel } from '@shared/providers';
import type { RiskLevel } from '@shared/types';
import { ProviderCard } from '../components/ProviderCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const FILTERS: (RiskLevel|'all')[] = ['all','safe','low','medium','high'];

export function ModelsScreen() {
  const [filter, setFilter] = useState<RiskLevel|'all'>('all');
  const models = filter === 'all' ? PROVIDERS : recommendModel(filter);
  return (
    <ScrollView style={s.c}>
      <Text style={s.title}>Model Router</Text>
      <Text style={s.sub}>Compare provider models and routing recommendations</Text>
      <View style={s.fRow}>{FILTERS.map(l=>(
        <TouchableOpacity key={l} style={[s.chip,filter===l&&s.chipA]} onPress={()=>setFilter(l)}>
          <Text style={[s.chipT,filter===l&&s.chipTA]}>{l==='all'?'All':l.charAt(0).toUpperCase()+l.slice(1)}</Text>
        </TouchableOpacity>
      ))}</View>
      <View style={s.grid}>{models.map((m,i)=><ProviderCard key={m.provider+'-'+i} model={m} />)}</View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c:{flex:1,backgroundColor:colors.background,padding:spacing.lg},
  title:{fontSize:24,fontWeight:'700',color:colors.text,marginBottom:4},
  sub:{fontSize:14,color:colors.textSecondary,marginBottom:spacing.lg},
  fRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:spacing.lg},
  chip:{paddingHorizontal:12,paddingVertical:4,borderRadius:20,backgroundColor:colors.surfaceAlt,borderWidth:1,borderColor:colors.border},
  chipA:{backgroundColor:colors.primary,borderColor:colors.primary},
  chipT:{fontSize:12,fontWeight:'500',color:colors.textSecondary},
  chipTA:{color:colors.white},
  grid:{gap:8},
});
