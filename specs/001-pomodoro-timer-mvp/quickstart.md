# Quickstart: Pomodoro Timer MVP

**Feature**: 001-pomodoro-timer-mvp  
**Purpose**: Validação manual pós-implementação

## Prerequisites

- [ ] Aplicativo instalado em Windows/macOS/Linux
- [ ] Primeira execução completa (settings defaults criados)
- [ ] Timer nunca foi usado (estado limpo)

## User Story 1: Completar Ciclo Pomodoro Básico

**Objetivo**: Validar timer, notificações, e transições de estado

### Steps

1. **Iniciar aplicação**
   - [ ] App abre janela principal
   - [ ] Timer mostra `25:00` (padrão)
   - [ ] Estado é `idle` (nenhum botão ativo)
   - [ ] Ícone aparece na system tray

2. **Iniciar sessão de foco**
   - [ ] Clicar botão "Iniciar Foco"
   - [ ] Timer começa contagem regressiva de 25:00
   - [ ] Botão muda para "Pausar"
   - [ ] Ícone da tray atualiza (mostra estado ativo)

3. **Aguardar 1 minuto** (para validar precisão)
   - [ ] Após ~60s, timer mostra `24:00` (±2s tolerado)
   - [ ] Interface continua responsiva (sem lag)
   - [ ] Memory usage <100MB (verificar Task Manager)

4. **Pausar e retomar**
   - [ ] Clicar "Pausar"
   - [ ] Timer congela (não decrementa)
   - [ ] Clicar "Retomar"
   - [ ] Timer continua de onde parou

5. **Skip para fim** (acelerar teste)
   - [ ] Alterar duração em Settings para `1 minuto`
   - [ ] Resetar timer
   - [ ] Iniciar nova sessão de 1min
   - [ ] Aguardar até `00:00`

6. **Validar transição para pausa curta**
   - [ ] Timer expira em 00:00
   - [ ] **Notificação nativa** aparece: "Sessão de Foco Completa"
   - [ ] **Som** toca (se habilitado)
   - [ ] Timer automaticamente inicia pausa curta (5min)
   - [ ] Contador de sessões mostra `1/4`

7. **Completar pausa curta**
   - [ ] Aguardar até pausa curta expirar
   - [ ] Notificação: "Pausa Completa"
   - [ ] Timer volta para `idle`
   - [ ] Botão "Iniciar Foco" reaparece

**Expected Result**: ✅ Ciclo completo (foco → pausa → idle) sem crashes

---

## User Story 2: Pausa Longa Após 4 Sessões

**Objetivo**: Validar lógica de ciclo Pomodoro (4+1)

### Steps

1. **Completar 3 sessões de foco** (usar 1min cada para acelerar)
   - [ ] Sessão 1: Foco 1min → Pausa curta 5min (skip)
   - [ ] Sessão 2: Foco 1min → Pausa curta 5min (skip)
   - [ ] Sessão 3: Foco 1min → Pausa curta 5min (skip)
   - [ ] Contador mostra `3/4`

2. **Completar 4ª sessão**
   - [ ] Iniciar 4º foco (1min)
   - [ ] Aguardar expiração
   - [ ] Notificação: "Sessão de Foco Completa - Hora da Pausa Longa!"
   - [ ] Timer inicia **pausa longa** de 15min (não 5min)
   - [ ] Contador reseta para `0/4`

3. **Completar pausa longa**
   - [ ] Aguardar expiração (ou skip)
   - [ ] Timer volta para `idle`
   - [ ] Próxima sessão recomeça ciclo (1/4)

**Expected Result**: ✅ Pausa longa dispara corretamente após 4 sessões

---

## User Story 3: Configurações e Persistência

**Objetivo**: Validar storage local e aplicação de configurações

### Steps

1. **Alterar configurações**
   - [ ] Abrir modal "Configurações" (ícone engrenagem)
   - [ ] Mudar `focusDuration` para `30 minutos`
   - [ ] Mudar `theme` para `dark`
   - [ ] Desabilitar `soundEnabled`
   - [ ] Salvar configurações

