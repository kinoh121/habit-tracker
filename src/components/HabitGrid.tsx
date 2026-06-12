import { useState, useRef, useEffect } from 'react';
import { useHabits } from '../contexts/HabitContext';
import HabitRow from './HabitRow';
import { today } from '../utils/dateUtils';

interface Props {
  days: string[];
}

export default function HabitGrid({ days }: Props) {
  const { habits, addHabit } = useHabits();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const todayStr = today();

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const submitAdd = async () => {
    if (newName.trim()) {
      await addHabit(newName.trim());
      setNewName('');
    }
    setAdding(false);
  };

  const dayNumbers = days.map(d => parseInt(d.split('-')[2], 10));

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto' }}>
      <table style={{
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        minWidth: 'max-content',
      }}>
        <thead>
          <tr>
            <th style={{
              position: 'sticky',
              left: 0,
              background: 'var(--bg-secondary)',
              zIndex: 3,
              minWidth: 140,
              maxWidth: 180,
              height: 32,
              borderBottom: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
            }} />
            {days.map((date, i) => (
              <th
                key={date}
                style={{
                  width: 32,
                  minWidth: 32,
                  height: 32,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: date === todayStr ? 700 : 400,
                  color: date === todayStr ? 'var(--accent)' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                }}
              >
                {dayNumbers[i]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habits.map(habit => (
            <HabitRow key={habit.id} habit={habit} days={days} />
          ))}

          {/* Add row */}
          <tr>
            <td
              colSpan={days.length + 1}
              style={{
                padding: '4px 8px',
                borderTop: '1px solid var(--border)',
              }}
            >
              {adding ? (
                <input
                  ref={inputRef}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onBlur={submitAdd}
                  onKeyDown={e => {
                    if (e.key === 'Enter') submitAdd();
                    if (e.key === 'Escape') { setAdding(false); setNewName(''); }
                  }}
                  placeholder="ハビット名を入力..."
                  style={{ width: 200, fontSize: 13 }}
                />
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    padding: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  ＋ ハビットを追加
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
