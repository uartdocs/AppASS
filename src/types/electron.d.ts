// Definições de tipos para o Electron
export interface ElectronAPI {
  onMenuAction: (callback: (action: string) => void) => void;
  onLoadData: (callback: (data: string, filename: string) => void) => void;
  onSaveData: (callback: (filePath: string) => void) => void;
  removeAllListeners: (channel: string) => void;
  platform: string;
  getVersion: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}