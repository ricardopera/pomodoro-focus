import { useState } from 'react';
import type { Settings } from '@shared/types';

interface SettingsViewProps {
  settings: Settings | null;
  onUpdate: (partial: Partial<Settings>) => Promise<void>;
  onReset: () => Promise<void>;
}

export function SettingsView({ settings, onUpdate, onReset }: SettingsViewProps) {
  const [isSaving, setIsSaving] = useState(false);

  if (!settings) {
    return <div className="settings-view">Carregando configurações...</div>;
  }

  const handleChange = async (key: keyof Settings, value: any) => {
    setIsSaving(true);
    try {
      await onUpdate({ [key]: value });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setIsSaving(true);
      try {
        await onReset();
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="settings-view">
      <h2>⚙️ Configurações</h2>

      <div className="settings-section">
        <h3>Durações (minutos)</h3>
        
        <label>
          Foco:
          <input
            type="number"
            min="1"
            max="60"
            value={settings.focusDuration}
            onChange={(e) => handleChange('focusDuration', parseInt(e.target.value))}
            disabled={isSaving}
          />
        </label>

        <label>
          Pausa Curta:
          <input
            type="number"
            min="1"
            max="30"
            value={settings.shortBreakDuration}
            onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value))}
            disabled={isSaving}
          />
        </label>

        <label>
          Pausa Longa:
          <input
            type="number"
            min="5"
            max="60"
            value={settings.longBreakDuration}
            onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value))}
            disabled={isSaving}
          />
        </label>

        <label>
          Sessões antes da pausa longa:
          <input
            type="number"
            min="2"
            max="10"
            value={settings.sessionsBeforeLongBreak}
            onChange={(e) => handleChange('sessionsBeforeLongBreak', parseInt(e.target.value))}
            disabled={isSaving}
          />
        </label>
      </div>

      <div className="settings-section">
        <h3>Aparência</h3>
        
        <label>
          Tema:
          <select
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            disabled={isSaving}
          >
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="system">Sistema</option>
          </select>
        </label>
      </div>

      <div className="settings-section">
        <h3>Comportamento</h3>
        
        <label>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
            disabled={isSaving}
          />
          Ativar notificações
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => handleChange('soundEnabled', e.target.checked)}
            disabled={isSaving}
          />
          Ativar som
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.minimizeToTray}
            onChange={(e) => handleChange('minimizeToTray', e.target.checked)}
            disabled={isSaving}
          />
          Minimizar para bandeja do sistema
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.autoStartBreaks}
            onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
            disabled={isSaving}
          />
          Iniciar pausas automaticamente
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.autoStartFocus}
            onChange={(e) => handleChange('autoStartFocus', e.target.checked)}
            disabled={isSaving}
          />
          Iniciar foco automaticamente após pausas
        </label>
      </div>

      <div className="settings-actions">
        <button className="btn btn-danger" onClick={handleReset} disabled={isSaving}>
          🔄 Restaurar Padrões
        </button>
      </div>
    </div>
  );
}
