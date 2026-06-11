import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TaskType } from '@shared/types';
import { TASK_TYPE_LABELS } from '@shared/types';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

type Nav = NativeStackNavigationProp<{ Home: undefined; Guard: { prompt: string } }, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [prompt, setPrompt] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('general');

  const handleScan = () => { if (prompt.trim()) navigation.navigate('Guard', { prompt }); };
  const handleClear = () => setPrompt('');

  return (
    <ScrollView style={s.c} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>New Safe Prompt</Text>
      <Text style={s.sub}>Compose or paste your prompt below for scanning</Text>
      <View style={s.chips}>{(Object.entries(TASK_TYPE_LABELS) as [TaskType, string][]).map(([k,v]) => (
        <TouchableOpacity key={k} style={[s.chip, taskType===k&&s.chipA]} onPress={()=>setTaskType(k)}>
          <Text style={[s.chipT, taskType===k&&s.chipTA]}>{v}</Text>
        </TouchableOpacity>
      ))}</View>
      <View style={s.inputWrap}>
        <TextInput style={s.input} value={prompt} onChangeText={setPrompt}
          placeholder="Paste your prompt here..." placeholderTextColor={colors.textMuted}
          multiline textAlignVertical="top" />
        {prompt.length > 0 && (
          <TouchableOpacity style={s.clearBtn} onPress={handleClear}>
            <Text style={s.clearBtnT}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={[s.btn, !prompt.trim()&&s.btnD]}
        onPress={handleScan} disabled={!prompt.trim()}>
        <Text style={s.btnT}>Scan Prompt</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  c:{flex:1,backgroundColor:colors.background,padding:spacing.lg},
  title:{fontSize:24,fontWeight:'700',color:colors.text,marginBottom:4},
  sub:{fontSize:14,color:colors.textSecondary,marginBottom:spacing.xl},
  chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:spacing.lg},
  chip:{paddingHorizontal:12,paddingVertical:4,borderRadius:20,backgroundColor:colors.surfaceAlt,borderWidth:1,borderColor:colors.border},
  chipA:{backgroundColor:colors.primary,borderColor:colors.primary},
  chipT:{fontSize:12,fontWeight:'500',color:colors.textSecondary},
  chipTA:{color:colors.white},
  inputWrap:{position:'relative',marginBottom:spacing.lg},
  input:{minHeight:180,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,fontSize:14,fontFamily:'monospace',color:colors.text,backgroundColor:colors.surface},
  clearBtn:{position:'absolute',top:8,right:8,paddingHorizontal:10,paddingVertical:4,borderRadius:radius.sm,backgroundColor:colors.surfaceAlt},
  clearBtnT:{fontSize:11,color:colors.textSecondary},
  btn:{backgroundColor:colors.primary,borderRadius:radius.md,paddingVertical:spacing.md,alignItems:'center'},
  btnD:{opacity:0.5},
  btnT:{color:colors.white,fontSize:15,fontWeight:'600'},
});
