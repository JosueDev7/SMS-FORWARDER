import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

const App: React.FC = () => {
  useBootstrap();

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.bgSoft,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Mensajes" component={MessagesScreen} />
        <Tab.Screen name="Rules" component={RulesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Logs" component={LogsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
