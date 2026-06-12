import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection, doc, onSnapshot, setDoc, updateDoc,
  serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import type { Habit, HabitRecord } from '../types';

interface HabitContextValue {
  habits: Habit[];
  records: HabitRecord[];
  addHabit: (name: string) => Promise<void>;
  updateHabit: (id: string, data: Partial<Omit<Habit, 'id' | 'createdAt'>>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleRecord: (habitId: string, date: string) => Promise<void>;
  reorderHabits: (ids: string[]) => Promise<void>;
}

const HabitContext = createContext<HabitContextValue | null>(null);

const PRESET_COLORS = [
  '#f97316', '#3b82f6', '#22c55e', '#ef4444',
  '#a855f7', '#eab308', '#ec4899', '#94a3b8',
];

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [records, setRecords] = useState<HabitRecord[]>([]);

  useEffect(() => {
    if (!user) { setHabits([]); setRecords([]); return; }
    const habitsRef = collection(db, 'users', user.uid, 'habits');
    const unsubHabits = onSnapshot(habitsRef, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Habit[];
      data.sort((a, b) => a.order - b.order);
      setHabits(data);
    });
    return unsubHabits;
  }, [user]);

  useEffect(() => {
    if (!user) { setRecords([]); return; }
    const recordsRef = collection(db, 'users', user.uid, 'records');
    const unsubRecords = onSnapshot(recordsRef, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as HabitRecord[];
      setRecords(data);
    });
    return unsubRecords;
  }, [user]);

  const addHabit = useCallback(async (name: string) => {
    if (!user || !name.trim()) return;
    const maxOrder = habits.length > 0 ? Math.max(...habits.map(h => h.order)) : -1;
    const colorIndex = habits.length % PRESET_COLORS.length;
    const id = `${Date.now()}`;
    await setDoc(doc(db, 'users', user.uid, 'habits', id), {
      name: name.trim(),
      color: PRESET_COLORS[colorIndex],
      detail: '',
      order: maxOrder + 1,
      createdAt: serverTimestamp(),
    });
  }, [user, habits]);

  const updateHabit = useCallback(async (id: string, data: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'habits', id), data);
  }, [user]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!user) return;
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', user.uid, 'habits', id));
    records.filter(r => r.habitId === id).forEach(r => {
      batch.delete(doc(db, 'users', user.uid, 'records', r.id));
    });
    await batch.commit();
  }, [user, records]);

  const toggleRecord = useCallback(async (habitId: string, date: string) => {
    if (!user) return;
    const recordId = `${habitId}_${date}`;
    const existing = records.find(r => r.id === recordId);
    if (existing) {
      await updateDoc(doc(db, 'users', user.uid, 'records', recordId), { done: !existing.done });
    } else {
      await setDoc(doc(db, 'users', user.uid, 'records', recordId), {
        habitId,
        date,
        done: true,
        createdAt: serverTimestamp(),
      });
    }
  }, [user, records]);

  const reorderHabits = useCallback(async (ids: string[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    ids.forEach((id, i) => {
      batch.update(doc(db, 'users', user.uid, 'habits', id), { order: i });
    });
    await batch.commit();
  }, [user]);

  return (
    <HabitContext.Provider value={{ habits, records, addHabit, updateHabit, deleteHabit, toggleRecord, reorderHabits }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits must be used within HabitProvider');
  return ctx;
}
