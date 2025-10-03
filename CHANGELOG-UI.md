# UI Improvements - Changelog

## Implementado em 03/10/2024

### ✅ 1. Ícone do Aplicativo

**Alterações:**
- Criado `public/icons/app-icon.svg` - Ícone vetorial com design de tomate profissional
- Gerado `public/icons/app-icon.png` (256x256) - Versão PNG para compatibilidade
- Implementado script `scripts/generate-icons.js` para gerar ícones PNG programaticamente
- Atualizado `src/main/index.ts` para usar o ícone PNG na janela

**Resultado:**
- Aplicativo agora exibe ícone personalizado de tomate no taskbar e janela
- Ícone compatível com Windows, Linux e macOS

### ✅ 2. Tema Escuro

**Alterações:**
- Reescrito `src/renderer/index.css` com sistema de temas baseado em CSS Variables
- Criados 3 modos de tema:
  - **Light**: Fundo branco, texto escuro
  - **Dark**: Fundo escuro (#1a1a2e), texto claro
  - **System**: Detecta automaticamente usando `@media (prefers-color-scheme: dark)`
- Atualizado `src/renderer/App.css` para usar variáveis de tema
- Implementado em `src/renderer/App.tsx`:
  - `useEffect` que aplica o atributo `data-theme` no `<html>`
  - Suporte para tema "system" que remove o atributo e deixa CSS media query controlar

**Variáveis CSS criadas:**
```css
--color-bg (fundo principal)
--color-bg-secondary (fundo alternativo)
--color-text (texto principal)
--color-text-secondary (texto secundário)
--color-border (bordas)
--color-card-bg (fundo dos cards)
--color-input-bg (fundo dos inputs)
--color-shadow (sombras)
```

**Resultado:**
- Tema escuro aplicado corretamente
- Transição suave entre temas
- Todos os componentes (timer, estatísticas, configurações) adaptados

### ✅ 3. Menu Superior Oculto (Frameless Window)

**Alterações:**
- Configurado `frame: false` em `src/main/index.ts`
- Criada barra de título personalizada em `src/renderer/App.css`:
  - `.app-titlebar` com região arrastável (`-webkit-app-region: drag`)
  - Botões de minimizar e fechar estilizados
  - Título do app "🍅 Pomodoro Focus"
- Implementado em `src/renderer/App.tsx`:
  - Componente de titlebar customizada
  - Funções `handleMinimize()` e `handleClose()`
- Adicionado IPC handlers em `src/main/ipc.ts`:
  - `window:minimize` - Minimiza a janela
  - `window:close` - Fecha a janela
- Exposto API no `src/preload/index.ts`:
  - `window.electronAPI.minimize()`
  - `window.electronAPI.close()`

**Resultado:**
- Janela sem menu nativo do Windows
- Barra de título personalizada com controles funcionais
- Interface mais limpa e moderna
- Janela arrastável pela titlebar

## Arquivos Modificados

1. `src/main/index.ts` - Configuração da janela (frame, ícone)
2. `src/main/ipc.ts` - Handlers de controle de janela
3. `src/preload/index.ts` - API Electron exposta (minimize, close)
4. `src/renderer/index.css` - Sistema de temas CSS
5. `src/renderer/App.css` - Estilos da titlebar e componentes
6. `src/renderer/App.tsx` - Lógica de tema e titlebar
7. `scripts/generate-icons.js` - Gerador de ícones PNG

## Arquivos Criados

1. `public/icons/app-icon.svg` - Ícone vetorial do app
2. `public/icons/app-icon.png` - Ícone PNG 256x256
3. `dist-electron/icons/app-icon.png` - Cópia para build

## Como Testar

```bash
# Gerar ícones (se necessário)
node scripts/generate-icons.js

# Compilar
node scripts/build-electron.js

# Executar
npm run dev
```

**Verificar:**
- ✅ Ícone de tomate aparece na barra de tarefas e janela
- ✅ Tema escuro aplicado (ou mudar em Configurações)
- ✅ Sem menu nativo no topo da janela
- ✅ Barra de título personalizada funcional
- ✅ Botões minimizar/fechar funcionando
- ✅ Janela arrastável pela titlebar
- ✅ Tema system detecta preferências do SO

## Próximos Passos

- [ ] T035: Power management (prevenir sleep durante pomodoro)
- [ ] T046-T054: Testes automatizados
- [ ] T056-T058: Build de produção
