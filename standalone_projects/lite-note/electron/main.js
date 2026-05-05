const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 开发环境加载 localhost，生产环境加载打包文件
  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  mainWindow.loadURL(startUrl);

  // 打开开发工具
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 监听：保存文件
ipcMain.handle('save-file', async (event, { content }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });

  if (canceled || !filePath) {
    return { success: false };
  }

  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC 监听：读取文件
ipcMain.handle('open-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });

  if (canceled || filePaths.length === 0) {
    return { canceled: true };
  }

  try {
    const content = fs.readFileSync(filePaths[0], 'utf-8');
    return { canceled: false, filePath: filePaths[0], content };
  } catch (error) {
    return { error: error.message };
  }
});
