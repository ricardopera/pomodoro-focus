# 📦 Guia de Distribuição - Pomodoro Focus

## 🎯 Gerando Executáveis

### Preparação

```bash
# 1. Instalar dependências
npm install

# 2. Build completo (já gera assets automaticamente)
npm run build:prod
```

### Windows 🪟

#### Gerar executáveis para Windows
```bash
npm run dist:win
```

**Saída** (pasta `release/`):
- `Pomodoro Focus Setup 1.0.0.exe` (~80-100 MB) - Instalador NSIS
- `PomodoroFocus-Portable-1.0.0.exe` (~80-100 MB) - Versão portátil

**Instalador NSIS** (Recomendado para usuários):
- Instalação tradicional com wizard
- Cria atalhos no Desktop e Menu Iniciar
- Opção de escolher diretório de instalação
- Desinstalador incluído

**Versão Portátil**:
- Executável único, sem instalação necessária
- Perfeito para USB ou pastas compartilhadas
- Todas as configurações ficam na pasta do app

### macOS 🍎

```bash
npm run dist:mac
```

**Saída**:
- `Pomodoro Focus-1.0.0.dmg` (~90-110 MB) - Instalador DMG
- `Pomodoro Focus-1.0.0-mac.zip` (~85-100 MB) - Arquivo ZIP

**Nota**: Para distribuir no macOS sem avisos de segurança, você precisará:
- Apple Developer Account ($99/ano)
- Code signing certificate
- Notarization pela Apple

Sem code signing, usuários verão "App de desenvolvedor não identificado" (contornável com Ctrl+Click → Abrir).

### Linux 🐧

```bash
npm run dist:linux
```

**Saídas**:
- `Pomodoro Focus-1.0.0.AppImage` (~100-120 MB) - Universal, funciona em todas as distros
- `pomodoro-focus_1.0.0_amd64.deb` (~80-100 MB) - Debian/Ubuntu

#### AppImage (Recomendado)
```bash
chmod +x "Pomodoro Focus-1.0.0.AppImage"
./Pomodoro\ Focus-1.0.0.AppImage
```

#### Debian/Ubuntu
```bash
sudo dpkg -i pomodoro-focus_1.0.0_amd64.deb
```

### Todas as Plataformas (se possível)

```bash
npm run dist:all
```

**Nota**: Requer ambiente apropriado (Windows para .exe, macOS para .dmg, etc.)

## 📤 Compartilhando o Aplicativo

### Opção 1: GitHub Releases ⭐ (Recomendado)

1. **Criar tag de versão**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Criar Release no GitHub**:
   - Vá para: https://github.com/ricardopera/pomodoro-focus/releases/new
   - Tag version: `v1.0.0`
   - Release title: `🍅 Pomodoro Focus v1.0.0 - Initial Release`
   - Descrição: Cole o conteúdo de [`PR-DESCRIPTION.md`](PR-DESCRIPTION.md)
   - Upload dos executáveis da pasta `release/`

3. **Usuários baixam diretamente**:
   - Windows: `Pomodoro Focus Setup 1.0.0.exe` ou versão portátil
   - macOS: `Pomodoro Focus-1.0.0.dmg`
   - Linux: `Pomodoro Focus-1.0.0.AppImage`

### Opção 2: Hospedagem em Nuvem

Upload para serviços de hospedagem:
- **Google Drive** / **Dropbox** - Compartilhar link público (grátis)
- **Amazon S3** / **Cloudflare R2** - Para alto volume
- **SourceForge** / **FOSSHUB** - Plataformas para open-source

### Opção 3: Lojas de Aplicativos (Futuro)

**Windows (Microsoft Store)**:
- Requer conta de desenvolvedor ($19 one-time)
- Submissão via Partner Center
- Revisão automática (~24-48h)

**macOS (Mac App Store)**:
- Requer Apple Developer ($99/ano)
- Sandboxing mais restritivo
- Revisão manual (~1-2 semanas)

**Linux (Snap Store)**:
```bash
# Criar snap package
npm install -g snapcraft
snapcraft

# Publicar
snapcraft login
snapcraft upload pomodoro-focus_1.0.0_amd64.snap --release=stable
```

## 🔐 Code Signing (Opcional mas Recomendado)

