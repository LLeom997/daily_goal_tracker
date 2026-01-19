
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, BarChart2, Settings as SettingsIcon, Zap } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';
import { db } from './db';

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {[
          { path: '/', icon: LayoutGrid, label: 'Today' },
          { path: '/analytics', icon: BarChart2, label: 'Stats' },
          { path: '/settings', icon: SettingsIcon, label: 'Settings' },
        ].map(({ path, icon: Icon, label }) => (
          <Link 
            key={path}
            to={path} 
            className={`flex flex-col items-center gap-1 w-full transition-colors ${
              isActive(path) 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={20} strokeWidth={isActive(path) ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-tight">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await db.settings.toArray();
        if (settings.length > 0) {
          const savedTheme = settings[0].theme;
          setTheme(savedTheme);
          if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (e) {
        console.error("Theme load failed", e);
      }
    };
    loadSettings();
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-background pb-20 selection:bg-primary selection:text-primary-foreground">
        <main className="max-w-md mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsPage setTheme={setTheme} />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </HashRouter>
  );
};

export default App;
