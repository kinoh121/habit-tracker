import { useState, useRef, useEffect } from 'react';
import { useHabits } from '../contexts/HabitContext';
import HabitCell from './HabitCell';
import ColorPicker from './ColorPicker';
import type { Habit } from '../types';

interface Props {
  habit: Habit;
  days: string[];
}

export default function HabitRow({ habit, days }: Props) {
  const { updateHabit, deleteHabit } = useHabits();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const [showDetail, setShowDetail] = useState(false);
  const [editDetail, setEditDetail] = useState(habit.detail);
  const [showColor, setShowColor] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setEditName(habit.name);
  }, [habit.name, editing]);

  useEffect(() => {
    setEditDetail(habit.detail);
  }, [habit.detail]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitName = async () => {
    setEditing(false);
    if (editName.trim() && editName.trim() !== habit.name) {
      await updateHabit(habit.id, { name: editName.trim() });
    } else {
      setEditName(habit.name);
    }
  };

  const commitDetail = async () => {
    await updateHabit(habit.id, { detail: editDetail });
  };

  const handleColorChange = async (color: string) => {
    await updateHabit(habit.id, { color });
    setShowColor(false);
  };

  return (
    <>
      <tr>
        <td style={{
          position: 'sticky',
          left: 0,
          background: 'var(--bg-primary)',
          zIndex: 1,
          minWidth: 140,
          maxWidth: 180,
          padding: '0 4px',
          borderBottom: '1px solid var(--border)',
          borderRight: '1px solid var(--border)',
        }}>
          <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 32 }}>
            {/* Color dot */}
            <button
              onClick={() => setShowColor(v => !v)}
              style={{
                width: 12, height: 12, borderRadius: '50%',
                background: habit.color, flexShrink: 0,
                border: 'none', padding: 0,
              }}
              title="色を変更"
            />

            {/* Name */}
            {editing ? (
              <input
                ref={inputRef}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitName();
                  if (e.key === 'Escape') { setEditing(false); setEditName(habit.name); }
                }}
                style={{ flex: 1, fontSize: 13, padding: '2px 4px', height: 24 }}
              />
            ) : (
              <span
                onClick={() => setEditing(true)}
                style={{
                  flex: 1, fontSize: 13, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  cursor: 'text', color: 'var(--text-primary)',
                }}
                title={habit.name}
              >
                {habit.name}
              </span>
            )}

            {/* Detail toggle */}
            <button
              onClick={() => setShowDetail(v => !v)}
              style={{
                fontSize: 11, color: habit.detail ? 'var(--accent)' : 'var(--text-muted)',
                padding: '0 2px', flexShrink: 0,
              }}
              title="詳細"
            >
              {showDetail ? '▲' : '▼'}
            </button>

            {/* Delete */}
            <button
              onClick={() => deleteHabit(habit.id)}
              style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0 2px', flexShrink: 0 }}
              title="削除"
            >
              ✕
            </button>
          </div>

          {/* Color picker */}
          {showColor && (
            <div style={{
              position: 'absolute', zIndex: 10, background: 'var(--bg-secondary)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              padding: 8, marginTop: 2, top: '100%', left: 0,
            }}>
              <ColorPicker value={habit.color} onChange={handleColorChange} />
            </div>
          )}
          </div>
        </td>

        {days.map(date => (
          <HabitCell key={date} habitId={habit.id} date={date} color={habit.color} />
        ))}
      </tr>

      {/* Detail row */}
      {showDetail && (
        <tr>
          <td
            colSpan={days.length + 1}
            style={{
              background: 'var(--bg-secondary)',
              padding: '6px 8px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <textarea
              value={editDetail}
              onChange={e => setEditDetail(e.target.value)}
              onBlur={commitDetail}
              placeholder="詳細メモ..."
              style={{ width: '100%', fontSize: 12, minHeight: 56, resize: 'vertical' }}
            />
          </td>
        </tr>
      )}
    </>
  );
}
