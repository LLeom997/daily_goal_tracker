
import React, { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import confetti from 'canvas-confetti';
import { Plus, Check, Flame, Trophy, ChevronRight } from 'lucide-react';
import { db } from '../db';
import { Habit } from '../types';

const Dashboard: React.FC = () => {
  const [today] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const habits = useLiveQuery(() => db.habits.where('active').equals(1).toArray());
  const logs = useLiveQuery(() => db.logs.where('date').equals(today).toArray());
  const allLogs = useLiveQuery(() => db.logs.toArray());

  const completedCount = logs?.filter(l => l.completed === 1).length || 0;
  const totalCount = habits?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Real-time streak calculation for display on habits
  const habitStreaks = useMemo(() => {
    if (!habits || !allLogs) return {} as Record<number, number>;
    const streaks: Record<number, number> = {};
    
    habits.forEach(h => {
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const entry = allLogs.find(l => l.habitId === h.id && l.date === d && l.completed === 1);
        if (entry) streak++;
        else if (i === 0) continue; // Allow today to be empty without breaking streak
        else break;
      }
      streaks[h.id!] = streak;
    });
    return streaks;
  }, [habits, allLogs]);

  const toggleHabit = async (habitId: number) => {
    const log = await db.logs.where('[habitId+date]').equals([habitId, today]).first();
    let isNowCompleted = false;

    if (log) {
      isNowCompleted = !log.completed;
      await db.logs.update(log.id!, { completed: isNowCompleted ? 1 : 0 });
    } else {
      isNowCompleted = true;
      await db.logs.add({ habitId, date: today, completed: 1, timestamp: Date.now() });
    }

    if (isNowCompleted && completedCount + 1 === totalCount && totalCount > 0) {
      confetti({ 
        particleCount: 150, 
        spread: 80, 
        origin: { y: 0.7 }, 
        colors: ['#ffffff', '#000000', '#71717a'],
        ticks: 200
      });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await db.habits.add({ name: newHabitName.trim(), createdAt: Date.now(), active: 1 });
    setNewHabitName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10">
      <header className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h1 className="text-3xl font-bold tracking-tight italic">Unstoppable</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center rounded-2xl w-12 h-12 bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all active:scale-90"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-secondary/50 border space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today's Progress</p>
              <p className="text-xl font-bold">{completedCount} / {totalCount}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black italic">{Math.round(progressPercent)}%</p>
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <section className="space-y-3">
        {habits?.map(habit => {
          const isCompleted = logs?.some(l => l.habitId === habit.id && l.completed === 1);
          const streak = habitStreaks[habit.id!] || 0;

          return (
            <div 
              key={habit.id}
              onClick={() => toggleHabit(habit.id!)}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group active:scale-[0.97] ${
                isCompleted 
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/10' 
                  : 'bg-card border-muted hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                isCompleted ? 'bg-white border-white text-primary' : 'border-muted-foreground/20'
              }`}>
                {isCompleted ? <Check size={18} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
              </div>
              <div className="flex-grow">
                <p className={`font-bold text-sm tracking-tight ${isCompleted ? '' : 'text-foreground'}`}>
                  {habit.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <Flame size={12} className={streak > 0 ? (isCompleted ? 'text-white' : 'text-orange-500') : 'text-muted-foreground/40'} />
                   <span className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                     {streak} Day Streak
                   </span>
                </div>
              </div>
              {!isCompleted && <ChevronRight size={16} className="text-muted-foreground/30" />}
            </div>
          );
        })}
        {habits?.length === 0 && (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-muted-foreground" size={24} />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg italic">The journey begins here</p>
              <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">Add your first daily discipline</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-xl transition-transform active:scale-95"
            >
              Get Started
            </button>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm border-2 shadow-2xl rounded-[32px] p-8 animate-in slide-in-from-bottom-10 duration-300">
            <div className="space-y-2 mb-8">
              <h3 className="text-2xl font-black italic">Set New Goal</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Consistency is the only metric</p>
            </div>
            <form onSubmit={handleAdd} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Habit Name</label>
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. Read 10 Pages"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full bg-secondary border-2 border-transparent focus:border-primary p-4 rounded-2xl outline-none text-sm font-bold transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-xs font-bold uppercase tracking-widest hover:bg-muted rounded-2xl transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
                >
                  Initialize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
