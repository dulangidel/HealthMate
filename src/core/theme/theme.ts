import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export const colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primarySoft: '#EEF2FF',
  background: '#F4F6FB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  onPrimary: '#FFFFFF',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  // Metric colour coding (steps = green, calories = red, water = blue)
  steps: '#16A34A',
  stepsSoft: '#DCFCE7',
  calories: '#EF4444',
  caloriesSoft: '#FEE2E2',
  water: '#2563EB',
  waterSoft: '#DBEAFE',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  subheading: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  caption: { fontSize: 13, color: colors.textMuted },
  small: { fontSize: 12, color: colors.textMuted },
};

export const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type MetricKey = 'steps' | 'calories' | 'water';

export interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  icon: IconName;
  color: string;
  soft: string;
}

export const METRICS: Record<MetricKey, MetricConfig> = {
  steps: { key: 'steps', label: 'Steps', unit: 'steps', icon: 'footsteps', color: colors.steps, soft: colors.stepsSoft },
  calories: { key: 'calories', label: 'Calories Burned', unit: 'kcal', icon: 'flame', color: colors.calories, soft: colors.caloriesSoft },
  water: { key: 'water', label: 'Water Intake', unit: 'ml', icon: 'water', color: colors.water, soft: colors.waterSoft },
};

export const METRIC_KEYS: MetricKey[] = ['steps', 'calories', 'water'];
