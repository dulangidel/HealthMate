import { Ionicons } from '@expo/vector-icons';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/core/components/Button';
import { Card } from '@/core/components/Card';
import { FormField } from '@/core/components/FormField';
import { colors, METRIC_KEYS, METRICS, spacing, typography } from '@/core/theme/theme';
import { useSettingsViewModel } from '../viewmodels/useSettingsViewModel';

export function SettingsScreen() {
  const vm = useSettingsViewModel();

  const confirm = (title: string, message: string, action: () => Promise<void>, done: string) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: async () => {
          try {
            await action();
            Alert.alert('Done', done);
          } catch {
            Alert.alert('Error', 'Something went wrong. Please try again.');
          }
        },
      },
    ]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Daily goals</Text>
        <Card style={styles.card}>
          {METRIC_KEYS.map((k) => (
            <FormField
              key={k}
              testID={`goal-${k}`}
              label={METRICS[k].label}
              icon={METRICS[k].icon}
              iconColor={METRICS[k].color}
              unit={METRICS[k].unit}
              value={vm.values[k]}
              onChangeText={(t) => vm.setField(k, t)}
              keyboardType="number-pad"
              error={vm.errors[k]}
              maxLength={6}
            />
          ))}
          <Button title="Save goals" icon="checkmark" onPress={vm.save} loading={vm.saving} disabled={!vm.dirty} />
          {vm.savedAt && !vm.dirty ? (
            <View style={styles.saved}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={{ color: colors.success }}>Goals saved</Text>
            </View>
          ) : null}
        </Card>

        <Text style={styles.sectionTitle}>Data</Text>
        <Card style={styles.card}>
          <Text style={typography.caption}>
            {vm.recordCount} {vm.recordCount === 1 ? 'record' : 'records'} stored on this device in a local SQLite database.
          </Text>
          <Button
            title="Reset to sample data"
            icon="refresh"
            variant="secondary"
            onPress={() =>
              confirm(
                'Reset to sample data?',
                'All your records will be replaced with 3 weeks of dummy data.',
                vm.resetToSampleData,
                'Sample data restored.',
              )
            }
          />
          <Button
            title="Delete all records"
            icon="trash-outline"
            variant="danger"
            onPress={() =>
              confirm('Delete all records?', 'This permanently removes every record. It cannot be undone.', vm.clearAll, 'All records deleted.')
            }
          />
        </Card>

        <Text style={styles.footer}>HealthMate v1.0.0 · Your data never leaves your device.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { ...typography.subheading, marginTop: spacing.sm },
  card: { gap: spacing.lg },
  saved: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'center' },
  footer: { ...typography.small, textAlign: 'center', marginTop: spacing.lg },
});
