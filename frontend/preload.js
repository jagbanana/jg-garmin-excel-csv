const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  syncData: (data) => ipcRenderer.invoke('sync-data', data),
  getStoredCredentials: () => ipcRenderer.invoke('get-credentials'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  saveCredentials: (credentials) => ipcRenderer.invoke('save-credentials', credentials)
});