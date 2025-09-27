const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Receber eventos do menu
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },

  // Carregar dados de arquivo
  onLoadData: (callback) => {
    ipcRenderer.on('load-data', (event, data, filename) => callback(data, filename));
  },

  // Salvar dados em arquivo
  onSaveData: (callback) => {
    ipcRenderer.on('save-data', (event, filePath) => callback(filePath));
  },

  // Remover listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Informações do sistema
  platform: process.platform,
  
  // Versão da aplicação
  getVersion: () => {
    return process.env.npm_package_version || '1.0.0';
  }
});