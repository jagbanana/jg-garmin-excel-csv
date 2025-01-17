const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const axios = require('axios');
const BackendLauncher = require('../launcher');  

const store = new Store();
const backend = new BackendLauncher();

function createWindow() {
  backend.start();

  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a1a'
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  
  // Open DevTools in development
  if (process.argv.includes('--debug')) {
    win.webContents.openDevTools();
  }

  return win;
}

// Handle app startup
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handle app shutdown
app.on('before-quit', () => {
  backend.stop();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    backend.stop();
    app.quit();
  }
});

// IPC handlers for backend communication
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

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: app.getPath('documents')
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('sync-data', async (event, data) => {
  try {
    console.log('Sending data to backend:', data); // Debug log
    
    const response = await axios.post('http://127.0.0.1:8000/sync', {
      email: data.email,
      password: data.password,
      start_date: data.startDate.split('T')[0], // Ensure date format is YYYY-MM-DD
      end_date: data.endDate.split('T')[0],
      output_dir: data.outputDir || app.getPath('documents')
    });
    return response.data;
  } catch (error) {
    console.error('Full error:', error); // Debug log
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to backend server. Is it running?');
    }
    
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.detail || [];
      const errorMessage = Array.isArray(validationErrors) 
        ? validationErrors.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n')
        : 'Invalid data format';
      throw new Error(errorMessage);
    }

    // Add more specific error handling
    if (error.response?.status === 401) {
      throw new Error('Invalid Garmin credentials. Please check your email and password.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Please check your Garmin account permissions.');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a few minutes and try again.');
    }
    
    throw new Error(error.response?.data?.detail || 'An unexpected error occurred. Please try again.');
  }
});