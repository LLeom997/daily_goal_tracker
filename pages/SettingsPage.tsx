
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Moon, Sun, Download, Trash2, Archive } from 'lucide-react';
import { db } from '../db';

interface SettingsPageProps {
  setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ setTheme }) => {
  const habits = useLiveQuery(() => db.habits.toArray());
  const settings = useLiveQuery(() => db.settings.toArray());
  const currentTheme = settings?.[0]?.theme || 'dark';

  const toggleTheme = async () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    if (settings && settings[0]) {
      await db.settings.update(settings[0].id!, { theme: newTheme });
    }
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const deleteHabit = async (id: number) => {
    if (confirm('Delete habit and all history?')) {
      await db.habits.delete(id);
      await db.logs.where('habitId').equals(id).delete();
    }
  };

  const archiveHabit = async (id: number, current: number) => {
    await db.habits.update(id, { active: current ? 0 : 1 });
  };

  return (
    <div className="space-y-12">
      <header className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Preferences</p>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </header>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Appearance</h3>
        <div className="rounded-xl border bg-card divide-y">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {currentTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative ${currentTheme === 'dark' ? 'bg-primary' : 'bg-secondary'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform duration-200 ${currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Manage Habits</h3>
        <div className="rounded-xl border bg-card divide-y">
          {habits?.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-4">
              <span className={`text-sm font-medium ${!habit.active ? 'opacity-30 line-through' : ''}`}>{habit.name}</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => archiveHabit(habit.id!, habit.active)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Archive size={16} />
                </button>
                <button 
                  onClick={() => deleteHabit(habit.id!)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {habits?.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground italic">No habits yet.</div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Danger Zone</h3>
        <button 
          onClick={async () => {
            if (confirm('Permanently wipe ALL data?')) {
              await (db as any).delete();
              window.location.reload();
            }
          }}
          className="w-full p-4 rounded-xl border border-destructive text-destructive text-sm font-semibold hover:bg-destructive hover:text-destructive-foreground transition-all"
        >
          Reset Local Database
        </button>
      </section>

      <footer className="text-center">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Discipline v1.0 • Offline Local Storage</p>
      </footer>
    </div>
  );
};

export default SettingsPage;
