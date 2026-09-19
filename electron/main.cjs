// KAYOR Browser — Electron main (Chromium native)
const { app, BrowserWindow, nativeImage, shell, Menu, session } = require('electron')
const path = require('path')

const isDev = !!process.env.VITE_DEV_SERVER_URL

function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, '../public/kayorbrowse.png')
    : path.join(__dirname, '../public/kayorbrowse.png') // inside asar, also works
  const icon = nativeImage.createFromPath(iconPath)

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
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false,
    }
  })

  // Показать и развернуть после готовности — как обычный браузер (не F11, а maximized)
  win.once('ready-to-show', () => {
    win.maximize()
    win.show()
  })

  // Блокировка рекламы (простой)
  session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    const block = ['doubleclick.net','googlesyndication.com','yandexadexchange.net']
    if (block.some(b => details.url.includes(b))) return cb({ cancel: true })
    cb({})
  })

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    // В packaged app dist лежит внутри asar: app.asar/dist/index.html
    // Используем app.getAppPath() чтобы корректно найти путь и для base:'./'
    const indexPath = path.join(app.getAppPath(), 'dist/index.html')
    win.loadFile(indexPath).catch(() => {
      // fallback для старого пути
      win.loadFile(path.join(__dirname, '../dist/index.html'))
    })
    // Открыть DevTools только если черный экран — для отладки, закомментируй в проде
    // win.webContents.openDevTools({ mode: 'detach' })
    win.webContents.on('did-fail-load', (_e, code, desc, url) => {
      console.error('did-fail-load', code, desc, url)
    })
  }

  // Внешние ссылки — в системный браузер
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

  win.on('closed', () => app.quit())
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

if (!isDev) app.setAsDefaultProtocolClient('kayor')
