import { prevHalf, nextHalf, formatHalfMonthLabel } from '../utils/dateUtils';
import type { HalfMonthState } from '../types';

interface Props {
  state: HalfMonthState;
  onChange: (s: HalfMonthState) => void;
}

export default function HalfMonthNav({ state, onChange }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: '12px 16px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 2,
    }}>
      <button
        onClick={() => onChange(prevHalf(state))}
        style={{ fontSize: 18, color: 'var(--text-secondary)', padding: '4px 8px' }}
      >
        ＜
      </button>
      <span style={{ fontWeight: 600, fontSize: 15, minWidth: 160, textAlign: 'center' }}>
        {formatHalfMonthLabel(state)}
      </span>
      <button
        onClick={() => onChange(nextHalf(state))}
        style={{ fontSize: 18, color: 'var(--text-secondary)', padding: '4px 8px' }}
      >
        ＞
      </button>
    </div>
  );
}
