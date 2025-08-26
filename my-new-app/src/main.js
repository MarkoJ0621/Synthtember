const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('node:path');
const { spawn, fork } = require('child_process');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let csoundProcess;
let trackingProcess;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 3024,
    height: 1964,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, // Make sure this is set correctly by your bundler
      nodeIntegration: false,
      contextIsolation: true, // Important for contextBridge in preload
      webSecurity: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  // Setup Content Security Policy header
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = "script-src 'self' 'unsafe-eval' 'unsafe-inline' data: https://cdn.jsdelivr.net;";
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      }
    });
  });

  // Spawn the Csound child process
  const csdPath = path.join(app.getAppPath(), 'src', 'audio.csd');
  csoundProcess = spawn('csound', ['-odac13', '-L', 'stdin', csdPath]);

  csoundProcess.stdout.on('data', (data) => {
    console.log(`Csound: ${data.toString()}`);
  });

  csoundProcess.stderr.on('data', (data) => {
    console.error(`Csound error: ${data.toString()}`);
  });

  // Listen for messages from renderer to send to csound
  ipcMain.on('csound-message', (event, message) => {
    if (csoundProcess && csoundProcess.stdin.writable) {
      csoundProcess.stdin.write(message + '\n');
    }
  });
});

// Cleanup child processes on quit
app.on('before-quit', () => {
  if (trackingProcess) trackingProcess.kill();
  if (csoundProcess) csoundProcess.kill();
});

// Quit app when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
