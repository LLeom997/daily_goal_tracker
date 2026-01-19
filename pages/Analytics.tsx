
import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell, YAxis } from 'recharts';
import { format, subDays, isBefore, startOfDay, parseISO, differenceInDays } from 'date-fns';
import { Trophy, Zap, Flame, Target } from 'lucide-react';
import { db } from '../db';
import { HabitLog } from '../types';

const Analytics: React.FC = () => {
  const habits = useLiveQuery(() => db.habits.where('active').equals(1).toArray());
  const allLogs = useLiveQuery(() => db.logs.where('completed').equals(1).toArray());

  // Logic to calculate XP and Levels
  const stats = useMemo(() => {
    if (!allLogs || !habits) return { xp: 0, level: 1, progress: 0, currentStreak: 0, bestStreak: 0 };

    const totalCompletions = allLogs.length;
    
    // Group logs by date to calculate streaks
    const logsByDate = allLogs.reduce((acc, log) => {
      acc[log.date] = (acc[log.date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate Streak (Consecutive days where at least 1 habit was done)
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    // Check back 365 days
    for (let i = 0; i < 365; i++) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (logsByDate[dateStr] > 0) {
        tempStreak++;
        if (i === currentStreak) currentStreak++; // Still in current streak
      } else {
        if (i === 0) {
           // Today not done yet, check if yesterday was done to keep currentStreak alive
           continue; 
        }
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 0;
        if (i > currentStreak) break; // Optimization: stop if we passed the gap
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    // XP Logic: 10 XP per completion + streak bonuses
    const xp = (totalCompletions * 10) + (bestStreak * 50);
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return { xp, level, progress, currentStreak, bestStreak, totalCompletions };
  }, [allLogs, habits]);

  const chartData = useMemo(() => {
    if (!allLogs) return [];
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = allLogs.filter(log => log.date === dateStr).length;
      return {
        name: format(date, 'EEE'),
        completed: count,
      };
    });
  }, [allLogs]);

  return (
    <div className="space-y-10 pb-12">
      <header className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Growth Engine</p>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        </div>

        {/* Level System Card */}
        <div className="p-6 rounded-3xl bg-primary text-primary-foreground shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={80} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Discipline Level</p>
                <h2 className="text-4xl font-black italic">LVL {stats.level}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total XP</p>
                <p className="text-xl font-bold">{stats.xp.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000" 
                  style={{ width: `${stats.progress}%` }} 
                />
              </div>
              <p className="text-[10px] font-medium opacity-70 text-center tracking-tight">
                {Math.round(stats.progress)}% to Level {stats.level + 1}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border bg-card flex flex-col justify-between h-32">
          <Flame className="text-orange-500 mb-2" size={20} />
          <div>
            <p className="text-2xl font-bold">{stats.currentStreak}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Streak</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl border bg-card flex flex-col justify-between h-32">
          <Zap className="text-yellow-500 mb-2" size={20} />
          <div>
            <p className="text-2xl font-bold">{stats.bestStreak}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Best Streak</p>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-primary" />
          <h3 className="text-sm font-bold tracking-tight uppercase">Weekly Output</h3>
        </div>
        <div className="h-48 w-full bg-card border rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: 'currentColor', opacity: 0.5}} 
              />
              <Tooltip 
                cursor={{fill: 'hsl(var(--muted))', opacity: 0.2}}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid hsl(var(--border))', 
                  backgroundColor: 'hsl(var(--card))',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="completed" 
                radius={[6, 6, 6, 6]}
                barSize={20}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.completed > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Intensity Heatmap */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold tracking-tight uppercase">Momentum Map</h3>
          <span className="text-[10px] text-muted-foreground font-medium">Last 28 Days</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 28 }).map((_, i) => {
            const date = subDays(new Date(), 27 - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const logsOnDay = allLogs?.filter(log => log.date === dateStr).length || 0;
            const habitCount = habits?.length || 1;
            const intensity = logsOnDay / habitCount;
            
            return (
              <div 
                key={i}
                title={`${dateStr}: ${logsOnDay} completed`}
                className={`aspect-square rounded-md transition-all duration-500 border ${
                  intensity > 0 ? 'border-primary/20' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: intensity > 0 
                    ? `hsl(var(--primary) / ${Math.max(0.1, intensity)})` 
                    : 'hsl(var(--muted) / 0.3)'
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-muted/30" />
            <div className="w-2 h-2 rounded-sm bg-primary/30" />
            <div className="w-2 h-2 rounded-sm bg-primary/60" />
            <div className="w-2 h-2 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </section>

      <footer className="pt-8 border-t text-center">
         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
           Total Task Completions: {stats.totalCompletions}
         </p>
      </footer>
    </div>
  );
};

export default Analytics;
