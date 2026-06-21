import { useState } from 'react';
import HabitGrid from '../components/HabitGrid';
import { currentHalfMonthState, getHalfMonthDays, prevHalf, nextHalf, formatHalfMonthLabel } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import type { HalfMonthState } from '../types';

export default function MainView() {
  const { handleSignOut } = useAuth();
  const [halfMonth, setHalfMonth] = useState<HalfMonthState>(currentHalfMonthState);
  const days = getHalfMonthDays(halfMonth.year, halfMonth.month, halfMonth.half);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header + Nav 統合 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 2,
      }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Habit Tracker</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setHalfMonth(prevHalf(halfMonth))}
            style={{ fontSize: 18, color: 'var(--text-secondary)', padding: '4px 8px' }}
          >
            ＜
          </button>
          <span style={{ fontWeight: 600, fontSize: 15, minWidth: 140, textAlign: 'center' }}>
            {formatHalfMonthLabel(halfMonth)}
          </span>
          <button
            onClick={() => setHalfMonth(nextHalf(halfMonth))}
            style={{ fontSize: 18, color: 'var(--text-secondary)', padding: '4px 8px' }}
          >
            ＞
          </button>
        </div>

        <button
          onClick={handleSignOut}
          style={{ fontSize: 12, color: 'var(--text-muted)' }}
        >
          ログアウト
        </button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <HabitGrid days={days} />
      </div>
    </div>
  );
}
