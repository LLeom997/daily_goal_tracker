
import React from 'react';
import { Check, Flame } from 'lucide-react';
import { Habit } from '../types';

interface HabitItemProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, completed, streak, onToggle }) => {
  return (
    <div 
      onClick={onToggle}
      className={`group relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2
        ${completed 
          ? 'bg-primary/10 border-primary/40 dark:bg-primary/20 dark:border-primary/50' 
          : 'bg-white border-gray-100 hover:border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700'
        }`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
          ${completed 
            ? 'bg-primary text-white scale-110' 
            : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-600'
          }`}
        >
          {completed ? <Check size={20} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-current opacity-40" />}
        </div>
        <div>
          <h3 className={`font-semibold transition-colors ${completed ? 'text-primary dark:text-primary-300' : 'text-gray-700 dark:text-zinc-300'}`}>
            {habit.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
             <Flame size={12} className={streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-400 dark:text-zinc-600'} />
             <span className="text-xs font-medium text-gray-500 dark:text-zinc-500">
               {streak} day streak
             </span>
          </div>
        </div>
      </div>
      
      {completed && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none ring-2 ring-primary/20 animate-pulse" />
      )}
    </div>
  );
};

export default HabitItem;
