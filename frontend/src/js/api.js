const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
require('@electron/remote/main').initialize();

const store = new Store();

// ... existing createWindow code ...

// IPC handlers
ipcMain.handle('sync-data', async (event, data) => {
  try {
    const apiClient = new ApiClient();
    return await apiClient.syncData(data);
  } catch (error) {
    console.error('Sync error:', error);
    return {
      success: false,
      error: error.message || 'Sync failed'
    };
  }
});

ipcMain.handle('get-credentials', async () => {
  return {
    email: store.get('email'),
    password: store.get('password')
  };
});

ipcMain.handle('save-credentials', async (event, credentials) => {
  store.set('email', credentials.email);
  store.set('password', credentials.password);
  return true;
});