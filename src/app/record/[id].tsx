import { useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/core/components/EmptyState';
import { RecordFormScreen } from '@/features/health-records/views/RecordFormScreen';

export default function EditRecordRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = Number(id);
  if (!Number.isInteger(recordId) || recordId <= 0) {
    return <EmptyState icon="alert-circle-outline" title="Invalid record" />;
  }
  return <RecordFormScreen key={recordId} recordId={recordId} />;
}
