<!--
Sync Impact Report:
- Version change: Initial → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections: All core principles (5), Desenvolvimento e Contribuições, Governança
- Removed sections: N/A
- Templates requiring updates:
  ✅ plan-template.md (reviewed - compatible)
  ✅ spec-template.md (reviewed - compatible)
  ✅ tasks-template.md (reviewed - compatible)
- Follow-up TODOs: None
-->

# Pomodoro Focus Constitution

## Missão

Criar um aplicativo Pomodoro desktop simples, eficaz e respeitoso com a atenção do
usuário — ajudando a reduzir distrações e promover foco sustentável.

## Princípios Fundamentais

### I. Minimalismo Funcional

A interface DEVE ser limpa e sem excesso de opções. Cada elemento visual e cada
configuração DEVE ter justificativa clara de valor para o usuário. Funcionalidades
"boas de ter" que não contribuem diretamente para foco e produtividade DEVEM ser
rejeitadas.

**Rationale**: O excesso de opções e elementos visuais compete pela atenção do
usuário, contradizendo o propósito central do aplicativo. Simplicidade reduz
carga cognitiva e acelera a adoção.

### II. Respeito à Atenção

Nada no aplicativo DEVE distrair o usuário; tudo DEVE proteger o foco. Notificações,
animações, e elementos visuais DEVEM ser discretos e orientados ao contexto do
Pomodoro. O aplicativo NÃO DEVE introduzir novas distrações enquanto tenta
eliminar outras.

**Rationale**: Um aplicativo de foco que distrai é contraditório. Toda decisão de
design deve passar pelo filtro: "isto ajuda ou atrapalha a concentração?".

### III. Privacidade por Padrão

Nenhum dado pessoal ou de uso DEVE deixar a máquina do usuário, exceto se o usuário
explicitamente optar por sincronização ou compartilhamento. Funcionalidades de
coleta de dados (analytics, telemetria) DEVEM ser opt-in, não opt-out. Dados
locais DEVEM usar criptografia quando sensíveis.

**Rationale**: Privacidade é um direito fundamental. Usuários devem ter controle
total sobre seus dados de produtividade e hábitos de trabalho.

### IV. Multiplataforma e Offline-First

O aplicativo DEVE funcionar em Windows, macOS e Linux com paridade de
funcionalidades. Toda funcionalidade central DEVE operar sem conexão à internet.
Sincronização entre dispositivos, se implementada, DEVE ser opcional e não
bloquear uso offline.

**Rationale**: Produtividade não deve depender de conexão internet. Usuários de
diferentes plataformas merecem a mesma experiência.

### V. Código Aberto e Acessível

O código-fonte DEVE permanecer aberto (licença MIT ou similar). A documentação
DEVE ser clara o suficiente para permitir contribuições externas. Qualquer pessoa
DEVE poder auditar, modificar e redistribuir o software. Acessibilidade (WCAG 2.1 AA)
DEVE ser prioridade em todas as interfaces.

**Rationale**: Transparência e auditabilidade são essenciais para software que
gerencia tempo e atenção. Acessibilidade é inclusão.

## Desenvolvimento e Contribuições

### Requisitos Técnicos

- **Testes obrigatórios**: Toda funcionalidade DEVE ter testes automatizados antes
  da implementação (TDD preferencial).
- **Documentação**: Mudanças significativas DEVEM incluir atualização de docs.
- **Revisão de código**: PRs DEVEM ser revisados quanto a alinhamento com os
  princípios constitucionais.

### Fluxo de Contribuição

1. Discussão de funcionalidade via issue antes de implementação significativa
2. Criação de spec alinhada com os princípios
3. Implementação com testes
4. PR com descrição clara e referência ao spec/issue
5. Revisão focada em: testes, alinhamento constitucional, qualidade de código

## Governança

### Mantenedores

- **Mantenedor inicial**: @ricardopera
- **Modelo de decisão**: Consenso em issues/PRs para decisões técnicas
- **Escalação**: Mantenedor inicial tem voto de desempate em caso de impasse

### Versionamento

- **Esquema**: SemVer (MAJOR.MINOR.PATCH)
- **MAJOR**: Mudanças incompatíveis com versões anteriores (quebra de API, migração de dados)
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs e melhorias sem impacto em funcionalidade

### Emendas à Constituição

Alterações neste documento requerem:

1. Issue propondo a mudança com justificativa
2. Discussão aberta por no mínimo 7 dias
3. Aprovação do mantenedor inicial
4. Atualização de documentação dependente (templates, specs)
5. Bump de versão seguindo SemVer para constituições:
   - MAJOR: Remoção ou redefinição incompatível de princípios
   - MINOR: Adição de novos princípios ou expansão de seções
   - PATCH: Clarificações e correções de redação

### Revisão de Conformidade

- Toda PR DEVE ser verificada quanto à conformidade com estes princípios
- Violações DEVEM ser justificadas e documentadas
- Complexidade acidental DEVE ser questionada e simplificada

**Version**: 1.0.0 | **Ratified**: 2025-10-03 | **Last Amended**: 2025-10-03
