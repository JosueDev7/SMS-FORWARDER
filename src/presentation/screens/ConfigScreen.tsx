import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors, THEME_PRESETS } from '@presentation/theme/colors';
import { useGlobalStyles } from '@presentation/theme/globalStyles';
import { useI18n } from '@shared/i18n/LanguageContext';
import { Locale } from '@shared/i18n/translations';
import { ScheduleConfig, DEFAULT_SCHEDULE } from '@domain/entities/Config';
import { container } from '@application/di/container';

const SWATCH_KEYS: Array<keyof ThemeColors> = ['bg', 'card', 'accent', 'success', 'danger'];

const pad = (n: number): string => String(n).padStart(2, '0');

const LANGUAGES: Array<{ id: Locale; label: string; flag: string }> = [
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
];

export const ConfigScreen: React.FC = () => {
  const { themeId, t, setThemeId } = useTheme();
  const { locale, setLocale, s } = useI18n();
  const gs = useGlobalStyles();
  const styles = useMemo(() => createStyles(t), [t]);

  const [schedule, setSchedule] = useState<ScheduleConfig>(DEFAULT_SCHEDULE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void container.usecases.manageConfig.get().then((config) => {
      setSchedule(config.schedule);
      setLoaded(true);
    });
  }, []);

  const saveSchedule = useCallback((updated: ScheduleConfig) => {
    setSchedule(updated);
    void container.usecases.manageConfig.updateSchedule(updated);
  }, []);

  const toggleSchedule = useCallback(
    (enabled: boolean) => saveSchedule({ ...schedule, enabled }),
    [schedule, saveSchedule],
  );

  const adjustTime = useCallback(
    (field: 'startHour' | 'startMinute' | 'endHour' | 'endMinute', delta: number) => {
      const isHour = field.includes('Hour');
      const max = isHour ? 23 : 59;
      const step = isHour ? 1 : 15;
      const current = schedule[field];
      let next = current + delta * step;
      if (next > max) next = 0;
      if (next < 0) next = max - (isHour ? 0 : (max % step !== 0 ? max % step : step - 1));
      if (!isHour) next = Math.round(next / step) * step;
      if (next > max) next = 0;
      saveSchedule({ ...schedule, [field]: next });
    },
    [schedule, saveSchedule],
  );

  const toggleDay = useCallback(
    (index: number) => {
      const days = [...schedule.daysOfWeek];
      days[index] = !days[index];
      saveSchedule({ ...schedule, daysOfWeek: days });
    },
    [schedule, saveSchedule],
  );

  if (!loaded) return null;

  return (
    <ScrollView style={gs.screen} contentContainerStyle={styles.content}>
      <Text style={gs.title}>{s.config.title}</Text>
      <Text style={gs.subtitle}>{s.config.subtitle}</Text>

      {/* ─── Theme Section ─── */}
      <Text style={styles.sectionTitle}>{s.config.themeSection}</Text>
      <Text style={styles.sectionHint}>{s.config.themeHint}</Text>

      <View style={styles.themeGrid}>
        {THEME_PRESETS.map((preset) => {
          const active = preset.id === themeId;
          return (
            <Pressable
              key={preset.id}
              style={[
                styles.themeCard,
                {
                  backgroundColor: preset.colors.card,
                  borderColor: active ? t.accent : preset.colors.border,
                },
                active && styles.themeCardActive,
              ]}
              onPress={() => setThemeId(preset.id)}
            >
              <View style={[styles.previewHeader, { backgroundColor: preset.colors.bg }]}>
                <View style={[styles.previewDot, { backgroundColor: preset.colors.accent }]} />
                <View style={[styles.previewLine, { backgroundColor: preset.colors.text }]} />
                <View style={[styles.previewLineShort, { backgroundColor: preset.colors.textMuted }]} />
              </View>

              <View style={styles.swatchRow}>
                {SWATCH_KEYS.map((k) => (
                  <View key={k} style={[styles.swatch, { backgroundColor: preset.colors[k] }]} />
                ))}
              </View>

              <View style={styles.themeLabelRow}>
                <Text style={styles.themeIcon}>{preset.icon}</Text>
                <Text style={[styles.themeLabel, { color: preset.colors.text }]}>
                  {preset.label}
                </Text>
              </View>

              {active && (
                <View style={[styles.activeBadge, { backgroundColor: t.accent }]}>
                  <Text style={[styles.activeBadgeText, { color: t.accentButtonText }]}>
                    {s.config.themeActive}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ─── Schedule Section ─── */}
      <Text style={styles.sectionTitle}>{s.config.scheduleSection}</Text>
      <Text style={styles.sectionHint}>{s.config.scheduleHint}</Text>

      <View style={styles.scheduleCard}>
        <View style={styles.scheduleToggleRow}>
          <View>
            <Text style={styles.scheduleToggleLabel}>
              {schedule.enabled ? s.config.scheduleActive : s.config.scheduleInactive}
            </Text>
          </View>
          <Switch
            value={schedule.enabled}
            onValueChange={toggleSchedule}
            trackColor={{ false: t.switchTrackOff, true: t.accentSoft }}
            thumbColor={schedule.enabled ? t.accent : t.switchThumbOff}
          />
        </View>

        {schedule.enabled && (
          <>
            {/* Time pickers */}
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{s.config.scheduleStart}</Text>
              <View style={styles.timePicker}>
                <Pressable style={styles.timeBtn} onPress={() => adjustTime('startHour', -1)}>
                  <Text style={styles.timeBtnText}>−</Text>
                </Pressable>
                <Text style={styles.timeValue}>
                  {pad(schedule.startHour)}:{pad(schedule.startMinute)}
                </Text>
                <Pressable style={styles.timeBtn} onPress={() => adjustTime('startHour', 1)}>
                  <Text style={styles.timeBtnText}>+</Text>
                </Pressable>
                <Pressable style={styles.timeMinBtn} onPress={() => adjustTime('startMinute', 1)}>
                  <Text style={styles.timeMinBtnText}>min</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{s.config.scheduleEnd}</Text>
              <View style={styles.timePicker}>
                <Pressable style={styles.timeBtn} onPress={() => adjustTime('endHour', -1)}>
                  <Text style={styles.timeBtnText}>−</Text>
                </Pressable>
                <Text style={styles.timeValue}>
                  {pad(schedule.endHour)}:{pad(schedule.endMinute)}
                </Text>
                <Pressable style={styles.timeBtn} onPress={() => adjustTime('endHour', 1)}>
                  <Text style={styles.timeBtnText}>+</Text>
                </Pressable>
                <Pressable style={styles.timeMinBtn} onPress={() => adjustTime('endMinute', 1)}>
                  <Text style={styles.timeMinBtnText}>min</Text>
                </Pressable>
              </View>
            </View>

            {/* Days */}
            <Text style={styles.daysTitle}>{s.config.scheduleDays}</Text>
            <View style={styles.daysRow}>
              {s.daysShort.map((day, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.dayChip,
                    schedule.daysOfWeek[i] && {
                      backgroundColor: t.accent,
                      borderColor: t.accent,
                    },
                  ]}
                  onPress={() => toggleDay(i)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      schedule.daysOfWeek[i] && { color: t.accentButtonText },
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      {/* ─── Language Section ─── */}
      <Text style={styles.sectionTitle}>{s.config.languageSection}</Text>
      <Text style={styles.sectionHint}>{s.config.languageHint}</Text>

      <View style={styles.languageGrid}>
        {LANGUAGES.map((lang) => {
          const active = lang.id === locale;
          return (
            <Pressable
              key={lang.id}
              style={[
                styles.languageCard,
                active && { borderColor: t.accent, borderWidth: 2 },
              ]}
              onPress={() => setLocale(lang.id)}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text style={[styles.languageLabel, active && { color: t.accent }]}>
                {lang.label}
              </Text>
              {active && (
                <View style={[styles.languageDot, { backgroundColor: t.accent }]} />
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
      paddingBottom: 40,
    },
    sectionTitle: {
      color: c.text,
      fontSize: 18,
      fontWeight: '700',
      marginTop: 24,
      marginBottom: 2,
      letterSpacing: 0.3,
    },
    sectionHint: {
      color: c.textMuted,
      fontSize: 13,
      marginBottom: 10,
    },
    /* ─── Theme ─── */
    themeGrid: {
      gap: 10,
    },
    themeCard: {
      borderWidth: 1.5,
      borderRadius: 14,
      padding: 12,
      overflow: 'hidden',
    },
    themeCardActive: {
      borderWidth: 2,
    },
    previewHeader: {
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
    },
    previewDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginBottom: 6,
    },
    previewLine: {
      height: 5,
      borderRadius: 2.5,
      width: '65%',
      marginBottom: 4,
      opacity: 0.7,
    },
    previewLineShort: {
      height: 3,
      borderRadius: 1.5,
      width: '40%',
      opacity: 0.5,
    },
    swatchRow: {
      flexDirection: 'row',
      gap: 5,
      marginBottom: 8,
    },
    swatch: {
      flex: 1,
      height: 18,
      borderRadius: 5,
    },
    themeLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    themeIcon: {
      fontSize: 18,
    },
    themeLabel: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    activeBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    activeBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    /* ─── Schedule ─── */
    scheduleCard: {
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
    },
    scheduleToggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    scheduleToggleLabel: {
      color: c.text,
      fontWeight: '700',
      fontSize: 14,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14,
    },
    timeLabel: {
      color: c.textMuted,
      fontSize: 14,
      fontWeight: '600',
      width: 55,
    },
    timePicker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    timeBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.bgSoft,
      borderColor: c.border,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timeBtnText: {
      color: c.accent,
      fontSize: 18,
      fontWeight: '700',
    },
    timeValue: {
      color: c.text,
      fontSize: 22,
      fontWeight: '700',
      fontFamily: 'monospace',
      minWidth: 70,
      textAlign: 'center',
    },
    timeMinBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgSoft,
    },
    timeMinBtnText: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },
    daysTitle: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
    daysRow: {
      flexDirection: 'row',
      gap: 6,
    },
    dayChip: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingVertical: 8,
      alignItems: 'center',
    },
    dayChipText: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },
    /* ─── Language ─── */
    languageGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    languageCard: {
      flex: 1,
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      gap: 6,
    },
    languageFlag: {
      fontSize: 28,
    },
    languageLabel: {
      color: c.text,
      fontSize: 14,
      fontWeight: '700',
    },
    languageDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 2,
    },
  });
