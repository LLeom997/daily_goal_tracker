
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, Archive, Moon, Sun, AlertTriangle, Plus } from 'lucide-react';

const SettingsView: React.FC = () => {
  const habits = useLiveQuery(() => db.habits.toArray());
  const settings = useLiveQuery(() => db.settings.get('app-settings'));
  const [newHabitName, setNewHabitName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleTheme = async () => {
    if (!settings) return;
    await db.settings.update('app-settings', {
      theme: settings.theme === 'dark' ? 'light' : 'dark'
    });
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await db.habits.add({
      name: newHabitName.trim(),
      createdAt: Date.now(),
      active: 1
    });
    setNewHabitName('');
  };

  const archiveHabit = async (id: number, currentActive: number) => {
    await db.habits.update(id, { active: currentActive === 1 ? 0 : 1 });
  };

  const deleteHabit = async (id: number) => {
    if (confirm('Delete habit?')) {
        await db.habits.delete(id);
        await db.logs.where('habitId').equals(id).delete();
    }
  };

  const wipeData = async () => {
    await db.habits.clear();
    await db.logs.clear();
    await db.settings.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Preferences</h2>
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 brutalist-border border-zinc-900 rounded-2xl bg-zinc-900/30"
        >
          <span className="text-sm font-bold uppercase tracking-tight">
            {settings?.theme === 'light' ? 'Light' : 'Dark'}
          </span>
          {settings?.theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Habits</h2>
        
        <form onSubmit={addHabit} className="flex gap-2">
            <input 
                type="text" 
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="New Discipline..."
                className="flex-1 h-10 bg-zinc-900/50 border border-zinc-900 rounded-xl px-3 text-xs font-bold focus:border-zinc-700 outline-none transition-all placeholder:text-zinc-800"
            />
            <button type="submit" className="bg-zinc-50 text-zinc-950 w-10 h-10 flex items-center justify-center rounded-xl hover:scale-105 active:scale-95 transition-all">
                <Plus size={18} strokeWidth={3} />
            </button>
        </form>

        <div className="space-y-2">
          {habits?.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-3 brutalist-border border-zinc-900 rounded-2xl bg-zinc-900/10">
              <span className={`text-xs font-bold uppercase ${habit.active === 0 ? 'text-zinc-800' : ''}`}>
                {habit.name}
              </span>
              <div className="flex gap-1.5">
                <button 
                    onClick={() => archiveHabit(habit.id!, habit.active)}
                    className="p-1.5 rounded-lg border border-zinc-900 text-zinc-600 hover:text-zinc-400"
                >
                  <Archive size={14} />
                </button>
                <button 
                    onClick={() => deleteHabit(habit.id!)}
                    className="p-1.5 rounded-lg border border-zinc-900 text-zinc-600 hover:text-red-800"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 pt-2">
        <h2 className="text-[10px] uppercase tracking-widest font-black text-red-900/50 dark:text-red-900">Danger Zone</h2>
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-between p-4 border border-red-900/20 rounded-2xl bg-red-950/5 text-red-900 hover:bg-red-950/10 transition-all"
        >
          <span className="text-xs font-bold uppercase tracking-tight">Wipe All Data</span>
          <AlertTriangle size={16} />
        </button>
      </section>

      {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-950 border border-red-900 p-6 rounded-[2rem] max-w-xs w-full space-y-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-black italic uppercase text-red-900 tracking-tighter">Confirm Wipe</h3>
                    <p className="text-[10px] font-bold text-zinc-600">All habits and XP progress will be permanently deleted.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={wipeData}
                        className="w-full p-3 bg-red-950 text-red-400 text-xs font-black uppercase rounded-xl hover:bg-red-900 transition-colors"
                    >
                        Destroy Data
                    </button>
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="w-full p-3 bg-zinc-900 text-zinc-500 text-xs font-black uppercase rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default SettingsView;
