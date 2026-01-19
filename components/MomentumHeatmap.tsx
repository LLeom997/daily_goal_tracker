
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, subDays } from 'date-fns';

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
    <div className="space-y-3">
      <h2 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Momentum</h2>
      <div className="grid grid-cols-7 gap-1.5 brutalist-border border-zinc-900 p-3 rounded-2xl bg-zinc-900/20">
        {days.map((day, idx) => {
          const dStr = format(day, 'yyyy-MM-dd');
          const count = logCounts?.[dStr] || 0;
          const max = totalHabits || 1;
          const intensity = count === 0 ? 0 : Math.ceil((count / max) * 4);
          
          return (
            <div 
              key={idx}
              className={`aspect-square rounded-md brutalist-border transition-all duration-500 ${
                intensity === 0 ? 'bg-zinc-950 border-zinc-900/50' : 
                intensity === 1 ? 'bg-zinc-800 border-zinc-700' :
                intensity === 2 ? 'bg-zinc-600 border-zinc-600' :
                intensity === 3 ? 'bg-zinc-300 border-zinc-300' :
                'bg-zinc-50 border-white'
              }`}
            />
          );
        })}
      </div>
      <div className="flex justify-between items-center px-1">
        <span className="text-[7px] font-black uppercase text-zinc-700">Passive</span>
        <span className="text-[7px] font-black uppercase text-zinc-400">Elite</span>
      </div>
    </div>
  );
};

export default MomentumHeatmap;
