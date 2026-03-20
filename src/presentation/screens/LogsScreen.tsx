import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { logger, LogEntry, LogLevel } from '@shared/utils/logger';
import { globalStyles } from '@presentation/theme/globalStyles';
import { colors } from '@presentation/theme/colors';

const LEVELS: Array<LogLevel | 'ALL'> = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

const LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: colors.textMuted,
  INFO: colors.accent,
  WARN: '#F5A623',
  ERROR: colors.danger,
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

export const LogsScreen: React.FC = () => {
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
    const levelColor = LEVEL_COLORS[item.level];
    return (
      <View style={styles.entry}>
        <View style={styles.entryHeader}>
          <Text style={[styles.levelBadge, { color: levelColor, borderColor: levelColor }]}>
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
  }, []);

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>DEBUG LOGS</Text>
      <Text style={globalStyles.subtitle}>
        {filtered.length} entrada{filtered.length !== 1 ? 's' : ''} • toca un mensaje para seleccionar
      </Text>

      {/* Search input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar tag o mensaje..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      {/* Level filter chips */}
      <View style={styles.filterRow}>
        {LEVELS.map((lvl) => {
          const isActive = levelFilter === lvl;
          const chipColor = lvl === 'ALL' ? colors.accent : LEVEL_COLORS[lvl as LogLevel];
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
          <Text style={[styles.actionBtnText, { color: colors.accent }]}>
            Copiar / Compartir
          </Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.clearBtn]} onPress={handleClear}>
          <Text style={[styles.actionBtnText, { color: colors.danger }]}>Limpiar</Text>
        </Pressable>
      </View>

      {/* Log list */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sin logs todavía.</Text>
          <Text style={styles.emptyHint}>Los logs aparecen al usar la app.</Text>
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

const styles = StyleSheet.create({
  searchInput: {
    marginTop: 12,
    backgroundColor: colors.card,
    color: colors.text,
    borderColor: colors.border,
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
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  filterChipText: {
    color: colors.textMuted,
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
    borderColor: colors.accent,
  },
  clearBtn: {
    borderColor: colors.danger,
  },
  actionBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  entry: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
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
    color: colors.textMuted,
    fontSize: 11,
    flex: 1,
  },
  time: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  message: {
    color: colors.text,
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
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
});
