
import { Dexie, type Table } from 'dexie';
import { Habit, HabitLog, Settings } from './types';

// Fix: Use named import for Dexie to ensure full type resolution of inherited methods like version() and open()
export class DisciplineDB extends Dexie {
  habits!: Table<Habit>;
  logs!: Table<HabitLog>;
  settings!: Table<Settings>;

  constructor() {
    super('DisciplineDB');
    // Fix: Access inherited 'version' method from the Dexie base class
    this.version(1).stores({
      habits: '++id, name, active',
      logs: '++id, habitId, date, [habitId+date]',
      settings: '++id'
    });
  }
}

export const db = new DisciplineDB();

export const DEFAULT_HABITS = [
  "Meditate 10 minutes",
  "Workout / Exercise",
  "Read 10 pages",
  "Eat healthy",
  "Plan next day"
];

export async function initializeDB() {
  try {
    // Fix: Access inherited 'open' method from the Dexie base class instance
    await db.open();
    const habitCount = await db.habits.count();
    if (habitCount === 0) {
      const habitsToInsert = DEFAULT_HABITS.map(name => ({
        name,
        createdAt: Date.now(),
        active: 1
      }));
      await db.habits.bulkAdd(habitsToInsert);
    }

    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add({
        theme: 'dark',
        notifications: false,
        reminderTime: '20:00'
      });
    }
  } catch (err) {
    console.error("Database initialization failed:", err);
    // Re-throw so the caller (index.tsx) knows initialization failed
    throw err;
  }
}
