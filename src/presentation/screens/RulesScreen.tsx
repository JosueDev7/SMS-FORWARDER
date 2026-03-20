import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { FuturisticInput } from '@presentation/components/FuturisticInput';
import { NeonButton } from '@presentation/components/NeonButton';
import { useAppStore } from '@presentation/context/appStore';
import { useGlobalStyles } from '@presentation/theme/globalStyles';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors } from '@presentation/theme/colors';

export const RulesScreen: React.FC = () => {
  const { t } = useTheme();
  const gs = useGlobalStyles();
  const styles = useMemo(() => createStyles(t), [t]);

  const rules = useAppStore((state) => state.rules);
  const createRule = useAppStore((state) => state.createRule);
  const updateRule = useAppStore((state) => state.updateRule);
  const deleteRule = useAppStore((state) => state.deleteRule);

  const [name, setName] = useState('');
  const [pattern, setPattern] = useState('');
  const [useRegex, setUseRegex] = useState(false);

  return (
    <View style={gs.screen}>
      <Text style={gs.title}>RULE ENGINE</Text>
      <Text style={gs.subtitle}>Reglas para filtrar y reenviar SMS</Text>

      <View style={gs.card}>
        <FuturisticInput label="Nombre" value={name} onChangeText={setName} placeholder="Banco principal" />
        <FuturisticInput
          label="Patron"
          value={pattern}
          onChangeText={setPattern}
          placeholder="includes o expresion regular"
        />
        <View style={styles.row}>
          <Text style={styles.rowText}>Usar RegExp</Text>
          <Switch
            value={useRegex}
            onValueChange={setUseRegex}
            trackColor={{ false: t.switchTrackOff, true: t.accentSoft }}
            thumbColor={useRegex ? t.accent : t.switchThumbOff}
          />
        </View>
        <NeonButton
          title="Crear Regla"
          onPress={() => {
            if (!name.trim() || !pattern.trim()) {
              return;
            }
            void createRule({ name, pattern, enabled: true, useRegex });
            setName('');
            setPattern('');
            setUseRegex(false);
          }}
        />
      </View>

      <FlatList
        data={rules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleName}>{item.name}</Text>
              <Switch
                value={item.enabled}
                onValueChange={(value) => {
                  void updateRule({ ...item, enabled: value });
                }}
                trackColor={{ false: t.switchTrackOff, true: t.accentSoft }}
                thumbColor={item.enabled ? t.accent : t.switchThumbOff}
              />
            </View>
            <Text style={styles.pattern}>{item.pattern}</Text>
            <Text style={styles.mode}>{item.useRegex ? 'Modo: RegExp' : 'Modo: includes'}</Text>
            <Pressable
              onPress={() => {
                void deleteRule(item.id);
              }}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Eliminar</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    rowText: {
      color: c.text,
    },
    ruleCard: {
      backgroundColor: c.bgSoft,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    ruleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ruleName: {
      color: c.text,
      fontWeight: '700',
    },
    pattern: {
      color: c.accent,
      marginTop: 4,
    },
    mode: {
      color: c.textMuted,
      marginTop: 4,
    },
    deleteButton: {
      marginTop: 10,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: c.danger,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    deleteText: {
      color: c.danger,
    },
  });
