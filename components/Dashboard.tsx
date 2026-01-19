
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
    if (window.navigator.vibrate) {
      window.navigator.vibrate(5);
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

    const currentHabits = await db.habits.where('active').equals(1).toArray();
    const currentLogs = await db.logs.where('date').equals(today).toArray();
    if (currentLogs.length + 1 === currentHabits.length && !existing) {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ffffff', '#000000', '#71717a']
      });
    }
  }, [today]);

  const streak = useLiveQuery(async () => {
    let count = 0;
    let checkDate = new Date();
    
    const todayDone = await db.logs.where('date').equals(format(new Date(), 'yyyy-MM-dd')).first();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayDone = await db.logs.where('date').equals(format(yesterdayDate, 'yyyy-MM-dd')).first();

    if (!todayDone && !yesterdayDone) return 0;

    while (true) {
      const d = format(checkDate, 'yyyy-MM-dd');
      const hasLogs = await db.logs.where('date').equals(d).first();
      if (hasLogs) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="flex items-center justify-between brutalist-border border-zinc-900 p-3 rounded-2xl bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-50 p-1.5 rounded-xl">
            <Flame className="text-zinc-900" size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Streak</p>
            <p className="text-lg font-black italic tracking-tight">{streak ?? 0} DAYS</p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Today's Focus</h2>
        {habits.map((habit) => {
          const isCompleted = logs?.some(l => l.habitId === habit.id);
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id!)}
              className={`w-full group relative flex items-center justify-between p-3.5 brutalist-border transition-all duration-300 rounded-2xl overflow-hidden ${
                isCompleted 
                  ? 'bg-zinc-100 border-zinc-100 text-zinc-950 scale-[0.99]' 
                  : 'bg-zinc-900/50 border-zinc-900 text-zinc-50 hover:border-zinc-800'
              }`}
            >
              <div className="flex flex-col items-start z-10">
                <span className={`text-sm font-bold tracking-tight uppercase ${isCompleted ? 'line-through opacity-50' : ''}`}>
                  {habit.name}
                </span>
                <span className={`text-[8px] uppercase font-black tracking-widest ${isCompleted ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  +10 XP
                </span>
              </div>
              <div className={`p-1.5 rounded-xl brutalist-border transition-all duration-500 ${
                isCompleted 
                  ? 'bg-zinc-950 border-zinc-950 text-zinc-50 rotate-0' 
                  : 'bg-zinc-800 border-zinc-800 text-zinc-800 rotate-45 scale-75'
              }`}>
                <Check size={14} strokeWidth={4} />
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
