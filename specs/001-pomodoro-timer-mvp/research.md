# Research: Pomodoro Timer MVP

**Feature**: 001-pomodoro-timer-mvp  
**Date**: 2025-10-03  
**Status**: Complete

## Technology Decisions

### 1. Desktop Framework: Electron vs Tauri

**Decision**: Electron 28.x

**Rationale**:
- **Maturidade**: Electron é amplamente usado (VS Code, Slack, Discord, Notion)
- **Ecossistema**: NPM packages abundantes para timers, notificações, tray
- **Documentação**: Tutoriais extensos, Stack Overflow answers, exemplos reais
- **Paridade multiplataforma**: APIs unificadas para Win/Mac/Linux
- **Curva de aprendizado**: JavaScript/TypeScript familiar, sem necessidade de Rust
- **Comunidade**: Maior base de usuários para troubleshooting

**Alternatives Considered**:
- **Tauri** (Rust + WebView nativo):
  - **Prós**: Menor footprint (~40MB vs ~80MB), mais rápido startup
  - **Contras**: Requer conhecimento de Rust, menos exemplos de Pomodoro apps, APIs menos maduras
  - **Decisão**: Rejeitado - complexidade adicional não justifica ganho de performance para app simples
- **Neutralino.js**:
  - **Prós**: Muito leve (~3MB)
  - **Contras**: Ecossistema limitado, menos suporte a system tray/notificações
  - **Decisão**: Rejeitado - risco de bugs em funcionalidades críticas (tray, notificações)

### 2. UI Framework: React vs Vanilla JS

**Decision**: React 18.x com TypeScript

**Rationale**:
- **Componentização**: Timer, Settings, Stats como componentes isolados
- **State management**: useState/useReducer suficiente para escopo MVP
- **Hooks customizados**: useTimer, useSettings, useStats encapsulam lógica
- **Testabilidade**: React Testing Library + Vitest bem estabelecidos
- **Performance**: Virtual DOM otimizado para re-renders frequentes (timer tick)

**Alternatives Considered**:
- **Vanilla JS**:
  - **Prós**: Zero overhead, startup rápido
  - **Contras**: Gerenciamento manual de estado, re-rendering manual
  - **Decisão**: Rejeitado - complexidade de manutenção cresce com features
- **Svelte**:
  - **Prós**: Compilado (sem runtime), performance superior
  - **Contras**: Menos exemplos Electron+Svelte, ecossistema menor
  - **Decisão**: Rejeitado - curva de aprendizado adicional

### 3. Build Tool: Vite vs Webpack

**Decision**: Vite 5.x

**Rationale**:
- **Dev speed**: HMR instantâneo (<50ms) vs Webpack (~2-5s)
- **Simplicidade**: Zero config para TypeScript + React
- **Electron integration**: electron-vite plugin maduro
- **Bundle size**: Tree-shaking agressivo, menor bundle final

**Alternatives Considered**:
- **Webpack**:
  - **Prós**: Mais maduro, mais plugins
  - **Contras**: Configuração complexa, HMR lento
  - **Decisão**: Rejeitado - Vite suficiente para escopo MVP

### 4. Storage: electron-store vs lowdb

**Decision**: electron-store 8.x

**Rationale**:
- **Simplicidade**: API key-value simples para config + stats
- **Schema validation**: JSON Schema built-in
- **Atomic writes**: Previne corrupção de arquivo
- **Defaults**: Valores padrão automáticos
- **Encryption**: Suporte nativo para dados sensíveis (futuro)

**Alternatives Considered**:
- **lowdb** (JSON database):
  - **Prós**: Query capabilities, relacional-like
  - **Contras**: Overkill para escopo MVP, sem schema validation
  - **Decisão**: Rejeitado - complexidade desnecessária
- **SQLite** (via better-sqlite3):
  - **Prós**: Queries complexas, performance em grandes datasets
  - **Contras**: Overhead para <1000 registros, migração de schema
  - **Decisão**: Rejeitado - MVP não precisa SQL

### 5. Testing Strategy

**Decision**: Vitest (unit/integration) + Playwright (E2E)

**Rationale**:
- **Vitest**: Drop-in replacement Vite-native, compatível com Jest APIs
- **Playwright**: Suporte Electron oficial, cross-platform, screenshots/videos
- **Coverage**: c8 integrado no Vitest para code coverage

**Alternatives Considered**:
- **Jest**:
  - **Prós**: Mais maduro, mais plugins
  - **Contras**: Configuração adicional com Vite, transformação lenta
  - **Decisão**: Rejeitado - Vitest mais rápido e alinhado com Vite
- **Spectron** (deprecated):
  - **Contras**: Descontinuado, migrar para Playwright
  - **Decisão**: Rejeitado - projeto morto

## Best Practices Research

### Electron Security

**Findings**:
- **Context isolation**: OBRIGATÓRIO - `contextIsolation: true` no BrowserWindow
- **Preload script**: Expor apenas APIs necessárias via `contextBridge`
- **Node integration**: DESABILITAR no renderer - `nodeIntegration: false`
- **CSP**: Content Security Policy para prevenir XSS
- **Remote module**: Não usar (deprecated)

**Implementation**:
```typescript
// src/main/index.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    preload: path.join(__dirname, '../preload/index.js')
  }
});

// src/preload/index.ts
contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings)
});
```

### Timer Precision

**Findings**:
- **setInterval drift**: Acumula erro ~1-2s em 25min devido a event loop delays
- **Solução**: Comparar `Date.now()` com timestamp inicial em cada tick
- **Performance**: `requestAnimationFrame` não recomendado (60fps desnecessário)

