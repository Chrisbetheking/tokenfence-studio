import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

export function SectionCard({title,children}:{title:string;children:React.ReactNode}) {
  return <View style={s.c}><Text style={s.t}>{title}</Text><View>{children}</View></View>;
}
const s = StyleSheet.create({
  c:{backgroundColor:colors.surface,borderRadius:radius.md,padding:spacing.lg,marginTop:spacing.lg,borderWidth:1,borderColor:colors.border},
  t:{fontSize:15,fontWeight:'600',color:colors.text,marginBottom:spacing.md},
});
