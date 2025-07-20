// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

//allows for csound communication with the renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('csoundBridge', {
    send: (msg) => ipcRenderer.send('csound-message', msg)
});

