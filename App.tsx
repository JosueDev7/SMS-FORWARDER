import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { HomeScreen } from '@presentation/screens/HomeScreen';
import { MessagesScreen } from '@presentation/screens/MessagesScreen';
import { RulesScreen } from '@presentation/screens/RulesScreen';
import { SettingsScreen } from '@presentation/screens/SettingsScreen';
import { LogsScreen } from '@presentation/screens/LogsScreen';
import { useBootstrap } from '@presentation/hooks/useBootstrap';
import { colors } from '@presentation/theme/colors';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
    notification: colors.accent,
  },
};

const TAB_ICONS: Record<string, string> = {
  Home: '📡',
  Mensajes: '💬',
  Reglas: '⚙',
  Telegram: '🤖',
  Logs: '📋',
};

const App: React.FC = () => {
  useBootstrap();

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.bgSoft,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 58,
            paddingBottom: 6,
            paddingTop: 4,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>{TAB_ICONS[route.name] ?? '●'}</Text>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.3,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
        <Tab.Screen name="Mensajes" component={MessagesScreen} />
        <Tab.Screen name="Reglas" component={RulesScreen} />
        <Tab.Screen name="Telegram" component={SettingsScreen} />
        <Tab.Screen name="Logs" component={LogsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
    marginBottom: -2,
  },
});

export default App;
