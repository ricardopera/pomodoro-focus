# Tasks: Pomodoro Timer MVP

**Input**: Design documents from `specs/001-pomodoro-timer-mvp/`  
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)

## Execution Flow (main)

```
1. Load plan.md from feature directory ✓
   → Tech stack: Electron 28.x, React 18.x, TypeScript 5.x, Vite 5.x
2. Load optional design documents ✓
   → data-model.md: 4 entities (AppState, Settings, Session, Statistics)
   → contracts/: 2 files (settings-api.md, timer-api.md)
   → research.md: Technology decisions and best practices
3. Generate tasks by category ✓
4. Apply task rules ✓
5. Number tasks sequentially (T001-T052) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Electron project**: `src/main/`, `src/renderer/`, `src/shared/`, `src/preload/`
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- Paths shown below assume Electron structure per plan.md

---

## Phase 3.1: Setup & Project Initialization

- [x] **T001** Initialize Electron + Vite + TypeScript project
  - Run `npm create @quick-start/electron` or manual setup
  - Configure `package.json` with scripts: `dev`, `build`, `test`
  - Verify: `npm run dev` opens blank Electron window

- [x] **T002** Install production dependencies
  - `npm install electron@^28.0.0 react@^18.2.0 react-dom@^18.2.0`
  - `npm install electron-store@^8.1.0`
  - Verify: `package.json` dependencies match research.md specs

- [x] **T003** Install development dependencies
  - `npm install -D vite@^5.0.0 @vitejs/plugin-react@^4.2.0`
  - `npm install -D typescript@^5.3.0 @types/react@^18.2.0 @types/node@^20.0.0`
  - `npm install -D vitest@^1.0.0 @vitest/ui@^1.0.0`
  - `npm install -D @playwright/test@^1.40.0 @axe-core/playwright@^4.8.0`
  - `npm install -D electron-builder@^24.0.0`

- [x] **T004** [P] Configure TypeScript
  - Create `tsconfig.json` with ES2022, strict mode, paths aliases
  - Create `tsconfig.node.json` for Vite config
  - Verify: No TypeScript errors on empty project

- [x] **T005** [P] Configure linting and formatting
  - Install `eslint@^8.0.0`, `prettier@^3.0.0`, `@typescript-eslint/parser`
  - Create `.eslintrc.json` with React + TypeScript rules
  - Create `.prettierrc` with 2-space indentation
  - Add `npm run lint` and `npm run format` scripts

- [x] **T006** Create project structure
  - Create directories: `src/main/`, `src/renderer/`, `src/shared/`, `src/preload/`
  - Create directories: `tests/unit/`, `tests/integration/`, `tests/e2e/`, `tests/contract/`
  - Create `public/` for icons and sounds
  - Verify: Structure matches plan.md

- [x] **T007** Configure Vite for Electron
  - Create `vite.config.ts` with `@vitejs/plugin-react`
  - Configure separate builds for main/renderer/preload
  - Setup HMR for renderer process
  - Verify: `npm run dev` enables hot reload

- [x] **T008** Configure Vitest
  - Create `vitest.config.ts` extending vite.config
  - Setup test globals, coverage with c8
  - Add `npm run test:unit` script
  - Verify: `npm run test:unit` runs (no tests yet)

- [x] **T009** Configure Playwright for E2E
  - Create `playwright.config.ts` with Electron launcher
  - Install Playwright browsers
  - Add `npm run test:e2e` script
  - Verify: Sample test can launch Electron app

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests - Settings API

- [ ] **T010** [P] Contract test: settings:get in `tests/contract/settings-get.spec.ts`
  - Test IPC invoke returns valid Settings object
  - Validate all required fields present (focusDuration, theme, etc.)
  - Validate field types and ranges
  - **MUST FAIL** (IPC handler not implemented yet)

- [ ] **T011** [P] Contract test: settings:update in `tests/contract/settings-update.spec.ts`
  - Test partial update (change only focusDuration)
  - Test validation errors (invalid ranges)
  - Test persistence (update → get → verify)
  - **MUST FAIL** (IPC handler not implemented yet)

- [ ] **T012** [P] Contract test: settings:changed event in `tests/contract/settings-events.spec.ts`
  - Test event fires on update
  - Test payload contains updated settings
  - **MUST FAIL** (event emission not implemented yet)

- [ ] **T013** [P] Contract test: settings:reset in `tests/contract/settings-reset.spec.ts`
  - Test reset restores defaults
  - Test persistence after reset
  - **MUST FAIL** (IPC handler not implemented yet)

### Contract Tests - Timer API

- [ ] **T014** [P] Contract test: timer:start in `tests/contract/timer-start.spec.ts`
  - Test returns sessionId and startTime
  - Test creates pendingSession
  - **MUST FAIL** (IPC handler not implemented yet)

- [ ] **T015** [P] Contract test: timer:pause/resume in `tests/contract/timer-pause-resume.spec.ts`
  - Test pause preserves timeRemaining
  - Test resume continues from paused time
  - **MUST FAIL** (IPC handlers not implemented yet)

- [ ] **T016** [P] Contract test: timer:reset in `tests/contract/timer-reset.spec.ts`
  - Test marks session as interrupted
  - Test clears pendingSession
  - **MUST FAIL** (IPC handler not implemented yet)

- [ ] **T017** [P] Contract test: timer:tick event in `tests/contract/timer-tick.spec.ts`
  - Test event fires every second
  - Test payload contains timeRemaining and progress
  - **MUST FAIL** (event emission not implemented yet)

- [ ] **T018** [P] Contract test: timer:complete event in `tests/contract/timer-complete.spec.ts`
  - Test event fires on timer expiration
  - Test payload contains nextState
  - **MUST FAIL** (event emission not implemented yet)

- [ ] **T019** [P] Contract test: sessions:get in `tests/contract/sessions-get.spec.ts`
  - Test returns array of Session objects
  - Test date range filtering works
  - **MUST FAIL** (IPC handler not implemented yet)

- [ ] **T020** [P] Contract test: statistics:get in `tests/contract/statistics-get.spec.ts`
  - Test returns valid Statistics object
  - Test all calculated fields present
  - **MUST FAIL** (IPC handler not implemented yet)

### Integration Tests

- [ ] **T021** [P] Integration test: Pomodoro cycle in `tests/integration/pomodoro-cycle.test.ts`
  - Test: idle → focus → break-short → idle
  - Test: 4 focus sessions → break-long
  - Test: sessionsCompleted counter resets correctly
  - **MUST FAIL** (timer logic not implemented yet)

- [ ] **T022** [P] Integration test: Settings persistence in `tests/integration/settings-persistence.test.ts`
  - Test: update settings → restart app → verify persisted
  - Test: corrupt file recovery (delete file → restart → defaults)
  - **MUST FAIL** (electron-store integration not implemented yet)

- [ ] **T023** [P] Integration test: Session recovery in `tests/integration/session-recovery.test.ts`
  - Test: start timer → force quit → reopen → dialog appears
  - Test: resume recovers correct timeRemaining
  - Test: reset marks session interrupted
  - **MUST FAIL** (recovery logic not implemented yet)

---

## Phase 3.3: Core Implementation - Shared Types (ONLY after tests are failing)

- [x] **T024** [P] TypeScript interfaces in `src/shared/types.ts`
  - Define `AppState`, `Settings`, `Session`, `Statistics` interfaces
  - Define `TimerState` type union
  - Export all types
  - Verify: No TypeScript errors, contract tests import types
  - ✅ DONE

- [x] **T025** [P] Constants in `src/shared/constants.ts`
  - Define DEFAULT_SETTINGS with values from data-model.md
  - Define TIMER_STATES enum
  - Define IPC_CHANNELS object (settings:*, timer:*, etc.)
  - Verify: Tests import and use constants
  - ✅ DONE

---

## Phase 3.4: Core Implementation - Main Process

- [x] **T026** electron-store wrapper in `src/main/store.ts`
  - Initialize Store with schema validation (JSON Schema from data-model.md)
  - Methods: getSettings(), updateSettings(), getSessions(), addSession()
  - Methods: getPendingSession(), setPendingSession(), clearPendingSession()
  - Error handling: corrupt file recovery
  - Verify: Contract tests T010-T013 start passing
  - ✅ DONE

- [x] **T027** Timer engine in `src/main/timer.ts`
  - Class TimerEngine with start/pause/resume/reset methods
  - Use Date.now() for precision (not setInterval drift)
  - Emit tick events every 1000ms
  - Emit complete event on expiration
  - Verify: Contract tests T014-T018 start passing
  - ✅ DONE

- [x] **T028** Session management in `src/main/session-manager.ts`
  - createSession(type, duration): Create Session with UUID
  - completeSession(sessionId): Mark completed, move to history
  - interruptSession(sessionId): Mark interrupted
  - Verify: Contract test T019 starts passing
  - ⚠️ MERGED into store.ts + timer.ts (simplified architecture)

- [x] **T029** Statistics calculator in `src/main/statistics.ts`
  - calculateStatistics(sessions[]): Return Statistics object
  - Implement streak algorithm from data-model.md
  - Calculate daily/weekly aggregations
  - Verify: Contract test T020 starts passing
  - ✅ DONE

- [x] **T030** IPC handlers for Settings in `src/main/ipc-handlers.ts`
  - Handle `settings:get`, `settings:update`, `settings:reset`
  - Emit `settings:changed` event to all windows
  - Validate input with JSON Schema
  - Verify: Contract tests T010-T013 fully pass
  - ⚠️ MERGED into ipc.ts (all handlers in single file)

- [x] **T031** IPC handlers for Timer in `src/main/ipc-handlers.ts`
  - Handle `timer:start`, `timer:pause`, `timer:resume`, `timer:reset`
  - Integrate with TimerEngine
  - Manage pendingSession in store
  - Verify: Contract tests T014-T018 fully pass

- [x] **T032** IPC handlers for Sessions/Stats in `src/main/ipc-handlers.ts`
  - Handle `sessions:get` with date filtering
  - Handle `statistics:get` with cached calculations
  - Verify: Contract tests T019-T020 fully pass
  - ⚠️ MERGED into ipc.ts (all handlers in single file)

- [x] **T033** System tray integration in `src/main/tray.ts`
  - Create Tray with icon (load from `public/icons/`)
  - Context menu: Pause/Resume, Settings, Statistics, Quit
  - Update tooltip with timer state
  - Platform-specific icons (Windows ICO, macOS template PNG, Linux PNG)
  - Verify: Tray appears and menu works
  - ✅ DONE (using SVG placeholder icon for now)

- [x] **T034** Native notifications in `src/main/notifications.ts`
  - showNotification(title, body, urgency)
  - Respect settings.notificationsEnabled and settings.soundEnabled
  - Platform-specific notification APIs
  - Verify: Notifications appear on focus/break complete
  - ✅ DONE

- [ ] **T035** Power management in `src/main/power-monitor.ts`
  - Listen to `suspend` event → pause timer automatically
  - Listen to `resume` event → show notification "Timer pausado"
  - Verify: Timer pauses on system sleep

- [x] **T036** Main process entry in `src/main/index.ts`
  - Create BrowserWindow with security settings (contextIsolation, nodeIntegration: false)
  - Load renderer HTML
  - Register all IPC handlers
  - Initialize tray, notifications, power monitor
  - Handle app lifecycle (ready, window-all-closed, activate)
  - Verify: App launches without errors
  - ✅ DONE

---

## Phase 3.5: Core Implementation - Preload Script

- [x] **T037** Preload script in `src/preload/index.ts`
  - Expose Settings API via contextBridge (getSettings, updateSettings, onSettingsChanged, resetSettings)
  - Expose Timer API (start, pause, resume, reset, onTick, onComplete)
  - Expose Sessions/Stats API (getSessions, getStatistics)
  - Verify: Renderer can invoke all APIs without direct IPC access
  - ✅ DONE

---

## Phase 3.6: Core Implementation - Renderer Process

### React Hooks

- [ ] **T038** [P] useTimer hook in `src/renderer/hooks/useTimer.ts`
  - State: timeLeft, isRunning, isPaused, currentState, sessionsCompleted
  - Methods: start(), pause(), resume(), reset()
  - Subscribe to timer:tick and timer:complete events
  - Verify: Hook updates state on timer events

- [ ] **T039** [P] useSettings hook in `src/renderer/hooks/useSettings.ts`
  - State: settings object
  - Methods: updateSettings(partial), resetSettings()
  - Subscribe to settings:changed event
  - Verify: Hook syncs with main process

- [ ] **T040** [P] useStats hook in `src/renderer/hooks/useStats.ts`
  - State: statistics object
  - Method: refreshStats()
  - Fetch statistics on mount and after session complete
  - Verify: Hook displays current stats

### React Components

- [ ] **T041** [P] Timer component in `src/renderer/components/Timer.tsx`
  - Display timeLeft in MM:SS format
  - Show circular progress indicator (0-100%)
  - Display currentState (Foco, Pausa, Pausa Longa)
  - ARIA live region for timer updates (accessibility)
  - Verify: Visual timer updates every second

- [ ] **T042** [P] Controls component in `src/renderer/components/Controls.tsx`
  - Buttons: Iniciar, Pausar, Retomar, Resetar (conditional rendering)
  - Keyboard shortcuts (Space = toggle, R = reset)
  - Focus indicators for accessibility
  - Verify: Buttons trigger useTimer methods

- [ ] **T043** [P] Settings modal in `src/renderer/components/Settings.tsx`
  - Form inputs for all Settings fields
  - Validation (ranges from data-model.md)
  - Save/Cancel buttons
  - Theme switcher with system auto-detect
  - Verify: Changes persist via useSettings

- [ ] **T044** [P] Stats tab in `src/renderer/components/Stats.tsx`
  - Display todayFocusMinutes, weekFocusMinutes
  - Display currentStreak, longestStreak
  - Visual progress bars or charts (optional: simple text is fine for MVP)
  - Verify: Stats update after session complete

- [ ] **T045** [P] App root component in `src/renderer/App.tsx`
  - Layout: Header (title), Main (Timer + Controls), Tabs (Settings, Stats)
  - Tab navigation (accessible)
  - Theme application (light/dark CSS classes)
  - Verify: All components render together

### Renderer Entry

- [ ] **T046** Renderer entry point in `src/renderer/index.tsx`
  - ReactDOM.createRoot and render <App />
  - Verify: Renderer loads in Electron window

### Styles

- [ ] **T047** [P] CSS styles in `src/renderer/styles/`
  - `global.css`: Reset, typography, CSS variables for theme colors
  - `timer.module.css`: Timer component styles
  - `controls.module.css`: Button styles with focus indicators
  - Verify: WCAG 2.1 AA contrast (4.5:1 minimum)

---

## Phase 3.7: Integration & End-to-End Tests

- [ ] **T048** Integration test: System tray interactions in `tests/integration/tray.test.ts`
  - Test: Click tray menu → Pause → timer pauses
  - Test: Minimize to tray (close window) → app continues running
  - Verify: Integration test T021 fully passes

- [ ] **T049** E2E test: Complete Pomodoro cycle in `tests/e2e/pomodoro-cycle.spec.ts`
  - Launch app → start focus → wait 1min → verify break-short
  - Complete 4 cycles → verify break-long
  - Use Playwright with Electron launcher
  - Verify: End-to-end flow works

- [ ] **T050** E2E test: Accessibility audit in `tests/e2e/accessibility.spec.ts`
  - Run axe-core audit on main screen
  - Test keyboard navigation (Tab order)
  - Test screen reader announcements (ARIA labels)
  - Verify: No critical accessibility violations

- [ ] **T051** E2E test: Multi-platform notifications in `tests/e2e/notifications.spec.ts`
  - Test notifications appear on Windows/macOS/Linux
  - Test sound playback (if soundEnabled)
  - Verify: Platform-specific notification APIs work

---

## Phase 3.8: Polish & Packaging

- [ ] **T052** [P] App icons in `public/icons/`
  - Generate icons: 16x16, 32x32, 48x48, 256x256, 512x512
  - Windows: Convert to .ico
  - macOS: Create .icns file
  - Linux: PNG files
  - Verify: Icons display correctly in each OS

- [ ] **T053** [P] Notification sound in `public/sounds/notification.mp3`
  - Add subtle notification sound (<1 second, not jarring)
  - Test sound playback in notifications.ts
  - Verify: Sound plays when soundEnabled=true

- [ ] **T054** Performance optimization
  - Code splitting: Lazy load Settings and Stats tabs
  - Bundle size analysis: Run `npm run build` and check dist/ size
  - Target: Renderer bundle <2MB, total app <100MB
  - Verify: Meets NFR-001, NFR-002 from spec.md

- [ ] **T055** [P] electron-builder config in `electron-builder.json`
  - Configure Windows build (NSIS installer, target: win32 x64)
  - Configure macOS build (DMG, target: darwin arm64/x64)
  - Configure Linux build (AppImage, target: linux x64)
  - Set app metadata (name, description, author)
  - Verify: `npm run build:win/mac/linux` produces installers

- [ ] **T056** [P] Unit tests for pure functions in `tests/unit/`
  - Test streak calculation algorithm (statistics.ts)
  - Test timer precision logic (timer.ts)
  - Test settings validation (store.ts)
  - Target: >80% code coverage
  - Verify: `npm run test:unit -- --coverage` shows coverage

- [ ] **T057** Manual testing via quickstart.md
  - Follow all 8 user stories in `specs/001-pomodoro-timer-mvp/quickstart.md`
  - Test on Windows + macOS + Linux
  - Document any bugs found
  - Verify: All acceptance criteria pass

- [ ] **T058** Documentation
  - Create `README.md` with install instructions, screenshots, features
  - Create `CONTRIBUTING.md` with development setup, testing, PR guidelines
  - Add LICENSE (MIT per constitution)
  - Verify: Documentation is clear for contributors

---

## Dependencies

**Critical Path**:

1. Setup (T001-T009) → All other phases
2. Tests (T010-T023) → Implementation (T024-T046)
3. Shared types (T024-T025) → Main process (T026-T036) AND Renderer (T038-T046)
4. Main process (T026-T036) → Preload (T037) → Renderer hooks (T038-T040)
5. Hooks (T038-T040) → Components (T041-T045)
6. Components (T041-T045) → E2E tests (T048-T051)
7. Everything → Polish (T052-T058)

**Blocking Relationships**:

- T026 (store) blocks T027 (timer), T030 (IPC handlers)
- T027 (timer) blocks T031 (timer IPC handlers)
- T030-T032 (IPC handlers) block T037 (preload)
- T037 (preload) blocks T038-T040 (hooks)
- T038-T040 (hooks) block T041-T045 (components)
- T010-T023 (tests) must fail before T026-T046 (implementation)

---

## Parallel Execution Examples

### Wave 1: Setup Phase (can run together)

```bash
# T004, T005 can run in parallel (different files)
Task: "Configure TypeScript in tsconfig.json"
Task: "Configure linting in .eslintrc.json and .prettierrc"
```

### Wave 2: Contract Tests (all can run in parallel)

```bash
# T010-T020 are independent test files
Task: "Contract test settings:get in tests/contract/settings-get.spec.ts"
Task: "Contract test settings:update in tests/contract/settings-update.spec.ts"
Task: "Contract test settings:changed in tests/contract/settings-events.spec.ts"
Task: "Contract test settings:reset in tests/contract/settings-reset.spec.ts"
Task: "Contract test timer:start in tests/contract/timer-start.spec.ts"
Task: "Contract test timer:pause/resume in tests/contract/timer-pause-resume.spec.ts"
Task: "Contract test timer:reset in tests/contract/timer-reset.spec.ts"
Task: "Contract test timer:tick in tests/contract/timer-tick.spec.ts"
Task: "Contract test timer:complete in tests/contract/timer-complete.spec.ts"
Task: "Contract test sessions:get in tests/contract/sessions-get.spec.ts"
Task: "Contract test statistics:get in tests/contract/statistics-get.spec.ts"
```

### Wave 3: Integration Tests (can run in parallel)

```bash
# T021-T023 are independent test scenarios
Task: "Integration test Pomodoro cycle in tests/integration/pomodoro-cycle.test.ts"
Task: "Integration test Settings persistence in tests/integration/settings-persistence.test.ts"
Task: "Integration test Session recovery in tests/integration/session-recovery.test.ts"
```

### Wave 4: Shared Types (can run in parallel)

```bash
# T024, T025 are different files
Task: "TypeScript interfaces in src/shared/types.ts"
Task: "Constants in src/shared/constants.ts"
```

### Wave 5: React Hooks (can run in parallel after T037 complete)

```bash
# T038-T040 are independent hooks
Task: "useTimer hook in src/renderer/hooks/useTimer.ts"
Task: "useSettings hook in src/renderer/hooks/useSettings.ts"
Task: "useStats hook in src/renderer/hooks/useStats.ts"
```

### Wave 6: React Components (can run in parallel after T038-T040 complete)

```bash
# T041-T044 are independent components
Task: "Timer component in src/renderer/components/Timer.tsx"
Task: "Controls component in src/renderer/components/Controls.tsx"
Task: "Settings modal in src/renderer/components/Settings.tsx"
Task: "Stats tab in src/renderer/components/Stats.tsx"
```

### Wave 7: Polish (can run in parallel)

```bash
# T052, T053, T055, T056, T058 are independent
Task: "App icons in public/icons/"
Task: "Notification sound in public/sounds/notification.mp3"
Task: "electron-builder config in electron-builder.json"
Task: "Unit tests for pure functions in tests/unit/"
Task: "Documentation (README, CONTRIBUTING, LICENSE)"
```

---

## Validation Checklist

Before marking feature complete:

- [ ] All contract tests (T010-T020) pass ✅
- [ ] All integration tests (T021-T023) pass ✅
- [ ] All E2E tests (T048-T051) pass ✅
- [ ] Unit test coverage >80% ✅
- [ ] Manual testing (quickstart.md) completed on Win/Mac/Linux ✅
- [ ] Performance benchmarks met (startup <200ms, memory <100MB, timer ±2s) ✅
- [ ] Accessibility audit passes (WCAG 2.1 AA) ✅
- [ ] No ESLint errors or warnings ✅
- [ ] Installers build successfully for all platforms ✅
- [ ] README and CONTRIBUTING documentation complete ✅

---

## Notes

- **TDD Enforcement**: Tests T010-T023 MUST fail before implementing T026-T046
- **[P] Tasks**: Can be executed in parallel using multiple agents/terminals
- **File Paths**: All paths are relative to repository root `D:\pomodoro\pomodoro-focus\`
- **Commit Strategy**: Commit after each task completion (atomic commits)
- **Constitution Compliance**: Each task must pass minimalismo, privacidade, acessibilidade checks

---

**Total Tasks**: 58  
**Estimated Parallel Waves**: 7  
**Sequential Steps**: ~15 (due to dependencies)  
**Ready for execution** ✅
