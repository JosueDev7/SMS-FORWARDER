import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { HomeScreen } from '@presentation/screens/HomeScreen';
import { MessagesScreen } from '@presentation/screens/MessagesScreen';
import { RulesScreen } from '@presentation/screens/RulesScreen';
import { SettingsScreen } from '@presentation/screens/SettingsScreen';
import { LogsScreen } from '@presentation/screens/LogsScreen';
import { AppearanceScreen } from '@presentation/screens/AppearanceScreen';
import { useBootstrap } from '@presentation/hooks/useBootstrap';
import { ThemeProvider, useTheme } from '@presentation/theme/ThemeContext';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '📡',
  Mensajes: '💬',
  Reglas: '⚙',
  Telegram: '🤖',
  Apariencia: '🎨',
  Logs: '📋',
};

const AppContent: React.FC = () => {
  const { themeId, t } = useTheme();
  useBootstrap();

  const baseTheme = themeId === 'light' ? DefaultTheme : DarkTheme;
  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: t.bg,
      card: t.card,
      text: t.text,
      border: t.border,
      primary: t.accent,
      notification: t.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: t.bgSoft,
            borderTopColor: t.border,
            borderTopWidth: 1,
            height: 58,
            paddingBottom: 6,
            paddingTop: 4,
          },
          tabBarActiveTintColor: t.accent,
          tabBarInactiveTintColor: t.textMuted,
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
        <Tab.Screen name="Apariencia" component={AppearanceScreen} />
        <Tab.Screen name="Logs" component={LogsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
    marginBottom: -2,
  },
});

export default App;
