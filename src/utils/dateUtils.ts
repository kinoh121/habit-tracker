import type { HalfMonthState } from '../types';

export function today(): string {
  const d = new Date();
  return toDateStr(d);
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getHalfMonthDays(year: number, month: number, half: 'first' | 'second'): string[] {
  const days: string[] = [];
  const m = String(month).padStart(2, '0');
  if (half === 'first') {
    for (let d = 1; d <= 15; d++) {
      days.push(`${year}-${m}-${String(d).padStart(2, '0')}`);
    }
  } else {
    const lastDay = new Date(year, month, 0).getDate();
    for (let d = 16; d <= lastDay; d++) {
      days.push(`${year}-${m}-${String(d).padStart(2, '0')}`);
    }
  }
  return days;
}

export function prevHalf(state: HalfMonthState): HalfMonthState {
  if (state.half === 'second') return { ...state, half: 'first' };
  if (state.month === 1) return { year: state.year - 1, month: 12, half: 'second' };
  return { year: state.year, month: state.month - 1, half: 'second' };
}

export function nextHalf(state: HalfMonthState): HalfMonthState {
  if (state.half === 'first') return { ...state, half: 'second' };
  if (state.month === 12) return { year: state.year + 1, month: 1, half: 'first' };
  return { year: state.year, month: state.month + 1, half: 'first' };
}

export function formatHalfMonthLabel(state: HalfMonthState): string {
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'];
  const halfLabel = state.half === 'first' ? '前半' : '後半';
  return `${state.year}年 ${monthNames[state.month - 1]} ${halfLabel}`;
}

export function currentHalfMonthState(): HalfMonthState {
  const d = new Date();
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    half: d.getDate() <= 15 ? 'first' : 'second',
  };
}
