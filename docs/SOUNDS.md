# 🔊 Sistema de Sons - Pomodoro Focus

## Sons Incluídos

### 1. **complete.wav** - Som de Conclusão
- **Uso**: Tocado quando um timer (foco ou pausa) é concluído
- **Descrição**: Dois tons harmoniosos (800Hz → 1000Hz)
- **Duração**: ~400ms
- **Volume**: Moderado (30%)

### 2. **tick.wav** - Som de Tick (Opcional)
- **Uso**: Pode ser usado para feedback de cada segundo (não implementado por padrão)
- **Descrição**: Tom curto e discreto (440Hz - Lá)
- **Duração**: 50ms
- **Volume**: Baixo (10%)

## Como os Sons Funcionam

1. **Notificações do Sistema**:
   - Quando `soundEnabled: true` nas configurações
   - O Electron usa a API de Notificações nativa do OS
   - O sistema operacional reproduz o som (ou usa o som padrão do sistema)

2. **Som Customizado**:
   - Os arquivos WAV estão em `public/sounds/`
   - O caminho é passado para a Notification API
   - Alguns sistemas operacionais suportam sons customizados, outros usam o padrão

## Controle de Som

Os sons podem ser ativados/desativados na aba **Configurações**:

- ✅ **Sons Habilitados**: Reproduz `complete.wav` ao terminar timer
- ❌ **Sons Desabilitados**: Notificação silenciosa (apenas visual)

## Geração de Sons

Os sons são gerados programaticamente usando:

```bash
npm run generate:sounds
# ou
node scripts/generate-sounds.js
```

Este script cria arquivos WAV com ondas senoidais puras.

## Formato dos Arquivos

- **Formato**: WAV (PCM não comprimido)
- **Sample Rate**: 44.1 kHz
- **Bit Depth**: 16-bit
- **Canais**: Mono (1 canal)
- **Tamanho**: ~40-80 KB por arquivo

## Personalizando Sons

Para usar seus próprios sons:

1. Substitua os arquivos em `public/sounds/`
2. Mantenha os nomes: `complete.wav`, `tick.wav`
3. Use formato WAV, MP3 ou OGG
4. Recompile o app: `npm run build`

## Sons Futuros (Planejados)

- ⏰ **start.wav** - Som ao iniciar timer
- ⏸️ **pause.wav** - Som ao pausar
- 🔄 **resume.wav** - Som ao retomar
- ⚠️ **warning.wav** - Som de aviso (1 minuto restante)

## Notas Técnicas

- Sons são embedados no build da aplicação
- Não requerem conexão com internet
- Compatível com Windows, macOS e Linux
- Respeitam as configurações de volume do sistema

## Troubleshooting

**Som não toca no Windows:**
- Verifique se notificações estão habilitadas para o app
- Verifique configurações de som do sistema
- Tente com `soundEnabled: true` nas configurações

**Som não toca no macOS:**
- Permissões de notificação devem estar habilitadas
- Sistema > Preferências > Notificações > Pomodoro Focus

**Som não toca no Linux:**
- Verifique se `libnotify` está instalado
- Teste com: `notify-send -u normal "Test" "Sound test"`