### Windows

**Sem code signing**: "Windows protegeu o seu PC" warning (SmartScreen)

**Com code signing**:
1. Comprar certificado (~$100-300/ano):
   - DigiCert, Sectigo, Comodo
2. Atualizar [`package.json`](package.json):
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "env:CSC_KEY_PASSWORD"
   }
   ```

### macOS

**Sem notarization**: "App de desenvolvedor não identificado"

**Com notarization**:
1. Apple Developer Account ($99/ano)
2. Exportar certificados da Keychain
3. Notarizar automaticamente com electron-builder

## 📊 Tamanhos dos Executáveis

| Plataforma | Formato | Tamanho Aproximado |
|------------|---------|-------------------|
| Windows | NSIS Installer | ~80-100 MB |
| Windows | Portable .exe | ~80-100 MB |
| macOS | .dmg | ~90-110 MB |
| macOS | .zip | ~85-100 MB |
| Linux | AppImage | ~100-120 MB |
| Linux | .deb | ~80-100 MB |

**Por que tão grande?**
- Chromium runtime: ~70 MB (engine do Electron)
- Node.js runtime: ~8 MB
- Seu código e assets: ~2-5 MB
- Dependências: ~5-10 MB

## 🚀 Auto-Update (Para versões futuras)

Para habilitar atualizações automáticas:

1. **Instalar electron-updater**:
   ```bash
   npm install electron-updater
   ```

2. **Configurar no main process**:
   ```typescript
   import { autoUpdater } from 'electron-updater';
   
   app.on('ready', () => {
     autoUpdater.checkForUpdatesAndNotify();
   });
   ```

3. **Hospedar releases**:
   - GitHub Releases (grátis, recomendado)
   - Amazon S3 + CloudFront
   - Servidor próprio com API

## 📝 Checklist de Lançamento

Antes de publicar a release:

- [x] Testar build em desenvolvimento (`npm run dev`)
- [ ] Testar build de produção (`npm run build:prod`)
- [ ] Gerar executáveis (`npm run dist:win`)
- [ ] Testar instalador no Windows
- [ ] Testar versão portátil
- [ ] Verificar se ícones aparecem corretamente
- [ ] Verificar se sons funcionam
- [ ] Testar todas as funcionalidades principais
- [ ] Atualizar [`README.md`](README.md) com links de download
- [ ] Criar tag de versão (`git tag v1.0.0`)
- [ ] Push da tag (`git push origin v1.0.0`)
- [ ] Criar GitHub Release
- [ ] Upload dos executáveis
- [ ] Adicionar screenshots à release
- [ ] Escrever release notes detalhadas

## 🐛 Troubleshooting

### Windows: "Windows protegeu o seu PC"
**Problema**: SmartScreen bloqueia app não assinado

**Solução para usuários**:
1. Clicar em "Mais informações"
2. Clicar em "Executar assim mesmo"

**Solução permanente**: Code signing certificate

### Windows: Antivírus bloqueando
**Problema**: Antivírus detecta falso positivo

**Solução**:
- Code signing reduz drasticamente falsos positivos
- Usuários podem adicionar exceção manualmente

### macOS: "App está danificado"
**Problema**: App sem notarization da Apple

**Solução para usuários**:
1. Ctrl+Click no app
2. Selecionar "Abrir"
3. Confirmar (apenas primeira vez)

**Solução permanente**: Apple Developer + Notarization

### Linux: AppImage não executa
**Problema**: Permissões de execução

**Solução**:
```bash
chmod +x "Pomodoro Focus-1.0.0.AppImage"
```

### Build falha: "Cannot find module"
**Problema**: Dependências não instaladas

**Solução**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Recursos Úteis

- [electron-builder Documentation](https://www.electron.build/)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Auto-Update Guide](https://www.electron.build/auto-update)
- [Publishing Guide](https://www.electron.build/configuration/publish)
- [macOS Notarization](https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/)

## 🎉 Começando

Para gerar seu primeiro executável:

```bash
# Windows
npm run dist:win

# Aguarde a compilação (pode levar alguns minutos)
# Os arquivos estarão em: release/
```

**Pronto para distribuir!** 🚀

Os executáveis estarão na pasta `release/` e prontos para compartilhar com o mundo.
