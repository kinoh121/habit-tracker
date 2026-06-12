import type { Timestamp } from 'firebase/firestore';

export interface Habit {
  id: string;
  name: string;
  color: string;
  detail: string;
  order: number;
  createdAt: Timestamp;
}

export interface HabitRecord {
  id: string;          // `${habitId}_${date}`
  habitId: string;
  date: string;        // YYYY-MM-DD
  done: boolean;
  createdAt: Timestamp;
}

export type HalfMonth = 'first' | 'second';

export interface HalfMonthState {
  year: number;
  month: number;       // 1-12
  half: HalfMonth;
}
