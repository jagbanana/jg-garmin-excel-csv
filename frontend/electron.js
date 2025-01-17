const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const axios = require('axios');

const store = new Store();

function createWindow() {
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
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
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
      output_dir: app.getPath('documents')
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
    
    throw new Error(error.response?.data?.detail || error.message);
  }
});