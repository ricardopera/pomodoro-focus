
# Implementation Plan: Pomodoro Timer MVP

**Branch**: `001-pomodoro-timer-mvp` | **Date**: 2025-10-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-pomodoro-timer-mvp/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Aplicativo desktop multiplataforma (Windows, macOS, Linux) que implementa a técnica
Pomodoro com timer visual, notificações discretas, e estatísticas de produtividade.
Foco em minimalismo, privacidade (zero telemetria), e operação offline-first.
Tecnologia escolhida: Electron para garantir paridade entre plataformas com HTML/CSS/JS.

## Technical Context

**Language/Version**: JavaScript (ES2022) / TypeScript 5.x, Node.js 20 LTS  
**Primary Dependencies**: Electron 28.x, React 18.x (UI), electron-store (config persistence)  
**Storage**: Local JSON files via electron-store (configurações e estatísticas)  
**Testing**: Vitest (unit/integration), Playwright (E2E), Spectron (Electron-specific)  
**Target Platform**: Windows 10+, macOS 11+, Linux (Debian/Ubuntu/Fedora)  
**Project Type**: single (Electron desktop app)  
**Performance Goals**: Carregamento <200ms, consumo <100MB RAM, timer precisão ±2s  
**Constraints**: Offline-first, zero telemetria, WCAG 2.1 AA, sem servidores externos  
**Scale/Scope**: Aplicação desktop local, single-user, ~10 telas/views, <5k LOC

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Minimalismo Funcional
- **PASS**: Interface limitada a timer, controles essenciais, e aba de estatísticas separada
- **PASS**: Configurações justificadas (durações, tema, notificações) - todas impactam experiência core
- **VERIFY**: Electron pode adicionar peso desnecessário - justificar vs alternativas (Tauri, Qt)

### II. Respeito à Atenção
- **PASS**: Notificações discretas via API nativa
- **PASS**: Minimiza para tray sem interromper fluxo
- **PASS**: Sem animações desnecessárias ou elementos visuais competitivos

### III. Privacidade por Padrão
- **PASS**: electron-store armazena dados localmente
- **PASS**: Zero requisições HTTP (offline-first)
- **PASS**: Sem analytics, telemetria ou rastreamento

### IV. Multiplataforma e Offline-First
- **PASS**: Electron suporta Win/Mac/Linux nativamente
- **PASS**: Funcionalidade completa sem internet
- **PASS**: APIs nativas de notificação por plataforma

### V. Código Aberto e Acessível
- **PASS**: Stack open-source (Electron, React, Node.js)
- **VERIFY**: WCAG 2.1 AA será validado em testes E2E
- **PASS**: Documentação clara via quickstart.md e contracts

### Decisões Técnicas Questionáveis

**Electron vs Tauri**:
- **Escolha**: Electron 28.x
- **Justificativa**: Maturidade, ecossistema extenso, docs abundantes, menor curva de aprendizado
- **Trade-off**: Maior consumo de memória (~80-100MB vs ~40MB Tauri), mas dentro do limite constitucional (<100MB)
- **Alternativa rejeitada**: Tauri (Rust) - mais leve mas requer Rust, menos exemplos para Pomodoro apps

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
src/
├── main/                    # Electron main process
│   ├── index.ts            # App lifecycle, window management
│   ├── tray.ts             # System tray integration
│   ├── notifications.ts    # Native notifications
│   └── store.ts            # electron-store wrapper
├── renderer/               # React UI (renderer process)
│   ├── components/         # React components
│   │   ├── Timer.tsx      # Main timer display
│   │   ├── Controls.tsx   # Start/Pause/Reset buttons
│   │   ├── Settings.tsx   # Configuration modal
│   │   └── Stats.tsx      # Statistics tab
│   ├── hooks/             # Custom React hooks
│   │   ├── useTimer.ts    # Timer logic
│   │   ├── useSettings.ts # Settings management
│   │   └── useStats.ts    # Statistics calculations
│   ├── styles/            # CSS modules
│   ├── App.tsx            # Root component
│   └── index.tsx          # Entry point
├── shared/                 # Shared between main/renderer
│   ├── types.ts           # TypeScript interfaces
│   ├── constants.ts       # App constants
│   └── ipc-channels.ts    # IPC event names
└── preload/               # Preload script (security bridge)
    └── index.ts           # Expose safe APIs to renderer

