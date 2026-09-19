const { contextBridge } = require('electron')
contextBridge.exposeInMainWorld('kayor', { version: '1.0.0' })
