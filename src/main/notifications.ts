import { Notification, type BrowserWindow } from 'electron';
import type { NotifyPayload } from '../shared/types';
import { appPath } from './window';

/**
 * Native toast. Clicking it brings the app back — that is the whole point
 * of the notification when the window is hidden behind other work.
 */
export function showNotification(window: BrowserWindow, payload: NotifyPayload): void {
  if (!Notification.isSupported()) return;

  const notification = new Notification({
    title: payload.title,
    body: payload.body,
    icon: appPath('public', 'icons', 'app-icon.png'),
    silent: true, // the renderer plays its own chime
  });

  notification.on('click', () => {
    if (window.isDestroyed()) return;
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  });

  notification.show();
}
