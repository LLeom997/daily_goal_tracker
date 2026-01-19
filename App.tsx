
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { format } from 'date-fns';
import { 
  Zap, 
  BarChart2, 
  Settings as SettingsIcon, 
  Flame, 
  Trophy,
  LayoutDashboard
} from 'lucide-react';
import confetti from 'canvas-confetti';

import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import SettingsView from './components/SettingsView';
import LevelBar from './components/LevelBar';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');
  
  const settings = useLiveQuery(() => db.settings.get('app-settings'));
  const isDark = settings?.theme !== 'light';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-zinc-950 text-zinc-50';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-zinc-50 text-zinc-950';
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen flex flex-col max-w-md mx-auto relative ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <header className="p-6 pt-10 sticky top-0 bg-inherit z-10 backdrop-blur-md bg-opacity-80">
        <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">
          UNSTOPPABLE
        </h1>
        <LevelBar />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 pb-24">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm h-16 bg-zinc-900/90 dark:bg-zinc-100/90 backdrop-blur-xl rounded-3xl brutalist-border border-zinc-700 dark:border-zinc-300 flex items-center justify-around px-2 z-50 transition-all duration-300">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard size={24} />} 
          isDark={isDark}
        />
        <NavButton 
          active={activeTab === 'analytics'} 
          onClick={() => setActiveTab('analytics')} 
          icon={<BarChart2 size={24} />} 
          isDark={isDark}
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          icon={<SettingsIcon size={24} />} 
          isDark={isDark}
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  isDark: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, isDark }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
        active 
          ? (isDark ? 'bg-zinc-50 text-zinc-950 scale-110 shadow-lg' : 'bg-zinc-950 text-zinc-50 scale-110 shadow-lg') 
          : 'text-zinc-500 hover:text-zinc-400'
      }`}
    >
      {icon}
    </button>
  );
};

export default App;
