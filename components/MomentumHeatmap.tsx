
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, subDays, isSameDay } from 'date-fns';

const MomentumHeatmap: React.FC = () => {
  const days = Array.from({ length: 28 }, (_, i) => subDays(new Date(), 27 - i));

  const logCounts = useLiveQuery(async () => {
    const counts: Record<string, number> = {};
    const allLogs = await db.logs.toArray();
    allLogs.forEach(log => {
      counts[log.date] = (counts[log.date] || 0) + 1;
    });
    return counts;
  }, []);

  const totalHabits = useLiveQuery(() => db.habits.where('active').equals(1).count(), []);

  return (
    <div className="space-y-4">
      <h2 className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500">28-Day Momentum</h2>
      <div className="grid grid-cols-7 gap-2 brutalist-border border-zinc-900 p-4 rounded-3xl bg-zinc-900/30">
        {days.map((day, idx) => {
          const dStr = format(day, 'yyyy-MM-dd');
          const count = logCounts?.[dStr] || 0;
          const max = totalHabits || 1;
          const intensity = count === 0 ? 0 : Math.ceil((count / max) * 4);
          
          return (
            <div 
              key={idx}
              className={`aspect-square rounded-lg brutalist-border transition-all duration-500 ${
                intensity === 0 ? 'bg-zinc-950 border-zinc-800/50' : 
                intensity === 1 ? 'bg-zinc-800 border-zinc-700' :
                intensity === 2 ? 'bg-zinc-600 border-zinc-500' :
                intensity === 3 ? 'bg-zinc-300 border-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.1)]' :
                'bg-zinc-50 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              }`}
              title={`${dStr}: ${count} completions`}
            />
          );
        })}
      </div>
      <div className="flex justify-between items-center px-1">
        <span className="text-[8px] font-black uppercase text-zinc-600">Patheric</span>
        <span className="text-[8px] font-black uppercase text-zinc-300">Unstoppable</span>
      </div>
    </div>
  );
};

export default MomentumHeatmap;
