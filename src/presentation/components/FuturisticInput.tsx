import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors } from '@presentation/theme/colors';

interface Props {
  label: string;
  value: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  onChangeText: (value: string) => void;
}

export const FuturisticInput: React.FC<Props> = ({
  label,
  value,
  placeholder,
  secureTextEntry,
  onChangeText,
}) => {
  const { t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={t.textMuted}
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 10,
    },
    label: {
      color: c.textMuted,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      color: c.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: c.bgSoft,
    },
  });
