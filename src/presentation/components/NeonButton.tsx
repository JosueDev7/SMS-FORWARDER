import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors } from '@presentation/theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const NeonButton: React.FC<Props> = ({ title, onPress, disabled }) => {
  const { t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    button: {
      backgroundColor: c.accent,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    text: {
      color: c.accentButtonText,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    pressed: {
      opacity: 0.8,
    },
    disabled: {
      backgroundColor: c.accentSoft,
      opacity: 0.6,
    },
  });
