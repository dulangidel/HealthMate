import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/core/theme/theme';
import { formatLongDate, parseISODate, todayISO, toISODate } from '@/core/utils/date';
import { Button } from './Button';

interface Props {
  label?: string;
  value: string | null;
  onChange: (iso: string) => void;
  placeholder?: string;
  error?: string;
  maximumDate?: string;
  compact?: boolean;
  testID?: string;
}

/** Native date picker: dialog on Android, calendar sheet on iOS. */
export function DateField({ label, value, onChange, placeholder = 'Select a date', error, maximumDate = todayISO(), compact, testID }: Props) {
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ? parseISODate(value) : new Date());
  const max = parseISODate(maximumDate);

  const open = () => {
    const current = value ? parseISODate(value) : new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        maximumDate: max,
        onValueChange: (_e, date) => onChange(toISODate(date)),
      });
    } else {
      setDraft(current);
      setIosOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        testID={testID}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Date'}: ${value ? formatLongDate(value) : placeholder}`}
        style={({ pressed }) => [styles.field, compact && styles.compact, error ? styles.fieldError : null, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="calendar-outline" size={compact ? 16 : 20} color={colors.primary} />
        <Text style={[styles.value, !value && styles.placeholder, compact && styles.compactText]} numberOfLines={1}>
          {value ? formatLongDate(value) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {Platform.OS !== 'android' && (
        <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setIosOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => undefined}>
              <DateTimePicker
                value={draft}
                mode="date"
                display="inline"
                maximumDate={max}
                accentColor={colors.primary}
                onValueChange={(_e, date) => setDraft(date)}
              />
              <View style={styles.sheetActions}>
                <Button title="Cancel" variant="secondary" onPress={() => setIosOpen(false)} style={{ flex: 1 }} />
                <Button
                  title="Done"
                  onPress={() => {
                    onChange(toISODate(draft));
                    setIosOpen(false);
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  compact: { minHeight: 40, borderRadius: radius.pill },
  fieldError: { borderColor: colors.danger },
  value: { flex: 1, fontSize: 16, color: colors.text },
  compactText: { fontSize: 14 },
  placeholder: { color: colors.textSubtle },
  error: { fontSize: 13, color: colors.danger },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg },
  sheetActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
