# Build e distribuição

## Pré-requisitos

- Node.js 20 ou superior
- Windows 10/11 para gerar os binários do Windows (o electron-builder empacota
  para a plataforma em que roda; instalador NSIS exige Windows)
- `npm install` na raiz do projeto

## Compilar

```bash
npm run build          # processo principal + preload (esbuild) e interface (Vite)
npm run build:prod     # gera os ícones antes de compilar
```

Saída:

```
dist/main/index.cjs        processo principal
dist/preload/index.cjs     ponte de contexto isolado
dist/renderer/             interface compilada (HTML/CSS/JS)
```

## Ícones

Os ícones nascem de dois SVGs versionados em `public/icons/`:

```bash
npm run icons
```

Isso rasteriza (com `sharp`) e grava:

- `public/icons/app-icon.png` — ícone da janela e das notificações
- `public/icons/tray-icon.png` — glifo da bandeja (32 px)
- `build/icon.ico` — ícone do Windows (16 a 256 px em um único arquivo)
- `build/icon.png` e `build/<tamanho>x<tamanho>/icon.png` — macOS e Linux

Para mudar a identidade visual, edite os SVGs e rode o script de novo.

## Gerar os executáveis

```bash
npm run dist:win       # Windows: instalador NSIS + portátil
npm run dist:linux     # Linux: AppImage
npm run pack           # apenas descompactado, para testar (release/win-unpacked)
```

Os artefatos ficam em `release/`:

- `PomodoroFocus-Setup-<versão>.exe` — instalador por usuário, com opção de
  escolher a pasta e atalhos no menu Iniciar e na área de trabalho.
- `PomodoroFocus-Portable-<versão>.exe` — executável único, sem instalação.

## Assinatura de código

Os builds saem **sem assinatura** (`signAndEditExecutable: false`). Isso faz o
SmartScreen exibir um aviso na primeira execução. Para assinar, defina as
variáveis de ambiente do electron-builder antes de `npm run dist:win`:

```powershell
$env:CSC_LINK = "caminho\para\certificado.pfx"
$env:CSC_KEY_PASSWORD = "senha"
npm run dist:win
```

## Publicação automática

O workflow `.github/workflows/release.yml` roda a cada tag `v*.*.*`:

1. compila no `windows-latest` com `npm run dist:win`;
2. sobe os `.exe` como artefatos;
3. cria a release no GitHub com esses arquivos.

Para publicar uma versão nova:

```bash
npm version minor      # atualiza package.json e cria a tag
git push --follow-tags
```

A versão exibida na tela de Ajustes vem do `package.json` — o Vite injeta o valor
em tempo de build (`__APP_VERSION__`), então não há número duplicado para manter.

## Problemas comuns

**`sharp` falha na instalação.** Rode `npm install --include=optional sharp` ou
apague `node_modules` e instale de novo; ele baixa binários pré-compilados por
plataforma.

**A janela abre em branco.** Confirme que `dist/renderer/index.html` existe
(`npm run build:renderer`). Em desenvolvimento, o app carrega
`ELECTRON_RENDERER_URL`, definido automaticamente por `npm run dev`.

**O ícone da bandeja não aparece no Linux.** Vários ambientes precisam de
`libappindicator`/extensão de área de notificação; no Windows não há nada a fazer.

**O antivírus reclama do portátil.** É consequência do executável não assinado:
veja a seção de assinatura acima.
