import { useState } from 'react';
import { Dock, DockIcon } from "@/components/magicui/dock";
import { HomeIcon, FolderOpen, Moon, Sun, Settings, Shuffle } from "lucide-react";
import { AnimatedGridPattern } from './components/magicui/animated-grid-pattern';
import { WallpaperProvider } from './contexts/WallpaperContext';
import { PresetsView } from './components/features/PresetsView';
import { LocalWallpaperView } from './components/features/LocalWallpaperView';
import { SettingsView } from './components/features/SettingsView';
import { RandomWallpaperView } from './components/features/RandomWallpaperView';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

import './App.css';

// Theme toggle button component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-5 right-5 p-2 rounded-full bg-gray-300/30 dark:bg-gray-700/30 hover:bg-gray-300/50 dark:hover:bg-gray-700/50 transition-colors z-50"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-yellow-300" />
      ) : (
        <Moon size={20} className="text-gray-800" />
      )}
    </button>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<'presets' | 'local' | 'random' | 'history' | 'settings'>('presets');

  const renderContent = () => {
    switch (currentView) {
      case 'presets':
        return <PresetsView />;
      case 'local':
        return <LocalWallpaperView />;
      case 'random':
        return <RandomWallpaperView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <PresetsView />;
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.3}
        duration={3}
        repeatDelay={1}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
      />

      <main className="relative z-10 flex h-full flex-col items-center justify-center">
        <ThemeToggle />

        <div className="w-full h-full overflow-auto py-16">
          {renderContent()}
        </div>
      </main>

      <Dock className='fixed bottom-8 left-1/2 transform -translate-x-1/2 !bg-gray-500/20 dark:!bg-gray-800/30 !border-white/20 dark:!border-white/10 z-50'>
        <DockIcon onClick={() => setCurrentView('presets')} className={currentView === 'presets' ? 'bg-white/30 dark:bg-white/10' : ''}>
          <HomeIcon size={24} className="text-gray-800 dark:text-white" />
        </DockIcon>
        <DockIcon onClick={() => setCurrentView('random')} className={currentView === 'random' ? 'bg-white/30 dark:bg-white/10' : ''}>
          <Shuffle size={24} className="text-gray-800 dark:text-white" />
        </DockIcon>
        <DockIcon onClick={() => setCurrentView('local')} className={currentView === 'local' ? 'bg-white/30 dark:bg-white/10' : ''}>
          <FolderOpen size={24} className="text-gray-800 dark:text-white" />
        </DockIcon>
        <DockIcon onClick={() => setCurrentView('settings')} className={currentView === 'settings' ? 'bg-white/30 dark:bg-white/10' : ''}>
          <Settings size={24} className="text-gray-800 dark:text-white" />
        </DockIcon>
      </Dock>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WallpaperProvider>
        <AppContent />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
