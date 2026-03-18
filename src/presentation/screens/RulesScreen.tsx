import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { FuturisticInput } from '@presentation/components/FuturisticInput';
import { NeonButton } from '@presentation/components/NeonButton';
import { useAppStore } from '@presentation/context/appStore';
import { globalStyles } from '@presentation/theme/globalStyles';
import { colors } from '@presentation/theme/colors';

export const RulesScreen: React.FC = () => {
  const rules = useAppStore((state) => state.rules);
  const createRule = useAppStore((state) => state.createRule);
  const updateRule = useAppStore((state) => state.updateRule);
  const deleteRule = useAppStore((state) => state.deleteRule);

  const [name, setName] = useState('');
  const [pattern, setPattern] = useState('');
  const [useRegex, setUseRegex] = useState(false);

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>RULE ENGINE</Text>
      <Text style={globalStyles.subtitle}>Reglas para filtrar y reenviar SMS</Text>

      <View style={globalStyles.card}>
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
            trackColor={{ false: '#31425A', true: colors.accentSoft }}
            thumbColor={useRegex ? colors.accent : '#A4B6D4'}
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
                trackColor={{ false: '#31425A', true: colors.accentSoft }}
                thumbColor={item.enabled ? colors.accent : '#A4B6D4'}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  rowText: {
    color: colors.text,
  },
  ruleCard: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
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
    color: colors.text,
    fontWeight: '700',
  },
  pattern: {
    color: colors.accent,
    marginTop: 4,
  },
  mode: {
    color: colors.textMuted,
    marginTop: 4,
  },
  deleteButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    color: colors.danger,
  },
});
