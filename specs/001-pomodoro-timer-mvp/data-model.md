# Data Model: Pomodoro Timer MVP

**Feature**: 001-pomodoro-timer-mvp  
**Date**: 2025-10-03

## Entities

### 1. AppState

**Purpose**: Estado corrente da aplicação (runtime, não persistido)

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| currentState | `'idle' \| 'focus' \| 'break-short' \| 'break-long'` | ✅ | Estado atual do timer | Enum restrito |
| timeLeft | `number` | ✅ | Milissegundos restantes no timer | `>= 0` |
| sessionsCompleted | `number` | ✅ | Sessões de foco completadas no ciclo atual | `0-3` (reseta em 4) |
| isPaused | `boolean` | ✅ | Timer está pausado? | - |
| startTimestamp | `number \| null` | ❌ | Timestamp quando timer iniciou (`Date.now()`) | `null` se idle |

**State Transitions**:

```
idle → focus (usuário clica "Iniciar")
focus → break-short (timer expira, sessionsCompleted < 4)
focus → break-long (timer expira, sessionsCompleted === 4)
break-short → idle (timer expira)
break-long → idle (timer expira, sessionsCompleted = 0)
* → idle (usuário clica "Resetar")
```

**Invariants**:

- `timeLeft === 0` implica transição automática para próximo estado
- `sessionsCompleted` sempre `0-3` (após 4, reseta e vai para `break-long`)
- `startTimestamp !== null` apenas se `currentState !== 'idle'`

### 2. Settings

**Purpose**: Configurações do usuário (persistidas via electron-store)

**Fields**:

| Field | Type | Required | Default | Description | Validation |
|-------|------|----------|---------|-------------|------------|
| focusDuration | `number` | ✅ | `25` | Duração de foco (minutos) | `1-60` |
| shortBreakDuration | `number` | ✅ | `5` | Duração de pausa curta (minutos) | `1-30` |
| longBreakDuration | `number` | ✅ | `15` | Duração de pausa longa (minutos) | `5-60` |
| sessionsBeforeLongBreak | `number` | ✅ | `4` | Sessões antes de pausa longa | `2-10` |
| theme | `'light' \| 'dark' \| 'system'` | ✅ | `'system'` | Tema visual | Enum restrito |
| notificationsEnabled | `boolean` | ✅ | `true` | Ativar notificações do sistema | - |
| soundEnabled | `boolean` | ✅ | `true` | Ativar som ao fim de sessão | - |
| minimizeToTray | `boolean` | ✅ | `true` | Minimizar para tray ao fechar janela | - |
| autoStartBreaks | `boolean` | ✅ | `true` | Iniciar pausas automaticamente | - |
| autoStartFocus | `boolean` | ✅ | `false` | Iniciar foco após pausa automaticamente | - |

**Schema Validation** (JSON Schema):

```json
{
  "type": "object",
  "properties": {
    "focusDuration": { "type": "number", "minimum": 1, "maximum": 60 },
    "shortBreakDuration": { "type": "number", "minimum": 1, "maximum": 30 },
    "longBreakDuration": { "type": "number", "minimum": 5, "maximum": 60 },
    "sessionsBeforeLongBreak": { "type": "number", "minimum": 2, "maximum": 10 },
    "theme": { "enum": ["light", "dark", "system"] },
    "notificationsEnabled": { "type": "boolean" },
    "soundEnabled": { "type": "boolean" },
    "minimizeToTray": { "type": "boolean" },
    "autoStartBreaks": { "type": "boolean" },
    "autoStartFocus": { "type": "boolean" }
  },
  "required": ["focusDuration", "shortBreakDuration", "longBreakDuration", "sessionsBeforeLongBreak", "theme", "notificationsEnabled", "soundEnabled", "minimizeToTray", "autoStartBreaks", "autoStartFocus"]
}
```

**Storage Path**: `%APPDATA%/pomodoro-focus/config.json` (Windows), `~/Library/Application Support/pomodoro-focus/config.json` (macOS)

### 3. Session

**Purpose**: Representa uma sessão de Pomodoro completada (histórico)

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | `string` | ✅ | UUID único | UUIDv4 |
| type | `'focus' \| 'break-short' \| 'break-long'` | ✅ | Tipo de sessão | Enum restrito |
| plannedDuration | `number` | ✅ | Duração planejada (minutos) | `> 0` |
| actualDuration | `number` | ✅ | Duração real (minutos) | `> 0` |
| startTime | `string` | ✅ | ISO 8601 timestamp de início | ISO 8601 válido |
| endTime | `string` | ✅ | ISO 8601 timestamp de fim | ISO 8601 válido, `>= startTime` |
| completed | `boolean` | ✅ | Sessão foi completada ou pulada? | - |
| interrupted | `boolean` | ✅ | Sessão foi interrompida (reset manual)? | - |

