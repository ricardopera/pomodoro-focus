# IPC Contracts: Settings API

**Channel Prefix**: `settings:`

## get-settings

**Direction**: Renderer → Main  
**Purpose**: Obter configurações atuais do usuário

### Request

```typescript
// Sem payload
ipcRenderer.invoke('settings:get')
```

### Response

```typescript
{
  focusDuration: number;          // 1-60
  shortBreakDuration: number;     // 1-30
  longBreakDuration: number;      // 5-60
  sessionsBeforeLongBreak: number; // 2-10
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  minimizeToTray: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}
```

### Error Handling

```typescript
try {
  const settings = await window.electronAPI.getSettings();
} catch (error) {
  // Caso arquivo corrompido, main process retorna defaults
  console.error('Failed to load settings, using defaults', error);
}
```

### Contract Test

**File**: `tests/contract/test_settings_get.spec.ts`

```typescript
test('settings:get returns valid settings object', async () => {
  const settings = await ipcRenderer.invoke('settings:get');
  
  expect(settings).toHaveProperty('focusDuration');
  expect(settings.focusDuration).toBeGreaterThanOrEqual(1);
  expect(settings.focusDuration).toBeLessThanOrEqual(60);
  
  expect(settings.theme).toMatch(/^(light|dark|system)$/);
  expect(typeof settings.notificationsEnabled).toBe('boolean');
});
```

---

## update-settings

**Direction**: Renderer → Main  
**Purpose**: Atualizar configurações parcial ou totalmente

### Request

```typescript
interface UpdateSettingsPayload {
  focusDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  sessionsBeforeLongBreak?: number;
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  minimizeToTray?: boolean;
  autoStartBreaks?: boolean;
  autoStartFocus?: boolean;
}

ipcRenderer.invoke('settings:update', {
  focusDuration: 30,
  theme: 'dark'
})
```

### Response

```typescript
{
  success: true,
  settings: { /* Updated settings object */ }
}

// OR em caso de erro

{
  success: false,
  error: 'Validation failed: focusDuration must be between 1 and 60'
}
```

### Validation Rules

- **focusDuration**: 1 ≤ x ≤ 60
- **shortBreakDuration**: 1 ≤ x ≤ 30
- **longBreakDuration**: 5 ≤ x ≤ 60
- **sessionsBeforeLongBreak**: 2 ≤ x ≤ 10
- **theme**: Must be 'light' | 'dark' | 'system'
- **Outros campos**: boolean

### Side Effects

- Settings são salvos atomicamente em disco
- Evento `settings:changed` emitido para todos os windows
- Se `theme` mudou, aplicar novo tema imediatamente

### Contract Test

**File**: `tests/contract/test_settings_update.spec.ts`

```typescript
test('settings:update validates input', async () => {
  const result = await ipcRenderer.invoke('settings:update', {
    focusDuration: 999 // Inválido
  });
  
  expect(result.success).toBe(false);
  expect(result.error).toContain('focusDuration');
});

test('settings:update persists changes', async () => {
  const before = await ipcRenderer.invoke('settings:get');
  
  await ipcRenderer.invoke('settings:update', {
    focusDuration: 30
  });
  
  const after = await ipcRenderer.invoke('settings:get');
  expect(after.focusDuration).toBe(30);
  expect(after.shortBreakDuration).toBe(before.shortBreakDuration); // Unchanged
});
```

---

## settings:changed (Event)

**Direction**: Main → Renderer  
**Purpose**: Notificar renderer quando settings mudam (ex: outro window)

### Payload

```typescript
{
  settings: Settings; // Objeto completo atualizado
}
```

### Subscription

```typescript
// src/renderer/hooks/useSettings.ts
useEffect(() => {
  const unsubscribe = window.electronAPI.onSettingsChanged((settings) => {
    setSettings(settings);
  });
  
  return unsubscribe;
}, []);
```

### Contract Test

**File**: `tests/contract/test_settings_events.spec.ts`

```typescript
test('settings:changed fires on update', async () => {
  const eventSpy = jest.fn();
  window.electronAPI.onSettingsChanged(eventSpy);
  
  await ipcRenderer.invoke('settings:update', { theme: 'dark' });
  
  await waitFor(() => {
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' })
    );
  });
});
```

---

## reset-settings

**Direction**: Renderer → Main  
**Purpose**: Resetar todas as configurações para valores padrão

### Request

```typescript
ipcRenderer.invoke('settings:reset')
```

### Response

```typescript
{
  success: true,
  settings: { /* Default settings object */ }
}
```

### Side Effects

- Arquivo de settings deletado e recriado com defaults
- Evento `settings:changed` emitido

### Contract Test

**File**: `tests/contract/test_settings_reset.spec.ts`

```typescript
test('settings:reset restores defaults', async () => {
  // Mudar settings primeiro
  await ipcRenderer.invoke('settings:update', { focusDuration: 45 });
  
  // Reset
  const result = await ipcRenderer.invoke('settings:reset');
  
  expect(result.success).toBe(true);
  expect(result.settings.focusDuration).toBe(25); // Default
  expect(result.settings.theme).toBe('system');
});
```
