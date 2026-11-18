import { fireEvent, render, screen } from '@testing-library/react-native';

import { METRICS } from '@/core/theme/theme';
import type { HealthRecord } from '../../model/HealthRecord';
import { MetricCard } from '../components/MetricCard';
import { RecordListItem } from '../components/RecordListItem';

describe('MetricCard', () => {
  it('shows the value and goal', async () => {
    const m = METRICS.water;
    await render(
      <MetricCard label={m.label} icon={m.icon} color={m.color} soft={m.soft} unit={m.unit} value={2000} goal={2500} progress={0.8} />,
    );
    expect(screen.getByText('Water Intake')).toBeTruthy();
    expect(screen.getByText(/2,000/)).toBeTruthy();
    expect(screen.getByText('Goal: 2,500 ml')).toBeTruthy();
  });
});

describe('RecordListItem', () => {
  const record: HealthRecord = {
    id: 7,
    date: '2026-11-17',
    steps: 7850,
    calories: 420,
    water: 2000,
    note: 'Evening walk',
    createdAt: '',
    updatedAt: '',
  };

  it('renders metrics and note, and calls handlers', async () => {
    const onPress = jest.fn();
    const onDelete = jest.fn();
    await render(<RecordListItem record={record} onPress={onPress} onDelete={onDelete} />);

    expect(screen.getByText(/7,850/)).toBeTruthy();
    expect(screen.getByText(/420 kcal/)).toBeTruthy();
    expect(screen.getByText('Evening walk')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('record-7'));
    expect(onPress).toHaveBeenCalledWith(record);

    await fireEvent.press(screen.getByTestId('delete-7'));
    expect(onDelete).toHaveBeenCalledWith(record);
  });
});
