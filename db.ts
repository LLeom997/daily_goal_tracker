
import { Dexie, type Table } from 'dexie';
import { Habit, HabitLog, Settings } from './types';

export class DisciplineDB extends Dexie {
  habits!: Table<Habit>;
  logs!: Table<HabitLog>;
  settings!: Table<Settings>;

  constructor() {
    super('DisciplineDB');
    // Version 2: Added 'completed' index to logs to allow filtering in Analytics
    this.version(2).stores({
      habits: '++id, name, active',
      logs: '++id, habitId, date, completed, [habitId+date]',
      settings: '++id'
    });

    // Handle legacy version 1 if user has it
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
    throw err;
  }
}
