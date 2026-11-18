import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/core/components/Card';
import { Chip } from '@/core/components/Chip';
import { EmptyState } from '@/core/components/EmptyState';
import { colors, METRIC_KEYS, METRICS, spacing, typography } from '@/core/theme/theme';
import { formatShortDate } from '@/core/utils/date';
import { formatNumber } from '@/core/utils/format';
import { INSIGHT_RANGES, useInsightsViewModel } from '../viewmodels/useInsightsViewModel';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/** Simple per-metric summary for the selected period. */
export function InsightsScreen() {
  const vm = useInsightsViewModel();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.heading}>Insights</Text>

        <View style={styles.chips}>
          {INSIGHT_RANGES.map((r) => (
            <Chip key={r} label={`Last ${r} days`} selected={vm.range === r} onPress={() => vm.setRange(r)} />
          ))}
        </View>

        {!vm.hasData ? (
          <EmptyState icon="bar-chart-outline" title="No data for this period" message="Log some activities to see a summary." />
        ) : (
          <>
            <Text style={typography.caption}>
              {vm.stats.activeDays} of {vm.range} days have records.
            </Text>
            {METRIC_KEYS.map((k) => {
              const m = METRICS[k];
              const best = vm.stats.best[k];
              return (
                <Card key={k} style={styles.card}>
                  <View style={styles.title}>
                    <Ionicons name={m.icon} size={18} color={m.color} />
                    <Text style={typography.subheading}>{m.label}</Text>
                  </View>
                  <Row label="Daily average" value={`${formatNumber(vm.stats.averages[k])} ${m.unit}`} />
                  <Row label="Total" value={`${formatNumber(vm.stats.totals[k])} ${m.unit}`} />
                  <Row
                    label="Best day"
                    value={best ? `${formatNumber(best[k])} ${m.unit} (${formatShortDate(best.date)})` : '–'}
                  />
                  <Row label="Goal reached" value={`${vm.stats.goalDays[k]} of ${vm.range} days`} />
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  chips: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  card: { gap: spacing.sm },
  title: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, color: colors.textMuted },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
});
