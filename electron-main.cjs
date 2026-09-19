// Minimal Electron main for KAYOR — to build native wrapper around Vite build
const { app, BrowserWindow } = require('electron')
const path = require('path')
function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs') }
  })
  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL)
  else win.loadFile(path.join(__dirname, 'dist/index.html'))
}
app.whenReady().then(createWindow)
