import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors, THEME_PRESETS } from '@presentation/theme/colors';
import { useGlobalStyles } from '@presentation/theme/globalStyles';

const SWATCH_KEYS: Array<keyof ThemeColors> = ['bg', 'card', 'accent', 'success', 'danger'];

export const AppearanceScreen: React.FC = () => {
  const { themeId, t, setThemeId } = useTheme();
  const gs = useGlobalStyles();
  const styles = useMemo(() => createStyles(t), [t]);

  return (
    <ScrollView style={gs.screen} contentContainerStyle={styles.content}>
      <Text style={gs.title}>APARIENCIA</Text>
      <Text style={gs.subtitle}>Elige un tema para la aplicación</Text>

      <View style={styles.grid}>
        {THEME_PRESETS.map((preset) => {
          const active = preset.id === themeId;
          return (
            <Pressable
              key={preset.id}
              style={[
                styles.card,
                {
                  backgroundColor: preset.colors.card,
                  borderColor: active ? t.accent : preset.colors.border,
                },
                active && styles.cardActive,
              ]}
              onPress={() => setThemeId(preset.id)}
            >
              {/* Preview header */}
              <View style={[styles.previewHeader, { backgroundColor: preset.colors.bg }]}>
                <View style={[styles.previewDot, { backgroundColor: preset.colors.accent }]} />
                <View style={[styles.previewLine, { backgroundColor: preset.colors.text }]} />
                <View style={[styles.previewLineShort, { backgroundColor: preset.colors.textMuted }]} />
              </View>

              {/* Swatches */}
              <View style={styles.swatchRow}>
                {SWATCH_KEYS.map((k) => (
                  <View key={k} style={[styles.swatch, { backgroundColor: preset.colors[k] }]} />
                ))}
              </View>

              {/* Label */}
              <View style={styles.labelRow}>
                <Text style={styles.icon}>{preset.icon}</Text>
                <Text style={[styles.label, { color: preset.colors.text }]}>{preset.label}</Text>
              </View>

              {active && (
                <View style={[styles.activeBadge, { backgroundColor: t.accent }]}>
                  <Text style={[styles.activeBadgeText, { color: t.accentButtonText }]}>ACTIVO</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: {
      paddingBottom: 32,
    },
    grid: {
      marginTop: 16,
      gap: 12,
    },
    card: {
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 14,
      overflow: 'hidden',
    },
    cardActive: {
      borderWidth: 2,
    },
    previewHeader: {
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
    },
    previewDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginBottom: 8,
    },
    previewLine: {
      height: 6,
      borderRadius: 3,
      width: '70%',
      marginBottom: 5,
      opacity: 0.7,
    },
    previewLineShort: {
      height: 4,
      borderRadius: 2,
      width: '45%',
      opacity: 0.5,
    },
    swatchRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 10,
    },
    swatch: {
      flex: 1,
      height: 22,
      borderRadius: 6,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    icon: {
      fontSize: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    activeBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    activeBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  });
