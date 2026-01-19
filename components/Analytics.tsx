
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Performance</h2>
        <div className="h-48 brutalist-border border-zinc-900 rounded-2xl p-3 bg-zinc-900/20">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#52525b', fontSize: 8, fontWeight: 800 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a',
                  borderRadius: '0.75rem',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  padding: '4px 8px'
                }}
              />
              <Bar dataKey="completions" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.completions > 0 ? '#fafafa' : '#27272a'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="brutalist-border border-zinc-900 p-4 rounded-2xl bg-zinc-900/30 text-center">
            <p className="text-[8px] uppercase font-black text-zinc-600 tracking-widest mb-0.5">Record</p>
            <p className="text-xl font-black italic tracking-tight">{bestStreak ?? 0}</p>
        </div>
        <div className="brutalist-border border-zinc-900 p-4 rounded-2xl bg-zinc-900/30 text-center">
            <p className="text-[8px] uppercase font-black text-zinc-600 tracking-widest mb-0.5">Wins</p>
            <p className="text-xl font-black italic tracking-tight">{totalCompletions ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
