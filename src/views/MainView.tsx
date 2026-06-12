import { useState } from 'react';
import HalfMonthNav from '../components/HalfMonthNav';
import HabitGrid from '../components/HabitGrid';
import { currentHalfMonthState, getHalfMonthDays } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import type { HalfMonthState } from '../types';

export default function MainView() {
  const { handleSignOut } = useAuth();
  const [halfMonth, setHalfMonth] = useState<HalfMonthState>(currentHalfMonthState);
  const days = getHalfMonthDays(halfMonth.year, halfMonth.month, halfMonth.half);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Habit Tracker</span>
        <button
          onClick={handleSignOut}
          style={{ fontSize: 12, color: 'var(--text-muted)' }}
        >
          ログアウト
        </button>
      </div>

      {/* Nav */}
      <HalfMonthNav state={halfMonth} onChange={setHalfMonth} />

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <HabitGrid days={days} />
      </div>
    </div>
  );
}
