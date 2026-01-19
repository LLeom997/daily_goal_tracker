
import Dexie, { Table } from 'dexie';
import { Habit, Log, Settings } from './types';

export class UnstoppableDB extends Dexie {
  habits!: Table<Habit>;
  logs!: Table<Log>;
  settings!: Table<Settings>;

  constructor() {
    super('UnstoppableDB');
    this.version(1).stores({
      habits: '++id, name, active',
      logs: '++id, [habitId+date], date, completed',
      settings: 'id'
    });
  }
}

export const db = new UnstoppableDB();

// Seed initial data if empty
export const seedDatabase = async () => {
  const habitCount = await db.habits.count();
  if (habitCount === 0) {
    const defaultHabits = [
      { name: 'Meditate', createdAt: Date.now(), active: 1 },
      { name: 'Workout', createdAt: Date.now(), active: 1 },
      { name: 'Read', createdAt: Date.now(), active: 1 },
      { name: 'Eat Healthy', createdAt: Date.now(), active: 1 },
      { name: 'Plan Day', createdAt: Date.now(), active: 1 },
    ];
    await db.habits.bulkAdd(defaultHabits);
  }

  const settingsExist = await db.settings.get('app-settings');
  if (!settingsExist) {
    await db.settings.add({
      id: 'app-settings',
      theme: 'dark',
      notifications: false,
      reminderTime: '08:00'
    });
  }
};