**Implementation**:
```typescript
// src/renderer/hooks/useTimer.ts
const startTime = Date.now();
const interval = setInterval(() => {
  const elapsed = Date.now() - startTime;
  const remaining = duration - elapsed;
  setTimeLeft(Math.max(0, remaining));
}, 1000);
```

### System Tray Best Practices

**Findings**:
- **Ícone adaptativo**: Fornecer versões claro/escuro para Windows/macOS
- **Menu contextual**: Máximo 5-7 items (recomendação UX)
- **Tooltip**: Mostrar estado atual (e.g., "Foco: 12:34 restantes")
- **Click behavior**: Single-click Windows, double-click macOS (plataform-dependent)

**Platform-specific**:
- **Windows**: 16x16, 32x32 ICO
- **macOS**: 16x16@1x, 32x32@2x PNG (template image)
- **Linux**: 22x22 PNG

### Notification Patterns

**Findings**:
- **Urgency**: `low` para pausas, `normal` para fim de foco
- **Silent mode**: Respeitar "Do Not Disturb" do SO
- **Persistence**: Notificação de fim de sessão deve persistir até interação
- **Actions**: macOS suporta botões (Retomar/Pular), Windows limitado

**Cross-platform API**:
```typescript
// src/main/notifications.ts
new Notification({
  title: 'Sessão de Foco Completa',
  body: 'Hora de uma pausa de 5 minutos',
  silent: !settings.soundEnabled,
  urgency: 'normal',
  timeoutType: 'never' // Persiste até click
});
```

### Accessibility (WCAG 2.1 AA)

**Findings**:
- **Contraste**: Mínimo 4.5:1 para texto normal, 3:1 para large text
- **Keyboard navigation**: Tab order lógico, focus indicators visíveis
- **Screen readers**: ARIA labels para timer, status announcements
- **Reduced motion**: Respeitar `prefers-reduced-motion` (sem animações)

**Testing tools**:
- **axe-core**: Auditor automático integrado no Playwright
- **NVDA/JAWS**: Teste manual com screen readers

## Performance Benchmarks

### Target Metrics (from spec NFR-001 to NFR-003)

| Métrica | Target | Estratégia |
|---------|--------|-----------|
| Startup time | <200ms | Code splitting, lazy load Settings/Stats |
| Memory footprint | <100MB | Production build, minimize dependencies |
| Timer precision | ±2s em 25min | `Date.now()` comparison, não `setInterval` drift |

### Bundle Size Optimization

- **Tree-shaking**: Vite automatic
- **Code splitting**: Lazy load `Settings.tsx`, `Stats.tsx`
- **Dependency audit**: Usar `bundle-buddy` para identificar bloat
- **Production build**: `electron-builder` com compression

## Risks & Mitigations

### Risk 1: Electron Bundle Size

**Risco**: Instalador >150MB viola princípio minimalismo  
**Probabilidade**: Média  
**Impacto**: Alto (percepção de bloat)  
**Mitigação**:
- ASAR archive compression
- Remove devDependencies do bundle
- Single executable (não unpacked)
- Target: <80MB instalador Windows, <100MB macOS DMG

### Risk 2: Timer Accuracy em Sleep/Suspend

**Risco**: Timer continua contando durante suspensão do sistema  
**Probabilidade**: Alta  
**Impacto**: Médio (UX negativa)  
**Mitigação**:
- Listen `power-monitor` events (`suspend`, `resume`)
- Pausar timer automaticamente em suspend
- Notificar usuário ao retornar: "Timer pausado devido a suspensão"

### Risk 3: Cross-platform Testing

**Risco**: Bug específico de plataforma não detectado (e.g., tray no Linux)  
**Probabilidade**: Média  
**Impacto**: Alto (quebra funcionalidade core)  
**Mitigação**:
- CI/CD com matrix: Windows Server, macOS, Ubuntu
- Playwright E2E em cada plataforma
- Beta testing com usuários de cada OS

## Dependencies Audit

### Production Dependencies (estimativa)

```json
{
  "electron": "^28.0.0",           // ~85MB (core)
  "react": "^18.2.0",              // ~350KB
  "react-dom": "^18.2.0",          // ~130KB  
  "electron-store": "^8.1.0",      // ~15KB
  "electron-updater": "^6.1.0"     // ~200KB (auto-update - futuro)
}
```

**Total bundle (prod)**: ~86MB framework + ~10MB app code = ~96MB ✅ (dentro do limite)

### Dev Dependencies

```json
{
  "vite": "^5.0.0",
  "electron-vite": "^2.0.0",
  "typescript": "^5.3.0",
  "@vitejs/plugin-react": "^4.2.0",
  "vitest": "^1.0.0",
  "@playwright/test": "^1.40.0",
  "@axe-core/playwright": "^4.8.0"
}
```

## Open Questions Resolved

~~1. Electron vs Tauri?~~ → **Electron** (maturidade)  
~~2. React vs Vanilla?~~ → **React** (componentização)  
~~3. State management library?~~ → **Nenhuma** (useState suficiente)  
~~4. Backend storage?~~ → **electron-store** (simplicidade)  
~~5. Auto-update mechanism?~~ → **Adiado para v1.1** (MVP não requer)

## Next Steps

✅ All NEEDS CLARIFICATION resolved  
✅ Tech stack finalized  
✅ Performance targets validated  
→ **Ready for Phase 1**: Design & Contracts
