import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { FuturisticInput } from '@presentation/components/FuturisticInput';
import { NeonButton } from '@presentation/components/NeonButton';
import { useAppStore } from '@presentation/context/appStore';
import { useGlobalStyles } from '@presentation/theme/globalStyles';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors } from '@presentation/theme/colors';
import { TelegramLink } from '@domain/entities/Config';

const normalizeError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Error desconocido.';
};

interface LinkCardProps {
  link: TelegramLink;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  const { t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);

  const updateTelegramLink = useAppStore((s) => s.updateTelegramLink);
  const removeTelegramLink = useAppStore((s) => s.removeTelegramLink);
  const testLink = useAppStore((s) => s.testLink);

  const handleTest = useCallback(() => {
    void testLink(link.id)
      .then(() => Alert.alert('Éxito', `Conexión con "${link.label}" correcta.`))
      .catch((e: unknown) => Alert.alert('Error', normalizeError(e)));
  }, [link.id, link.label, testLink]);

  const handleDelete = useCallback(() => {
    Alert.alert('Eliminar', `¿Eliminar link "${link.label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => void removeTelegramLink(link.id),
      },
    ]);
  }, [link.id, link.label, removeTelegramLink]);

  return (
    <View style={styles.linkCard}>
      <View style={styles.linkHeader}>
        <View style={styles.linkLabelRow}>
          <Text style={styles.linkIcon}>🤖</Text>
          <Text style={styles.linkLabel} numberOfLines={1}>
            {link.label}
          </Text>
        </View>
        <Switch
          value={link.enabled}
          onValueChange={(v) => void updateTelegramLink({ ...link, enabled: v })}
          trackColor={{ false: t.switchTrackOff, true: t.accentSoft }}
          thumbColor={link.enabled ? t.accent : t.switchThumbOff}
        />
      </View>
      <Text style={styles.linkDetail}>Chat ID: {link.chatId}</Text>
      <Text style={styles.linkDetail}>Token: ••••••{link.botTokenBase64.slice(-8)}</Text>

      <View style={styles.linkActions}>
        <Pressable style={styles.linkActionBtn} onPress={handleTest}>
          <Text style={[styles.linkActionText, { color: t.accent }]}>⚡ Test</Text>
        </Pressable>
        <Pressable style={[styles.linkActionBtn, styles.linkDeleteBtn]} onPress={handleDelete}>
          <Text style={[styles.linkActionText, { color: t.danger }]}>🗑 Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
};

export const SettingsScreen: React.FC = () => {
  const { t } = useTheme();
  const gs = useGlobalStyles();
  const styles = useMemo(() => createStyles(t), [t]);

  const telegramLinks = useAppStore((s) => s.telegramLinks);
  const addTelegramLink = useAppStore((s) => s.addTelegramLink);
  const testAllLinks = useAppStore((s) => s.testAllLinks);

  const [label, setLabel] = useState('');
  const [token, setToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [formVisible, setFormVisible] = useState(false);

  const handleAdd = useCallback(() => {
    if (!label.trim() || !token.trim() || !chatId.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    void addTelegramLink({
      label: label.trim(),
      botToken: token.trim(),
      chatId: chatId.trim(),
    })
      .then(() => {
        Alert.alert('Guardado', `Link "${label.trim()}" agregado.`);
        setLabel('');
        setToken('');
        setChatId('');
        setFormVisible(false);
      })
      .catch((e: unknown) => Alert.alert('Error', normalizeError(e)));
  }, [addTelegramLink, chatId, label, token]);

  const handleTestAll = useCallback(() => {
    void testAllLinks()
      .then(() => Alert.alert('Éxito', 'Todos los links activos respondieron correctamente.'))
      .catch((e: unknown) => Alert.alert('Error', normalizeError(e)));
  }, [testAllLinks]);

  return (
    <View style={gs.screen}>
      <Text style={gs.title}>TELEGRAM LINKS</Text>
      <Text style={gs.subtitle}>
        {telegramLinks.length} destino{telegramLinks.length !== 1 ? 's' : ''} configurado{telegramLinks.length !== 1 ? 's' : ''}
      </Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: t.success }]}>
            {telegramLinks.filter((l) => l.enabled).length}
          </Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: t.textMuted }]}>
            {telegramLinks.filter((l) => !l.enabled).length}
          </Text>
          <Text style={styles.statLabel}>Inactivos</Text>
        </View>
      </View>

      {/* Add new form toggle */}
      {!formVisible ? (
        <Pressable style={styles.addButton} onPress={() => setFormVisible(true)}>
          <Text style={styles.addButtonText}>+ Agregar Telegram Link</Text>
        </Pressable>
      ) : (
        <View style={gs.card}>
          <FuturisticInput
            label="Nombre / Etiqueta"
            value={label}
            onChangeText={setLabel}
            placeholder='Ej: "Mi grupo", "Alertas bancarias"'
          />
          <FuturisticInput
            label="Bot Token"
            value={token}
            onChangeText={setToken}
            placeholder="123456:ABCDEF..."
            secureTextEntry
          />
          <FuturisticInput
            label="Chat ID"
            value={chatId}
            onChangeText={setChatId}
            placeholder="-100123456789"
          />
          <NeonButton title="Guardar Link" onPress={handleAdd} />
          <Pressable style={styles.cancelBtn} onPress={() => setFormVisible(false)}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      )}

      {/* Test all button */}
      {telegramLinks.length > 0 && (
        <Pressable style={styles.testAllBtn} onPress={handleTestAll}>
          <Text style={styles.testAllText}>⚡ Test todos los links activos</Text>
        </Pressable>
      )}

      {/* Link list */}
      {telegramLinks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📡</Text>
          <Text style={styles.emptyText}>Sin destinos Telegram.</Text>
          <Text style={styles.emptyHint}>
            Agrega un Bot Token y Chat ID para empezar a reenviar SMS.
          </Text>
        </View>
      ) : (
        <FlatList
          data={telegramLinks}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <LinkCard link={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      marginBottom: 4,
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
    statNum: {
      fontSize: 22,
      fontWeight: '700',
    },
    statLabel: {
      color: c.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    addButton: {
      backgroundColor: c.accent,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    addButtonText: {
      color: c.accentButtonText,
      fontWeight: '700',
      fontSize: 14,
      letterSpacing: 0.5,
    },
    cancelBtn: {
      alignItems: 'center',
      paddingVertical: 8,
      marginTop: 4,
    },
    cancelText: {
      color: c.textMuted,
      fontWeight: '600',
    },
    testAllBtn: {
      borderWidth: 1,
      borderColor: c.accent,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
      marginTop: 8,
    },
    testAllText: {
      color: c.accent,
      fontWeight: '700',
      fontSize: 13,
    },
    linkCard: {
      backgroundColor: c.bgSoft,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    linkHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    linkLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
    },
    linkIcon: {
      fontSize: 18,
      marginRight: 6,
    },
    linkLabel: {
      color: c.text,
      fontWeight: '700',
      fontSize: 15,
      flex: 1,
    },
    linkDetail: {
      color: c.textMuted,
      fontSize: 12,
      marginBottom: 2,
      fontFamily: 'monospace',
    },
    linkActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    linkActionBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.accent,
      borderRadius: 8,
      paddingVertical: 6,
      alignItems: 'center',
    },
    linkDeleteBtn: {
      borderColor: c.danger,
    },
    linkActionText: {
      fontWeight: '700',
      fontSize: 12,
    },
    listContent: {
      paddingTop: 8,
      paddingBottom: 32,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyIcon: {
      fontSize: 40,
      marginBottom: 8,
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
  });
