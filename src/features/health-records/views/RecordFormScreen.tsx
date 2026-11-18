import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, type RefObject } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInputInstance,
} from 'react-native';

import { Button } from '@/core/components/Button';
import { DateField } from '@/core/components/DateField';
import { EmptyState } from '@/core/components/EmptyState';
import { FormField } from '@/core/components/FormField';
import { colors, METRICS, radius, spacing, type MetricKey } from '@/core/theme/theme';
import { NOTE_MAX_LENGTH } from '../model/validation';
import { useRecordFormViewModel } from '../viewmodels/useRecordFormViewModel';

interface Props {
  recordId?: number;
  initialDate?: string;
}

/** Add / Edit health record form with validation. */
export function RecordFormScreen({ recordId, initialDate }: Props) {
  const vm = useRecordFormViewModel(recordId, initialDate);
  const caloriesRef = useRef<TextInputInstance>(null);
  const waterRef = useRef<TextInputInstance>(null);
  const noteRef = useRef<TextInputInstance>(null);
  const refs: Record<MetricKey, RefObject<TextInputInstance | null> | null> = { steps: null, calories: caloriesRef, water: waterRef };
  const nextOf: Record<MetricKey, RefObject<TextInputInstance | null>> = { steps: caloriesRef, calories: waterRef, water: noteRef };

  const onSave = async () => {
    if (await vm.submit()) router.back();
  };

  const onDelete = () => {
    Alert.alert('Delete this entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await vm.remove();
            router.back();
          } catch {
            Alert.alert('Error', 'Could not delete the entry.');
          }
        },
      },
    ]);
  };

  if (vm.loading) {
    return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  }

  if (vm.notFound) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Record not found"
        message="It may have been deleted."
        action={<Button title="Go back" variant="secondary" onPress={() => router.back()} />}
      />
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <DateField
          testID="date-field"
          label="Date"
          value={vm.values.date}
          onChange={(d) => vm.setField('date', d)}
          error={vm.errors.date}
        />

        {(['steps', 'calories', 'water'] as MetricKey[]).map((key) => {
          const m = METRICS[key];
          return (
            <FormField
                key={key}
                ref={refs[key] ?? undefined}
                testID={`input-${key}`}
                label={key === 'water' ? 'Water intake' : key === 'calories' ? 'Calories burned' : 'Steps walked'}
                icon={m.icon}
                iconColor={m.color}
                unit={m.unit}
                value={vm.values[key]}
                onChangeText={(t) => vm.setField(key, t)}
                placeholder="0"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => nextOf[key].current?.focus()}
                error={vm.errors[key]}
                maxLength={7}
              />
          );
        })}

        <FormField
          ref={noteRef}
          testID="input-note"
          label="Note (optional)"
          icon="create-outline"
          value={vm.values.note}
          onChangeText={(t) => vm.setField('note', t)}
          placeholder="e.g. Evening run in the park"
          multiline
          maxLength={NOTE_MAX_LENGTH + 20}
          error={vm.errors.note}
          hint={`${vm.values.note.length}/${NOTE_MAX_LENGTH}`}
        />

        {vm.errors.form ? (
          <View style={styles.formError} accessibilityLiveRegion="assertive">
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.formErrorText}>{vm.errors.form}</Text>
          </View>
        ) : null}

        <Button
          testID="save-button"
          title={vm.isEditing ? 'Save changes' : 'Save record'}
          icon="checkmark"
          onPress={onSave}
          loading={vm.saving}
        />
        {vm.isEditing && <Button title="Delete entry" icon="trash-outline" variant="danger" onPress={onDelete} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 },
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  formErrorText: { flex: 1, color: colors.danger, fontWeight: '600' },
});
