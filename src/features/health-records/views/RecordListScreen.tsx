import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/core/components/Button';
import { Chip } from '@/core/components/Chip';
import { DateField } from '@/core/components/DateField';
import { EmptyState } from '@/core/components/EmptyState';
import { FloatingActionButton } from '@/core/components/FloatingActionButton';
import { colors, radius, spacing, typography } from '@/core/theme/theme';
import { relativeDayLabel } from '@/core/utils/date';
import { formatNumber, formatWater } from '@/core/utils/format';
import type { HealthRecord } from '../model/HealthRecord';
import { QUICK_FILTERS, useRecordListViewModel } from '../viewmodels/useRecordListViewModel';
import { RecordListItem } from './components/RecordListItem';

export function RecordListScreen() {
  const vm = useRecordListViewModel();

  const confirmDelete = useCallback(
    (record: HealthRecord) => {
      Alert.alert('Delete entry?', `This entry from ${relativeDayLabel(record.date, vm.today)} will be removed.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await vm.deleteRecord(record.id);
            } catch {
              Alert.alert('Error', 'Could not delete the entry. Please try again.');
            }
          },
        },
      ]);
    },
    [vm],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>History</Text>
          <Pressable
            onPress={vm.toggleSort}
            style={styles.sortButton}
            accessibilityRole="button"
            accessibilityLabel={vm.sort === 'desc' ? 'Sorted newest first. Tap to sort oldest first.' : 'Sorted oldest first. Tap to sort newest first.'}
            testID="sort-toggle"
          >
            <Ionicons name={vm.sort === 'desc' ? 'arrow-down' : 'arrow-up'} size={16} color={colors.primary} />
            <Text style={styles.sortText}>{vm.sort === 'desc' ? 'Newest' : 'Oldest'}</Text>
          </Pressable>
        </View>

        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            testID="search-input"
            value={vm.query}
            onChangeText={vm.setQuery}
            placeholder="Search by date (e.g. 2026-11-17, 17/11, Nov)"
            placeholderTextColor={colors.textSubtle}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel="Search records by date"
          />
          {vm.query ? (
            <Pressable onPress={() => vm.setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {QUICK_FILTERS.map((f) => (
            <Chip
              key={f.key}
              testID={`filter-${f.key}`}
              label={f.label}
              selected={vm.quickFilter === f.key}
              onPress={() => vm.selectQuickFilter(f.key)}
            />
          ))}
        </ScrollView>
        <DateField
          compact
          value={vm.selectedDate}
          onChange={vm.pickDate}
          placeholder="Filter by a specific date"
          testID="filter-date"
        />

        <View style={styles.resultRow}>
          <Text style={typography.caption}>
            {vm.resultCount} {vm.resultCount === 1 ? 'entry' : 'entries'}
          </Text>
          {vm.isFiltered && (
            <Pressable onPress={vm.clearFilters} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.clear}>Clear filters</Text>
            </Pressable>
          )}
        </View>
      </View>

      {vm.error ? (
        <EmptyState icon="alert-circle-outline" title="Couldn’t load records" message={vm.error} />
      ) : vm.loading && vm.sections.length === 0 ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : (
        <SectionList
          sections={vm.sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{relativeDayLabel(section.title, vm.today)}</Text>
              <Text style={styles.sectionTotals}>
                {formatNumber(section.summary.steps)} steps · {formatNumber(section.summary.calories)} kcal · {formatWater(section.summary.water)}
              </Text>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <View
              style={[
                styles.itemWrap,
                index === 0 && styles.first,
                index === section.data.length - 1 && styles.last,
                index > 0 && styles.divider,
              ]}
            >
              <RecordListItem record={item} onPress={(r) => router.push(`/record/${r.id}`)} onDelete={confirmDelete} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={vm.isFiltered ? 'search-outline' : 'clipboard-outline'}
              title={vm.isFiltered ? 'No matching records' : 'No records yet'}
              message={vm.isFiltered ? 'Try a different date or clear the filters.' : 'Your logged activities will appear here.'}
              action={
                vm.isFiltered ? (
                  <Button title="Clear filters" variant="secondary" onPress={vm.clearFilters} />
                ) : (
                  <Button title="Add first record" icon="add" onPress={() => router.push('/record/new')} />
                )
              }
            />
          }
        />
      )}

      <FloatingActionButton accessibilityLabel="Add health record" onPress={() => router.push('/record/new')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: typography.heading,
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  sortText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  chips: { gap: spacing.sm },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clear: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  list: { padding: spacing.lg, paddingBottom: 120 },
  sectionHeader: { marginTop: spacing.md, marginBottom: spacing.sm, gap: 2 },
  sectionTitle: { ...typography.subheading },
  sectionTotals: { ...typography.small },
  itemWrap: { backgroundColor: colors.surface, overflow: 'hidden' },
  first: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  last: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
