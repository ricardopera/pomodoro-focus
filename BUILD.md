# 🔨 Guia de Build - Pomodoro Focus

Este documento descreve como compilar e criar executáveis do Pomodoro Focus para diferentes plataformas.

## 📋 Pré-requisitos

- Node.js 18 ou superior
- npm 8 ou superior
- Git

### Requisitos Específicos por Plataforma

#### Windows
- Windows 10 ou superior
- Nenhuma dependência adicional necessária

#### macOS
- macOS 10.13 ou superior
- Xcode Command Line Tools (instalado automaticamente)

#### Linux
- Distribuições baseadas em Debian/Ubuntu (para DEB)
- Qualquer distribuição moderna (para AppImage)
- Ferramentas de build: `build-essential`

```bash
# Ubuntu/Debian
sudo apt-get install build-essential
```

## 🚀 Build de Desenvolvimento

### 1. Clonar e Configurar

```bash
# Clone o repositório
git clone https://github.com/ricardopera/pomodoro-focus.git
cd pomodoro-focus

# Instale as dependências
npm install
```

### 2. Executar em Modo Desenvolvimento

```bash
# Inicia o aplicativo com hot-reload
npm run dev
```

O aplicativo abrirá automaticamente com:
- **Main Process**: Recarrega automaticamente ao detectar mudanças
- **Renderer**: Hot Module Replacement (HMR) via Vite

## 🏗️ Build de Produção

### Build Completo

```bash
# Build de produção otimizado
npm run build:prod
```

Este comando executa:
1. `prepare-build.js` - Prepara diretório de build e copia ícones
2. `generate-sounds.js` - Gera arquivos de som WAV
3. `generate-icons.js` - Gera ícones PNG
4. `build-electron.js` - Compila main process e preload com esbuild
5. `vite build` - Compila renderer com Vite

**Saída**: Pasta `dist/` com código compilado

### Build Parcial (Desenvolvimento)

```bash
# Apenas build do código (sem assets)
npm run build

# Apenas main process
npm run build:electron

# Apenas renderer
npm run build:renderer
```

## 📦 Criar Executáveis

### Windows 🪟

```bash
npm run dist:win
```

**Artefatos gerados** (pasta `release/`):
- `Pomodoro Focus Setup 1.0.0.exe` - Instalador NSIS (~80-100 MB)
- `PomodoroFocus-Portable-1.0.0.exe` - Versão portátil (~80-100 MB)

**Tempo estimado**: 8-10 minutos

### Linux 🐧

```bash
npm run dist:linux
```

**Artefatos gerados** (pasta `release/`):
- `Pomodoro Focus-1.0.0.AppImage` - Universal (~100-120 MB)
- `pomodoro-focus_1.0.0_amd64.deb` - Debian/Ubuntu (~70 MB)

**Tempo estimado**: 6-8 minutos

### macOS 🍎

```bash
npm run dist:mac
```

**Artefatos gerados** (pasta `release/`):
- `Pomodoro Focus-1.0.0.dmg` - Instalador DMG (~90-110 MB)
- `Pomodoro Focus-1.0.0-mac.zip` - Arquivo ZIP (~85-100 MB)

**Tempo estimado**: 8-10 minutos

**Nota**: Para distribuir no macOS sem avisos de segurança, você precisará de um Apple Developer Account ($99/ano) para code signing e notarização.

### Todas as Plataformas

```bash
npm run dist:all
```

**Nota**: Requer ambiente apropriado. Geralmente, você precisa:
- macOS para gerar DMG
- Windows para gerar EXE
- Linux para gerar AppImage/DEB

## 🔍 Estrutura de Build

### Diretórios

```
pomodoro-focus/
├── build/              # Recursos de build (ícones)
│   └── icon.png        # Ícone principal (gerado automaticamente)
├── dist/               # Código compilado
│   ├── main/           # Main process compilado
│   ├── preload/        # Preload script compilado
│   └── renderer/       # Renderer compilado (React)
├── dist-electron/      # Ícones para Electron
├── release/            # Executáveis finais
│   ├── win-unpacked/   # Arquivos descompactados (Windows)
│   ├── linux-unpacked/ # Arquivos descompactados (Linux)
│   ├── *.exe           # Instaladores Windows
│   ├── *.AppImage      # AppImage Linux
│   ├── *.deb           # Pacote Debian
│   ├── *.dmg           # Instalador macOS
│   └── *.zip           # ZIP macOS
└── scripts/            # Scripts de build
    ├── prepare-build.js    # Prepara diretório de build
    ├── generate-sounds.js  # Gera sons
    ├── generate-icons.js   # Gera ícones
    └── build-electron.js   # Compila Electron
```

### Configuração de Build

A configuração do electron-builder está em `package.json` na seção `"build"`:

