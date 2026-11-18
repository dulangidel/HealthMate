import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/core/components/Card';
import { EmptyState } from '@/core/components/EmptyState';
import { FloatingActionButton } from '@/core/components/FloatingActionButton';
import { colors, spacing, typography } from '@/core/theme/theme';
import type { HealthRecord } from '../model/HealthRecord';
import { useHealthStore } from '../state/healthStore';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';
import { MetricCard } from './components/MetricCard';
import { RecordListItem } from './components/RecordListItem';

export function DashboardScreen() {
  const vm = useDashboardViewModel();
  const deleteRecord = useHealthStore((s) => s.deleteRecord);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await vm.reload();
    setRefreshing(false);
  }, [vm]);

  const confirmDelete = (record: HealthRecord) =>
    Alert.alert('Delete entry?', 'This entry will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRecord(record.id) },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={typography.heading}>Today – {vm.todayLabel}</Text>

        {vm.error ? <Text style={styles.error}>Couldn’t load your data: {vm.error}</Text> : null}

        {vm.metrics.map((m) => (
          <MetricCard
            key={m.key}
            label={m.label}
            icon={m.icon}
            color={m.color}
            soft={m.soft}
            value={m.value}
            unit={m.unit}
            goal={m.goal}
            progress={m.progress}
          />
        ))}

        <View style={styles.rowBetween}>
          <Text style={typography.subheading}>Today’s entries</Text>
          <Pressable onPress={() => router.push('/records')} accessibilityRole="link" hitSlop={8}>
            <Text style={styles.link}>View history</Text>
          </Pressable>
        </View>
        <Card style={styles.listCard}>
          {vm.todayEntries.length === 0 ? (
            <EmptyState icon="clipboard-outline" title="Nothing logged yet today" message="Tap + to add a record." />
          ) : (
            vm.todayEntries.map((r, i) => (
              <View key={r.id} style={i > 0 && styles.divider}>
                <RecordListItem record={r} onPress={() => router.push(`/record/${r.id}`)} onDelete={confirmDelete} />
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      <FloatingActionButton
        testID="add-record-fab"
        accessibilityLabel="Add health record"
        onPress={() => router.push('/record/new')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100, gap: spacing.md },
  error: { color: colors.danger },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  link: { color: colors.primary },
  listCard: { padding: 0, overflow: 'hidden' },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
