const { contextBridge } = require('electron');
const remoteMain = require('@electron/remote/main');
const { app, dialog } = require('@electron/remote');

const path = require('path');

contextBridge.exposeInMainWorld('csoundBridge', {
    send: (msg) => ipcRenderer.send('csound-message', msg)
});

// Expose hand tracking IPC events to renderer
contextBridge.exposeInMainWorld('handTrackingBridge', {
    onHandTrackingData: (callback) => ipcRenderer.on('hand-tracking-data', callback)
});

contextBridge.exposeInMainWorld('electronAPI', {
    path,
    app
});