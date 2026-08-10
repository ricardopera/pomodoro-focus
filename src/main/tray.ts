import { app, Menu, nativeImage, Tray, type BrowserWindow } from 'electron';
import { PHASE_LABEL } from '../shared/constants';
import { formatClock } from '../shared/format';
import { timerTooltip } from '../shared/pomodoro';
import type { RemoteCommand, TrayState } from '../shared/types';
import { appPath } from './window';

export class AppTray {
  private tray: Tray | null = null;
  private state: TrayState = {
    status: 'idle',
    kind: 'focus',
    remainingSeconds: 0,
    title: '',
  };

  constructor(
    private readonly window: BrowserWindow,
    private readonly send: (command: RemoteCommand) => void,
    private readonly onQuit: () => void
  ) {}

  init(): void {
    const image = nativeImage
      .createFromPath(appPath('public', 'icons', 'tray-icon.png'))
      .resize({ width: 16, height: 16 });
    this.tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image);
    this.tray.on('click', () => this.toggleWindow());
    this.tray.on('double-click', () => this.showWindow());
    this.render();
  }

  update(state: TrayState): void {
    this.state = state;
    this.render();
  }

  private showWindow(): void {
    if (this.window.isMinimized()) this.window.restore();
    this.window.show();
    this.window.focus();
  }

  private toggleWindow(): void {
    if (this.window.isVisible() && !this.window.isMinimized()) {
      this.window.hide();
    } else {
      this.showWindow();
    }
  }

  private render(): void {
    if (!this.tray) return;
    const { status, kind, remainingSeconds, title } = this.state;
    const clock = formatClock(remainingSeconds);
    this.tray.setToolTip(`Pomodoro Focus — ${timerTooltip(kind, clock, title)}`);

    const menu = Menu.buildFromTemplate([
      { label: `${PHASE_LABEL[kind]} • ${clock}`, enabled: false },
      ...(title ? [{ label: title.slice(0, 48), enabled: false }] : []),
      { type: 'separator' },
      {
        label: status === 'running' ? 'Pausar' : 'Iniciar',
        click: () => this.send('toggle'),
      },
      { label: 'Reiniciar', click: () => this.send('reset') },
      { label: 'Pular etapa', click: () => this.send('skip') },
      { type: 'separator' },
      { label: 'Abrir Pomodoro Focus', click: () => this.showWindow() },
      {
        label: 'Sair',
        click: () => {
          this.onQuit();
          app.quit();
        },
      },
    ]);
    this.tray.setContextMenu(menu);
  }

  destroy(): void {
    this.tray?.destroy();
    this.tray = null;
  }
}
