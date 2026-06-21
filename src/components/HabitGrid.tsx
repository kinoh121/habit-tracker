import { useState, useRef, useEffect, useCallback } from 'react';
import { useHabits } from '../contexts/HabitContext';
import HabitRow from './HabitRow';
import { today } from '../utils/dateUtils';

interface Props {
  days: string[];
}

export default function HabitGrid({ days }: Props) {
  const { habits, addHabit, reorderHabits } = useHabits();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const todayStr = today();

  // PC drag state
  const dragIdRef = useRef<string | null>(null);
  const [pcDragOver, setPcDragOver] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const pcDragOverRef = useRef<{ id: string; position: 'before' | 'after' } | null>(null);

  const handleDragStart = useCallback((id: string) => { dragIdRef.current = id; }, []);
  const handleDragOver = useCallback((id: string, position: 'before' | 'after') => {
    if (dragIdRef.current !== id) {
      pcDragOverRef.current = { id, position };
      setPcDragOver({ id, position });
    }
  }, []);
  const handleDrop = useCallback(() => {
    const fromId = dragIdRef.current;
    const over = pcDragOverRef.current;
    if (fromId && over && fromId !== over.id) {
      const ids = habits.map(h => h.id);
      const fromIdx = ids.indexOf(fromId);
      const toIdx = ids.indexOf(over.id);
      const newIds = [...ids];
      newIds.splice(fromIdx, 1);
      const insertAt = over.position === 'before' ? toIdx : toIdx + 1;
      const adjusted = fromIdx < toIdx
        ? (over.position === 'before' ? toIdx - 1 : toIdx)
        : insertAt;
      newIds.splice(adjusted, 0, fromId);
      reorderHabits(newIds);
    }
    dragIdRef.current = null;
    pcDragOverRef.current = null;
    setPcDragOver(null);
  }, [habits, reorderHabits]);

  // Touch drag state (TaskToolと同じアーキテクチャ)
  const containerRef = useRef<HTMLDivElement>(null);
  const touchDragIdRef = useRef<string | null>(null);
  const touchDragOverIdRef = useRef<string | null>(null);
  const [touchDragOver, setTouchDragOver] = useState<string | null>(null);
  const [touchDraggingId, setTouchDraggingId] = useState<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const ghostOffsetRef = useRef({ x: 0, y: 0 });

  const cleanupGhost = useCallback(() => {
    if (ghostRef.current) { ghostRef.current.remove(); ghostRef.current = null; }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reorder = (fromId: string, toId: string) => {
      if (fromId === toId) return;
      const ids = habits.map(h => h.id);
      const fromIdx = ids.indexOf(fromId);
      const toIdx = ids.indexOf(toId);
      if (fromIdx < 0 || toIdx < 0) return;
      const newIds = [...ids];
      const [moved] = newIds.splice(fromIdx, 1);
      newIds.splice(toIdx, 0, moved);
      reorderHabits(newIds);
    };

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as Element;
      const row = target.closest('[data-habit-id]');
      const habitId = row?.getAttribute('data-habit-id');
      if (!habitId) return;

      const touch = e.touches[0];
      const sourceEl = row as HTMLElement;

      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        touchDragIdRef.current = habitId;
        setTouchDraggingId(habitId);
        if (navigator.vibrate) navigator.vibrate(50);

        // ゴースト生成
        const rect = sourceEl.getBoundingClientRect();
        cleanupGhost();
        const ghost = sourceEl.cloneNode(true) as HTMLDivElement;
        ghost.style.cssText = [
          'position: fixed',
          `left: ${rect.left}px`,
          `top: ${rect.top}px`,
          `width: ${rect.width}px`,
          `height: ${rect.height}px`,
          'opacity: 0.85',
          'pointer-events: none',
          'z-index: 9999',
          'box-shadow: 0 8px 24px rgba(0,0,0,0.4)',
          'border-radius: 4px',
          'transform: scale(1.03)',
        ].join(';');
        document.body.appendChild(ghost);
        ghostRef.current = ghost;
        ghostOffsetRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      }, 300);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchDragIdRef.current) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        return;
      }
      e.preventDefault();
      const touch = e.touches[0];
      if (ghostRef.current) {
        ghostRef.current.style.left = `${touch.clientX - ghostOffsetRef.current.x}px`;
        ghostRef.current.style.top = `${touch.clientY - ghostOffsetRef.current.y}px`;
      }
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const row = target?.closest('[data-habit-id]');
      const targetId = row?.getAttribute('data-habit-id');
      if (targetId && targetId !== touchDragIdRef.current) {
        touchDragOverIdRef.current = targetId;
        setTouchDragOver(targetId);
      }
    };

    const endDrag = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (touchDragIdRef.current && touchDragOverIdRef.current) {
        reorder(touchDragIdRef.current, touchDragOverIdRef.current);
      }
      touchDragIdRef.current = null;
      touchDragOverIdRef.current = null;
      setTouchDraggingId(null);
      setTouchDragOver(null);
      cleanupGhost();
    };

    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', endDrag);
    el.addEventListener('touchcancel', endDrag);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', endDrag);
      el.removeEventListener('touchcancel', endDrag);
      cleanupGhost();
    };
  }, [habits, reorderHabits, cleanupGhost]);

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
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeeks = days.map(d => {
    const [y, m, day] = d.split('-').map(Number);
    return weekdays[new Date(y, m - 1, day).getDay()];
  });

  return (
    <div ref={containerRef} style={{ overflowX: 'auto', overflowY: 'auto' }}>
      <table style={{
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        minWidth: 'max-content',
      }}>
        <thead>
          <tr>
            <th style={{
              position: 'sticky', left: 0,
              background: 'var(--bg-secondary)', zIndex: 3,
              minWidth: 144, maxWidth: 198, height: 28,
              borderBottom: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
            }} />
            {days.map((date, i) => (
              <th key={date} style={{
                width: 32, minWidth: 32, height: 28,
                textAlign: 'center', fontSize: 11,
                fontWeight: date === todayStr ? 700 : 400,
                color: date === todayStr ? 'var(--accent)' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                background: date === todayStr ? '#2a2a3a' : 'var(--bg-secondary)',
              }}>
                {dayNumbers[i]}
              </th>
            ))}
          </tr>
          <tr>
            <th style={{
              position: 'sticky', left: 0,
              background: 'var(--bg-secondary)', zIndex: 3,
              height: 22,
              borderBottom: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
            }} />
            {days.map((date, i) => {
              const dow = dayOfWeeks[i];
              const isWeekend = dow === '土' || dow === '日';
              return (
                <th key={date} style={{
                  width: 32, minWidth: 32, height: 22,
                  textAlign: 'center', fontSize: 10, fontWeight: 400,
                  color: date === todayStr ? 'var(--accent)' : isWeekend ? '#888' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  background: date === todayStr ? '#2a2a3a' : 'var(--bg-secondary)',
                }}>
                  {dow}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {habits.map(habit => {
            const fromIdx = habits.findIndex(h => h.id === touchDraggingId);
            const toIdx = habits.findIndex(h => h.id === habit.id);
            const touchDragOverPosition: 'before' | 'after' | null =
              touchDragOver === habit.id && touchDraggingId
                ? (fromIdx < toIdx ? 'after' : 'before')
                : null;

            return (
              <HabitRow
                key={habit.id}
                habit={habit}
                days={days}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                dragOverPosition={
                  pcDragOver?.id === habit.id
                    ? pcDragOver.position
                    : touchDragOverPosition
                }
                isTouchDragging={touchDraggingId === habit.id}
              />
            );
          })}

          <tr>
            <td colSpan={days.length + 1} style={{ padding: '4px 8px', borderTop: '1px solid var(--border)' }}>
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
                  style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}
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
