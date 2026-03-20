import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { FuturisticInput } from '@presentation/components/FuturisticInput';
import { NeonButton } from '@presentation/components/NeonButton';
import { useAppStore } from '@presentation/context/appStore';
import { globalStyles } from '@presentation/theme/globalStyles';

const normalizeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido en la solicitud.';
};

export const SettingsScreen: React.FC = () => {
  const chatIdStore = useAppStore((state) => state.telegramChatId);
  const saveSettings = useAppStore((state) => state.saveSettings);
  const testConnection = useAppStore((state) => state.testConnection);

  const [token, setToken] = useState('');
  const [chatId, setChatId] = useState(chatIdStore);

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>TELEGRAM LINK</Text>
      <Text style={globalStyles.subtitle}>Configura bot token y chat ID</Text>

      <View style={globalStyles.card}>
        <FuturisticInput
          label="Bot Token"
          value={token}
          onChangeText={setToken}
          placeholder="123456:ABCDEF"
          secureTextEntry
        />
        <FuturisticInput label="Chat ID" value={chatId} onChangeText={setChatId} placeholder="-100123456789" />

        <NeonButton
          title="Guardar"
          onPress={() => {
            if (!token.trim() || !chatId.trim()) {
              Alert.alert('Error', 'Debes ingresar Bot Token y Chat ID antes de guardar.');
              return;
            }

            void saveSettings({ token: token.trim(), chatId: chatId.trim() })
              .then(() => {
                Alert.alert('Guardado', 'Configuracion almacenada con token ofuscado en Base64.');
              })
              .catch((error: unknown) => {
                Alert.alert('Error', normalizeError(error));
              });
          }}
        />
        <NeonButton
          title="Test Connection"
          onPress={() => {
            if (!token.trim() || !chatId.trim()) {
              Alert.alert('Error', 'Debes ingresar Bot Token y Chat ID antes de probar la conexion.');
              return;
            }

            void saveSettings({ token: token.trim(), chatId: chatId.trim() })
              .then(() => testConnection())
              .then(() => Alert.alert('Exito', 'Conexion Telegram correcta.'))
              .catch((error: unknown) => {
                Alert.alert('Error', normalizeError(error));
              });
          }}
        />
      </View>
    </View>
  );
};
