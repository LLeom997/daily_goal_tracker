
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, Archive, Moon, Sun, AlertTriangle, Plus, X } from 'lucide-react';

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
    if (confirm('Permanently delete this habit and all its logs?')) {
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Theme Toggle */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500">Appearance</h2>
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-6 brutalist-border border-zinc-800 rounded-3xl bg-zinc-900/40"
        >
          <span className="font-bold uppercase tracking-tight">
            {settings?.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </span>
          {settings?.theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </section>

      {/* Habit Management */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500">Habit Management</h2>
        
        <form onSubmit={addHabit} className="flex gap-2">
            <input 
                type="text" 
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="New Habit..."
                className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-4 font-bold focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-700"
            />
            <button type="submit" className="bg-zinc-50 text-zinc-950 p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all">
                <Plus size={24} strokeWidth={3} />
            </button>
        </form>

        <div className="space-y-3">
          {habits?.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-4 brutalist-border border-zinc-800 rounded-3xl bg-zinc-900/20">
              <span className={`font-bold uppercase ${habit.active === 0 ? 'text-zinc-700' : ''}`}>
                {habit.name}
              </span>
              <div className="flex gap-2">
                <button 
                    onClick={() => archiveHabit(habit.id!, habit.active)}
                    className="p-2 rounded-xl border-2 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    title={habit.active === 1 ? 'Archive' : 'Unarchive'}
                >
                  <Archive size={18} />
                </button>
                <button 
                    onClick={() => deleteHabit(habit.id!)}
                    className="p-2 rounded-xl border-2 border-zinc-800 text-zinc-500 hover:text-red-500"
                    title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xs uppercase tracking-[0.2em] font-black text-red-900 dark:text-red-500">Danger Zone</h2>
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-between p-6 border-2 border-red-900/30 rounded-3xl bg-red-900/5 text-red-500 hover:bg-red-900/10 transition-all"
        >
          <span className="font-bold uppercase tracking-tight">Wipe Database</span>
          <AlertTriangle size={20} />
        </button>
      </section>

      {/* Modal Overlay for Wipe Confirmation */}
      {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-950 border-2 border-red-500 p-8 rounded-[2rem] max-w-sm w-full space-y-6">
                <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase text-red-500 tracking-tighter">Are you sure?</h3>
                    <p className="text-sm font-bold text-zinc-400">This action will destroy all habits, logs, and XP progress. This cannot be undone.</p>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={wipeData}
                        className="w-full p-4 bg-red-500 text-white font-black uppercase rounded-2xl hover:bg-red-600 transition-colors"
                    >
                        Yes, Delete Everything
                    </button>
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="w-full p-4 bg-zinc-900 text-zinc-400 font-black uppercase rounded-2xl hover:bg-zinc-800 transition-colors"
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
