# Sistema de Aulas Demonstrativas - Aplicativo Windows

Sistema completo para gerenciamento de aulas demonstrativas, agora disponível como aplicativo desktop para Windows.

## 🚀 Funcionalidades

- **Interface Desktop Nativa**: Aplicativo Windows com menus nativos
- **Gerenciamento de Aulas**: Cadastro e controle de aulas demonstrativas
- **Sistema de Professores**: Atribuição e alteração de professores
- **Controle de Matrículas**: Matricular e desmatricular alunos
- **Estatísticas em Tempo Real**: Acompanhamento de métricas importantes
- **Importação/Exportação**: Carregar e salvar dados em JSON
- **Atalhos de Teclado**: Produtividade com shortcuts

## 🛠️ Como Executar

### Modo Desenvolvimento
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento (Electron + Vite)
npm run electron-dev
```

### Modo Produção
```bash
# Construir a aplicação
npm run build

# Executar o Electron
npm run electron
```

### Gerar Instalador Windows
```bash
# Gerar instalador .exe para Windows
npm run dist
```

## ⌨️ Atalhos de Teclado

- `Ctrl+N` - Novo registro (foca no formulário)
- `Ctrl+O` - Carregar arquivo de dados
- `Ctrl+S` - Salvar dados
- `Ctrl+E` - Exportar para Excel
- `F5` - Sincronizar dados
- `Ctrl+Q` - Sair da aplicação

## 📁 Estrutura do Projeto

```
├── src/                 # Código da aplicação React
├── electron/           # Código do Electron
│   ├── main.js         # Processo principal
│   ├── preload.js      # Script de preload
│   └── assets/         # Ícones da aplicação
├── dist/               # Build da aplicação web
└── dist-electron/      # Instalador Windows gerado
```

## 🎯 Recursos do Aplicativo Desktop

- **Menu Nativo**: Menu completo com todas as funcionalidades
- **Diálogos Nativos**: Abrir/salvar arquivos com interface Windows
- **Ícone Personalizado**: Ícone próprio na barra de tarefas
- **Instalador**: Geração automática de instalador .exe
- **Auto-atualização**: Preparado para sistema de updates

## 📋 Requisitos do Sistema

- Windows 7 ou superior
- 4GB RAM mínimo
- 100MB espaço em disco

## 🔧 Personalização

Para personalizar o aplicativo:

1. **Ícones**: Substitua os arquivos em `electron/assets/`
2. **Nome**: Altere `productName` no `package.json`
3. **Configurações**: Modifique `electron/main.js`

## 📦 Distribuição

O comando `npm run dist` gera:
- Instalador NSIS (.exe)
- Arquivos portáveis
- Atalhos automáticos no desktop e menu iniciar