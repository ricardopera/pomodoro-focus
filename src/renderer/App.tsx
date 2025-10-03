import { useState, useEffect } from 'react';
import { useSettings, useTimer, useStatistics } from './hooks';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { StatisticsView } from './components/StatisticsView';
import { SettingsView } from './components/SettingsView';
import './App.css';

type Tab = 'timer' | 'statistics' | 'settings';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const { settings, updateSettings, resetSettings } = useSettings();
  const { timerState, isLoading, startTimer, pauseTimer, resumeTimer, resetTimer } = useTimer();
  const { statistics, isLoading: statsLoading, reload: reloadStats } = useStatistics();

  // Apply theme on mount and when settings change
  useEffect(() => {
    if (!settings) return;
    
    const theme = settings.theme;
    const root = document.documentElement;
    
    if (theme === 'system') {
      // Remove data-theme to let CSS media query handle it
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [settings]);

  const handleMinimize = () => {
    window.electronAPI.minimize();
  };

  const handleClose = () => {
    window.electronAPI.close();
  };

  return (
    <div className="app">
      {/* Custom title bar */}
      <div className="app-titlebar">
        <div className="app-titlebar-title">🍅 Pomodoro Focus</div>
        <div className="app-titlebar-controls">
          <button className="titlebar-button minimize" onClick={handleMinimize} title="Minimizar">
            −
          </button>
          <button className="titlebar-button close" onClick={handleClose} title="Fechar">
            ×
          </button>
        </div>
      </div>

      <nav className="app-nav">
        <button
          className={`nav-tab ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          ⏱️ Timer
        </button>
        <button
          className={`nav-tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('statistics');
            reloadStats();
          }}
        >
          📊 Estatísticas
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Configurações
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'timer' && (
          <div className="timer-view">
            <TimerDisplay timerState={timerState} />
            <TimerControls
              timerState={timerState}
              onStart={startTimer}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onReset={resetTimer}
              isLoading={isLoading}
            />
            <div className="sessions-indicator">
              <span>Sessões completas: {timerState.sessionsCompleted}/4</span>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <StatisticsView statistics={statistics} isLoading={statsLoading} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdate={updateSettings}
            onReset={resetSettings}
          />
        )}
      </main>
    </div>
  );
}
