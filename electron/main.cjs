// KAYOR Browser — Electron main (Chromium native)
const { app, BrowserWindow, nativeImage, shell, Menu, session } = require('electron')
const path = require('path')

const isDev = !!process.env.VITE_DEV_SERVER_URL

function createWindow() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../public/kayorbrowse.png'))
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#0a0a0f',
    title: 'KAYOR Browser',
    icon,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0a0a0f', symbolColor: '#ffffff', height: 36 },
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,           // для <webview> — настоящий движок
      sandbox: false,
    }
  })

  // Блокировка рекламы — простой пример (в проде подключить EasyList)
  session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    const block = ['doubleclick.net','googlesyndication.com','yandexadexchange.net']
    if (block.some(b => details.url.includes(b))) return cb({ cancel: true })
    cb({})
  })

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Внешние ссылки — в системный браузер
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('kayor://') || url.startsWith('file://')) return { action: 'allow' }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Меню
  const menu = Menu.buildFromTemplate([
    { role: 'fileMenu', submenu: [{ role: 'quit', label: 'Выход' }] },
    { role: 'editMenu' },
    { role: 'viewMenu', submenu: [
      { role: 'reload', label: 'Перезагрузить' },
      { role: 'toggleDevTools', label: 'DevTools' },
      { type: 'separator' },
      { role: 'resetZoom', label: 'Масштаб 100%' },
      { role: 'zoomIn', label: 'Увеличить' },
      { role: 'zoomOut', label: 'Уменьшить' },
      { role: 'togglefullscreen', label: 'Полный экран' },
    ]},
    { role: 'windowMenu' },
    { label: 'KAYOR', submenu: [
      { label: 'О KAYOR', click: () => win.webContents.send('open-settings') },
      { type: 'separator' },
      { label: 'github.com/kayorissss/KAYOR-BROWSER', click: () => shell.openExternal('https://github.com/kayorissss/KAYOR-BROWSER') },
    ]}
  ])
  Menu.setApplicationMenu(menu)

  // Закрытие
  win.on('closed', () => app.quit())
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

// Протокол kayor://
app.setAsDefaultProtocolClient('kayor')
