import { LIMITS } from '../../shared/constants';
import type { Settings, ThemeName } from '../../shared/types';

interface SettingsScreenProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClearHistory: () => void;
  version: string;
}

const THEMES: { value: ThemeName; label: string }[] = [
  { value: 'midnight', label: 'Meia-noite' },
  { value: 'aurora', label: 'Aurora' },
  { value: 'ember', label: 'Brasa' },
  { value: 'paper', label: 'Papel' },
];

interface NumberFieldProps {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function NumberField({ label, hint, value, min, max, onChange }: NumberFieldProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  return (
    <div className="field">
      <div className="field__text">
        <span className="field__label">{label}</span>
        {hint && <span className="field__hint">{hint}</span>}
      </div>
      <div className="stepper">
        <button type="button" onClick={() => set(value - 1)} aria-label={`Diminuir ${label}`}>
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(event) => set(Number(event.target.value) || min)}
        />
        <button type="button" onClick={() => set(value + 1)} aria-label={`Aumentar ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

interface ToggleProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <label className="field field--toggle">
      <div className="field__text">
        <span className="field__label">{label}</span>
        {hint && <span className="field__hint">{hint}</span>}
      </div>
      <input
        type="checkbox"
        className="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch__track" aria-hidden />
    </label>
  );
}

export function SettingsScreen({
  settings,
  onChange,
  onClearHistory,
  version,
}: SettingsScreenProps) {
  return (
    <div className="screen screen--scroll">
      <h2 className="screen__title">Ajustes</h2>

      <section className="card">
        <h3 className="card__title">Durações (minutos)</h3>
        <NumberField
          label="Foco"
          value={settings.focusMinutes}
          min={LIMITS.focusMinutes.min}
          max={LIMITS.focusMinutes.max}
          onChange={(focusMinutes) => onChange({ focusMinutes })}
        />
        <NumberField
          label="Pausa curta"
          value={settings.shortBreakMinutes}
          min={LIMITS.shortBreakMinutes.min}
          max={LIMITS.shortBreakMinutes.max}
          onChange={(shortBreakMinutes) => onChange({ shortBreakMinutes })}
        />
        <NumberField
          label="Pausa longa"
          value={settings.longBreakMinutes}
          min={LIMITS.longBreakMinutes.min}
          max={LIMITS.longBreakMinutes.max}
          onChange={(longBreakMinutes) => onChange({ longBreakMinutes })}
        />
        <NumberField
          label="Pausa longa a cada"
          hint="Sessões de foco antes da pausa longa"
          value={settings.longBreakInterval}
          min={LIMITS.longBreakInterval.min}
          max={LIMITS.longBreakInterval.max}
          onChange={(longBreakInterval) => onChange({ longBreakInterval })}
        />
        <NumberField
          label="Meta diária"
          hint="Pomodoros por dia"
          value={settings.dailyGoal}
          min={LIMITS.dailyGoal.min}
          max={LIMITS.dailyGoal.max}
          onChange={(dailyGoal) => onChange({ dailyGoal })}
        />
      </section>

      <section className="card">
        <h3 className="card__title">Fluxo</h3>
        <Toggle
          label="Iniciar pausas automaticamente"
          checked={settings.autoStartBreaks}
          onChange={(autoStartBreaks) => onChange({ autoStartBreaks })}
        />
        <Toggle
          label="Iniciar foco automaticamente"
          hint="Retoma o trabalho assim que a pausa termina"
          checked={settings.autoStartFocus}
          onChange={(autoStartFocus) => onChange({ autoStartFocus })}
        />
        <Toggle
          label="Pedir o nome da sessão"
          hint="Não deixa iniciar um foco sem dizer no que vai trabalhar"
          checked={settings.requireSessionName}
          onChange={(requireSessionName) => onChange({ requireSessionName })}
        />
      </section>

      <section className="card">
        <h3 className="card__title">Avisos</h3>
        <Toggle
          label="Notificações do sistema"
          checked={settings.notificationsEnabled}
          onChange={(notificationsEnabled) => onChange({ notificationsEnabled })}
        />
        <Toggle
          label="Som ao terminar"
          checked={settings.soundEnabled}
          onChange={(soundEnabled) => onChange({ soundEnabled })}
        />
        <div className="field">
          <div className="field__text">
            <span className="field__label">Volume</span>
          </div>
          <input
            type="range"
            className="range"
            min={0}
            max={100}
            value={Math.round(settings.soundVolume * 100)}
            onChange={(event) => onChange({ soundVolume: Number(event.target.value) / 100 })}
          />
        </div>
        <Toggle
          label="Tique-taque durante o foco"
          hint="Um clique discreto a cada segundo"
          checked={settings.tickingEnabled}
          onChange={(tickingEnabled) => onChange({ tickingEnabled })}
        />
      </section>

      <section className="card">
        <h3 className="card__title">Janela</h3>
        <Toggle
          label="Sempre à frente"
          checked={settings.alwaysOnTop}
          onChange={(alwaysOnTop) => onChange({ alwaysOnTop })}
        />
        <Toggle
          label="Fechar minimiza para a bandeja"
          checked={settings.minimizeToTray}
          onChange={(minimizeToTray) => onChange({ minimizeToTray })}
        />
        <Toggle
          label="Escurecer a interface durante o foco"
          hint="Só o relógio permanece visível; passe o mouse para reaparecer"
          checked={settings.focusDimming}
          onChange={(focusDimming) => onChange({ focusDimming })}
        />
        <div className="field">
          <div className="field__text">
            <span className="field__label">Tema</span>
          </div>
          <div className="themes">
            {THEMES.map((theme) => (
              <button
                key={theme.value}
                type="button"
                className={`themechip themechip--${theme.value} ${
                  settings.theme === theme.value ? 'is-active' : ''
                }`}
                onClick={() => onChange({ theme: theme.value })}
                title={theme.label}
              >
                <span aria-hidden />
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card card--danger">
        <h3 className="card__title">Dados</h3>
        <p className="card__text">
          Tudo fica salvo apenas neste computador. Nada é enviado para a internet.
        </p>
        <button type="button" className="btn btn--danger" onClick={onClearHistory}>
          Limpar histórico de sessões
        </button>
      </section>

      <p className="version">Pomodoro Focus v{version}</p>

      <section className="card">
        <h3 className="card__title">Atalhos</h3>
        <ul className="shortcuts">
          <li>
            <kbd>Espaço</kbd> iniciar ou pausar
          </li>
          <li>
            <kbd>R</kbd> reiniciar a etapa
          </li>
          <li>
            <kbd>S</kbd> pular a etapa
          </li>
          <li>
            <kbd>M</kbd> modo compacto
          </li>
          <li>
            <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> foco, pausa curta, pausa longa
          </li>
        </ul>
      </section>
    </div>
  );
}
