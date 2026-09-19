// KAYOR Browser — Electron main (Chromium native)
const { app, BrowserWindow, nativeImage, shell, Menu, session, ipcMain } = require('electron')
const path = require('path')

const isDev = !!process.env.VITE_DEV_SERVER_URL
let mainWin = null

function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, '../public/kayorbrowse.png')
    : path.join(__dirname, '../public/kayorbrowse.png')
  const icon = nativeImage.createFromPath(iconPath)

  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#0a0a0f',
    title: 'KAYOR Browser',
    icon,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false,
    }
  })
  mainWin = win

  win.once('ready-to-show', () => {
    win.maximize()
    win.show()
  })

  session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    const block = ['doubleclick.net','googlesyndication.com','yandexadexchange.net']
    if (block.some(b => details.url.includes(b))) return cb({ cancel: true })
    cb({})
  })

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist/index.html')
    win.loadFile(indexPath).catch(() => {
      win.loadFile(path.join(__dirname, '../dist/index.html'))
    })
    win.webContents.on('did-fail-load', (_e, code, desc, url) => {
      console.error('did-fail-load', code, desc, url)
    })
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('kayor://') || url.startsWith('file://')) return { action: 'allow' }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const menu = Menu.buildFromTemplate([
    { role: 'fileMenu', submenu: [{ role: 'quit', label: 'Выход' }] },
    { role: 'editMenu' },
    { role: 'viewMenu', submenu: [
      { role: 'reload', label: 'Перезагрузить' },
      { role: 'toggleDevTools', label: 'DevTools (F12)' },
      { type: 'separator' },
      { role: 'resetZoom', label: 'Масштаб 100%' },
      { role: 'zoomIn', label: 'Увеличить' },
      { role: 'zoomOut', label: 'Уменьшить' },
      { role: 'togglefullscreen', label: 'Полный экран (F11)' },
    ]},
    { role: 'windowMenu' },
    { label: 'KAYOR', submenu: [
      { label: 'О KAYOR', click: () => win.webContents.send('open-settings') },
      { type: 'separator' },
      { label: 'github.com/kayorissss/KAYOR-BROWSER', click: () => shell.openExternal('https://github.com/kayorissss/KAYOR-BROWSER') },
    ]}
  ])
  Menu.setApplicationMenu(menu)

  win.on('closed', () => { mainWin=null; app.quit() })
}

ipcMain.handle('window-control', (_e, action)=>{
  const win = mainWin || BrowserWindow.getFocusedWindow()
  if(!win) return
  if(action==='minimize') win.minimize()
  else if(action==='maximize'){ if(win.isMaximized()) win.unmaximize(); else win.maximize() }
  else if(action==='close') win.close()
})

ipcMain.handle('open-external', (_e, url)=> shell.openExternal(url))

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

if (!isDev) app.setAsDefaultProtocolClient('kayor')
