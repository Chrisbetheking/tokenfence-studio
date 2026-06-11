import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ProviderModel } from '@shared/types';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

export function ProviderCard({model}:{model:ProviderModel}) {
  const local = model.deployment==='local';
  return (
    <View style={s.c}>
      <View style={s.h}><View><Text style={s.p}>{model.provider}</Text><Text style={s.m}>{model.model}</Text></View>
        <View style={[s.b,local?s.bl:s.bc]}><Text style={[s.bt,local?s.blt:s.bct]}>{local?'Local':'Cloud'}</Text></View></View>
      <View style={s.d}><Text style={s.dl}>Best for</Text><Text style={s.dv}>{model.bestFor}</Text></View>
      <View style={s.d}><Text style={s.dl}>Risk policy</Text><Text style={s.dv}>{model.riskPolicy}</Text></View>
    </View>
  );
}
const s = StyleSheet.create({
  c:{backgroundColor:colors.surface,borderRadius:radius.md,padding:spacing.lg,borderWidth:1,borderColor:colors.border},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12},
  p:{fontSize:16,fontWeight:'700',color:colors.text},
  m:{fontSize:12,fontFamily:'monospace',color:colors.textMuted,marginTop:2},
  b:{paddingHorizontal:8,paddingVertical:2,borderRadius:radius.sm},
  bl:{backgroundColor:'#dcfce7'},bc:{backgroundColor:'#dbeafe'},
  bt:{fontSize:11,fontWeight:'600'},
  blt:{color:'#166534'},bct:{color:'#1e40af'},
  d:{marginTop:8},
  dl:{fontSize:11,fontWeight:'600',color:colors.textMuted,textTransform:'uppercase'},
  dv:{fontSize:13,color:colors.textSecondary,marginTop:2},
});
