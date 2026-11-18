import { useLocalSearchParams } from 'expo-router';

import { isValidISODate } from '@/core/utils/date';
import { RecordFormScreen } from '@/features/health-records/views/RecordFormScreen';

export default function NewRecordRoute() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  return <RecordFormScreen initialDate={date && isValidISODate(date) ? date : undefined} />;
}