2. **Validar aplicação imediata**
   - [ ] Interface muda para tema escuro **imediatamente**
   - [ ] Timer idle mostra `30:00` (nova duração)
   - [ ] Iniciar sessão de foco
   - [ ] Aguardar expiração
   - [ ] **Nenhum som** toca (soundEnabled=false)

3. **Validar persistência**
   - [ ] Fechar aplicativo completamente (Sair)
   - [ ] Reabrir aplicativo
   - [ ] Tema ainda é `dark`
   - [ ] Timer padrão ainda é `30:00`
   - [ ] Abrir Settings → confirmar valores salvos

**Expected Result**: ✅ Settings persistem entre sessões e aplicam corretamente

---

## User Story 4: System Tray e Minimização

**Objetivo**: Validar comportamento de background

### Steps

1. **Minimizar para tray**
   - [ ] Iniciar sessão de foco
   - [ ] Clicar `X` (fechar janela)
   - [ ] Janela desaparece **mas** ícone permanece na tray
   - [ ] Timer continua contando (verificar tooltip da tray)

2. **Interagir via tray**
   - [ ] Right-click ícone da tray
   - [ ] Menu mostra: `Pausar`, `Configurações`, `Estatísticas`, `Sair`
   - [ ] Clicar `Pausar`
   - [ ] Timer pausa (tooltip confirma)
   - [ ] Double-click ícone da tray
   - [ ] Janela reabre mostrando timer pausado

3. **Notificação em background**
   - [ ] Minimizar novamente
   - [ ] Aguardar timer expirar
   - [ ] Notificação aparece **mesmo com janela fechada**
   - [ ] Ícone da tray pisca ou muda cor

**Expected Result**: ✅ App funciona completamente em background via tray

---

## User Story 5: Estatísticas

**Objetivo**: Validar cálculos de histórico

### Steps

1. **Completar várias sessões**
   - [ ] Completar 3 sessões de foco (1min cada)
   - [ ] Resetar 1 sessão (interrompida)
   - [ ] Total: 3 completas, 1 interrompida

2. **Abrir aba Estatísticas**
   - [ ] Clicar tab "Estatísticas"
   - [ ] Mostrar `Hoje: 3 minutos de foco` (apenas completas)
   - [ ] Mostrar `Sessões completadas hoje: 3` (ignora interrompida)
   - [ ] Mostrar `Streak atual: 1 dia`

3. **Validar persistência de histórico**
   - [ ] Fechar app
   - [ ] Reabrir app
   - [ ] Estatísticas ainda mostram dados anteriores

**Expected Result**: ✅ Stats calculam corretamente e persistem

---

## User Story 6: Recuperação de Sessão

**Objetivo**: Validar behavior de reinício durante timer ativo

### Steps

1. **Iniciar sessão e fechar app**
   - [ ] Alterar foco para `5 minutos` em Settings
   - [ ] Iniciar sessão de foco
   - [ ] Aguardar ~2 minutos
   - [ ] **Força fechar** app (Alt+F4 / Kill process)

2. **Reabrir app**
   - [ ] Reabrir aplicativo
   - [ ] **Diálogo aparece**: "Retomar sessão de foco com ~3 minutos restantes?"
   - [ ] Opções: `[Retomar]` `[Resetar]`

3. **Testar retomar**
   - [ ] Clicar `Retomar`
   - [ ] Timer começa de ~3:00 (tempo restante correto)
   - [ ] Sessão continua normalmente

4. **Testar resetar** (repetir passos 1-2)
   - [ ] Clicar `Resetar`
   - [ ] Timer volta para `idle`
   - [ ] Sessão é marcada como interrompida no histórico

**Expected Result**: ✅ App recupera sessão ativa gracefully

---

## User Story 7: Acessibilidade (WCAG 2.1 AA)

**Objetivo**: Validar suporte a screen readers e keyboard navigation

### Steps

