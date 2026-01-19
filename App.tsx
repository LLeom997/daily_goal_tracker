
import React, { useState, useEffect, ReactNode } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, BarChart2, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';
import { db } from './db';

// Define explicit interfaces for ErrorBoundary props and state
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Simple Error Boundary to catch rendering errors and prevent [object Object]
// Fix: Use React.Component with explicit generic interfaces for props and state to resolve property access errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error instanceof Error ? this.state.error.message : JSON.stringify(this.state.error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
          <div className="space-y-4 max-w-xs">
            <AlertCircle className="mx-auto text-destructive" size={48} />
            <h2 className="text-xl font-bold italic tracking-tighter uppercase">Application Crash</h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{msg}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default App;
