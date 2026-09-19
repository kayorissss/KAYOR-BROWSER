const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('kayor', {
  version: '1.0.0',
  platform: process.platform,
  isElectron: true,
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
  minimize: () => ipcRenderer.invoke('window-control', 'minimize'),
  maximize: () => ipcRenderer.invoke('window-control', 'maximize'),
  close: () => ipcRenderer.invoke('window-control', 'close'),
  setDefaultBrowser: () => ipcRenderer.invoke('set-default-browser'),
  clearData: (type) => ipcRenderer.invoke('clear-data', type),
})