```json
{
  "build": {
    "appId": "com.ricardopera.pomodoro-focus",
    "productName": "Pomodoro Focus",
    "directories": {
      "buildResources": "build",
      "output": "release"
    },
    "win": { ... },
    "mac": { ... },
    "linux": { ... }
  }
}
```

## 🧪 Testes

### Testes Unitários

```bash
# Executar testes
npm test

# Executar testes uma vez
npm run test:unit

# Cobertura de código
npm run test:coverage
```

### Testes E2E

```bash
# Executar testes E2E com Playwright
npm run test:e2e
```

### Linter

```bash
# Executar ESLint
npm run lint

# Formatar código
npm run format
```

## 🐛 Troubleshooting

### Build falha no Windows

**Erro**: "EPERM: operation not permitted"

**Solução**:
1. Execute PowerShell como Administrador, OU
2. Ative o Modo Desenvolvedor do Windows:
   - Win+I → Privacidade e segurança → Para desenvolvedores
   - Ative "Modo de desenvolvedor"

### Build falha no Linux

**Erro**: "Cannot find module 'fpm'"

**Solução**:
```bash
# Ubuntu/Debian
sudo apt-get install ruby-dev gcc make
sudo gem install fpm
```

### Build falha no macOS

**Erro**: "Command failed: xcrun"

**Solução**:
```bash
# Instalar Xcode Command Line Tools
xcode-select --install
```

### Ícone não aparece

**Problema**: Executável sem ícone

**Solução**:
1. Verifique se `build/icon.png` existe
2. Execute `npm run build:prod` novamente
3. Limpe a pasta release: `rm -rf release`

### Build muito lento

**Dicas de otimização**:
1. Use SSD (não HDD)
2. Desative antivírus temporariamente
3. Aumente memória disponível
4. Use `npm ci` em vez de `npm install` (CI/CD)

## 📊 Comparação de Tamanhos

| Plataforma | Formato | Tamanho | Compressão |
|------------|---------|---------|------------|
| Windows | NSIS Installer | ~95 MB | 7z |
| Windows | Portable .exe | ~95 MB | - |
| Linux | AppImage | ~105 MB | gzip |
| Linux | .deb | ~70 MB | xz |
| macOS | .dmg | ~100 MB | bzip2 |
| macOS | .zip | ~90 MB | zip |

**Por que tão grande?**
- Chromium (engine do Electron): ~70 MB
- Node.js runtime: ~8 MB
- React + dependências: ~5 MB
- Código da aplicação: ~2-3 MB
- Assets (sons, ícones): ~1 MB

## 🔧 Scripts Customizados

### prepare-build.js
Prepara o ambiente de build copiando recursos necessários.

```bash
node scripts/prepare-build.js
```

### generate-sounds.js
Gera arquivos WAV de som programaticamente.

```bash
node scripts/generate-sounds.js
```

### generate-icons.js
Gera ícones PNG a partir de código JavaScript.

```bash
node scripts/generate-icons.js
```

### build-electron.js
Compila main process e preload com esbuild.

```bash
node scripts/build-electron.js
```

## 🔒 Code Signing

### Windows

Para assinar executáveis Windows:

1. Obter certificado de code signing (~$300/ano)
2. Configurar no `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/cert.pfx",
      "certificatePassword": "password"
    }
  }
}
```

### macOS

Para assinar e notarizar no macOS:

1. Apple Developer Account ($99/ano)
2. Certificado de Developer ID
3. Configurar no `package.json`:

```json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "identity": "Developer ID Application: Your Name"
    },
    "afterSign": "scripts/notarize.js"
  }
}
```

## 🚀 Otimizações

### Reduzir Tamanho do Build

1. **Remover source maps em produção**:
   - Editar `vite.config.ts`:
   ```typescript
   build: {
     sourcemap: false
   }
   ```

2. **Comprimir melhor**:
   - Usar `electron-builder-squirrel-windows` (Windows)
   - Usar `7z` compression (melhor compressão)

3. **Lazy loading**:
   - Carregar módulos pesados apenas quando necessário

### Acelerar Build

1. **Cache de dependências**:
   ```bash
   npm ci --prefer-offline
   ```

2. **Builds incrementais**:
   - Não limpar `dist/` entre builds de dev

3. **Paralelização**:
   - electron-builder já paraliza automaticamente

## 📚 Recursos

- [electron-builder Documentation](https://www.electron.build/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Documentation](https://vitejs.dev/)
- [esbuild Documentation](https://esbuild.github.io/)

## 🎉 Próximos Passos

Após criar os executáveis:

1. **Testar**: Instale e teste em cada plataforma
2. **Versionar**: Use SemVer (`npm version patch/minor/major`)
3. **Release**: Publique via GitHub Releases (manual ou automático)
4. **Distribuir**: Compartilhe com usuários

Para publicar releases automáticas, veja [RELEASE.md](./RELEASE.md)

---

**Última atualização**: 2025-10-04
**Versão do documento**: 1.0.0
