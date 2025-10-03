import { Notification, app } from 'electron';
import path from 'path';
import type { SessionType } from '@shared/types';
import { getSettings } from './store';

// Play sound using system default player or HTML5 Audio
function playSound(soundFile: string): void {
  try {
    const settings = getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    // In Electron, we'll use the Notification API's sound property
    // The actual sound playback is handled by the OS
    console.log(`[NOTIFICATIONS] Would play sound: ${soundFile}`);
  } catch (error) {
    console.error('[NOTIFICATIONS] Error playing sound:', error);
  }
}

export function showTimerCompleteNotification(sessionType: SessionType): void {
  const settings = getSettings();

  if (!settings.notificationsEnabled) {
    return;
  }

  const { title, body } = getNotificationContent(sessionType);

  // Play completion sound
  if (settings.soundEnabled) {
    playSound('complete.wav');
  }

  const notification = new Notification({
    title,
    body,
    silent: !settings.soundEnabled,
    urgency: 'normal',
    timeoutType: 'default',
    // On some platforms, we can specify a custom sound
    sound: settings.soundEnabled ? path.join(app.getAppPath(), 'public/sounds/complete.wav') : undefined,
  });

  notification.show();
}

export function showBreakReminderNotification(): void {
  const settings = getSettings();

  if (!settings.notificationsEnabled) {
    return;
  }

  const notification = new Notification({
    title: 'Pausa Sugerida',
    body: 'Considere fazer uma pausa para descansar os olhos e alongar.',
    silent: !settings.soundEnabled,
    urgency: 'low',
  });

  notification.show();
}

function getNotificationContent(sessionType: SessionType): { title: string; body: string } {
  const settings = getSettings();

  switch (sessionType) {
    case 'focus':
      return {
        title: '🍅 Sessão de Foco Concluída!',
        body: settings.autoStartBreaks
          ? 'Excelente trabalho! A pausa iniciará automaticamente.'
          : 'Excelente trabalho! Hora de fazer uma pausa.',
      };

    case 'break-short':
      return {
        title: '☕ Pausa Curta Concluída!',
        body: settings.autoStartFocus
          ? 'Pausa terminada. Próxima sessão de foco iniciará automaticamente.'
          : 'Pausa terminada. Pronto para a próxima sessão de foco?',
      };

    case 'break-long':
      return {
        title: '🌟 Pausa Longa Concluída!',
        body: settings.autoStartFocus
          ? 'Ótimo descanso! Próxima sessão de foco iniciará automaticamente.'
          : 'Ótimo descanso! Pronto para retomar o foco?',
      };

    default:
      return {
        title: 'Timer Concluído',
        body: 'O timer foi concluído.',
      };
  }
}
