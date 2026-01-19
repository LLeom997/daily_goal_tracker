
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

const LevelBar: React.FC = () => {
  const xp = useLiveQuery(async () => {
    const logs = await db.logs.count();
    return logs * 10;
  }, []);

  if (xp === undefined) return null;

  const currentLevel = Math.floor(Math.sqrt(xp / 10)) + 1;
  const nextLevelXp = Math.pow(currentLevel, 2) * 10;
  const currentLevelStartXp = Math.pow(currentLevel - 1, 2) * 10;
  
  const progress = ((xp - currentLevelStartXp) / (nextLevelXp - currentLevelStartXp)) * 100;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
          LVL {currentLevel} <span className="italic opacity-70">— {(xp - currentLevelStartXp).toFixed(0)} / {(nextLevelXp - currentLevelStartXp).toFixed(0)} XP</span>
        </span>
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
          TOTAL {xp} XP
        </span>
      </div>
      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden brutalist-border border-zinc-900">
        <div 
          className="h-full bg-zinc-50 progress-bar-fluid"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default LevelBar;
