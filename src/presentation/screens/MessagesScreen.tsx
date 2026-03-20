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
import { globalStyles } from '@presentation/theme/globalStyles';
import { colors } from '@presentation/theme/colors';

type Filter = MessageStatus | 'ALL';

const FILTERS: Filter[] = ['ALL', 'FORWARDED', 'DROPPED', 'ERROR'];

const STATUS_COLOR: Record<MessageStatus, string> = {
  FORWARDED: colors.success,
  DROPPED: colors.textMuted,
  ERROR: colors.danger,
};

const STATUS_LABEL: Record<MessageStatus, string> = {
  FORWARDED: 'REENVIADO',
  DROPPED: 'IGNORADO',
  ERROR: 'ERROR',
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('es', {
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
  const [expanded, setExpanded] = useState(false);
  const statusColor = STATUS_COLOR[item.status];

  return (
    <Pressable
      style={[styles.card, { borderLeftColor: statusColor, borderLeftWidth: 3 }]}
      onPress={() => setExpanded((v) => !v)}
    >
      {/* Header row */}
      <View style={styles.cardHeader}>
        <Text style={styles.sender} numberOfLines={1}>
          {item.sender}
        </Text>
        <View style={[styles.badge, { borderColor: statusColor }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {STATUS_LABEL[item.status]}
          </Text>
        </View>
      </View>

      {/* Body preview / expanded */}
      <Text style={styles.body} numberOfLines={expanded ? undefined : 2} selectable={expanded}>
        {item.body}
      </Text>

      {/* Dates */}
      <View style={styles.footer}>
        <Text style={styles.meta}>Recibido: {formatDate(item.receivedAt)}</Text>
        <Text style={styles.meta}>Procesado: {formatDate(item.processedAt)}</Text>
      </View>

      {/* Error detail */}
      {item.statusDetail && expanded ? (
        <Text style={styles.detail}>{item.statusDetail}</Text>
      ) : null}

      <Text style={styles.expandHint}>{expanded ? '▲ Colapsar' : '▼ Ver completo'}</Text>
    </Pressable>
  );
};

export const MessagesScreen: React.FC = () => {
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
      'Limpiar historial',
      '¿Borrar todos los mensajes interceptados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => {
            void clearMessages();
          },
        },
      ],
    );
  }, [clearMessages]);

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

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>MENSAJES SMS</Text>
      <Text style={globalStyles.subtitle}>Interceptados y procesados por el servicio</Text>

      {/* Stats bar */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{counts.forwarded}</Text>
          <Text style={styles.statLabel}>Reenviados</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: colors.textMuted }]}>{counts.dropped}</Text>
          <Text style={styles.statLabel}>Ignorados</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: colors.danger }]}>{counts.error}</Text>
          <Text style={styles.statLabel}>Errores</Text>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Buscar remitente o contenido..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const isActive = filter === f;
          const chipColor =
            f === 'ALL' ? colors.accent : STATUS_COLOR[f as MessageStatus];
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
                {f === 'ALL' ? 'TODOS' : STATUS_LABEL[f as MessageStatus]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List or empty state */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sin mensajes.</Text>
          <Text style={styles.emptyHint}>
            Los SMS interceptados aparecerán aquí cuando lleguen.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <Pressable style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>Limpiar historial</Text>
            </Pressable>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
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
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  search: {
    marginTop: 10,
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
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
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
    color: colors.text,
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
    color: colors.text,
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
    color: colors.textMuted,
    fontSize: 11,
  },
  detail: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
  },
  expandHint: {
    color: colors.accentSoft,
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
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    color: colors.textMuted,
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
    borderColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearBtnText: {
    color: colors.danger,
    fontWeight: '700',
  },
});
