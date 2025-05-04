import { useState } from 'react';
import { Dock, DockIcon } from "@/components/magicui/dock";
import { HomeIcon, FolderOpen, History } from "lucide-react";
import { AnimatedGridPattern } from './components/ui/animated-grid-pattern';
import { WallpaperProvider } from './contexts/WallpaperContext';
import { PresetsView } from './components/features/PresetsView';
import { LocalWallpaperView } from './components/features/LocalWallpaperView';
import { HistoryView } from './components/features/HistoryView';

import './App.css';

function App() {
  // State to track current page/view
  const [currentView, setCurrentView] = useState<'presets' | 'local' | 'history'>('presets');

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'presets':
        return <PresetsView />;
      case 'local':
        return <LocalWallpaperView />;
      case 'history':
        return <HistoryView />;
      default:
        return <PresetsView />;
    }
  };

  return (
    <WallpaperProvider>
      <div className="relative h-screen w-full overflow-hidden">
        {/* Animated Grid Pattern Background */}
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.3}
          duration={3}
          repeatDelay={1}
          className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        />

        <main className="relative z-10 flex h-full flex-col items-center justify-center">
          {/* Content area */}
          <div className="w-full h-full overflow-auto py-16">
            {renderContent()}
          </div>
        </main>

        {/* Dock Component */}
        <Dock className='fixed bottom-8 left-1/2 transform -translate-x-1/2 !bg-gray-500/20 !border-white/20 z-50'>
          <DockIcon onClick={() => setCurrentView('presets')} className={currentView === 'presets' ? 'bg-white/30' : ''}>
            <HomeIcon size={24} color="white" />
          </DockIcon>
          <DockIcon onClick={() => setCurrentView('local')} className={currentView === 'local' ? 'bg-white/30' : ''}>
            <FolderOpen size={24} color="white" />
          </DockIcon>
          <DockIcon onClick={() => setCurrentView('history')} className={currentView === 'history' ? 'bg-white/30' : ''}>
            <History size={24} color="white" />
          </DockIcon>
        </Dock>
      </div>
    </WallpaperProvider>
  );
}

export default App;
