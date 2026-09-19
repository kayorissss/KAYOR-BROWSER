// KAYOR Browser — Electron main (Chromium native)
const { app, BrowserWindow, nativeImage, shell, Menu, session, ipcMain, Tray } = require('electron')
const path = require('path')

// Performance: легкие флаги для экономии памяти
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('enable-features', 'BackForwardCache:TimeToLiveInBackForwardCacheInSeconds/300')

const isDev = !!process.env.VITE_DEV_SERVER_URL
let mainWin = null
let tray = null

function createWindow() {
  const iconPath = path.join(__dirname, '../public/kayorbrowse.png')
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
      backgroundThrottling: false,
    }
  })
  mainWin = win

  // Tray — чтоб крестик не закрывал, а сворачивал (п.19.3)
  try{
    tray = new Tray(icon.resize({width:16,height:16}))
    const ctx = Menu.buildFromTemplate([
      { label:'Показать KAYOR', click:()=> win.show() },
      { label:'Новая вкладка', click:()=> win.webContents.send('new-tab') },
      { type:'separator'},
      { label:'Выход', click:()=>{ app.isQuiting=true; app.quit() }},
    ])
    tray.setToolTip('KAYOR Browser')
    tray.setContextMenu(ctx)
    tray.on('double-click', ()=> win.show())
    tray.on('click', ()=> win.show())
  }catch(e){ console.error('tray',e) }

  win.once('ready-to-show', () => {
    win.maximize()
    win.show()
    // убрать splash быстрее
    win.webContents.send('app-ready')
  })

  // Легкий блокировщик + экономия: чистим кэш при нехватке
  session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    const block = ['doubleclick.net','googlesyndication.com','yandexadexchange.net','googletagmanager.com']
    if (block.some(b => details.url.includes(b))) return cb({ cancel: true })
    cb({})
  })

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools({ mode: 'detach' })
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
    // не открывать внешне для ya.ru/search и тд — пусть webview обработает, поэтому deny + external только для явно внешних
    if(url.includes('ya.ru')||url.includes('yandex')||url.includes('fandom')||url.includes('google')) return { action:'deny' }
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

  win.on('close', (e)=>{
    if(!app.isQuiting){
      e.preventDefault()
      win.hide()
      if(tray) tray.displayBalloon({title:'KAYOR', content:'Браузер свёрнут в трей • двойной клик чтобы вернуть'})
    }
  })
  win.on('closed', () => { mainWin=null })
}

ipcMain.handle('window-control', (_e, action)=>{
  const win = mainWin || BrowserWindow.getFocusedWindow()
  if(!win) return
  if(action==='minimize') win.minimize()
  else if(action==='maximize'){ if(win.isMaximized()) win.unmaximize(); else win.maximize() }
  else if(action==='close'){ win.hide() }
  else if(action==='quit'){ app.isQuiting=true; win.close() }
})

ipcMain.handle('open-external', (_e, url)=> shell.openExternal(url))
ipcMain.handle('set-default-browser', ()=>{
  const ok = app.setAsDefaultProtocolClient('http')
  try{ app.setAsDefaultProtocolClient('https'); }catch{}
  return ok
})
ipcMain.handle('clear-data', async (_e, type)=>{
  if(type==='cache') await session.defaultSession.clearCache()
  if(type==='storage') await session.defaultSession.clearStorageData()
  return true
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin' && app.isQuiting) app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
app.on('before-quit', ()=> app.isQuiting=true)

if (!isDev) app.setAsDefaultProtocolClient('kayor')
