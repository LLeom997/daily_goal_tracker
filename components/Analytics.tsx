
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

const Analytics: React.FC = () => {
  const chartData = useLiveQuery(async () => {
    const end = new Date();
    const start = subDays(end, 6);
    const interval = eachDayOfInterval({ start, end });
    
    const data = [];
    for (const day of interval) {
      const dStr = format(day, 'yyyy-MM-dd');
      const count = await db.logs.where('date').equals(dStr).count();
      data.push({
        name: format(day, 'EEE').toUpperCase(),
        completions: count,
        fullDate: dStr
      });
    }
    return data;
  }, []);

  const bestStreak = useLiveQuery(async () => {
    const allLogs = await db.logs.toArray();
    const dates = [...new Set(allLogs.map(l => l.date))].sort();
    
    let max = 0;
    let current = 0;
    
    for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
            current = 1;
        } else {
            const prev = new Date(dates[i-1]);
            const curr = new Date(dates[i]);
            const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
            
            if (diff === 1) {
                current++;
            } else {
                max = Math.max(max, current);
                current = 1;
            }
        }
    }
    return Math.max(max, current);
  }, []);

  const totalCompletions = useLiveQuery(() => db.logs.count(), []);

  if (!chartData) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500">Weekly Performance</h2>
        <div className="h-64 brutalist-border border-zinc-900 rounded-3xl p-4 bg-zinc-900/30">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 900 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '2px solid #27272a',
                  borderRadius: '1rem',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              />
              <Bar dataKey="completions" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.completions > 0 ? '#f4f4f5' : '#27272a'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="brutalist-border border-zinc-900 p-6 rounded-3xl bg-zinc-900/40 text-center">
            <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Best Streak</p>
            <p className="text-3xl font-black italic tracking-tighter">{bestStreak ?? 0}</p>
        </div>
        <div className="brutalist-border border-zinc-900 p-6 rounded-3xl bg-zinc-900/40 text-center">
            <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Total Wins</p>
            <p className="text-3xl font-black italic tracking-tighter">{totalCompletions ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
