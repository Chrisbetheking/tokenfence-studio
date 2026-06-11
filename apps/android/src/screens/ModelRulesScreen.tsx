import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getDefaultFileRoutingRules } from '@shared/fileRouter';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function ModelRulesScreen() {
  const rules = getDefaultFileRoutingRules();
  return (
    <ScrollView style={s.c}>
      <Text style={s.title}>Model Rules</Text>
      <Text style={s.sub}>File-type based model routing configuration</Text>
      <SectionCard title="Active Rules">
        {rules.filter(r=>r.enabled).map((r)=>(
          <View key={r.id} style={s.rule}>
            <View style={s.ruleLeft}>
              <Text style={s.ruleCat}>{r.fileCategory.toUpperCase()}</Text>
              <Text style={s.ruleDesc}>{r.description}</Text>
            </View>
            <View style={s.ruleRight}>
              <Text style={s.ruleProvider}>{r.provider}</Text>
              <Text style={s.ruleModel}>{r.model}</Text>
            </View>
          </View>
        ))}
      </SectionCard>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  c:{flex:1,backgroundColor:colors.background,padding:spacing.lg},
  title:{fontSize:24,fontWeight:'700',color:colors.text,marginBottom:4},
  sub:{fontSize:14,color:colors.textSecondary,marginBottom:spacing.lg},
  rule:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border},
  ruleLeft:{flex:1},
  ruleCat:{fontSize:13,fontWeight:'700',color:colors.primary},
  ruleDesc:{fontSize:13,color:colors.textSecondary,marginTop:2},
  ruleRight:{alignItems:'flex-end'},
  ruleProvider:{fontSize:14,fontWeight:'600',color:colors.text},
  ruleModel:{fontSize:11,fontFamily:'monospace',color:colors.textMuted,marginTop:2},
});
