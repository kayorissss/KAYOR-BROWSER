const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('kayor', {
  version: '1.0.0',
  platform: process.platform,
  isElectron: true,
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
})
