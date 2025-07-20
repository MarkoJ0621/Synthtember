const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { session } = require('electron');
const { spawn } = require('child_process');
const { ipcMain } = require('electron');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
let csoundProcess = null;
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 3024,
    height: 1964,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, //absolute path
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Setup CSP header
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = "script-src 'self' 'unsafe-eval' 'unsafe-inline' data: https://cdn.jsdelivr.net;";
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      }
    });
  });

  // Spawn csound process
  const csdPath = path.join(app.getAppPath(), 'src', 'audio.csd');
  const csoundProcess = spawn('csound', ['-odac13', '-L', 'stdin', csdPath]);

  csoundProcess.stdout.on('data', (data) => {
    console.log(`Csound: ${data.toString()}`);
  });

  csoundProcess.stderr.on('data', (data) => {
    console.error(`Csound error: ${data.toString()}`);
  });

  ipcMain.on('csound-message', (event, message) => {
    console.log("Received message for Csound:", message);
    if (csoundProcess && csoundProcess.stdin.writable) {
      console.log()
      csoundProcess.stdin.write(message + '\n');
    }
  });
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
