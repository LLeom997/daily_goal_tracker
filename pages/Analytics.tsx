
import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { format, subDays, startOfToday, isValid, parseISO } from 'date-fns';
import { Trophy, Zap, Flame, Target } from 'lucide-react';
import { db } from '../db';
import { HabitLog, UserStats } from '../types';

const Analytics: React.FC = () => {
  const habits = useLiveQuery(() => db.habits.where('active').equals(1).toArray());
  const allLogs = useLiveQuery(() => db.logs.where('completed').equals(1).toArray());

  // Logic to calculate XP and Levels with defensive guards
  const stats: UserStats = useMemo(() => {
    const defaultStats: UserStats = { xp: 0, level: 1, progress: 0, currentStreak: 0, bestStreak: 0, totalCompletions: 0 };
    if (!allLogs || !habits || habits.length === 0) return defaultStats;

    const totalCompletions = allLogs.length;
    
    // Group logs by date
    const logsByDate = allLogs.reduce((acc, log) => {
      if (log.date) {
        acc[log.date] = (acc[log.date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate Streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    const today = startOfToday();
    
    for (let i = 0; i < 365; i++) {
      const dateCheck = subDays(today, i);
      const dateStr = format(dateCheck, 'yyyy-MM-dd');
      
      if (logsByDate[dateStr] > 0) {
        tempStreak++;
        // If we are checking today or consecutive days from today, increment currentStreak
        if (i === currentStreak || (i === 1 && currentStreak === 0)) {
          currentStreak = tempStreak;
        }
      } else {
        // Only break current streak if we are past "today" and "yesterday"
        if (i > 1) {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 0;
          // Optimization: if we're past the gap, no need to keep calculating current streak
          if (i > currentStreak + 1) break;
        }
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    // XP Logic: 10 XP per completion + streak bonuses
    const xp = (totalCompletions * 10) + (bestStreak * 50);
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const progress = Math.min(100, Math.max(0, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));

    return { xp, level, progress, currentStreak, bestStreak, totalCompletions };
  }, [allLogs, habits]);

  const chartData = useMemo(() => {
    if (!allLogs) return [];
    const today = startOfToday();
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = allLogs.filter(log => log.date === dateStr).length;
      return {
        name: format(date, 'EEE'),
        completed: count,
      };
    });
  }, [allLogs]);

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      <header className="space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Growth Engine</p>
          <h1 className="text-3xl font-black italic tracking-tight">Analytics</h1>
        </div>

        {/* Level System Card */}
        <div className="p-6 rounded-[2rem] bg-primary text-primary-foreground shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Trophy size={100} />
          </div>
          <div className="relative z-10 space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Discipline Level</p>
                <h2 className="text-5xl font-black italic tracking-tighter">LVL {stats.level}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total XP</p>
                <p className="text-2xl font-black">{stats.xp.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white transition-all duration-1000 ease-out" 
                  style={{ width: `${stats.progress}%` }} 
                />
              </div>
              <p className="text-[10px] font-bold opacity-60 text-center tracking-widest uppercase">
                {Math.round(stats.progress)}% to Level {stats.level + 1}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-[2rem] border-2 bg-card flex flex-col justify-between h-36 hover:border-orange-500/50 transition-colors">
          <Flame className="text-orange-500" size={24} />
          <div>
            <p className="text-3xl font-black italic tracking-tighter">{stats.currentStreak}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Streak</p>
          </div>
        </div>
        <div className="p-6 rounded-[2rem] border-2 bg-card flex flex-col justify-between h-36 hover:border-yellow-500/50 transition-colors">
          <Zap className="text-yellow-500" size={24} />
          <div>
            <p className="text-3xl font-black italic tracking-tighter">{stats.bestStreak}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Best Streak</p>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Target size={18} className="text-primary" />
          <h3 className="text-xs font-bold tracking-[0.15em] uppercase">Weekly Output</h3>
        </div>
        <div className="h-56 w-full bg-card border-2 rounded-[2rem] p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: 'currentColor', opacity: 0.4}} 
              />
              <Bar 
                dataKey="completed" 
                radius={[8, 8, 8, 8]}
                barSize={24}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.completed > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} 
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Intensity Heatmap */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold tracking-[0.15em] uppercase">Momentum Map</h3>
          <span className="text-[10px] text-muted-foreground font-bold uppercase">28D Window</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 28 }).map((_, i) => {
            const date = subDays(startOfToday(), 27 - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const logsOnDay = allLogs?.filter(log => log.date === dateStr).length || 0;
            const habitCount = Math.max(1, habits?.length || 1);
            const intensity = Math.min(1, logsOnDay / habitCount);
            
            return (
              <div 
                key={i}
                className={`aspect-square rounded-lg transition-all duration-300 border-2 ${
                  intensity > 0 ? 'border-primary/10' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: intensity > 0 
                    ? `hsl(var(--primary) / ${Math.max(0.15, intensity)})` 
                    : 'hsl(var(--muted) / 0.4)'
                }}
              />
            );
          })}
        </div>
      </section>

      <footer className="pt-10 border-t-2 border-dashed text-center">
         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
           Lifetime Missions: {stats.totalCompletions}
         </p>
      </footer>
    </div>
  );
};

export default Analytics;