tests/
├── unit/                  # Unit tests (Vitest)
│   ├── hooks.test.ts
│   ├── components.test.tsx
│   └── store.test.ts
├── integration/           # Integration tests
│   ├── timer-flow.test.ts
│   ├── settings-persistence.test.ts
│   └── stats-calculation.test.ts
└── e2e/                   # End-to-end tests (Playwright)
    ├── pomodoro-cycle.spec.ts
    ├── system-tray.spec.ts
    └── accessibility.spec.ts

public/                    # Static assets
├── icons/                 # App icons (Windows, macOS, Linux)
└── sounds/                # Notification sounds

package.json               # Dependencies, scripts
tsconfig.json             # TypeScript config
vite.config.ts            # Vite bundler config
electron-builder.json     # Build/packaging config
```

**Structure Decision**: Single Electron project with main/renderer separation.
Main process handles OS integration (tray, notifications, file system), renderer
process handles UI (React). IPC for cross-process communication. Vite for fast
HMR during development.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs:
  - **research.md**: Setup tasks (project init, dependencies)
  - **data-model.md**: Entity implementation tasks (AppState, Settings, Session, Statistics)
  - **contracts/**: IPC contract test tasks (2 files × 4-6 tests each)
  - **quickstart.md**: Manual testing checklist (não gera tasks automáticas)

**Task Categories**:

1. **Setup** (T001-T005):
   - Init Electron+Vite project
   - Install dependencies (electron, react, electron-store, vitest, playwright)
   - Configure TypeScript, ESLint, Prettier
   - Setup test infrastructure
   - Create project structure (src/main, src/renderer, tests/)

2. **Tests First - IPC Contracts** (T006-T018):
   - Settings API contract tests (4 tests: get, update, changed event, reset)
   - Timer API contract tests (8 tests: start, pause, resume, reset, tick event, complete event)
   - Sessions/Stats API contract tests (3 tests: get sessions, get stats)
   - **MUST FAIL** before implementation

3. **Core Implementation - Main Process** (T019-T028):
   - electron-store wrapper (Settings persistence)
   - Timer engine (start/pause/resume/reset logic with Date.now() precision)
   - Session management (create, complete, interrupt)
   - Statistics calculator (streak, daily/weekly aggregations)
   - IPC handlers (settings:*, timer:*, sessions:*, statistics:*)
   - System tray integration
   - Native notifications
   - Power management (suspend/resume detection)

4. **Core Implementation - Renderer Process** (T029-T038):
   - React components (Timer, Controls, Settings modal, Stats tab)
   - Custom hooks (useTimer, useSettings, useStats, useIPC)
   - Preload script (secure IPC bridge)
   - Theme system (light/dark/system auto-detect)
   - Accessibility (ARIA labels, keyboard navigation)

5. **Integration Tests** (T039-T045):
   - Complete Pomodoro cycle (focus → break → idle)
   - Settings persistence across restarts
   - Session recovery on app reopen
   - System tray interactions
   - Multi-platform notification delivery

6. **Polish & Packaging** (T046-T052):
   - E2E tests with Playwright (accessibility audit with axe-core)
   - Performance optimization (code splitting, bundle size)
   - Build configurations (electron-builder for Win/Mac/Linux)
   - App icons (16x16, 32x32, 256x256 for each platform)
   - Manual testing via quickstart.md
   - Documentation (README, CONTRIBUTING)

**Ordering Strategy**:

- TDD strict: Tests (T006-T018) before implementation (T019-T038)
- Dependency order:
  - Main process (T019-T028) blocks Renderer (T029-T038)
  - electron-store (T019) blocks Timer engine (T020)
  - IPC handlers (T024) blocks React hooks (T032)
- Mark [P] for parallel execution:
  - All contract tests can run in parallel (independent files)
  - React components can be built in parallel (isolated)
  - Build configs for each OS in parallel

**Estimated Output**: ~52 numbered, sequenced tasks in tasks.md

**Parallelization Opportunities**:

- **T006-T018**: 13 contract test tasks [P] (different files)
- **T029-T033**: 5 React component tasks [P] (Timer.tsx, Controls.tsx, Settings.tsx, Stats.tsx, App.tsx)
- **T034-T036**: 3 React hook tasks [P] (useTimer, useSettings, useStats)
- **T049-T051**: 3 build config tasks [P] (Windows, macOS, Linux)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking

*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [x] Phase 3: Tasks generated (/tasks command) ✅
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [ ] Complexity deviations documented (N/A - nenhum desvio)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
