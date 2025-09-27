const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Manter referência global da janela
let mainWindow;

function createWindow() {
  // Criar a janela principal
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'icon.png'), // Ícone da aplicação
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false // Não mostrar até estar pronto
  });

  // Carregar a aplicação
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Abrir DevTools em desenvolvimento
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focar na janela
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Emitir evento quando a janela for fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Interceptar links externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Criar menu da aplicação
function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Novo Registro',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Enviar evento para a aplicação web
            mainWindow.webContents.send('menu-action', 'new-record');
          }
        },
        { type: 'separator' },
        {
          label: 'Carregar Dados',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'CSV Files', extensions: ['csv'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              try {
                const data = fs.readFileSync(filePath, 'utf8');
                mainWindow.webContents.send('load-data', data, path.basename(filePath));
              } catch (error) {
                dialog.showErrorBox('Erro', `Não foi possível carregar o arquivo: ${error.message}`);
              }
            }
          }
        },
        {
          label: 'Salvar Dados',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              defaultPath: 'dados-sistema-demonstracao.json',
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled) {
              mainWindow.webContents.send('save-data', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectall', label: 'Selecionar Tudo' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarga' },
        { role: 'toggleDevTools', label: 'Ferramentas do Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' }
      ]
    },
    {
      label: 'Ferramentas',
      submenu: [
        {
          label: 'Sincronizar Dados',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.send('menu-action', 'sync');
          }
        },
        {
          label: 'Exportar Excel',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-action', 'export-excel');
          }
        },
        { type: 'separator' },
        {
          label: 'Limpar Todos os Dados',
          click: async () => {
            const response = await dialog.showMessageBox(mainWindow, {
              type: 'warning',
              buttons: ['Cancelar', 'Limpar Tudo'],
              defaultId: 0,
              title: 'Confirmar Limpeza',
              message: 'Tem certeza que deseja limpar todos os dados?',
              detail: 'Esta ação não pode ser desfeita.'
            });

            if (response.response === 1) {
              mainWindow.webContents.send('menu-action', 'clear-all');
            }
          }
        }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre',
              message: 'Sistema de Aulas Demonstrativas',
              detail: 'Versão 1.0.0\n\nSistema para gerenciamento de aulas demonstrativas com arquivo único compartilhado na rede.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Este método será chamado quando o Electron terminar de inicializar
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    // No macOS, recriar janela quando o ícone do dock for clicado
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Sair quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  // No macOS, aplicações ficam ativas até que o usuário saia explicitamente
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Configurações de segurança
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});