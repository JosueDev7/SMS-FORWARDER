import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@presentation/theme/ThemeContext';

export const useGlobalStyles = () => {
  const { t } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: t.bg,
          paddingHorizontal: 16,
          paddingTop: 16,
        },
        title: {
          color: t.text,
          fontSize: 26,
          fontWeight: '700',
          marginBottom: 10,
          letterSpacing: 1,
        },
        subtitle: {
          color: t.textMuted,
          fontSize: 14,
        },
        card: {
          backgroundColor: t.card,
          borderColor: t.border,
          borderWidth: 1,
          borderRadius: 14,
          padding: 12,
          marginBottom: 10,
        },
      }),
    [t],
  );
};
