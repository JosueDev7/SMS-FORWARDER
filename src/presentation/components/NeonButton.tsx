import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@presentation/theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const NeonButton: React.FC<Props> = ({ title, onPress, disabled }) => {
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

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  text: {
    color: '#001825',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: colors.accentSoft,
    opacity: 0.6,
  },
});
