import { Ionicons } from '@expo/vector-icons';
import type { Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { colors, radius, spacing, type IconName } from '@/core/theme/theme';

interface Props extends Omit<TextInputProps, 'style' | 'ref'> {
  ref?: Ref<TextInputInstance>;
  label: string;
  error?: string;
  icon?: IconName;
  iconColor?: string;
  unit?: string;
  hint?: string;
}

export function FormField({ ref, label, error, icon, iconColor = colors.textMuted, unit, hint, multiline, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, multiline && styles.multiline, error ? styles.inputError : null]}>
        {icon && <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />}
        <TextInput
          ref={ref}
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholderTextColor={colors.textSubtle}
          multiline={multiline}
          accessibilityLabel={label}
          {...inputProps}
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: spacing.sm },
  inputError: { borderColor: colors.danger, backgroundColor: '#FFF8F8' },
  icon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: spacing.sm },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  unit: { fontSize: 14, color: colors.textMuted, marginLeft: spacing.sm },
  error: { fontSize: 13, color: colors.danger },
  hint: { fontSize: 12, color: colors.textMuted },
});
