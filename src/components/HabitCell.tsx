import { useHabits } from '../contexts/HabitContext';
import { today } from '../utils/dateUtils';

interface Props {
  habitId: string;
  date: string;
  color: string;
}

export default function HabitCell({ habitId, date, color }: Props) {
  const { records, toggleRecord } = useHabits();
  const record = records.find(r => r.id === `${habitId}_${date}`);
  const done = record?.done ?? false;
  const isToday = date === today();

  return (
    <td
      onClick={() => toggleRecord(habitId, date)}
      style={{
        width: 32,
        minWidth: 32,
        height: 32,
        background: done ? color : 'transparent',
        border: `1px solid var(--border)`,
        cursor: 'pointer',
        textAlign: 'center',
        outline: isToday ? `1px solid ${color}` : 'none',
        outlineOffset: -2,
        transition: 'background 0.1s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    />
  );
}
