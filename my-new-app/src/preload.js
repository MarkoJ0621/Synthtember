const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('csoundBridge', {
    send: (msg) => ipcRenderer.send('csound-message', msg)
});

// Expose hand tracking IPC events to renderer
contextBridge.exposeInMainWorld('handTrackingBridge', {
    onHandTrackingData: (callback) => ipcRenderer.on('hand-tracking-data', callback)
});
