import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppStore } from '@presentation/context/appStore';
import { InterceptedMessage, MessageStatus } from '@domain/entities/InterceptedMessage';
import { useGlobalStyles } from '@presentation/theme/globalStyles';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors } from '@presentation/theme/colors';
import { useI18n } from '@shared/i18n/LanguageContext';
import { Strings } from '@shared/i18n/translations';

type Filter = MessageStatus | 'ALL';

const FILTERS: Filter[] = ['ALL', 'FORWARDED', 'DROPPED', 'ERROR'];

function getStatusLabel(status: MessageStatus, str: Strings): string {
  const map: Record<MessageStatus, string> = {
    FORWARDED: str.messages.statusForwarded,
    DROPPED: str.messages.statusDropped,
    ERROR: str.messages.statusError,
  };
  return map[status];
}

function getStatusColor(status: MessageStatus, c: ThemeColors): string {
  const map: Record<MessageStatus, string> = {
    FORWARDED: c.success,
    DROPPED: c.textMuted,
    ERROR: c.danger,
  };
  return map[status];
}

function formatDate(ts: number, locale: string): string {
  return new Date(ts).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

interface MessageCardProps {
  item: InterceptedMessage;
}

const MessageCard: React.FC<MessageCardProps> = ({ item }) => {
  const { t } = useTheme();
  const { locale, s } = useI18n();
  const styles = useMemo(() => createStyles(t), [t]);
  const [expanded, setExpanded] = useState(false);
  const sc = getStatusColor(item.status, t);

  return (
    <Pressable
      style={[styles.card, { borderLeftColor: sc, borderLeftWidth: 3 }]}
      onPress={() => setExpanded((v) => !v)}
    >
      {/* Header row */}
      <View style={styles.cardHeader}>
        <Text style={styles.sender} numberOfLines={1}>
          {item.sender}
        </Text>
        <View style={[styles.badge, { borderColor: sc }]}>
          <Text style={[styles.badgeText, { color: sc }]}>
            {getStatusLabel(item.status, s)}
          </Text>
        </View>
      </View>

      {/* Body preview / expanded */}
      <Text style={styles.body} numberOfLines={expanded ? undefined : 2} selectable={expanded}>
        {item.body}
      </Text>

      {/* Dates */}
      <View style={styles.footer}>
        <Text style={styles.meta}>{s.messages.received}: {formatDate(item.receivedAt, locale)}</Text>
        <Text style={styles.meta}>{s.messages.processed}: {formatDate(item.processedAt, locale)}</Text>
      </View>

      {/* Error detail */}
      {item.statusDetail && expanded ? (
        <Text style={styles.detail}>{item.statusDetail}</Text>
      ) : null}

      <Text style={styles.expandHint}>{expanded ? s.messages.collapse : s.messages.expand}</Text>
    </Pressable>
  );
};

export const MessagesScreen: React.FC = () => {
  const { t } = useTheme();
  const { s } = useI18n();
  const gs = useGlobalStyles();
  const styles = useMemo(() => createStyles(t), [t]);

  const messages = useAppStore((state) => state.messages);
  const clearMessages = useAppStore((state) => state.clearMessages);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return messages.filter((m) => {
      if (filter !== 'ALL' && m.status !== filter) return false;
      if (q && !m.sender.toLowerCase().includes(q) && !m.body.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [messages, filter, search]);

  const handleClear = useCallback(() => {
    Alert.alert(
      s.messages.clearConfirmTitle,
      s.messages.clearConfirmMsg,
      [
        { text: s.common.cancel, style: 'cancel' },
        {
          text: s.common.delete,
          style: 'destructive',
          onPress: () => {
            void clearMessages();
          },
        },
      ],
    );
  }, [clearMessages, s]);

  const counts = useMemo(() => {
    const forwarded = messages.filter((m) => m.status === 'FORWARDED').length;
    const dropped = messages.filter((m) => m.status === 'DROPPED').length;
    const error = messages.filter((m) => m.status === 'ERROR').length;
    return { forwarded, dropped, error };
  }, [messages]);

  const renderItem = useCallback(
    ({ item }: { item: InterceptedMessage }) => <MessageCard item={item} />,
    [],
  );

  const getFilterLabel = (f: Filter): string => {
    if (f === 'ALL') return s.messages.filterAll;
    return getStatusLabel(f, s);
  };

  return (
    <View style={gs.screen}>
      <Text style={gs.title}>{s.messages.title}</Text>
      <Text style={gs.subtitle}>{s.messages.subtitle}</Text>

      {/* Stats bar */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: t.success }]}>{counts.forwarded}</Text>
          <Text style={styles.statLabel}>{s.messages.forwarded}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: t.textMuted }]}>{counts.dropped}</Text>
          <Text style={styles.statLabel}>{s.messages.dropped}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: t.danger }]}>{counts.error}</Text>
          <Text style={styles.statLabel}>{s.messages.errors}</Text>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder={s.messages.searchPlaceholder}
        placeholderTextColor={t.textMuted}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const isActive = filter === f;
          const chipColor =
            f === 'ALL' ? t.accent : getStatusColor(f as MessageStatus, t);
          return (
            <Pressable
              key={f}
              style={[
                styles.chip,
                isActive && { borderColor: chipColor, backgroundColor: chipColor + '22' },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, isActive && { color: chipColor }]}>
                {getFilterLabel(f)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List or empty state */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{s.messages.empty}</Text>
          <Text style={styles.emptyHint}>{s.messages.emptyHint}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <Pressable style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>{s.messages.clearHistory}</Text>
            </Pressable>
          }
        />
      )}
    </View>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    statsRow: {
      flexDirection: 'row',
      marginTop: 12,
      marginBottom: 4,
      gap: 8,
    },
    stat: {
      flex: 1,
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 8,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 22,
      fontWeight: '700',
    },
    statLabel: {
      color: c.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    search: {
      marginTop: 10,
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
    chip: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingVertical: 5,
      alignItems: 'center',
    },
    chipText: {
      color: c.textMuted,
      fontSize: 9,
      fontWeight: '700',
    },
    listContent: {
      paddingTop: 8,
      paddingBottom: 16,
    },
    card: {
      backgroundColor: c.bgSoft,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      marginBottom: 8,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    sender: {
      color: c.text,
      fontWeight: '700',
      fontSize: 15,
      flex: 1,
      marginRight: 8,
    },
    badge: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    body: {
      color: c.text,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 6,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    meta: {
      color: c.textMuted,
      fontSize: 11,
    },
    detail: {
      color: c.danger,
      fontSize: 11,
      marginTop: 4,
    },
    expandHint: {
      color: c.accentSoft,
      fontSize: 11,
      marginTop: 6,
      alignSelf: 'center',
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
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    clearBtn: {
      marginTop: 8,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: c.danger,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
    },
    clearBtnText: {
      color: c.danger,
      fontWeight: '700',
    },
  });
