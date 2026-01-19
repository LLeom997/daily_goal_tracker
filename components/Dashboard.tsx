
import React, { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format } from 'date-fns';
import { Check, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import MomentumHeatmap from './MomentumHeatmap';

const Dashboard: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const habits = useLiveQuery(() => db.habits.where('active').equals(1).toArray());
  const logs = useLiveQuery(() => db.logs.where('date').equals(today).toArray());

  const toggleHabit = useCallback(async (habitId: number) => {
    // Haptic style feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    const existing = await db.logs.where({ habitId, date: today }).first();
    if (existing) {
      await db.logs.delete(existing.id!);
    } else {
      await db.logs.add({
        habitId,
        date: today,
        completed: 1,
        timestamp: Date.now()
      });
    }

    // Check for 100% completion
    const currentHabits = await db.habits.where('active').equals(1).toArray();
    const currentLogs = await db.logs.where('date').equals(today).toArray();
    if (currentLogs.length + 1 === currentHabits.length && !existing) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#000000', '#71717a']
      });
    }
  }, [today]);

  const streak = useLiveQuery(async () => {
    let count = 0;
    let checkDate = new Date();
    
    // Check if streak is alive (today or yesterday done)
    const todayDone = await db.logs.where('date').equals(format(new Date(), 'yyyy-MM-dd')).first();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayDone = await db.logs.where('date').equals(format(yesterdayDate, 'yyyy-MM-dd')).first();

    if (!todayDone && !yesterdayDone) return 0;

    // Start counting backwards
    while (true) {
      const d = format(checkDate, 'yyyy-MM-dd');
      const hasLogs = await db.logs.where('date').equals(d).first();
      if (hasLogs) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If we skip today but had yesterday, streak is still alive but count is from yesterday
        if (d === format(new Date(), 'yyyy-MM-dd')) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
        }
        break;
      }
    }
    return count;
  }, []);

  if (!habits) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="flex items-center justify-between brutalist-border border-zinc-800 p-4 rounded-3xl bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-50 p-2 rounded-2xl">
            <Flame className="text-zinc-900" size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-zinc-500">Current Streak</p>
            <p className="text-2xl font-black italic tracking-tighter">{streak ?? 0} DAYS</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500">Today's Discipline</h2>
        {habits.map((habit) => {
          const isCompleted = logs?.some(l => l.habitId === habit.id);
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id!)}
              className={`w-full group relative flex items-center justify-between p-6 brutalist-border transition-all duration-300 rounded-3xl overflow-hidden ${
                isCompleted 
                  ? 'bg-zinc-100 border-zinc-100 text-zinc-950 scale-[0.98]' 
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-50 hover:border-zinc-700'
              }`}
            >
              <div className="flex flex-col items-start z-10">
                <span className={`text-lg font-bold tracking-tight uppercase ${isCompleted ? 'line-through opacity-60' : ''}`}>
                  {habit.name}
                </span>
                <span className={`text-[10px] uppercase font-black tracking-widest ${isCompleted ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  +10 XP
                </span>
              </div>
              <div className={`p-2 rounded-2xl brutalist-border transition-all duration-500 ${
                isCompleted 
                  ? 'bg-zinc-950 border-zinc-950 text-zinc-50 rotate-0' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-800 rotate-45 scale-75'
              }`}>
                <Check size={20} strokeWidth={4} />
              </div>
            </button>
          );
        })}
      </div>

      <MomentumHeatmap />
    </div>
  );
};

export default Dashboard;
