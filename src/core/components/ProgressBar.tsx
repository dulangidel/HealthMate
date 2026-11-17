import { StyleSheet, View } from 'react-native';

import { radius } from '@/core/theme/theme';

interface Props {
  /** 0..1 */
  value: number;
  color: string;
  trackColor: string;
  height?: number;
}

export function ProgressBar({ value, color, trackColor, height = 8 }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      style={[styles.track, { backgroundColor: trackColor, height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
    >
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
