import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, METRICS, spacing, type MetricKey } from '@/core/theme/theme';
import { formatNumber } from '@/core/utils/format';
import type { HealthRecord } from '../../model/HealthRecord';

interface Props {
  record: HealthRecord;
  onPress: (record: HealthRecord) => void;
  onDelete: (record: HealthRecord) => void;
}

function Metric({ metric, value }: { metric: MetricKey; value: number }) {
  const m = METRICS[metric];
  return (
    <View style={styles.metric}>
      <Ionicons name={m.icon} size={14} color={m.color} />
      <Text style={styles.metricText} numberOfLines={1}>
        {formatNumber(value)} {m.unit === 'steps' ? '' : m.unit}
      </Text>
    </View>
  );
}

export function RecordListItem({ record, onPress, onDelete }: Props) {
  return (
    <Pressable
      testID={`record-${record.id}`}
      onPress={() => onPress(record)}
      onLongPress={() => onDelete(record)}
      accessibilityRole="button"
      accessibilityLabel={`Entry: ${record.steps} steps, ${record.calories} kilocalories, ${record.water} millilitres water. Tap to edit.`}
      accessibilityHint="Long press to delete"
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: '#F9FAFB' }]}
    >
      <View style={styles.body}>
        <View style={styles.metrics}>
          <Metric metric="steps" value={record.steps} />
          <Metric metric="calories" value={record.calories} />
          <Metric metric="water" value={record.water} />
        </View>
        {record.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {record.note}
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => onDelete(record)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Delete entry"
        testID={`delete-${record.id}`}
        style={styles.delete}
      >
        <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  body: { flex: 1, gap: spacing.sm },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricText: { fontSize: 14, color: colors.text },
  note: { fontSize: 13, color: colors.textMuted },
  delete: { padding: spacing.xs },
});
