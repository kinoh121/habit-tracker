import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useHabits } from '../contexts/HabitContext';
import HabitCell from './HabitCell';
import ColorPicker from './ColorPicker';
import type { Habit } from '../types';

interface Props {
  habit: Habit;
  days: string[];
  onDragStart: (id: string) => void;
  onDragOver: (id: string, position: 'before' | 'after') => void;
  onDrop: () => void;
  dragOverPosition: 'before' | 'after' | null;
  isTouchDragging: boolean;
}

export default function HabitRow({
  habit, days,
  onDragStart, onDragOver, onDrop, dragOverPosition, isTouchDragging,
}: Props) {
  const { updateHabit, deleteHabit } = useHabits();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const [showDetail, setShowDetail] = useState(false);
  const [editDetail, setEditDetail] = useState(habit.detail);
  const [showColor, setShowColor] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState({ top: 0, left: 0 });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const colorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTimeRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { if (!editing) setEditName(habit.name); }, [habit.name, editing]);
  useEffect(() => { setEditDetail(habit.detail); }, [habit.detail]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commitName = async () => {
    setEditing(false);
    if (editName.trim() && editName.trim() !== habit.name) {
      await updateHabit(habit.id, { name: editName.trim() });
    } else {
      setEditName(habit.name);
    }
  };

  const commitDetail = async () => { await updateHabit(habit.id, { detail: editDetail }); };

  const handleColorChange = async (color: string) => {
    await updateHabit(habit.id, { color });
    setShowColor(false);
  };

  const startColorTimer = useCallback(() => {
    if (colorTimerRef.current) clearTimeout(colorTimerRef.current);
    colorTimerRef.current = setTimeout(() => setShowColor(false), 3000);
  }, []);

  const openColorPicker = useCallback(() => {
    if (colorBtnRef.current) {
      const rect = colorBtnRef.current.getBoundingClientRect();
      setColorPickerPos({ top: rect.bottom + 4, left: rect.left });
    }
    setShowColor(v => {
      if (!v) setTimeout(() => startColorTimer(), 0);
      return !v;
    });
  }, [startColorTimer]);

  useEffect(() => {
    if (!showColor && colorTimerRef.current) clearTimeout(colorTimerRef.current);
  }, [showColor]);

  // ダブルタップで編集（ドラッグ開始は親コンテナが長押しで処理）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const moved = Math.sqrt(dx * dx + dy * dy) > 10;
    touchStartRef.current = null;

    if (moved) return;

    const now = Date.now();
    if (now - lastTapTimeRef.current < 300) {
      setEditing(true);
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
    }
  }, []);

  const borderTop = dragOverPosition === 'before' ? '2px solid var(--accent)' : '1px solid var(--border)';
  const borderBottom = dragOverPosition === 'after' ? '2px solid var(--accent)' : '1px solid var(--border)';

  return (
    <>
      <tr
        data-habit-id={habit.id}
        draggable
        onDragStart={() => onDragStart(habit.id)}
        onDragOver={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          onDragOver(habit.id, e.clientY < rect.top + rect.height / 2 ? 'before' : 'after');
        }}
        onDrop={onDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ opacity: isTouchDragging ? 0.3 : 1 }}
      >
        <td style={{
          position: 'sticky', left: 0,
          background: 'var(--bg-primary)', zIndex: 1,
          minWidth: 144, maxWidth: 198, padding: '0 4px',
          borderTop, borderBottom, borderRight: '1px solid var(--border)',
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 32 }}>
              <button
                ref={colorBtnRef}
                onClick={openColorPicker}
                style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: habit.color, flexShrink: 0, border: 'none', padding: 0,
                }}
              />

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
                  onDoubleClick={() => setEditing(true)}
                  style={{
                    flex: 1, fontSize: 13, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    cursor: 'default', color: 'var(--text-primary)',
                    userSelect: 'none', WebkitUserSelect: 'none',
                  }}
                >
                  {habit.name}
                </span>
              )}

              <button
                onClick={() => setShowDetail(v => !v)}
                style={{
                  fontSize: 11, color: habit.detail ? 'var(--accent)' : 'var(--text-muted)',
                  padding: '0 2px', flexShrink: 0,
                }}
              >
                {showDetail ? '▲' : '▼'}
              </button>

              <button
                onClick={() => setConfirmDelete(true)}
                style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0 2px', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {showColor && createPortal(
              <div
                onMouseMove={startColorTimer}
                onTouchStart={startColorTimer}
                style={{
                  position: 'fixed',
                  top: colorPickerPos.top, left: colorPickerPos.left,
                  zIndex: 9999,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: 8, boxShadow: 'var(--shadow)',
                }}
              >
                <ColorPicker value={habit.color} onChange={handleColorChange} />
              </div>,
              document.body
            )}
          </div>
        </td>

        {days.map(date => (
          <HabitCell key={date} habitId={habit.id} date={date} color={habit.color} />
        ))}
      </tr>

      {showDetail && (
        <tr>
          <td
            colSpan={days.length + 1}
            style={{
              background: 'var(--bg-secondary)', padding: '6px 8px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
              {habit.name}
            </div>
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

      {confirmDelete && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '20px 24px',
              minWidth: 240,
              boxShadow: 'var(--shadow)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8 }}>
              「{habit.name}」を削除しますか？
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              記録もすべて削除されます。
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  fontSize: 13, padding: '6px 14px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => { deleteHabit(habit.id); setConfirmDelete(false); }}
                style={{
                  fontSize: 13, padding: '6px 14px',
                  background: '#7a3040',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  color: '#fff',
                }}
              >
                削除
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
