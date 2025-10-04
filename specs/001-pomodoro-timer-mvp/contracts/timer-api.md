# IPC Contracts: Timer API

**Channel Prefix**: `timer:`

## start-timer

**Direction**: Renderer → Main  
**Purpose**: Iniciar timer com tipo e duração especificados

### Request

```typescript
interface StartTimerPayload {
  type: 'focus' | 'break-short' | 'break-long';
  duration: number; // Milissegundos
}

ipcRenderer.invoke('timer:start', {
  type: 'focus',
  duration: 25 * 60 * 1000 // 25 minutos
})
```

### Response

```typescript
{
  success: true,
  sessionId: string; // UUID da sessão criada
  startTime: string; // ISO 8601 timestamp
}
```

### Side Effects

- Cria `pendingSession` em electron-store
- Inicia interval interno para tracking de tempo
- Emite evento `timer:tick` a cada segundo

### Contract Test (tests/contract/test_timer_start.spec.ts)

```typescript
test('timer:start creates pending session', async () => {
  const result = await ipcRenderer.invoke('timer:start', {
    type: 'focus',
    duration: 1500000
  });
  
  expect(result.success).toBe(true);
  expect(result.sessionId).toMatch(/^[0-9a-f-]{36}$/); // UUID
  expect(new Date(result.startTime).getTime()).toBeCloseTo(Date.now(), -3);
});
```

---

## pause-timer

**Direction**: Renderer → Main  
**Purpose**: Pausar timer sem resetar progresso

### Request

```typescript
ipcRenderer.invoke('timer:pause')
```

### Response

```typescript
{
  success: true,
  timeElapsed: number; // Milissegundos já decorridos
  timeRemaining: number; // Milissegundos restantes
}
```

### Contract Test

```typescript
test('timer:pause preserves remaining time', async () => {
  await ipcRenderer.invoke('timer:start', { type: 'focus', duration: 60000 });
  await sleep(2000); // Aguardar 2s
  
  const result = await ipcRenderer.invoke('timer:pause');
  
  expect(result.timeRemaining).toBeCloseTo(58000, -3);
});
```

---

## resume-timer

**Direction**: Renderer → Main  
**Purpose**: Retomar timer pausado

### Request

```typescript
ipcRenderer.invoke('timer:resume')
```

### Response

```typescript
{
  success: true,
  resumedAt: string; // ISO 8601 timestamp
}
```

---

## reset-timer

**Direction**: Renderer → Main  
**Purpose**: Cancelar timer atual e voltar para idle

### Request

```typescript
ipcRenderer.invoke('timer:reset')
```

### Response

```typescript
{
  success: true,
  sessionId: string; // Session marcada como interrupted
}
```

### Side Effects

- Marca `pendingSession.interrupted = true`
- Move para array de sessions (histórico)
- Limpa `pendingSession` do store
- Emite `timer:reset` event

---

## timer:tick (Event)

**Direction**: Main → Renderer  
**Purpose**: Atualizar UI com tempo restante a cada segundo

### Payload

```typescript
{
  timeRemaining: number; // Milissegundos
  timeElapsed: number;   // Milissegundos
  progress: number;      // 0.0 - 1.0 (porcentagem)
}
```

### Subscription

```typescript
useEffect(() => {
  const unsubscribe = window.electronAPI.onTimerTick(({ timeRemaining, progress }) => {
    setTimeLeft(timeRemaining);
    setProgress(progress);
  });
  
  return unsubscribe;
}, []);
```

---

## timer:complete (Event)

**Direction**: Main → Renderer  
**Purpose**: Notificar conclusão de sessão

### Payload

```typescript
{
  sessionId: string;
  type: 'focus' | 'break-short' | 'break-long';
  nextState: 'break-short' | 'break-long' | 'idle';
  sessionsCompleted: number; // Total no ciclo atual
}
```

### Side Effects

- Move `pendingSession` para `sessions` array
- Incrementa `sessionsCompleted` em AppState
- Mostra notificação nativa
- Toca som (se habilitado)

### Contract Test

```typescript
test('timer:complete fires on expiration', async () => {
  const eventSpy = jest.fn();
  window.electronAPI.onTimerComplete(eventSpy);
  
  await ipcRenderer.invoke('timer:start', { type: 'focus', duration: 1000 });
  await sleep(1100);
  
  expect(eventSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'focus',
      nextState: 'break-short'
    })
  );
});
```

---

## get-sessions

**Direction**: Renderer → Main  
**Purpose**: Obter histórico de sessões

### Request

```typescript
interface GetSessionsPayload {
  from?: string; // ISO date (YYYY-MM-DD)
  to?: string;   // ISO date
  limit?: number; // Default 100
}

ipcRenderer.invoke('sessions:get', {
  from: '2025-10-01',
  to: '2025-10-03'
})
```

### Response

```typescript
{
  sessions: Session[];
  total: number;
}
```

### Contract Test

```typescript
test('sessions:get filters by date range', async () => {
  const result = await ipcRenderer.invoke('sessions:get', {
    from: '2025-10-03',
    to: '2025-10-03'
  });
  
  expect(Array.isArray(result.sessions)).toBe(true);
  result.sessions.forEach(session => {
    const date = new Date(session.startTime).toISOString().split('T')[0];
    expect(date).toBe('2025-10-03');
  });
});
```

---

## get-statistics

**Direction**: Renderer → Main  
**Purpose**: Obter estatísticas calculadas

### Request

```typescript
ipcRenderer.invoke('statistics:get')
```

### Response

```typescript
{
  todayFocusMinutes: number;
  todaySessionsCompleted: number;
  weekFocusMinutes: number;
  weekSessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
}
```

### Contract Test

```typescript
test('statistics:get returns valid stats', async () => {
  const stats = await ipcRenderer.invoke('statistics:get');
  
  expect(stats.todayFocusMinutes).toBeGreaterThanOrEqual(0);
  expect(stats.currentStreak).toBeGreaterThanOrEqual(0);
  expect(stats.longestStreak).toBeGreaterThanOrEqual(stats.currentStreak);
});
```
