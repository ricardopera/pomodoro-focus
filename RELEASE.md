# 🚀 Guia de Release - Pomodoro Focus

Este documento descreve o processo automatizado de criação de releases para o Pomodoro Focus.

## 📋 Visão Geral

O projeto utiliza GitHub Actions para automatizar completamente o processo de build e publicação de releases. Quando uma nova tag de versão é criada, o workflow automaticamente:

1. Cria uma release no GitHub
2. Compila executáveis para Windows, Linux e macOS
3. Publica os executáveis na release
4. Gera release notes automáticas

## 🏷️ Criando uma Nova Release

### Método 1: Via Tag Git (Recomendado)

```bash
# 1. Certifique-se de que está na branch main atualizada
git checkout main
git pull origin main

# 2. Atualize a versão no package.json (se necessário)
# Edite manualmente ou use npm version
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# 3. Crie e publique a tag
git tag v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 4. Aguarde o workflow completar (~15-20 minutos)
# Acompanhe em: https://github.com/ricardopera/pomodoro-focus/actions
```

### Método 2: Via GitHub Actions (Manual)

1. Vá para: https://github.com/ricardopera/pomodoro-focus/actions/workflows/release.yml
2. Clique em "Run workflow"
3. Digite a versão desejada (ex: `v1.0.0`)
4. Clique em "Run workflow"

## 📦 Artefatos Gerados

Cada release inclui os seguintes executáveis:

### Windows
- **Pomodoro Focus Setup v1.0.0.exe** (~80-100 MB)
  - Instalador NSIS com wizard de instalação
  - Cria atalhos no Desktop e Menu Iniciar
  - Inclui desinstalador
  
- **PomodoroFocus-Portable-v1.0.0.exe** (~80-100 MB)
  - Versão portátil (não requer instalação)
  - Ideal para uso em USB ou pastas compartilhadas

### Linux
- **Pomodoro Focus-v1.0.0.AppImage** (~100-120 MB)
  - Formato universal que funciona em todas as distros
  - Requer `chmod +x` antes de executar
  
- **pomodoro-focus_v1.0.0_amd64.deb** (~80-100 MB)
  - Pacote Debian/Ubuntu
  - Instalável com `dpkg -i`

### macOS
- **Pomodoro Focus-v1.0.0.dmg** (~90-110 MB)
  - Instalador DMG padrão do macOS
  - Arraste para Applications
  
- **Pomodoro Focus-v1.0.0-mac.zip** (~85-100 MB)
  - Arquivo ZIP alternativo

## 🔄 Workflow Automático

O workflow é acionado quando:
- Uma tag com formato `v*.*.*` é criada (ex: `v1.0.0`, `v2.1.3`)
- Manualmente via GitHub Actions UI

### Etapas do Workflow

1. **create-release**: Cria a release no GitHub com release notes
2. **build-windows**: Compila executáveis para Windows (runs-on: windows-latest)
3. **build-linux**: Compila executáveis para Linux (runs-on: ubuntu-latest)
4. **build-macos**: Compila executáveis para macOS (runs-on: macos-latest)

Todos os builds executam em paralelo para maior eficiência.

### Tempo de Execução

- **Total**: ~15-20 minutos
- **Windows**: ~8-10 minutos
- **Linux**: ~6-8 minutos
- **macOS**: ~8-10 minutos

## 📝 Versionamento

O projeto segue [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Mudanças incompatíveis com versões anteriores
- **MINOR** (1.x.0): Novas funcionalidades compatíveis
- **PATCH** (1.0.x): Correções de bugs

### Exemplos

```bash
# Correção de bug: 1.0.0 → 1.0.1
npm version patch
git push origin v1.0.1

# Nova funcionalidade: 1.0.1 → 1.1.0
npm version minor
git push origin v1.1.0

# Mudança breaking: 1.1.0 → 2.0.0
npm version major
git push origin v2.0.0
```

## ✅ Checklist de Release

Antes de criar uma release:

- [ ] Todas as mudanças estão commitadas e na branch `main`
- [ ] Testes estão passando (`npm test`)
- [ ] Build local funciona (`npm run build:prod`)
- [ ] Versão atualizada no `package.json`
- [ ] `CHANGELOG.md` atualizado (se existir)
- [ ] Documentação atualizada
- [ ] Screenshots/demos atualizados (se aplicável)

## 🐛 Troubleshooting

### Workflow falhou

1. Verifique os logs em: https://github.com/ricardopera/pomodoro-focus/actions
2. Problemas comuns:
   - **Dependências**: Execute `npm ci` localmente para verificar
   - **Build falhou**: Execute `npm run dist:win/linux/mac` localmente
   - **Upload falhou**: Verifique se os arquivos existem em `release/`

### Release criada mas sem artefatos

1. Verifique se o workflow completou todos os jobs
2. Os artefatos são adicionados após os builds completarem
3. Aguarde todos os jobs finalizarem (ícone verde ✓)

### Corrigir uma release com problemas

```bash
# 1. Delete a release e tag no GitHub (via UI)

# 2. Delete a tag local
git tag -d v1.0.0

# 3. Delete a tag remota
git push origin :refs/tags/v1.0.0

# 4. Corrija os problemas e crie nova tag
git tag v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## 🔒 Segurança

- O workflow usa `GITHUB_TOKEN` automático (não requer configuração)
- Executáveis **não são assinados** digitalmente (code signing)
- Para production, considere:
  - Windows: Certificado de code signing (~$300/ano)
  - macOS: Apple Developer Account + notarização ($99/ano)

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [electron-builder Publishing](https://www.electron.build/configuration/publish)
- [Semantic Versioning](https://semver.org/)
- [Creating Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)

## 🎯 Exemplo Completo

```bash
# Workflow completo para release v1.0.0

# 1. Atualizar código
git checkout main
git pull origin main

# 2. Fazer mudanças necessárias
# ... editar arquivos ...

# 3. Commit
git add .
git commit -m "feat: Add new feature"
git push origin main

# 4. Atualizar versão
npm version minor  # 1.0.0 → 1.1.0

# 5. Criar tag e push
git push origin main
git push origin v1.1.0

# 6. Acompanhar workflow
# https://github.com/ricardopera/pomodoro-focus/actions

# 7. Verificar release
# https://github.com/ricardopera/pomodoro-focus/releases
```

## 🎉 Após a Release

1. **Anuncie**: Compartilhe a release nas redes sociais
2. **Monitore**: Acompanhe issues e feedback dos usuários
3. **Atualize README**: Adicione link para a release mais recente
4. **Celebre**: Você acabou de publicar uma nova versão! 🎊

---

**Última atualização**: 2025-10-04
**Versão do documento**: 1.0.0
