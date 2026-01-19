
export interface Habit {
  id?: number;
  name: string;
  createdAt: number;
  active: number; // 1 for active, 0 for archived
  category?: string;
}

export interface HabitLog {
  id?: number;
  habitId: number;
  date: string; // YYYY-MM-DD
  completed: number; // 1 for true, 0 for false
  timestamp: number;
}

export interface Settings {
  id?: number;
  theme: 'light' | 'dark';
  notifications: boolean;
  reminderTime: string;
}

export interface UserStats {
  xp: number;
  level: number;
  progress: number;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
}
