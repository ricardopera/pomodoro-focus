import type { Session, Statistics } from '@shared/types';
import { getSessions } from './store';

export function calculateStatistics(): Statistics {
  const sessions = getSessions();
  const now = new Date();
  
  // Today's data (midnight to now)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= todayStart && s.type === 'focus' && s.completed;
  });
  
  const todayFocusMinutes = todaySessions.reduce((sum, s) => sum + s.actualDuration, 0);
  const todaySessionsCompleted = todaySessions.length;
  
  // This week's data (Monday to now)
  const weekStart = getMonday(now);
  const weekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= weekStart && s.type === 'focus' && s.completed;
  });
  
  const weekFocusMinutes = weekSessions.reduce((sum, s) => sum + s.actualDuration, 0);
  const weekSessionsCompleted = weekSessions.length;
  
  // Streak calculation
  const { currentStreak, longestStreak } = calculateStreaks(sessions);
  
  return {
    todayFocusMinutes,
    todaySessionsCompleted,
    weekFocusMinutes,
    weekSessionsCompleted,
    currentStreak,
    longestStreak,
  };
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
  return new Date(d.setDate(diff));
}

function calculateStreaks(sessions: Session[]): { currentStreak: number; longestStreak: number } {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  // Group sessions by day
  const focusSessions = sessions.filter(s => s.type === 'focus' && s.completed);
  const dayMap = new Map<string, boolean>();
  
  focusSessions.forEach(session => {
    const date = new Date(session.startTime);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dayMap.set(dayKey, true);
  });
  
  const sortedDays = Array.from(dayMap.keys()).sort();
  
  if (sortedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  // Calculate current streak (from today backwards)
  const today = new Date();
  
  let currentStreak = 0;
  let checkDate = new Date(today);
  
  while (true) {
    const checkKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    
    if (dayMap.has(checkKey)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { currentStreak, longestStreak };
}