1. **Keyboard navigation**
   - [ ] Abrir app
   - [ ] Pressionar `Tab` múltiplas vezes
   - [ ] Focus indicators visíveis em todos os botões
   - [ ] Ordem de tab lógica: Timer → Iniciar → Settings → Stats
   - [ ] Pressionar `Enter` em botão focado ativa ação

2. **Contraste de cores**
   - [ ] Tema claro: Contraste texto/background ≥4.5:1
   - [ ] Tema escuro: Contraste texto/background ≥4.5:1
   - [ ] Usar ferramenta: [Contrast Checker](https://webaim.org/resources/contrastchecker/)

3. **Screen reader** (NVDA no Windows ou VoiceOver no macOS)
   - [ ] Ativar screen reader
   - [ ] Timer anuncia tempo restante
   - [ ] Botões anunciam estado ("Pausar" vs "Retomar")
   - [ ] Transições de estado anunciam ("Sessão de foco completa")

**Expected Result**: ✅ App utilizável com teclado e screen reader

---

## User Story 8: Multiplataforma

**Objetivo**: Validar paridade entre Windows, macOS, Linux

### Steps (repetir em cada OS)

- [ ] **Windows 10/11**:
  - [ ] Instalador .exe executa sem admin
  - [ ] Atalho criado no Menu Iniciar
  - [ ] Ícone da tray aparece (bandeja do sistema)
  - [ ] Notificações usam API nativa (Action Center)

- [ ] **macOS 11+**:
  - [ ] DMG monta corretamente
  - [ ] App movido para `/Applications`
  - [ ] Ícone da menu bar (tray) aparece
  - [ ] Notificações usam Notification Center
  - [ ] Tema auto-detecta Light/Dark mode do sistema

- [ ] **Linux (Ubuntu/Fedora)**:
  - [ ] AppImage executa sem instalação
  - [ ] Ícone da tray aparece (testar GNOME e KDE)
  - [ ] Notificações usam libnotify
  - [ ] Sem crash ao minimizar

**Expected Result**: ✅ Comportamento idêntico em todas as plataformas

---

## Performance Validation

### Benchmarks

- [ ] **Startup time**: App abre em <200ms (medir com stopwatch)
- [ ] **Memory footprint**: <100MB RAM (verificar Task Manager)
- [ ] **Timer precision**: Erro <2s em sessão de 25min (testar com cronômetro externo)
- [ ] **Bundle size**: Instalador Windows <80MB, macOS <100MB

### Load Test

- [ ] Completar 100 sessões de foco (histórico grande)
- [ ] Abrir aba Estatísticas
- [ ] Cálculo de stats completa em <500ms
- [ ] Interface continua responsiva

---

## Edge Cases

### Suspensão do Sistema

- [ ] Iniciar timer
- [ ] Suspender sistema (Sleep/Hibernar)
- [ ] Aguardar 5 minutos
- [ ] Acordar sistema
- [ ] App mostra notificação: "Timer pausado devido a suspensão"
- [ ] Timer está pausado (não expirou sozinho)

### Múltiplas Instâncias

- [ ] Abrir app
- [ ] Tentar abrir segunda instância
- [ ] Segunda instância não abre
- [ ] Janela da primeira instância vem para frente
- [ ] Mensagem: "Pomodoro Focus já está em execução"

### Arquivo Corrompido

- [ ] Fechar app
- [ ] Deletar `%APPDATA%/pomodoro-focus/config.json`
- [ ] Reabrir app
- [ ] App cria novo arquivo com defaults
- [ ] Nenhum crash, mensagem de aviso opcional

---

## Sign-off Checklist

- [ ] Todos os 8 User Stories passaram
- [ ] Performance benchmarks dentro dos targets
- [ ] Edge cases cobertos
- [ ] Testado em Windows + macOS + Linux
- [ ] Acessibilidade validada (keyboard + screen reader)
- [ ] Nenhum crash detectado
- [ ] Memory leaks verificados (usar DevTools Profiler)

**Tester Signature**: _________________________  
**Date**: _________________________  
**Build Version**: _________________________

---

**Next**: Ready for /tasks command to generate implementation tasks
