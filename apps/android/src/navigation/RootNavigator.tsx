// @ts-nocheck
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { GuardScreen } from '../screens/GuardScreen';
import { ModelsScreen } from '../screens/ModelsScreen';
import { ArchiveScreen } from '../screens/ArchiveScreen';
import { ArchiveDetailScreen } from '../screens/ArchiveDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DocumentPipelineScreen } from '../screens/DocumentPipelineScreen';
import { FileRouterScreen } from '../screens/FileRouterScreen';
import { ModelRulesScreen } from '../screens/ModelRulesScreen';
import { StorageScreen } from '../screens/StorageScreen';
import { CompareScreen } from '../screens/CompareScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const icons: Record<string,string> = {
  Home: '\u{1F3E0}', Guard: '\u{1F6E1}', Models: '\u2699',
  Archive: '\u{1F4C1}', Settings: '\u2699\uFE0F',
  Pipeline: '\u{1F4C4}', Router: '\u{1F4C1}', Rules: '\u{1F4CB}',
};

function TabIcon({label,focused}:{label:string;focused:boolean}) {
  return <Text style={{fontSize:20,opacity:focused?1:0.5}}>{icons[label]||'\u2022'}</Text>;
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerStyle:{backgroundColor:colors.surface},headerTintColor:colors.text}}>
      <Stack.Screen name="Home" component={HomeScreen} options={{title:'New Safe Prompt'}} />
      <Stack.Screen name="Guard" component={GuardScreen} options={{title:'Prompt Guard'}} />
      <Stack.Screen name="FileRouter" component={FileRouterScreen} options={{title:'File Router'}} />
    </Stack.Navigator>
  );
}

function ModelsStack() {
  return (
    <Stack.Navigator screenOptions={{headerStyle:{backgroundColor:colors.surface},headerTintColor:colors.text}}>
      <Stack.Screen name="Models" component={ModelsScreen} options={{title:'Model Matrix'}} />
      <Stack.Screen name="Compare" component={CompareScreen} options={{title:'Compare'}} />
      <Stack.Screen name="ModelRules" component={ModelRulesScreen} options={{title:'Model Rules'}} />
    </Stack.Navigator>
  );
}

function ArchiveStack() {
  return (
    <Stack.Navigator screenOptions={{headerStyle:{backgroundColor:colors.surface},headerTintColor:colors.text}}>
      <Stack.Screen name="_Archive" component={ArchiveScreen} options={{title:'Local Archive'}} />
      <Stack.Screen name="ArchiveDetail" component={ArchiveDetailScreen} options={{title:'Run Details'}} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{headerStyle:{backgroundColor:colors.surface},headerTintColor:colors.text}}>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{title:'Settings'}} />
      <Stack.Screen name="Storage" component={StorageScreen} options={{title:'Storage'}} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator screenOptions={({route})=>({
      headerShown:false,
      tabBarIcon:({focused})=><TabIcon label={route.name} focused={focused} />,
      tabBarActiveTintColor:colors.primary,
      tabBarInactiveTintColor:colors.textMuted,
      tabBarStyle:{backgroundColor:colors.surface,borderTopColor:colors.border,paddingBottom:4,height:56},
      tabBarLabelStyle:{fontSize:11,fontWeight:'500'},
    })}>
      <Tab.Screen name="HomeTab" component={HomeStack} options={{tabBarLabel:'Home'}} />
      <Tab.Screen name="GuardTab" component={GuardScreen} options={{tabBarLabel:'Guard'}} />
      <Tab.Screen name="ModelsTab" component={ModelsStack} options={{tabBarLabel:'Models'}} />
      <Tab.Screen name="ArchiveTab" component={ArchiveStack} options={{tabBarLabel:'Archive'}} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} options={{tabBarLabel:'Settings'}} />
    </Tab.Navigator>
  );
}