**Example**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "focus",
  "plannedDuration": 25,
  "actualDuration": 25,
  "startTime": "2025-10-03T14:30:00.000Z",
  "endTime": "2025-10-03T14:55:00.000Z",
  "completed": true,
  "interrupted": false
}
```

**Invariants**:

- `completed === true` implica `actualDuration === plannedDuration` (±2s tolerância)
- `interrupted === true` implica `completed === false`
- `endTime - startTime === actualDuration * 60000` (milissegundos)

**Storage**: Array de sessions persistido via electron-store, indexado por data

### 4. Statistics

**Purpose**: Agregações calculadas sobre histórico de sessões

**Fields** (calculados, não persistidos):

| Field | Type | Description | Calculation |
|-------|------|-------------|-------------|
| todayFocusMinutes | `number` | Minutos de foco hoje | `SUM(sessions.actualDuration WHERE type='focus' AND date=today)` |
| todaySessionsCompleted | `number` | Sessões completadas hoje | `COUNT(sessions WHERE completed=true AND date=today)` |
| weekFocusMinutes | `number` | Minutos de foco esta semana | `SUM(...)` WHERE week=current |
| weekSessionsCompleted | `number` | Sessões completadas esta semana | `COUNT(...)` WHERE week=current |
| currentStreak | `number` | Dias consecutivos com ≥1 sessão | Algoritmo de streak (ver abaixo) |
| longestStreak | `number` | Maior streak já alcançado | `MAX(all streaks)` |

**Streak Algorithm**:

```typescript
function calculateStreak(sessions: Session[]): number {
  const days = groupByDate(sessions.filter(s => s.completed && s.type === 'focus'));
  let streak = 0;
  let currentDate = today();
  
  while (days.has(currentDate)) {
    streak++;
    currentDate = subtractOneDay(currentDate);
  }
  
  return streak;
}
```

## Relationships

```
Settings (1) ─────── (runtime) ─────── AppState (1)
                                            │
                                            │ creates
                                            ▼
                                       Session (*)
                                            │
                                            │ aggregates
                                            ▼
                                     Statistics (1)
```

- **Settings** → **AppState**: Settings informam durações padrão ao iniciar timer
- **AppState** → **Session**: Ao completar ciclo, AppState cria novo Session record
- **Session** → **Statistics**: Statistics calcula métricas sobre array de Sessions

## Storage Strategy

### electron-store Structure

```json
{
  "settings": { /* Settings object */ },
  "sessions": [
    { /* Session object */ },
    { /* Session object */ }
  ],
  "pendingSession": { /* Session incompleta se app fechado durante timer */ }
}
```

### Performance Considerations

- **Sessions array**: Limitar a últimos 90 dias em memória (lazy load older)
- **Indexing**: Criar índice por `startTime` para queries de range
- **Statistics cache**: Cachear stats do dia atual, invalidar a cada nova sessão

### Data Migration

**v1.0 → v1.1** (futuro):

- Se adicionar campo em Settings: fornecer default
- Se adicionar campo em Session: aplicar apenas a novas sessões
- Nunca remover campos (deprecated → null)

## Validation Rules

### Business Rules

1. **Minimum timer duration**: 1 minuto (prevenir spam de sessões)
2. **Maximum timer duration**: 60 minutos (manter alinhamento com Pomodoro)
3. **Sessions before long break**: 2-10 (padrão Pomodoro é 4)
4. **Auto-start conflicts**: `autoStartFocus` e `autoStartBreaks` não podem ser ambos `false` (prevenir deadlock)

### Data Integrity

1. **Settings persistence**: Escrever atomicamente (temp file → rename)
2. **Session deduplication**: Verificar `id` antes de inserir
3. **Timestamp validation**: `endTime >= startTime`, futuros rejeitados
4. **Type safety**: TypeScript interfaces geram tipos em runtime (zod ou io-ts)

## Error Handling

### Corrupt Settings File

```typescript
try {
  const settings = store.get('settings');
  validateSettings(settings); // JSON Schema validation
} catch (error) {
  logger.error('Settings corrupted, resetting to defaults', error);
  store.set('settings', DEFAULT_SETTINGS);
  notifyUser('Configurações foram resetadas para padrão');
}
```

### Missing Sessions Data

```typescript
const sessions = store.get('sessions', []); // Default to empty array
if (sessions.length === 0) {
  logger.info('No session history found (new install or data reset)');
}
```

### Pending Session Recovery

```typescript
const pendingSession = store.get('pendingSession');
if (pendingSession) {
  const elapsed = Date.now() - new Date(pendingSession.startTime).getTime();
  const remaining = (pendingSession.plannedDuration * 60000) - elapsed;
  
  if (remaining > 0) {
    showDialog('Retomar sessão de foco com ' + formatTime(remaining) + ' restantes?');
  } else {
    // Sessão expirou enquanto app estava fechado
    markSessionCompleted(pendingSession);
  }
  
  store.delete('pendingSession');
}
```

## Testing Considerations

### Unit Tests

- **State transitions**: Verificar cada transição válida/inválida
- **Validation**: Testar limites de campos numéricos
- **Streak calculation**: Casos de borda (gaps, weekends, timezone)

### Integration Tests

- **Persistence**: Escrever settings → fechar app → reabrir → verificar
- **Concurrency**: Múltiplos writes simultâneos (race conditions)
- **Corruption recovery**: Deletar arquivo → app deve resetar gracefully

### Test Data

```typescript
const MOCK_SESSION: Session = {
  id: 'test-uuid',
  type: 'focus',
  plannedDuration: 25,
  actualDuration: 25,
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 25 * 60000).toISOString(),
  completed: true,
  interrupted: false
};
```

---

**Next**: Generate IPC contracts for Settings/Session CRUD operations
