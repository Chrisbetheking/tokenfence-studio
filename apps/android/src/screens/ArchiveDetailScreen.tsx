import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { loadArchive } from '../storage/archiveStore';
import type { ArchiveEntry } from '@shared/types';
import { SENSITIVE_TYPE_LABELS } from '@shared/types';
import { RiskBadge } from '../components/RiskBadge';
import { SafeTextBox } from '../components/SafeTextBox';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Route = RouteProp<{ ArchiveDetail: { id: string } }, 'ArchiveDetail'>;

export function ArchiveDetailScreen() {
  const route = useRoute<Route>();
  const [entry, setEntry] = useState<ArchiveEntry|null>(null);
  useEffect(()=>{loadArchive().then(e=>setEntry(e.find(x=>x.id===route.params.id)||null));},[route.params.id]);
  if(!entry) return <View style={s.empty}><Text style={s.emptyT}>Entry not found</Text></View>;
  const {guardResult}=entry;
  return (
    <ScrollView style={s.c}>
      <RiskBadge level={guardResult.riskLevel} count={guardResult.findings.length} />
      <Text style={s.d}>{new Date(entry.savedAt).toLocaleString()}</Text>
      {guardResult.findings.length>0&&<View style={s.sec}>{guardResult.findings.map((f,i)=><View key={i} style={s.f}><Text style={s.ft}>{SENSITIVE_TYPE_LABELS[f.type]}</Text><Text style={s.fm}>{f.match}</Text></View>)}</View>}
      <Text style={s.st}>Redacted Prompt</Text><SafeTextBox text={guardResult.redacted} />
      {guardResult.original?<><Text style={s.st}>Original Prompt</Text><SafeTextBox text={guardResult.original} /></>:<Text style={s.note}>Original prompt not stored (sanitized-only mode)</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c:{flex:1,backgroundColor:colors.background,padding:spacing.lg},
  empty:{flex:1,justifyContent:'center',alignItems:'center'},
  emptyT:{fontSize:17,color:colors.textSecondary},
  d:{fontSize:12,color:colors.textMuted,marginTop:8,marginBottom:spacing.lg},
  sec:{marginBottom:spacing.lg},
  st:{fontSize:16,fontWeight:'600',color:colors.text,marginBottom:8},
  f:{paddingVertical:4,borderBottomWidth:1,borderBottomColor:colors.border,marginBottom:4},
  ft:{fontSize:14,fontWeight:'600',color:colors.text},
  fm:{fontSize:12,fontFamily:'monospace',color:colors.textSecondary},
  note:{fontSize:13,color:colors.textMuted,fontStyle:'italic'},
});
