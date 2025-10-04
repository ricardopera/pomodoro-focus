# 🍅 Pomodoro Focus

Um aplicativo desktop moderno de timer Pomodoro construído com Electron, React e TypeScript.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Electron](https://img.shields.io/badge/electron-28.3.3-blue)
![React](https://img.shields.io/badge/react-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)

## ✨ Features

### Core
- ⏱️ **Timer Pomodoro Completo** - Sessões de foco, pausas curtas e pausas longas
- 🔄 **Ciclos Automáticos** - Sistema inteligente de sessões (4 focos → 1 pausa longa)
- 💾 **Persistência de Estado** - Nunca perca seu progresso
- 🎯 **Configurações Personalizáveis** - Ajuste durações e comportamentos

### Interface
- 🎨 **Temas Modernos** - Light, Dark e System (detecção automática)
- 🪟 **Janela Frameless** - Design limpo e minimalista
- 🍅 **Ícone Profissional** - Visual atraente e reconhecível
- 📊 **3 Abas Funcionais** - Timer, Estatísticas e Configurações

### Produtividade
- 📈 **Estatísticas Detalhadas** - Rastreie seu foco diário e semanal
- 🔥 **Sistema de Streak** - Mantenha sua sequência de dias produtivos
- 🔔 **Notificações Nativas** - Alertas do sistema operacional
- 🔊 **Sistema de Sons** - Feedback sonoro para conclusão de sessões

### Sistema
- 📍 **System Tray** - Ícone na bandeja do sistema
- 🔽 **Minimize to Tray** - Continue rodando em background
- 💪 **Baixo Consumo** - Otimizado para performance
- 🔒 **Seguro** - Sandbox mode e context isolation ativados

## 📸 Screenshots

> Em desenvolvimento - Screenshots serão adicionados em breve

## 📥 Download

### Versão Estável (Recomendado)

Baixe a versão mais recente em: [Releases](https://github.com/ricardopera/pomodoro-focus/releases/latest)

**Windows:**
- `Pomodoro Focus Setup.exe` - Instalador completo (recomendado)
- `PomodoroFocus-Portable.exe` - Versão portátil (não requer instalação)

**Linux:**
- `Pomodoro Focus.AppImage` - Universal (funciona em todas as distros)
- `pomodoro-focus.deb` - Pacote Debian/Ubuntu

**macOS:**
- `Pomodoro Focus.dmg` - Instalador DMG
- `Pomodoro Focus-mac.zip` - Arquivo ZIP

### Desenvolvimento

Para desenvolvedores que desejam contribuir ou executar a versão de desenvolvimento:

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Windows, macOS ou Linux

### Instalação

```bash
# Clone o repositório
git clone https://github.com/ricardopera/pomodoro-focus.git
cd pomodoro-focus

# Instale as dependências
npm install

# Gere os assets necessários
node scripts/generate-sounds.js
node scripts/generate-icons.js
```

### Desenvolvimento

```bash
# Compile o código
node scripts/build-electron.js

# Execute em modo desenvolvimento
npm run dev
```

O aplicativo abrirá automaticamente com hot-reload ativado para o renderer.

### Build de Produção

```bash
# Build completo
npm run build

# Criar executável (em desenvolvimento)
npm run package
```

## 🎯 Como Usar

### Timer Pomodoro

1. **Iniciar Sessão de Foco**
   - Clique em "Iniciar Foco" (25 minutos padrão)
   - O timer começará a contar
   - Foque em sua tarefa!

2. **Pausar/Retomar**
   - Clique em "Pausar" para interromper temporariamente
   - Clique em "Retomar" para continuar de onde parou

3. **Completar Sessão**
   - Quando o timer chegar a zero:
     - Receberá uma notificação
     - Ouvirá um som (se ativado)
     - Iniciará automaticamente a pausa (se configurado)

4. **Ciclo Completo**
   - Após 4 sessões de foco → Pausa longa (15 minutos)
   - O ciclo recomeça automaticamente

### Configurações Disponíveis

| Configuração | Descrição | Padrão |
|-------------|-----------|--------|
| Duração do Foco | Tempo de concentração | 25 min |
| Pausa Curta | Descanso entre focos | 5 min |
| Pausa Longa | Descanso após ciclo | 15 min |
| Sessões por Ciclo | Focos antes da pausa longa | 4 |
| Tema | Visual do app | System |
| Notificações | Alertas do sistema | Ativado |
| Sons | Feedback sonoro | Ativado |
| Minimizar para Bandeja | Continuar em background | Ativado |
| Auto-iniciar Pausas | Iniciar pausas automaticamente | Ativado |
| Auto-iniciar Foco | Iniciar foco após pausas | Desativado |

### Estatísticas

Acompanhe sua produtividade:
- **Foco Hoje** - Minutos de concentração no dia atual
- **Sessões Hoje** - Pomodoros completados hoje
- **Foco na Semana** - Total semanal de minutos
- **Sessões na Semana** - Total semanal de pomodoros
- **Streak Atual** - Dias consecutivos de uso
- **Melhor Streak** - Maior sequência alcançada

## 🏗️ Arquitetura

### Estrutura do Projeto

```
pomodoro-focus/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point, gerenciamento de janelas
│   │   ├── ipc.ts         # IPC handlers
│   │   ├── timer.ts       # Lógica do timer
│   │   ├── store.ts       # Persistência (electron-store)
│   │   ├── tray.ts        # System tray
│   │   ├── notifications.ts
│   │   └── statistics.ts
│   ├── preload/           # Secure bridge
│   │   └── index.ts       # ElectronAPI exposure
│   ├── renderer/          # React app
│   │   ├── App.tsx
│   │   ├── components/    # UI components
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── TimerControls.tsx
│   │   │   ├── StatisticsView.tsx
│   │   │   └── SettingsView.tsx
│   │   └── hooks/         # Custom React hooks
│   │       ├── useTimer.ts
│   │       ├── useSettings.ts
│   │       └── useStatistics.ts
│   └── shared/
│       ├── types.ts       # TypeScript types
│       └── constants.ts   # Shared constants
├── public/
│   ├── icons/             # App e tray icons
│   └── sounds/            # Arquivos de som
├── scripts/               # Build e utilidades
│   ├── build-electron.js
│   ├── dev.js
│   ├── generate-icons.js
│   └── generate-sounds.js
├── dist/                  # Arquivos compilados
└── docs/                  # Documentação
```

### Stack Tecnológico

- **Framework**: Electron 28.3.3
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5.9.3
- **Bundler**: esbuild (main/preload) + Vite (renderer)
- **State Management**: React Hooks + electron-store
- **Styling**: CSS Modules + CSS Variables

### Comunicação IPC

Type-safe IPC entre main e renderer:

```typescript
// Renderer → Main
window.electronAPI.timer.start('focus')
window.electronAPI.settings.update({ theme: 'dark' })

// Main → Renderer (eventos)
window.electronAPI.timer.onTick((state) => { ... })
window.electronAPI.timer.onComplete(() => { ... })
```

## 🔒 Segurança

- ✅ **Context Isolation** - Isolamento completo entre processos
- ✅ **Node Integration Disabled** - Sem acesso direto ao Node no renderer
- ✅ **Sandbox Mode** - Renderer executado em sandbox
- ✅ **CSP** - Content Security Policy (em produção)
- ✅ **Type-Safe IPC** - Comunicação tipada entre processos

## 🧪 Testes

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

> Nota: Testes estão em desenvolvimento

## 📝 Documentação

- [BUILD.md](./BUILD.md) - Guia completo de build e compilação
- [RELEASE.md](./RELEASE.md) - Processo de releases automáticos
- [DISTRIBUTION.md](./DISTRIBUTION.md) - Guia de distribuição
- [CHANGELOG-FEATURES.md](./CHANGELOG-FEATURES.md) - Log de features
- [CHANGELOG-UI.md](./CHANGELOG-UI.md) - Melhorias de UI
- [PROGRESS.md](./PROGRESS.md) - Status do projeto
- [docs/SOUNDS.md](./docs/SOUNDS.md) - Sistema de sons

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🐛 Reportar Bugs

Encontrou um bug? [Abra uma issue](https://github.com/ricardopera/pomodoro-focus/issues/new) com:
- Descrição detalhada do problema
- Passos para reproduzir
- Screenshots (se aplicável)
- Sistema operacional e versão

## 📋 Roadmap

### v1.0 - MVP ✅
- [x] Timer funcional
- [x] Interface moderna
- [x] Temas (Light/Dark/System)
- [x] Notificações e sons
- [x] Estatísticas básicas
- [x] System tray

### v1.1 - Melhorias ✅
- [x] Power management (prevenir sleep)
- [x] Testes automatizados
- [x] Build de produção
- [x] Instaladores (Windows/macOS/Linux)
- [x] GitHub Actions para releases automáticos

### v1.2 - Features Avançadas
- [ ] Sincronização em nuvem
- [ ] Histórico detalhado de sessões
- [ ] Gráficos de produtividade
- [ ] Integração com calendários
- [ ] Modo de trabalho em equipe

### v2.0 - Futuro
- [ ] Aplicativo mobile (sincronizado)
- [ ] Integração com Notion/Trello
- [ ] Metas e conquistas
- [ ] Análise de produtividade com IA

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Ricardo Pera**

- GitHub: [@ricardopera](https://github.com/ricardopera)
- Email: [Seu email]

## 🙏 Agradecimentos

- Técnica Pomodoro criada por Francesco Cirillo
- Ícones e inspiração da comunidade open-source
- Electron, React e TypeScript communities

## ⭐ Apoie o Projeto

Se este projeto foi útil para você, considere:
- ⭐ Dar uma estrela no GitHub
- 🐛 Reportar bugs
- 💡 Sugerir novas features
- 🤝 Contribuir com código
- ☕ [Comprar um café](https://www.buymeacoffee.com/ricardopera) (opcional)

---

<div align="center">

**Feito com ❤️ e ☕ usando a Técnica Pomodoro**

</div>
