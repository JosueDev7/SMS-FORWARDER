import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { logger, LogEntry, LogLevel } from '@shared/utils/logger';
import { useGlobalStyles } from '@presentation/theme/globalStyles';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors } from '@presentation/theme/colors';
import { useI18n } from '@shared/i18n/LanguageContext';
import { fmt } from '@shared/i18n/translations';

const LEVELS: Array<LogLevel | 'ALL'> = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

function getLevelColor(level: LogLevel, c: ThemeColors): string {
  const map: Record<LogLevel, string> = {
    DEBUG: c.textMuted,
    INFO: c.accent,
    WARN: c.warning,
    ERROR: c.danger,
  };
  return map[level];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

export const LogsScreen: React.FC = () => {
  const { t } = useTheme();
  const { s } = useI18n();
  const gs = useGlobalStyles();
  const styles = useMemo(() => createStyles(t), [t]);

  const [entries, setEntries] = useState<LogEntry[]>(() => logger.getEntries());
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = logger.subscribe(() => {
      setEntries(logger.getEntries());
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return entries
      .filter((e) => levelFilter === 'ALL' || e.level === levelFilter)
      .filter(
        (e) =>
          !lowerSearch ||
          e.message.toLowerCase().includes(lowerSearch) ||
          e.tag.toLowerCase().includes(lowerSearch),
      )
      .slice()
      .reverse();
  }, [entries, levelFilter, search]);

  const handleShare = useCallback(async () => {
    if (filtered.length === 0) {
      return;
    }
    const now = new Date().toISOString();
    const header = `=== SMS-FORWARDER LOGS [${now}] ===\n`;
    const body = filtered
      .map((e) => `[${formatTime(e.timestamp)}] [${e.level}] [${e.tag}] ${e.message}`)
      .join('\n');
    await Share.share({ message: header + body, title: 'SMS Forwarder Logs' });
  }, [filtered]);

  const handleClear = useCallback(() => {
    logger.clear();
  }, []);

  const renderItem = useCallback(({ item }: { item: LogEntry }) => {
    const lc = getLevelColor(item.level, t);
    return (
      <View style={styles.entry}>
        <View style={styles.entryHeader}>
          <Text style={[styles.levelBadge, { color: lc, borderColor: lc }]}>
            {item.level}
          </Text>
          <Text style={styles.tag} numberOfLines={1}>
            {item.tag}
          </Text>
          <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={styles.message} selectable>
          {item.message}
        </Text>
      </View>
    );
  }, [t, styles]);

  return (
    <View style={gs.screen}>
      <Text style={gs.title}>{s.logs.title}</Text>
      <Text style={gs.subtitle}>
        {fmt(s.logs.subtitle, filtered.length)}
      </Text>

      {/* Search input */}
      <TextInput
        style={styles.searchInput}
        placeholder={s.logs.searchPlaceholder}
        placeholderTextColor={t.textMuted}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      {/* Level filter chips */}
      <View style={styles.filterRow}>
        {LEVELS.map((lvl) => {
          const isActive = levelFilter === lvl;
          const chipColor = lvl === 'ALL' ? t.accent : getLevelColor(lvl as LogLevel, t);
          return (
            <Pressable
              key={lvl}
              style={[
                styles.filterChip,
                isActive && { borderColor: chipColor, backgroundColor: chipColor + '22' },
              ]}
              onPress={() => setLevelFilter(lvl)}
            >
              <Text style={[styles.filterChipText, isActive && { color: chipColor }]}>{lvl}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionBtn, styles.shareBtn]}
          onPress={() => {
            void handleShare();
          }}
        >
          <Text style={[styles.actionBtnText, { color: t.accent }]}>
            {s.logs.copyShare}
          </Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.clearBtn]} onPress={handleClear}>
          <Text style={[styles.actionBtnText, { color: t.danger }]}>{s.logs.clear}</Text>
        </Pressable>
      </View>

      {/* Log list */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{s.logs.empty}</Text>
          <Text style={styles.emptyHint}>{s.logs.emptyHint}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    searchInput: {
      marginTop: 12,
      backgroundColor: c.card,
      color: c.text,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
    },
    filterRow: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 6,
    },
    filterChip: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingVertical: 5,
      alignItems: 'center',
    },
    filterChipText: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: '700',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
      marginBottom: 4,
    },
    actionBtn: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 9,
      alignItems: 'center',
    },
    shareBtn: {
      borderColor: c.accent,
    },
    clearBtn: {
      borderColor: c.danger,
    },
    actionBtnText: {
      fontWeight: '700',
      fontSize: 13,
    },
    entry: {
      backgroundColor: c.bgSoft,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      marginBottom: 6,
    },
    entryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
      gap: 6,
    },
    levelBadge: {
      fontSize: 10,
      fontWeight: '700',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    tag: {
      color: c.textMuted,
      fontSize: 11,
      flex: 1,
    },
    time: {
      color: c.textMuted,
      fontSize: 10,
      fontFamily: 'monospace',
    },
    message: {
      color: c.text,
      fontSize: 13,
      fontFamily: 'monospace',
    },
    listContent: {
      paddingTop: 4,
      paddingBottom: 32,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: c.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
    emptyHint: {
      color: c.textMuted,
      fontSize: 12,
      marginTop: 4,
      opacity: 0.6,
    },
  });
