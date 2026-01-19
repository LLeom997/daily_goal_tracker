
export interface Habit {
  id?: number;
  name: string;
  createdAt: number;
  active: number; // 1 for active, 0 for archived
}

export interface Log {
  id?: number;
  habitId: number;
  date: string; // YYYY-MM-DD
  completed: number; // 1 for true, 0 for false
  timestamp: number;
}

export interface Settings {
  id: string; // 'app-settings'
  theme: 'dark' | 'light';
  notifications: boolean;
  reminderTime: string;
}

export interface DailyCompletion {
  date: string;
  count: number;
  total: number;
}
