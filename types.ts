
export enum TaskCategory {
  WORK = 'Work',
  PERSONAL = 'Personal',
  HEALTH = 'Health',
  LEARNING = 'Learning',
  OTHER = 'Other'
}

export type TaskStatus = 'active' | 'completed' | 'incomplete';

export type AppTheme = 'VAPORWAVE' | 'CYBERPUNK' | 'FANTASY';

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  category: TaskCategory;
  createdAt: number;
}

export interface WeeklyTarget {
  id: string;
  text: string;
  completed: boolean;
}

export interface EntertainmentQuest {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyStats {
  total: number;
  completed: number;
  percentage: number;
}

export interface CheatActivity {
  id: string;
  title: string;
  metric?: number; // hours for games/tv, not needed for movies
}
