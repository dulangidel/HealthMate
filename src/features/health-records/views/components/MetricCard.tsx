import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/core/components/Card';
import { ProgressBar } from '@/core/components/ProgressBar';
import { colors, spacing, type IconName } from '@/core/theme/theme';
import { formatNumber } from '@/core/utils/format';

interface Props {
  label: string;
  icon: IconName;
  color: string;
  soft: string;
  value: number;
  unit: string;
  goal: number;
  progress: number;
}

/** Today's total for one metric with a simple progress bar towards the goal. */
export function MetricCard({ label, icon, color, soft, value, unit, goal, progress }: Props) {
  return (
    <Card style={styles.card}>
      <View
        style={styles.row}
        accessible
        accessibilityLabel={`${label}: ${formatNumber(value)} ${unit} of ${formatNumber(goal)} goal`}
      >
        <Ionicons name={icon} size={22} color={color} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {formatNumber(value)} <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>
      <ProgressBar value={progress} color={color} trackColor={soft} height={6} />
      <Text style={styles.goal}>
        Goal: {formatNumber(goal)} {unit}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { flex: 1, fontSize: 15, color: colors.text },
  value: { fontSize: 18, fontWeight: '600', color: colors.text },
  unit: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
  goal: { fontSize: 12, color: colors.textMuted },
});
