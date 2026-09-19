import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, X, Search, Star, StarOff, Lock, ShieldCheck, Globe, ChevronLeft, ChevronRight, RotateCw, Home,
  MoreHorizontal, Bookmark, Download, Clock, History, Settings, Palette, Monitor, Moon, Sun,
  Pin, Copy, ExternalLink, QrCode, Trash2, Folder, FolderPlus, Grip, Layers, SplitSquareHorizontal,
  PanelLeft, PanelRight, Maximize2, Minus, Square, SearchCode, Languages, Shield, EyeOff, Image as ImageIcon,
  NotebookPen, Camera, BookOpen, PictureInPicture2, Timer, Calculator, Pipette, Volume2, VolumeX, Sparkles,
  Zap, HardDrive, Trash, ChevronDown, Check, Import, Upload, LogIn, LogOut, User, Crown, AlertTriangle, CheckCircle2,
  Ghost, MousePointer2, AppWindow, Puzzle, StickyNote, ListChecks, Cloud, CloudOff, ArrowUpRight
} from 'lucide-react'

// Types
type Tab = {
  id: string
  title: string
  url: string
  favicon: string
  pinned?: boolean
  sleeping?: boolean
  group?: string | null
  incognito?: boolean
}
type BookmarkItem = { id: string; title: string; url: string; folder?: string; favicon?: string }
type FolderItem = { id: string; name: string; color?: string }
type HistoryItem = { id: string; title: string; url: string; time: string; favicon: string }
type DownloadItem = { id: string; name: string; url: string; size: string; progress: number; status: 'downloading' | 'done' | 'paused' | 'failed'; category: string; time: string }
type SpeedDial = { id: string; title: string; url: string; bg: string; letter: string }
type Workspace = { id: string; name: string; color: string; icon: string }

const DEFAULT_TABS: Tab[] = [
  { id: '1', title: 'Новая вкладка', url: 'kayor://newtab', favicon: '✦' },
  { id: '2', title: 'Dribbble — Discover the World’s Top Designers', url: 'https://dribbble.com', favicon: '🏀' },
  { id: '3', title: 'YouTube • Музыка', url: 'https://youtube.com', favicon: '▶️', pinned: true },
  { id: '4', title: 'GitHub • kayorissss', url: 'https://github.com', favicon: '🐙' },
]

const SPEED_DIALS: SpeedDial[] = [
  { id: '1', title: 'YouTube', url: 'https://youtube.com', bg: 'linear-gradient(135deg,#ff3b30,#ff6b6b)', letter: 'Y' },
  { id: '2', title: 'Figma', url: 'https://figma.com', bg: 'linear-gradient(135deg,#1abcf2,#7b61ff)', letter: 'F' },
  { id: '3', title: 'GitHub', url: 'https://github.com', bg: 'linear-gradient(135deg,#24292e,#6e7681)', letter: 'G' },
  { id: '4', title: 'Dribbble', url: 'https://dribbble.com', bg: 'linear-gradient(135deg,#ea4c89,#ff8fab)', letter: 'D' },
  { id: '5', title: 'Notion', url: 'https://notion.so', bg: 'linear-gradient(135deg,#000,#333)', letter: 'N' },
  { id: '6', title: 'Авито', url: 'https://avito.ru', bg: 'linear-gradient(135deg,#00aaff,#00d2ff)', letter: 'A' },
  { id: '7', title: 'Яндекс', url: 'https://ya.ru', bg: 'linear-gradient(135deg,#ffcc00,#ff3b30)', letter: 'Я' },
  { id: '8', title: 'Wikipedia', url: 'https://wikipedia.org', bg: 'linear-gradient(135deg,#636466,#a8a9ad)', letter: 'W' },
]

const WORKSPACES: Workspace[] = [
  { id: 'w1', name: 'Личное', color: '#ff253a', icon: '◐' },
  { id: 'w2', name: 'Работа', color: '#0ea5e9', icon: '⬢' },
  { id: 'w3', name: 'Учёба', color: '#10b981', icon: '✦' },
]

const WALLPAPERS = [
  { id: 'w1', name: 'Гранит', bg: 'linear-gradient(135deg,#0a0a0f 0%, #1a1a22 40%, #2a2a30 100%)' },
  { id: 'w2', name: 'Красный отблеск', bg: 'radial-gradient(120% 120% at 20% 20%, #ff253a 0%, #1a0a0f 28%, #0a0a0f 72%)' },
  { id: 'w3', name: 'Матовое стекло', bg: 'linear-gradient(135deg,#e8e8ec 0%, #d4d4d8 50%, #f4f4f5 100%)' },
  { id: 'w4', name: 'Северное сияние', bg: 'radial-gradient(120% 80% at 50% 0%, #00d2ff 0%, #3a00ff 30%, #0a0a0f 70%)' },
  { id: 'w5', name: 'Закат на стекле', bg: 'linear-gradient(135deg,#ff6b6b 0%, #ff253a 35%, #1a0a12 100%)' },
  { id: 'w6', name: 'Туман', bg: 'linear-gradient(180deg,#f8fafc 0%, #e2e8f0 100%)' },
]

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const s = localStorage.getItem('kayor_tabs')
    return s ? JSON.parse(s) : DEFAULT_TABS
  })
  const [activeId, setActiveId] = useState<string>(() => tabs[0]?.id || '1')
  const [closedStack, setClosedStack] = useState<Tab[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const s = localStorage.getItem('kayor_bm')
    return s ? JSON.parse(s) : [
      { id: 'b1', title: 'Figma', url: 'https://figma.com', favicon: '🎨' },
      { id: 'b2', title: 'GitHub', url: 'https://github.com', favicon: '🐙' },
      { id: 'b3', title: 'YouTube', url: 'https://youtube.com', favicon: '▶️' },
      { id: 'b4', title: 'Яндекс', url: 'https://ya.ru', favicon: 'Я' },
      { id: 'b5', title: 'Dribbble', url: 'https://dribbble.com', favicon: '🏀' },
      { id: 'b6', title: 'Notion', url: 'https://notion.so', favicon: 'N' },
    ] as BookmarkItem[]
  })
  const [folders] = useState<FolderItem[]>([
    { id: 'f1', name: 'Работа', color: '#0ea5e9' },
    { id: 'f2', name: 'Дизайн', color: '#ff253a' },
    { id: 'f3', name: 'Учёба', color: '#10b981' },
  ])
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const s = localStorage.getItem('kayor_hist')
    return s ? JSON.parse(s) : [
      { id: 'h1', title: 'KAYOR — браузер будущего', url: 'kayor://newtab', time: 'Сегодня 14:32', favicon: '✦' },
      { id: 'h2', title: 'Figma — редактор', url: 'https://figma.com', time: 'Сегодня 13:10', favicon: '🎨' },
      { id: 'h3', title: 'GitHub / kayorissss', url: 'https://github.com/kayorissss', time: 'Вчера 22:04', favicon: '🐙' },
      { id: 'h4', title: 'YouTube — lofi hip hop', url: 'https://youtube.com/watch?v=5qap5aO4i9A', time: 'Вчера 19:11', favicon: '▶️' },
      { id: 'h5', title: 'Документация Vite', url: 'https://vitejs.dev', time: '2 дня назад', favicon: '⚡' },
    ]
  })
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    { id: 'd1', name: 'kayor-installer-1.0.0.exe', url: 'https://kayor.app/download', size: '84.3 MB', progress: 100, status: 'done', category: 'Программы', time: 'Сегодня' },
    { id: 'd2', name: 'wallpaper-4k-glass.jpg', url: 'https://images.unsplash.com/photo', size: '8.2 MB', progress: 68, status: 'downloading', category: 'Картинки', time: 'Сейчас' },
    { id: 'd3', name: 'design-system.fig', url: 'https://figma.com/file', size: '12.1 MB', progress: 100, status: 'done', category: 'Документы', time: 'Вчера' },
  ])

  // UI state
  const [theme, setTheme] = useState<'light' | 'dark' | 'glass'>(() => (localStorage.getItem('kayor_theme') as any) || 'dark')
  const [accent, setAccent] = useState<string>(() => localStorage.getItem('kayor_accent') || '#ff253a')
  const [compact, setCompact] = useState(false)
  const [glassStrength, setGlassStrength] = useState(24)
  const [wallpaperId, setWallpaperId] = useState(() => localStorage.getItem('kayor_wp') || 'w1')
  const [rounded, setRounded] = useState(16)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarTab, setSidebarTab] = useState<'bookmarks' | 'history' | 'downloads' | 'notes' | 'reading'>('bookmarks')
  const [verticalTabs, setVerticalTabs] = useState(false)
  const [splitView, setSplitView] = useState(false)
  const [secondUrl, setSecondUrl] = useState('https://example.com')
  const [omnibox, setOmnibox] = useState('')
  const [omniboxFocused, setOmniboxFocused] = useState(false)
  const [searchEngine, setSearchEngine] = useState<'google' | 'yandex' | 'duckduckgo' | 'bing'>('yandex')
  const [adblock, setAdblock] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showDownloads, setShowDownloads] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [showCommand, setShowCommand] = useState(false)
  const [incognito, setIncognito] = useState(false)
  const [profile, setProfile] = useState<{ name: string; provider: 'google' | 'yandex' | null; avatar: string }>(() => {
    const s = localStorage.getItem('kayor_profile')
    return s ? JSON.parse(s) : { name: 'Гость', provider: null, avatar: 'K' }
  })
  const [bookmarkFoldersOpen, setBookmarkFoldersOpen] = useState(true)
  const [notes, setNotes] = useState(() => localStorage.getItem('kayor_notes') || '• Идеи для KAYOR:\n— доделать переводчик\n— добавить жесты мышью\n— режим чтения\n')
  const [readingList, setReadingList] = useState<{ id: string; title: string; url: string }[]>([
    { id: 'r1', title: 'Как мы сделали эффект жидкого стекла', url: 'https://example.com/article' },
    { id: 'r2', title: 'Chromium: архитектура вкладок', url: 'https://example.com/chromium' },
  ])
  const [translateText, setTranslateText] = useState('')
  const [translateResult, setTranslateResult] = useState<string | null>(null)
  const [translateLang, setTranslateLang] = useState('en→ru')
  const [downloadPath] = useState('~/Загрузки/KAYOR')
  const [askWhere, setAskWhere] = useState(false)
  const [autoDelete, setAutoDelete] = useState('7 дней')
  const [notifications, setNotifications] = useState(true)
  const [greetingName, setGreetingName] = useState(() => localStorage.getItem('kayor_greet') || 'Исследователь')
  const [editingGreeting, setEditingGreeting] = useState(false)
  const [time, setTime] = useState(new Date())
  const [tabSearch, setTabSearch] = useState('')
  const [showTabSearch, setShowTabSearch] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false })
  const [pip, setPip] = useState(false)
  const omniboxRef = useRef<HTMLInputElement>(null)

  const activeTab = useMemo(() => tabs.find(t => t.id === activeId) || tabs[0], [tabs, activeId])
  const wallpaper = useMemo(() => WALLPAPERS.find(w => w.id === wallpaperId) || WALLPAPERS[0], [wallpaperId])

  // Persist
  useEffect(() => { localStorage.setItem('kayor_tabs', JSON.stringify(tabs)) }, [tabs])
  useEffect(() => { localStorage.setItem('kayor_bm', JSON.stringify(bookmarks)) }, [bookmarks])
  useEffect(() => { localStorage.setItem('kayor_hist', JSON.stringify(history)) }, [history])
  useEffect(() => { localStorage.setItem('kayor_theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('kayor_accent', accent) }, [accent])
  useEffect(() => { localStorage.setItem('kayor_wp', wallpaperId) }, [wallpaperId])
  useEffect(() => { localStorage.setItem('kayor_profile', JSON.stringify(profile)) }, [profile])
  useEffect(() => { localStorage.setItem('kayor_notes', notes) }, [notes])
  useEffect(() => { localStorage.setItem('kayor_greet', greetingName) }, [greetingName])
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i) }, [])

  // Simulated download progress
  useEffect(() => {
    const id = setInterval(() => {
      setDownloads(prev => prev.map(d => d.status === 'downloading' ? { ...d, progress: Math.min(100, d.progress + Math.random() * 6), status: d.progress + 6 >= 100 ? 'done' as const : 'downloading' as const } : d))
    }, 1400)
    return () => clearInterval(id)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't' && !e.shiftKey) { e.preventDefault(); createTab() }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') { e.preventDefault(); closeTab(activeId) }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') { e.preventDefault(); restoreTab() }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') { e.preventDefault(); omniboxRef.current?.focus() }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setShowCommand(v => !v) }
      if (e.key === 'Escape') { setShowSettings(false); setShowCommand(false); setContextMenu({ x: 0, y: 0, visible: false }); setShowQr(false) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [activeId, tabs])

  // Helpers
  function createTab(url = 'kayor://newtab', title?: string) {
    const id = Math.random().toString(36).slice(2, 8)
    const isInternal = url.startsWith('kayor://')
    const newTab: Tab = {
      id, url, title: title || (isInternal ? 'Новая вкладка' : new URL(url.startsWith('http') ? url : 'https://' + url).hostname),
      favicon: isInternal ? '✦' : '🌐'
    }
    setTabs(t => [...t, newTab])
    setActiveId(id)
    if (!isInternal) {
      setHistory(h => [{ id: Math.random().toString(36).slice(2), title: newTab.title, url, time: 'Сейчас', favicon: '🌐' }, ...h].slice(0, 80))
    }
  }
  function closeTab(id: string) {
    const tab = tabs.find(t => t.id === id)
    if (!tab) return
    if (tab.pinned) return
    setClosedStack(s => [...s, tab].slice(-20))
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id)
      const next = prev.filter(t => t.id !== id)
      if (next.length === 0) { createTab(); return prev }
      if (id === activeId) {
        const newActive = next[Math.max(0, idx - 1)] || next[0]
        setActiveId(newActive.id)
      }
      return next
    })
  }
  function restoreTab() {
    const last = closedStack[closedStack.length - 1]
    if (!last) return
    setClosedStack(s => s.slice(0, -1))
    setTabs(t => [...t, last])
    setActiveId(last.id)
  }
  function duplicateTab(id: string) {
    const tab = tabs.find(t => t.id === id)
    if (!tab) return
    const nid = Math.random().toString(36).slice(2, 8)
    setTabs(t => [...t, { ...tab, id: nid, title: tab.title + ' — копия' }])
  }
  function togglePin(id: string) {
    setTabs(t => t.map(x => x.id === id ? { ...x, pinned: !x.pinned } : x).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)))
  }
  function toggleSleep(id: string) {
    setTabs(t => t.map(x => x.id === id ? { ...x, sleeping: !x.sleeping } : x))
  }

  function navigateCurrent(input: string) {
    let url = input.trim()
    if (!url) return
    // commands
    if (url.startsWith('/translate ')) {
      const q = url.replace('/translate ', '')
      setTranslateText(q)
      handleTranslate(q)
      setShowCommand(false)
      return
    }
    if (url.startsWith('/calc ')) {
      try {
        const expr = url.replace('/calc ', '')
        // eslint-disable-next-line no-eval
        const res = Function(`"use strict"; return (${expr})`)()
        setTranslateText(`Калькулятор: ${expr} = ${res}`)
        setTranslateResult(String(res))
        return
      } catch { /* */ }
    }
    // if search without dot and without protocol -> search
    const isUrl = url.includes('.') || url.startsWith('http') || url.startsWith('kayor://')
    if (!isUrl) {
      const q = encodeURIComponent(url)
      const engines: Record<string, string> = {
        google: `https://www.google.com/search?q=${q}`,
        yandex: `https://ya.ru/search?text=${q}`,
        bing: `https://www.bing.com/search?q=${q}`,
        duckduckgo: `https://duckduckgo.com/?q=${q}`
      }
      url = engines[searchEngine]
    } else if (!url.startsWith('http') && !url.startsWith('kayor://')) {
      url = 'https://' + url
    }
    setTabs(t => t.map(tab => tab.id === activeId ? { ...tab, url, title: url.startsWith('kayor://') ? 'Новая вкладка' : (() => { try { return new URL(url).hostname } catch { return url } })(), favicon: url.startsWith('kayor://') ? '✦' : '🌐' } : tab))
    if (!url.startsWith('kayor://')) setHistory(h => [{ id: Math.random().toString(36).slice(2), title: url, url, time: 'Сейчас', favicon: '🌐' }, ...h].slice(0, 80))
    setOmnibox('')
    setOmniboxFocused(false)
  }

  async function handleTranslate(q?: string) {
    const text = q ?? translateText
    if (!text.trim()) return
    setTranslateResult('Переводим…')
    try {
      // MyMemory free API
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${translateLang.includes('→') ? (translateLang.split('→')[0].trim() === 'en' ? 'en|ru' : 'ru|en') : 'en|ru'}`)
      const j = await res.json()
      setTranslateResult(j.responseData?.translatedText || '—')
    } catch {
      setTranslateResult(text.split('').reverse().join('') + ' (демо-перевод: нет сети, но API подключится)')
    }
  }

  function greeting() {
    const h = time.getHours()
    if (h < 6) return 'Доброй ночи'
    if (h < 12) return 'Доброе утро'
    if (h < 18) return 'Добрый день'
    return 'Добрый вечер'
  }

  function cleanUrl(u: string) {
    try { const url = new URL(u); url.searchParams.forEach((_, k) => { if (k.startsWith('utm_') || k === 'fbclid' || k === 'gclid') url.searchParams.delete(k) }); return url.toString() } catch { return u }
  }

  const filteredTabs = useMemo(() => tabs.filter(t => t.title.toLowerCase().includes(tabSearch.toLowerCase()) || t.url.toLowerCase().includes(tabSearch.toLowerCase())), [tabs, tabSearch])
  const isSecure = activeTab?.url.startsWith('https://') || activeTab?.url.startsWith('kayor://')
  const isNewTab = activeTab?.url === 'kayor://newtab' || activeTab?.url.startsWith('kayor://')
  const bookmarksBarItems = bookmarks.slice(0, 8)

  return (
    <div className={`h-screen w-screen flex flex-col select-none ${theme === 'dark' ? 'dark' : ''}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        :root { --accent: ${accent}; --rounded: ${rounded}px; --glass-blur: ${glassStrength}px; }
      `}</style>

      {/* Window frame */}
      <div className={`flex-1 flex flex-col overflow-hidden relative ${theme === 'dark' ? 'bg-[#0a0a0f] text-zinc-100' : theme === 'glass' ? 'bg-[#f4f4f5] text-zinc-900' : 'bg-[#f7f7f8] text-zinc-900'}`} style={theme !== 'dark' ? { background: wallpaper.bg } : undefined}>

        {/* Title bar (Windows style) */}
        <div className={`h-[36px] flex items-center px-3 gap-2 shrink-0 z-30 ${theme === 'dark' ? 'bg-[#14141a]/90 border-b border-white/[0.06] backdrop-blur-xl' : 'bg-white/70 backdrop-blur-xl border-b border-black/5'}`} style={theme === 'glass' ? { backdropFilter: `blur(${glassStrength}px)` } : undefined}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[11px] tracking-widest" style={{ background: `linear-gradient(135deg, ${accent}, #ff6b6b)`, boxShadow: `0 2px 10px ${accent}66` }}>KAYOR</div>
            <span className="hidden sm:block text-[12px] font-semibold tracking-tight opacity-80">KAYOR BROWSER</span>
            <span className="hidden md:inline-flex items-center gap-1.5 ml-3 px-2 py-1 rounded-full text-[10px] font-bold tracking-widest bg-white/10 border border-white/10">BETA <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} /></span>
          </div>

          <div className="flex-1 flex items-center justify-center gap-1">
            {/* Workspaces */}
            <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-black/10 dark:bg-white/5 border border-white/10">
              {WORKSPACES.map(w => (
                <button key={w.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition hover:bg-white/10" style={{ background: w.name === 'Личное' ? `${accent}18` : undefined, border: w.name === 'Личное' ? `1px solid ${accent}35` : '1px solid transparent' }}>
                  <span style={{ color: w.color }}>{w.icon}</span> {w.name}
                </button>
              ))}
              <button className="w-6 h-6 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><Plus size={12} /></button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="hidden md:flex items-center gap-1 mr-2">
              <button onClick={() => setIncognito(!incognito)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition ${incognito ? 'bg-violet-600 text-white border-violet-500' : 'bg-white/10 border-white/10 hover:bg-white/15'}`}>
                <Ghost size={14} /> {incognito ? 'Инкогнито' : 'Обычный'}
              </button>
              <button onClick={() => setSplitView(!splitView)} className={`p-1.5 rounded-lg border ${splitView ? 'bg-white text-zinc-900' : 'bg-white/10 border-white/10 hover:bg-white/15'}`} title="Split view"><SplitSquareHorizontal size={14} /></button>
              <button onClick={() => setVerticalTabs(!verticalTabs)} className="p-1.5 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15" title="Вертикальные вкладки"><PanelLeft size={14} /></button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur">
              <div className="w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold text-white" style={{ background: accent }}>{profile.avatar}</div>
              <span className="hidden sm:block text-xs font-medium max-w-[90px] truncate">{profile.name}</span>
              {profile.provider ? (
                <button onClick={() => setProfile({ name: 'Гость', provider: null, avatar: 'K' })} className="p-1 rounded-full hover:bg-white/15"><LogOut size={12} /></button>
              ) : (
                <div className="hidden sm:flex items-center gap-1">
                  <button onClick={() => setProfile({ name: 'kayor@gmail.com', provider: 'google', avatar: 'G' })} className="px-2 py-1 rounded-full bg-white text-zinc-900 text-[10px] font-bold flex items-center gap-1">Google <LogIn size={10} /></button>
                  <button onClick={() => setProfile({ name: 'kayor@yandex.ru', provider: 'yandex', avatar: 'Я' })} className="px-2 py-1 rounded-full bg-[#ffcc00] text-black text-[10px] font-bold">Яндекс</button>
                </div>
              )}
              <button onClick={() => setShowSettings(true)} className="w-6 h-6 grid place-items-center rounded-full hover:bg-white/10"><Settings size={14} /></button>
            </div>

            <div className="hidden md:flex items-center ml-1 gap-0.5">
              <button className="w-8 h-8 grid place-items-center hover:bg-white/10 rounded-lg"><Minus size={14} /></button>
              <button className="w-8 h-8 grid place-items-center hover:bg-white/10 rounded-lg"><Square size={12} /></button>
              <button className="w-8 h-8 grid place-items-center hover:bg-red-500 hover:text-white rounded-lg"><X size={14} /></button>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className={`flex items-end gap-1 px-2 pt-2 shrink-0 overflow-hidden ${theme === 'dark' ? 'bg-[#0f0f14] border-b border-white/5' : 'bg-white/45 backdrop-blur-xl border-b border-black/5'} ${verticalTabs ? 'hidden' : 'flex'}`} style={{ minHeight: compact ? 40 : 46 }}>
          <button onClick={() => setShowTabSearch(!showTabSearch)} className="hidden md:grid place-items-center w-7 h-7 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 shrink-0 mb-1"><SearchCode size={14} /></button>

          <div className="flex-1 flex items-end gap-1 overflow-x-auto scrollbar-thin">
            {tabs.map(tab => (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', tab.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  const id = e.dataTransfer.getData('text/plain');
                  if (!id || id === tab.id) return;
                  const fromIdx = tabs.findIndex(t => t.id === id);
                  const toIdx = tabs.findIndex(t => t.id === tab.id);
                  if (fromIdx < 0 || toIdx < 0) return;
                  const next = [...tabs];
                  const [moved] = next.splice(fromIdx, 1);
                  next.splice(toIdx, 0, moved);
                  setTabs(next);
                }}
                onClick={() => setActiveId(tab.id)}
                onAuxClick={(e) => { if (e.button === 1) closeTab(tab.id) }}
                className={`group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer select-none shrink-0 border border-transparent
                  ${activeId === tab.id ? (theme === 'dark' ? 'bg-[#23232b] text-white border-white/10 shadow-lg' : 'bg-white text-zinc-900 shadow-md border-black/5') : theme === 'dark' ? 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border-white/5' : 'bg-white/55 hover:bg-white/80 text-zinc-600 border-black/5'}
                  ${tab.pinned ? '!px-2 min-w-[44px] justify-center' : 'min-w-[160px] max-w-[220px]'}
                  ${tab.sleeping ? 'opacity-60 italic' : ''}`}
                style={{ borderRadius: `${rounded}px ${rounded}px 0 0`, borderBottom: activeId === tab.id ? '1px solid transparent' : undefined, marginBottom: activeId === tab.id ? -1 : 0 }}
              >
                <span className="text-[14px] leading-none">{tab.favicon}</span>
                {!tab.pinned && <span className="truncate text-[13px] font-medium flex-1">{tab.title}</span>}
                {tab.pinned && <Pin size={10} className="opacity-60" />}
                {tab.sleeping && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Спящая" />}
                {!tab.pinned && (
                  <button
                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                    className="w-5 h-5 grid place-items-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 -mr-1"
                  ><X size={12} /></button>
                )}
                {activeId === tab.id && <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full" style={{ background: accent }} />}
              </div>
            ))}
            <button onClick={() => createTab()} className="w-7 h-7 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 border border-white/10 mb-1 shrink-0"><Plus size={14} /></button>
            <div className="w-2 shrink-0" />
          </div>

          <div className="hidden md:flex items-center gap-1 mb-1 ml-2">
            <button onClick={restoreTab} className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs flex items-center gap-1"><History size={12} /> Ctrl+Shift+T</button>
          </div>
        </div>

        {/* Tab search dropdown */}
        {showTabSearch && (
          <div className={`mx-2 mt-2 p-2 rounded-2xl border shadow-xl z-20 ${theme === 'dark' ? 'bg-[#1c1c22] border-white/10' : 'bg-white border-black/10'}`}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <Search size={14} className="opacity-60" /><input value={tabSearch} onChange={e => setTabSearch(e.target.value)} placeholder="Поиск по вкладкам — 50+ вкладок не проблема" className="flex-1 bg-transparent outline-none text-sm" autoFocus />
              <span className="text-xs opacity-50">{filteredTabs.length} вкладок</span>
            </div>
            <div className="mt-2 max-h-[220px] overflow-auto grid gap-1">
              {filteredTabs.map(t => (
                <button key={t.id} onClick={() => { setActiveId(t.id); setShowTabSearch(false) }} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/5 ${activeId === t.id ? 'bg-black/5 dark:bg-white/5' : ''}`}>
                  <span>{t.favicon}</span><span className="truncate text-sm flex-1">{t.title}</span><span className="text-xs opacity-50 truncate max-w-[160px]">{t.url}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Omnibox */}
        <div className={`flex items-center gap-2 px-2 py-2 shrink-0 ${theme === 'dark' ? 'bg-[#18181f] border-b border-white/5' : 'bg-white/60 backdrop-blur-xl border-b border-black/5'}`}>
          <div className="flex items-center gap-1">
            <button onClick={() => window.history.back()} className="w-8 h-8 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"><ChevronLeft size={16} /></button>
            <button className="w-8 h-8 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 opacity-60"><ChevronRight size={16} /></button>
            <button onClick={() => setTabs(t => [...t])} className="w-8 h-8 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"><RotateCw size={14} /></button>
            <button onClick={() => navigateCurrent('kayor://newtab')} className="w-8 h-8 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"><Home size={14} /></button>
          </div>

          <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm relative ${theme === 'dark' ? 'bg-[#23232b] border-white/10 focus-within:border-white/20' : 'bg-white border-black/10 focus-within:border-black/20'}`} style={{ boxShadow: omniboxFocused ? `0 0 0 3px ${accent}22` : undefined, borderRadius: rounded }}>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`w-6 h-6 grid place-items-center rounded-full ${isSecure ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{isSecure ? <Lock size={12} /> : <AlertTriangle size={12} />}</span>
              <button onClick={() => setAdblock(!adblock)} className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border ${adblock ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`} title="Блокировщик рекламы">
                <ShieldCheck size={12} /> {adblock ? 'AdBlock ON' : 'OFF'}
              </button>
            </div>

            <input
              ref={omniboxRef}
              value={omniboxFocused ? omnibox : (omnibox || activeTab?.url || '')}
              onFocus={() => setOmniboxFocused(true)}
              onBlur={() => setTimeout(() => setOmniboxFocused(false), 180)}
              onChange={e => setOmnibox(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') navigateCurrent(omnibox || activeTab?.url || '') }}
              placeholder="Поиск или введите адрес — /translate, /calc, ya.ru"
              className="flex-1 bg-transparent outline-none text-[14px] placeholder:opacity-50"
            />

            <div className="hidden md:flex items-center gap-1 shrink-0">
              <select value={searchEngine} onChange={e => setSearchEngine(e.target.value as any)} className="text-xs bg-transparent border border-black/10 dark:border-white/10 rounded-full px-2 py-1 outline-none">
                <option value="yandex">Яндекс</option><option value="google">Google</option><option value="duckduckgo">DuckDuckGo</option><option value="bing">Bing</option>
              </select>
              <button onClick={() => { const u = activeTab?.url || ''; navigator.clipboard.writeText(cleanUrl(u)); }} className="w-7 h-7 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10" title="Копировать чистую ссылку"><Copy size={14} /></button>
              <button onClick={() => setShowQr(!showQr)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10" title="QR-код"><QrCode size={14} /></button>
              <button onClick={() => setBookmarks(b => b.some(x => x.url === activeTab?.url) ? b.filter(x => x.url !== activeTab?.url) : [...b, { id: Math.random().toString(36).slice(2), title: activeTab?.title || 'Закладка', url: activeTab?.url || '', favicon: '🔖' }])} className="w-7 h-7 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                {bookmarks.some(b => b.url === activeTab?.url) ? <Star size={14} className="fill-amber-400 text-amber-400" /> : <Star size={14} />}
              </button>
            </div>

            {/* Omnibox dropdown */}
            {omniboxFocused && (
              <div className={`absolute left-0 right-0 top-[calc(100%+8px)] rounded-2xl border shadow-2xl overflow-hidden z-30 ${theme === 'dark' ? 'bg-[#1e1e26] border-white/10' : 'bg-white border-black/10'}`}>
                <div className="p-2">
                  <div className="text-[11px] font-bold tracking-widest opacity-50 px-2 py-1">БЫСТРЫЕ КОМАНДЫ</div>
                  <div className="grid gap-1">
                    {[
                      { k: '/translate Привет мир', d: 'Перевести текст', icon: Languages },
                      { k: '/calc 256*1024', d: 'Калькулятор в адресной строке', icon: Calculator },
                      { k: '100 usd to rub', d: 'Конвертер валют (демо)', icon: ArrowUpRight },
                      { k: 'погода в Москве', d: `Искать в ${searchEngine}`, icon: Search },
                    ].map(item => (
                      <button key={item.k} onClick={() => navigateCurrent(item.k)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left">
                        <span className="w-7 h-7 grid place-items-center rounded-lg bg-black/5 dark:bg-white/10"><item.icon size={14} /></span>
                        <span className="flex-1 text-sm font-medium">{item.k}</span><span className="text-xs opacity-60">{item.d}</span>
                      </button>
                    ))}
                  </div>
                  {history.slice(0, 4).length > 0 && <>
                    <div className="text-[11px] font-bold tracking-widest opacity-50 px-2 py-2">ИСТОРИЯ И ЗАКЛАДКИ</div>
                    {history.slice(0, 4).map(h => (
                      <button key={h.id} onClick={() => navigateCurrent(h.url)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left">
                        <span>{h.favicon}</span><span className="flex-1 truncate text-sm">{h.title}</span><span className="text-xs opacity-50 truncate max-w-[180px]">{h.url}</span>
                      </button>
                    ))}
                  </>}
                </div>
                <div className="px-3 py-2 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
                  <span className="opacity-60 flex items-center gap-1"><Sparkles size={12} /> Подсказки из истории и закладок</span>
                  <span className="opacity-60">↵ Enter — перейти</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setPip(!pip)} className={`hidden lg:grid place-items-center w-8 h-8 rounded-full border ${pip ? 'bg-white text-zinc-900 border-black/10' : 'bg-white/10 border-white/10 hover:bg-white/15'}`} title="Картинка-в-картинке"><PictureInPicture2 size={14} /></button>
            <button onClick={() => setShowDownloads(!showDownloads)} className="relative w-8 h-8 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 border border-white/10">
              <Download size={14} />{downloads.some(d => d.status === 'downloading') && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: accent }} />}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 border border-white/10"><PanelRight size={14} /></button>
            <button onClick={() => setShowCommand(!showCommand)} className="hidden md:grid place-items-center w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        {/* Bookmarks bar */}
        <div className={`flex items-center gap-1 px-2 py-1.5 shrink-0 overflow-x-auto ${theme === 'dark' ? 'bg-[#14141a] border-b border-white/5' : 'bg-white/40 backdrop-blur border-b border-black/5'}`}>
          <button onClick={() => setBookmarkFoldersOpen(!bookmarkFoldersOpen)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/10 text-xs shrink-0"><Folder size={12} /> Папки <ChevronDown size={12} className={`transition ${bookmarkFoldersOpen ? 'rotate-180' : ''}`} /></button>
          {bookmarkFoldersOpen && folders.map(f => (
            <span key={f.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0" style={{ background: `${f.color}18`, borderColor: `${f.color}30`, color: f.color }}><FolderPlus size={12} /> {f.name}</span>
          ))}
          <span className="w-px h-4 bg-black/10 dark:bg-white/10 shrink-0 mx-1" />
          {bookmarksBarItems.map(b => (
            <button key={b.id} onClick={() => navigateCurrent(b.url)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-white/15 border border-transparent hover:border-white/10 text-xs shrink-0">
              <span>{b.favicon}</span> {b.title}
            </button>
          ))}
          <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs shrink-0"><Import size={12} /> Импорт</button>
          <div className="flex-1" />
          <span className="hidden md:flex items-center gap-1 text-[11px] opacity-60 shrink-0"><Cloud size={12} className={profile.provider ? 'text-emerald-500' : 'opacity-40'} /> {profile.provider ? 'Синхронизация вкл' : 'Войдите для синхронизации'}</span>
        </div>

        {/* Main area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Vertical tabs */}
          {verticalTabs && (
            <div className={`w-[260px] shrink-0 flex flex-col border-r overflow-hidden ${theme === 'dark' ? 'bg-[#0f0f14] border-white/5' : 'bg-white/60 backdrop-blur-xl border-black/5'}`}>
              <div className="p-2 flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest opacity-60">ВКЛАДКИ • {tabs.length}</span>
                <button onClick={() => setVerticalTabs(false)} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"><X size={12} /></button>
              </div>
              <div className="flex-1 overflow-auto p-2 space-y-1">
                {tabs.map(t => (
                  <div key={t.id} onClick={() => setActiveId(t.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border ${activeId === t.id ? 'bg-white dark:bg-[#23232b] border-black/5 dark:border-white/10 shadow' : 'hover:bg-black/5 dark:hover:bg-white/5 border-transparent'}`}>
                    <span>{t.favicon}</span><span className="flex-1 truncate text-sm">{t.title}</span>
                    <button onClick={e => { e.stopPropagation(); closeTab(t.id) }} className="w-6 h-6 grid place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X size={12} /></button>
                  </div>
                ))}
                <button onClick={() => createTab()} className="w-full mt-2 py-2 rounded-xl border border-dashed border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm flex items-center justify-center gap-1"><Plus size={14} /> Новая вкладка</button>
              </div>
              <div className="p-2 border-t border-black/5 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-1">
                  <button onClick={() => setHistory([])} className="flex-1 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs flex items-center justify-center gap-1"><Trash2 size={12} /> Очистить</button>
                  <button onClick={restoreTab} className="flex-1 py-1.5 rounded-full text-white text-xs flex items-center justify-center gap-1" style={{ background: accent }}><History size={12} /> Вернуть</button>
                </div>
                <div className="flex items-center gap-2 text-xs opacity-60"><HardDrive size={12} /> Экономия RAM • спящие вкладки</div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Webview area */}
            <div className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-[#0a0a0f]">
              {isNewTab ? (
                <NewTabPage
                  theme={theme} accent={accent} wallpaper={wallpaper} wallpapers={WALLPAPERS} onPickWallpaper={setWallpaperId}
                  greeting={greeting()} greetingName={greetingName} editingGreeting={editingGreeting} setEditingGreeting={setEditingGreeting} setGreetingName={setGreetingName}
                  time={time} searchEngine={searchEngine} setSearchEngine={setSearchEngine} onNavigate={navigateCurrent}
                  onCreateTab={createTab} speedDials={SPEED_DIALS} history={history} downloads={downloads}
                  notes={notes} setNotes={setNotes} readingList={readingList} setReadingList={setReadingList}
                  translateText={translateText} setTranslateText={setTranslateText} translateResult={translateResult} translateLang={translateLang} setTranslateLang={setTranslateLang} onTranslate={() => handleTranslate()}
                  rounded={rounded} compact={compact}
                />
              ) : activeTab?.url.startsWith('kayor://settings') ? (
                <SettingsPage theme={theme} accent={accent} setTheme={setTheme} setAccent={setAccent} compact={compact} setCompact={setCompact} glassStrength={glassStrength} setGlassStrength={setGlassStrength} rounded={rounded} setRounded={setRounded} wallpapers={WALLPAPERS} wallpaperId={wallpaperId} setWallpaperId={setWallpaperId} adblock={adblock} setAdblock={setAdblock} searchEngine={searchEngine} setSearchEngine={setSearchEngine} downloadPath={downloadPath} askWhere={askWhere} setAskWhere={setAskWhere} autoDelete={autoDelete} setAutoDelete={setAutoDelete} notifications={notifications} setNotifications={setNotifications} />
              ) : activeTab?.url.startsWith('kayor://history') ? (
                <HistoryPage history={history} setHistory={setHistory} onNavigate={navigateCurrent} theme={theme} />
              ) : activeTab?.url.startsWith('kayor://downloads') ? (
                <DownloadsPage downloads={downloads} setDownloads={setDownloads} theme={theme} accent={accent} />
              ) : activeTab?.url.startsWith('kayor://bookmarks') ? (
                <BookmarksPage bookmarks={bookmarks} setBookmarks={setBookmarks} theme={theme} />
              ) : (
                <WebView url={activeTab?.url || ''} theme={theme} onTitleChange={(title) => setTabs(ts => ts.map(t => t.id === activeId ? { ...t, title } : t))} onNavigate={navigateCurrent} />
              )}

              {/* Context menu */}
              {contextMenu.visible && (
                <div onClick={() => setContextMenu({ x: 0, y: 0, visible: false })} className="fixed inset-0 z-40">
                  <div style={{ left: contextMenu.x, top: contextMenu.y }} className={`absolute w-[260px] rounded-2xl border shadow-2xl overflow-hidden py-2 ${theme === 'dark' ? 'bg-[#1e1e26] border-white/10' : 'bg-white border-black/10'}`}>
                    {[
                      { label: 'Открыть в новой вкладке', icon: AppWindow },
                      { label: 'Открыть в инкогнито', icon: EyeOff },
                      { label: 'Копировать ссылку', icon: Copy },
                      { label: 'Сохранить как…', icon: Download },
                      { label: 'Перевести выделенное', icon: Languages },
                      { label: 'Поиск в Яндексе', icon: Search },
                      { label: 'Просмотр кода элемента', icon: SearchCode },
                    ].map(i => (
                      <button key={i.label} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-sm text-left"><i.icon size={14} /> {i.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* QR */}
              {showQr && (
                <div className="absolute top-3 right-3 z-20 p-4 rounded-2xl bg-white border border-black/10 shadow-2xl flex flex-col items-center gap-2">
                  <div className="w-32 h-32 rounded-xl bg-zinc-900 grid place-items-center text-white text-xs">QR • {activeTab?.url.slice(0, 22)}…</div>
                  <span className="text-xs font-medium">Поделиться страницей</span>
                  <button onClick={() => setShowQr(false)} className="w-full py-1.5 rounded-full bg-zinc-900 text-white text-xs">Закрыть</button>
                </div>
              )}

              {/* Pip video mock */}
              {pip && (
                <div className="absolute bottom-4 right-4 w-[320px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black z-20">
                  <div className="h-8 flex items-center justify-between px-3 bg-zinc-900 text-white text-xs"><span className="flex items-center gap-1"><PictureInPicture2 size={12} /> Картинка-в-картинке</span><button onClick={() => setPip(false)} className="w-6 h-6 grid place-items-center rounded-full hover:bg-white/10"><X size={12} /></button></div>
                  <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 grid place-items-center text-white/60 text-xs">▶ Видео продолжает играть — перетащи окно</div>
                  <div className="h-10 flex items-center gap-2 px-3 bg-zinc-900"><button className="w-7 h-7 grid place-items-center rounded-full bg-white text-black"><Volume2 size={12} /></button><div className="flex-1 h-1 rounded-full bg-white/20"><div className="w-[42%] h-full rounded-full bg-white" /></div><span className="text-[11px] text-white/70">lofi hip hop</span></div>
                </div>
              )}
            </div>

            {/* Split view */}
            {splitView && (
              <div className="hidden xl:flex w-[50%] border-l border-black/10 dark:border-white/10 flex-col bg-white dark:bg-zinc-900">
                <div className="h-9 flex items-center gap-2 px-2 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                  <input value={secondUrl} onChange={e => setSecondUrl(e.target.value)} placeholder="Второй сайт — введите URL" className="flex-1 bg-white dark:bg-zinc-800 rounded-full px-3 py-1 text-xs outline-none border border-black/10 dark:border-white/10" />
                  <button onClick={() => setSplitView(false)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X size={12} /></button>
                </div>
                <div className="flex-1 relative bg-white">
                  <iframe src={secondUrl.startsWith('http') ? secondUrl : 'https://' + secondUrl} className="w-full h-full border-0" title="split" />
                </div>
              </div>
            )}

            {/* Sidebar */}
            {sidebarOpen && (
              <div className={`w-[340px] shrink-0 border-l flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#14141a] border-white/5' : 'bg-white/70 backdrop-blur-xl border-black/5'}`}>
                <div className="flex items-center gap-1 p-2 border-b border-black/5 dark:border-white/5">
                  {[
                    { id: 'bookmarks', icon: Bookmark, label: 'Закладки' },
                    { id: 'history', icon: Clock, label: 'История' },
                    { id: 'downloads', icon: Download, label: 'Загрузки' },
                    { id: 'notes', icon: StickyNote, label: 'Заметки' },
                    { id: 'reading', icon: BookOpen, label: 'Чтение' },
                  ].map(t => (
                    <button key={t.id} onClick={() => setSidebarTab(t.id as any)} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-medium border ${sidebarTab === t.id ? 'bg-white dark:bg-white/10 border-black/5 dark:border-white/10 shadow' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-70'}`}>
                      <t.icon size={14} /> {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-auto p-3">
                  {sidebarTab === 'bookmarks' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Закладки</h3><button className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><MoreHorizontal size={14} /></button></div>
                      <div className="flex gap-2">
                        <button onClick={() => setBookmarks(b => [...b, { id: Math.random().toString(36).slice(2), title: 'Новая закладка', url: activeTab?.url || 'https://example.com', favicon: '🔖' }])} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1" style={{ background: accent }}><Plus size={12} /> Добавить</button>
                        <button className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs flex items-center gap-1"><Upload size={12} /> Импорт</button>
                      </div>
                      <div className="space-y-1">
                        {bookmarks.map(b => (
                          <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 group">
                            <span>{b.favicon || '🔖'}</span><button onClick={() => navigateCurrent(b.url)} className="flex-1 text-left truncate text-sm">{b.title}</button>
                            <span className="text-[11px] opacity-50 hidden group-hover:block truncate max-w-[90px]">{new URL(b.url.startsWith('http') ? b.url : 'https://' + b.url).hostname}</span>
                            <button onClick={() => setBookmarks(bm => bm.filter(x => x.id !== b.id))} className="opacity-0 group-hover:opacity-100 w-6 h-6 grid place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"><Trash2 size={12} /></button>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-2xl border border-dashed border-black/10 dark:border-white/10 text-xs opacity-60">Перетаскивайте закладки в папки. Облачная синхронизация включена при входе через аккаунт.</div>
                    </div>
                  )}

                  {sidebarTab === 'history' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">История</h3><button onClick={() => setHistory([])} className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 flex items-center gap-1"><Trash size={12} /> Очистить</button></div>
                      <div className="relative"><Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" /><input placeholder="Поиск по истории" className="w-full pl-8 pr-3 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 outline-none text-sm" /></div>
                      <div className="space-y-4">
                        {['Сегодня', 'Вчера', 'На прошлой неделе'].map(group => (
                          <div key={group}>
                            <div className="text-[11px] font-bold tracking-widest opacity-40 mb-2">{group}</div>
                            <div className="space-y-1">
                              {history.slice(0, group === 'Сегодня' ? 3 : 1).map(h => (
                                <div key={h.id} className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
                                  <span>{h.favicon}</span><div className="flex-1 min-w-0"><div className="truncate text-sm">{h.title}</div><div className="truncate text-xs opacity-50">{h.url}</div></div><span className="text-[11px] opacity-40 shrink-0">{h.time}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sidebarTab === 'downloads' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Загрузки</h3><span className="text-xs px-2 py-1 rounded-full bg-black/5 dark:bg-white/5">{downloads.length} файлов</span></div>
                      <div className="flex items-center gap-2 text-xs p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"><HardDrive size={12} /> Папка: <span className="font-mono">{downloadPath}</span></div>
                      <div className="space-y-2">
                        {downloads.map(d => (
                          <div key={d.id} className="p-3 rounded-2xl border bg-white dark:bg-white/5 border-black/5 dark:border-white/5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="truncate text-sm font-medium">{d.name}</div>
                                <div className="text-xs opacity-60">{d.category} • {d.size} • {d.time}</div>
                              </div>
                              <span className={`text-[11px] px-2 py-1 rounded-full font-bold shrink-0 ${d.status === 'done' ? 'bg-emerald-500 text-white' : d.status === 'downloading' ? 'bg-sky-500 text-white' : 'bg-amber-500 text-white'}`}>{d.status === 'done' ? 'Готово' : d.status === 'downloading' ? `${Math.round(d.progress)}%` : d.status}</span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${d.progress}%`, background: d.status === 'done' ? '#10b981' : accent }} />
                            </div>
                            <div className="mt-2 flex gap-1">
                              <button className="flex-1 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs flex items-center justify-center gap-1"><ExternalLink size={12} /> Показать в папке</button>
                              {d.status === 'downloading' && <button onClick={() => setDownloads(ds => ds.map(x => x.id === d.id ? { ...x, status: 'paused' as const } : x))} className="px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 text-xs">Пауза</button>}
                              {d.status === 'paused' && <button onClick={() => setDownloads(ds => ds.map(x => x.id === d.id ? { ...x, status: 'downloading' as const } : x))} className="px-3 py-1 rounded-full text-white text-xs" style={{ background: accent }}>Продолжить</button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sidebarTab === 'notes' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold flex items-center gap-1"><NotebookPen size={14} /> Блокнот</h3><span className="text-xs opacity-50">Автосохранение</span></div>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Быстрые заметки прямо в браузере…" className="w-full h-[300px] p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 outline-none text-sm resize-none" />
                      <div className="flex gap-1">
                        <button onClick={() => setNotes(n => n + '\n• ')} className="flex-1 py-2 rounded-xl bg-white dark:bg-white/10 border border-black/5 dark:border-white/5 text-xs flex items-center justify-center gap-1"><Plus size={12} /> Пункт</button>
                        <button onClick={() => navigator.clipboard.writeText(notes)} className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs flex items-center gap-1"><Copy size={12} /> Копировать</button>
                      </div>
                      <div className="p-3 rounded-2xl flex gap-3" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
                        <Sparkles size={16} style={{ color: accent }} /><span className="text-xs leading-relaxed">Совет: выдели текст на любой странице → правый клик → «Перевести» или «Копировать». Заметки синхронизируются с аккаунтом.</span>
                      </div>
                    </div>
                  )}

                  {sidebarTab === 'reading' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Читать позже</h3><button onClick={() => setReadingList(r => [...r, { id: Math.random().toString(36).slice(2), title: activeTab?.title || 'Статья без названия', url: activeTab?.url || '' }])} className="w-7 h-7 grid place-items-center rounded-full text-white" style={{ background: accent }}><Plus size={14} /></button></div>
                      <div className="space-y-2">
                        {readingList.map(r => (
                          <div key={r.id} className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 flex gap-3">
                            <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: accent }}><BookOpen size={16} className="text-white" /></div>
                            <div className="flex-1 min-w-0"><div className="truncate text-sm font-medium">{r.title}</div><div className="truncate text-xs opacity-50">{r.url}</div></div>
                            <button onClick={() => setReadingList(l => l.filter(x => x.id !== r.id))} className="w-7 h-7 grid place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 shrink-0"><Trash2 size={12} /></button>
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-2 rounded-xl border border-dashed border-black/10 dark:border-white/10 text-xs opacity-70">Открыть все в новых вкладках</button>
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-black/5 dark:border-white/5 flex items-center gap-1">
                  <button className="flex-1 py-2 rounded-full bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs flex items-center justify-center gap-1"><Camera size={12} /> Скриншот</button>
                  <button className="flex-1 py-2 rounded-full text-white text-xs flex items-center justify-center gap-1" style={{ background: accent }}><Languages size={12} /> Переводчик</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Downloads bar (bottom) */}
        {showDownloads && (
          <div className={`h-[64px] shrink-0 flex items-center gap-2 px-3 border-t backdrop-blur-xl ${theme === 'dark' ? 'bg-[#18181f] border-white/5' : 'bg-white/80 border-black/5'}`}>
            <span className="text-xs font-bold tracking-widest opacity-60">ЗАГРУЗКИ</span>
            <div className="flex-1 flex gap-2 overflow-auto">
              {downloads.map(d => (
                <div key={d.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 min-w-[220px]">
                  <div className="w-8 h-8 rounded-lg grid place-items-center text-white shrink-0" style={{ background: accent }}><Download size={14} /></div>
                  <div className="flex-1 min-w-0"><div className="truncate text-xs font-medium">{d.name}</div><div className="h-1 rounded-full bg-black/10 dark:bg-white/10 mt-1"><div className="h-full rounded-full" style={{ width: `${d.progress}%`, background: accent }} /></div></div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowDownloads(false)} className="w-8 h-8 grid place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X size={14} /></button>
          </div>
        )}

        {/* Status bar */}
        <div className={`h-[26px] flex items-center gap-3 px-3 text-[11px] shrink-0 border-t ${theme === 'dark' ? 'bg-[#0f0f14] border-white/5 text-zinc-400' : 'bg-white/60 border-black/5 text-zinc-600'}`}>
          <span className="hidden md:flex items-center gap-1.5"><Shield size={12} className="text-emerald-500" /> Защита от фишинга • HTTPS-принуждение • DNT</span>
          <span className="hidden lg:flex items-center gap-1.5"><Zap size={12} style={{ color: accent }} /> Спящие вкладки экономят RAM</span>
          <span className="hidden lg:flex items-center gap-1.5"><MousePointer2 size={12} /> Жесты мышью: нарисуй «L» → назад</span>
          <div className="flex-1" />
          <span className="flex items-center gap-1"><HardDrive size={12} /> {tabs.length} вкладок • {bookmarks.length} закладок</span>
          <span className="hidden sm:inline">KAYOR 1.0.0 • Chromium 124</span>
        </div>

        {/* Settings modal */}
        {showSettings && (
          <div className="absolute inset-0 z-50 flex">
            <div onClick={() => setShowSettings(false)} className="flex-1 bg-black/40 backdrop-blur-sm" />
            <div className={`w-[min(980px,96vw)] max-w-[980px] h-[92vh] my-auto mr-2 md:mr-4 rounded-[24px] shadow-2xl overflow-hidden flex flex-col border ${theme === 'dark' ? 'bg-[#121216] border-white/10' : 'bg-white border-black/10'}`}>
              <SettingsHeader onClose={() => setShowSettings(false)} accent={accent} />
              <SettingsBody
                theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}
                compact={compact} setCompact={setCompact} glassStrength={glassStrength} setGlassStrength={setGlassStrength}
                rounded={rounded} setRounded={setRounded} wallpapers={WALLPAPERS} wallpaperId={wallpaperId} setWallpaperId={setWallpaperId}
                adblock={adblock} setAdblock={setAdblock} searchEngine={searchEngine} setSearchEngine={setSearchEngine}
                downloadPath={downloadPath} askWhere={askWhere} setAskWhere={setAskWhere} autoDelete={autoDelete} setAutoDelete={setAutoDelete}
                notifications={notifications} setNotifications={setNotifications} profile={profile} setProfile={setProfile}
              />
            </div>
          </div>
        )}

        {/* Command palette */}
        {showCommand && (
          <div className="absolute inset-0 z-50 grid place-items-start pt-[20vh] bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowCommand(false)}>
            <div onClick={e => e.stopPropagation()} className={`w-full max-w-[640px] mx-auto rounded-[20px] border shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-[#1c1c22] border-white/10' : 'bg-white border-black/10'}`}>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/5 dark:border-white/5">
                <Search size={16} className="opacity-50" /><input autoFocus placeholder="Быстрые команды — введите /translate, /calc, настройки, загрузки…" className="flex-1 bg-transparent outline-none text-sm" />
                <span className="text-xs px-2 py-1 rounded-full bg-black/5 dark:bg-white/10">⌘K</span>
              </div>
              <div className="p-2 max-h-[380px] overflow-auto">
                {[
                  { icon: Settings, title: 'Настройки', desc: 'kayor://settings', action: () => { setShowSettings(true); setShowCommand(false) } },
                  { icon: Download, title: 'Загрузки', desc: 'Открыть менеджер загрузок', action: () => { createTab('kayor://downloads'); setShowCommand(false) } },
                  { icon: Clock, title: 'История', desc: 'kayor://history', action: () => { createTab('kayor://history'); setShowCommand(false) } },
                  { icon: Bookmark, title: 'Закладки', desc: 'kayor://bookmarks', action: () => { createTab('kayor://bookmarks'); setShowCommand(false) } },
                  { icon: Languages, title: 'Переводчик', desc: '/translate текст', action: () => { setShowCommand(false) } },
                  { icon: Camera, title: 'Скриншот страницы', desc: 'Выделение области', action: () => setShowCommand(false) },
                  { icon: BookOpen, title: 'Режим чтения', desc: 'Убрать мусор, оставить текст', action: () => setShowCommand(false) },
                  { icon: Puzzle, title: 'Расширения', desc: 'Управление CRX', action: () => setShowCommand(false) },
                ].map(item => (
                  <button key={item.title} onClick={item.action} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left">
                    <span className="w-8 h-8 grid place-items-center rounded-lg bg-black/5 dark:bg-white/10"><item.icon size={14} /></span>
                    <span className="flex-1"><span className="block text-sm font-medium">{item.title}</span><span className="block text-xs opacity-60">{item.desc}</span></span>
                    <ChevronRight size={14} className="opacity-30" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── WebView (iframe with fallback) ───────────────────────────────────────────
function WebView({ url, onTitleChange, onNavigate }: { url: string; theme: string; onTitleChange: (t: string) => void; onNavigate: (u: string) => void }) {
  const [error, setError] = useState(false)
  useEffect(() => { setError(false); try { const h = new URL(url.startsWith('http') ? url : 'https://' + url).hostname; onTitleChange(h) } catch { /* */ } }, [url])
  // Some sites block iframe — show nice fallback with actions
  return (
    <div className="flex-1 relative bg-white flex flex-col overflow-hidden" onContextMenu={e => { e.preventDefault(); /* handled by parent */ }}>
      {!error ? (
        <iframe
          src={url}
          title="page"
          className="w-full h-full border-0 bg-white"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          onError={() => setError(true)}
          onLoad={(e) => {
            const target = e.target as HTMLIFrameElement
            try {
              // if blocked, it will be empty and error will be visible via fallback button
              if (!target.contentDocument) { /* cross-origin blocked is expected */ }
            } catch { /* */ }
          }}
        />
      ) : null}
      {/* Overlay fallback when site blocks embedding */}
      <div className={`absolute inset-0 grid place-items-center p-6 ${error ? '' : 'pointer-events-none opacity-0'} transition`}>
        <div className="max-w-[560px] w-full p-6 rounded-[20px] border bg-white shadow-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl grid place-items-center text-white" style={{ background: '#ff253a' }}><Globe size={20} /></div>
          <h3 className="text-lg font-bold">Сайт не позволяет встраивание</h3>
          <p className="text-sm opacity-70">Многие сайты (YouTube, GitHub и др.) блокируют показ в iframe из-за X-Frame-Options. В нативной сборке KAYOR на Electron/Chromium этот лимит снимается — страницы открываются напрямую через движок Blink.</p>
          <div className="flex gap-2 justify-center">
            <a href={url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full bg-zinc-900 text-white text-sm flex items-center gap-1"><ExternalLink size={14} /> Открыть в новой вкладке <ArrowUpRight size={12} /></a>
            <button onClick={() => setError(false)} className="px-4 py-2 rounded-full bg-zinc-100 text-sm">Попробовать снова</button>
          </div>
          <div className="text-[11px] opacity-50">Подсказка: в dev-режиме используй кнопку «Открыть в системе» — в Electron это будет нативный webview.</div>
        </div>
      </div>
      {/* Floating fallback trigger */}
      {!error && (
        <button onClick={() => setError(true)} className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs shadow-lg opacity-70 hover:opacity-100 flex items-center gap-1">
          <ExternalLink size={12} /> Открыть отдельно — если не загрузилось
        </button>
      )}
    </div>
  )
}

// ─── New Tab Page ─────────────────────────────────────────────────────────────
function NewTabPage({ theme, accent, wallpaper, wallpapers, onPickWallpaper, greeting, greetingName, editingGreeting, setEditingGreeting, setGreetingName, time, searchEngine, setSearchEngine, onNavigate, onCreateTab, speedDials, history, downloads, notes, setNotes, readingList, setReadingList: _setReadingList, translateText, setTranslateText, translateResult, translateLang, setTranslateLang, onTranslate, rounded, compact }: any) {
  const [newTabSearch, setNewTabSearch] = useState('')
  const [showWallpapers, setShowWallpapers] = useState(false)
  const isDark = theme === 'dark'

  return (
    <div className="flex-1 overflow-auto relative" style={{ background: wallpaper.bg }}>
      {/* Decor blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full blur-[80px] opacity-30" style={{ background: `radial-gradient(circle at center, ${accent} 0%, transparent 70%)` }} />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-[80px] opacity-20" style={{ background: `radial-gradient(circle at center, #7b61ff 0%, transparent 70%)` }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-[40px] blur-[60px] opacity-[0.08] bg-white" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
        {/* Greeting + clock + weather */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className={`flex-1 p-5 md:p-7 rounded-[28px] border relative overflow-hidden ${isDark ? 'bg-white/[0.06] backdrop-blur-2xl border-white/10 text-white' : 'bg-white/75 backdrop-blur-2xl border-white/40 text-zinc-900 shadow-xl'}`} style={{ borderRadius: rounded * 1.5 }}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest border" style={{ background: `${accent}18`, borderColor: `${accent}30`, color: accent }}>KAYOR • БРАУЗЕР БЕЗ РЕКЛАМЫ</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs opacity-60"><CloudOff size={12} /> Блокировка трекеров вкл</span>
                </div>
                <h1 className="text-[28px] md:text-[40px] font-extrabold tracking-tight leading-none" style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>
                  {greeting},<br />
                  {editingGreeting ? (
                    <input value={greetingName} onChange={e => setGreetingName(e.target.value)} onBlur={() => setEditingGreeting(false)} onKeyDown={e => e.key === 'Enter' && setEditingGreeting(false)} autoFocus className="bg-transparent border-b border-white/20 outline-none w-[220px]" />
                  ) : (
                    <button onClick={() => setEditingGreeting(true)} className="text-left hover:opacity-80" style={{ color: accent }}>{greetingName} <span className="text-sm font-normal opacity-50">✎</span></button>
                  )}
                </h1>
                <p className="text-sm opacity-70 max-w-[520px]">Минималистичный, быстрый и красивый. Тёмная тема, матовое стекло, акцент — красный. Настрой фон, иконки и папки — всё для тебя.</p>
              </div>
              <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                <div className={`px-4 py-3 rounded-2xl text-center border ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-black/5 shadow'}`}>
                  <div className="text-[28px] font-bold leading-none tracking-tight">{time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-xs opacity-60">{time.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })} • Москва</div>
                </div>
                <div className={`px-3 py-2 rounded-full flex items-center gap-2 text-xs border ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-black/5'}`}>
                  <span className="w-7 h-7 rounded-full grid place-items-center bg-sky-500 text-white">⛅</span> 18° • Переменная облачность <span className="opacity-50">• Влажность 62%</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mt-5 flex gap-2">
              <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-full border shadow-sm ${isDark ? 'bg-white text-zinc-900 border-white' : 'bg-white border-black/10'}`} style={{ borderRadius: rounded }}>
                <Search size={18} className="opacity-40 shrink-0" />
                <input value={newTabSearch} onChange={e => setNewTabSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && onNavigate(newTabSearch)} placeholder="Поиск в Яндексе или введите адрес — попробуй «/calc 12*12»" className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-50" />
                {newTabSearch && <button onClick={() => setNewTabSearch('')} className="w-7 h-7 grid place-items-center rounded-full hover:bg-black/5"><X size={14} /></button>}
                <button onClick={() => onNavigate(newTabSearch || 'kayor')} className="px-4 py-1.5 rounded-full text-white text-sm font-semibold shrink-0" style={{ background: accent }}>Найти</button>
              </div>
              <select value={searchEngine} onChange={e => setSearchEngine(e.target.value)} className={`hidden sm:block px-3 py-3 rounded-full border text-sm outline-none ${isDark ? 'bg-white/10 text-white border-white/10' : 'bg-white border-black/10'}`}>
                <option value="yandex">Яндекс</option><option value="google">Google</option><option value="duckduckgo">DDG</option><option value="bing">Bing</option>
              </select>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="opacity-60">Популярное:</span>
              {['погода', 'переводчик', 'Figma', 'YouTube', 'нейросети'].map(q => (
                <button key={q} onClick={() => onNavigate(q)} className={`px-3 py-1 rounded-full border hover:scale-[1.02] transition ${isDark ? 'bg-white/10 border-white/10 hover:bg-white/15' : 'bg-white border-black/5 hover:bg-zinc-50'}`}>#{q}</button>
              ))}
              <span className="opacity-40 hidden sm:inline">• Быстрые команды: <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">/translate</code> <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">/calc</code></span>
            </div>
          </div>

          {/* Right widgets */}
          <div className="w-full lg:w-[320px] space-y-3 shrink-0">
            <div className={`p-4 rounded-[20px] border flex flex-col gap-3 ${isDark ? 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-white' : 'bg-white/70 backdrop-blur-xl border-white/40 shadow'}`} style={{ borderRadius: rounded * 1.2 }}>
              <div className="flex items-center justify-between"><h3 className="text-sm font-semibold flex items-center gap-1.5"><Timer size={14} style={{ color: accent }} /> Продуктивность</h3><span className="text-xs px-2 py-1 rounded-full bg-emerald-500 text-white font-bold">Эко-режим</span></div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[{ label: 'Figma', time: '1ч 22м', col: accent }, { label: 'YouTube', time: '48м', col: '#0ea5e9' }, { label: 'GitHub', time: '31м', col: '#10b981' }].map(s => (
                  <div key={s.label} className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-black/5'}`}>
                    <div className="w-8 h-8 mx-auto rounded-full grid place-items-center text-white text-xs" style={{ background: s.col }}>{s.label[0]}</div>
                    <div className="text-xs font-semibold mt-1">{s.time}</div><div className="text-[11px] opacity-60">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs opacity-70"><VolumeX size={12} /> Тихий режим — заглушить все вкладки <button className="ml-auto px-2 py-1 rounded-full bg-white text-zinc-900 font-semibold">Вкл</button></div>
            </div>

            <div className={`p-3 rounded-[20px] border ${isDark ? 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-white' : 'bg-white/70 backdrop-blur-xl border-white/40 shadow'}`}>
              <div className="flex items-center gap-2 text-sm font-semibold"><ImageIcon size={14} /> Обои и тема</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {wallpapers.slice(0, 6).map(w => (
                  <button key={w.id} onClick={() => onPickWallpaper(w.id)} className={`h-14 rounded-xl border-2 overflow-hidden relative ${wallpaper.id === w.id ? 'border-white shadow-lg scale-[1.02]' : 'border-white/20 opacity-80 hover:opacity-100'}`} style={{ background: w.bg }} title={w.name}>
                    {wallpaper.id === w.id && <span className="absolute inset-0 grid place-items-center bg-black/20"><Check size={16} className="text-white" /></span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowWallpapers(!showWallpapers)} className="w-full mt-2 py-2 rounded-full bg-white text-zinc-900 text-xs font-semibold flex items-center justify-center gap-1"><Palette size={12} /> Настроить стекло и радиус</button>
              {showWallpapers && (
                <div className="mt-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-2">
                  <div className="text-xs opacity-70">Эффект: матовое / жидкое стекло (backdrop-blur)</div>
                  <div className="text-xs opacity-50">Настройка доступна в Настройках → Внешний вид</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Speed Dial */}
        <div className={`p-4 md:p-5 rounded-[24px] border ${isDark ? 'bg-white/[0.06] backdrop-blur-xl border-white/10' : 'bg-white/70 backdrop-blur-xl border-white/40 shadow'}`} style={{ borderRadius: rounded * 1.4 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}><Layers size={14} style={{ color: accent }} /> Быстрый доступ • Speed Dial</h2>
            <div className="flex items-center gap-1">
              <button className={`px-3 py-1 rounded-full text-xs border ${isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-black/5'}`}><Grip size={12} className="inline mr-1" /> Изменить</button>
              <button onClick={() => onCreateTab('https://example.com')} className="w-7 h-7 grid place-items-center rounded-full text-white" style={{ background: accent }}><Plus size={14} /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {speedDials.map(s => (
              <button key={s.id} onClick={() => onNavigate(s.url)} className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:scale-[1.02] transition border" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'white', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: rounded }}>
                <div className="w-12 h-12 rounded-2xl grid place-items-center text-white font-black text-lg shadow" style={{ background: s.bg }}>{s.letter}</div>
                <span className={`text-xs font-medium truncate w-full text-center ${isDark ? 'text-white' : 'text-zinc-700'}`}>{s.title}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {history.slice(0, 6).map(h => (
              <button key={h.id} onClick={() => onNavigate(h.url)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${isDark ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10' : 'bg-zinc-50 border-black/5 hover:bg-white'}`}>
                <span>{h.favicon}</span> {h.title.slice(0, 22)}
              </button>
            ))}
          </div>
        </div>

        {/* Two columns: translator + downloads/media */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className={`p-4 rounded-[20px] border space-y-3 ${isDark ? 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-white' : 'bg-white/70 backdrop-blur-xl border-white/40 shadow'}`} style={{ borderRadius: rounded * 1.2 }}>
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold flex items-center gap-1.5"><Languages size={14} style={{ color: accent }} /> Переводчик</h3>
              <select value={translateLang} onChange={e => setTranslateLang(e.target.value)} className={`text-xs px-2 py-1 rounded-full border outline-none ${isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-black/10'}`}>
                <option>en→ru</option><option>ru→en</option><option>en→de</option>
              </select>
            </div>
            <textarea value={translateText} onChange={e => setTranslateText(e.target.value)} placeholder="Введи текст или выдели на странице → правый клик → Перевести. Автоопределение языка." className={`w-full h-[84px] p-3 rounded-2xl border outline-none resize-none text-sm ${isDark ? 'bg-white text-zinc-900 border-white' : 'bg-white border-black/10'}`} />
            <div className="flex gap-2">
              <button onClick={onTranslate} className="flex-1 py-2 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-1" style={{ background: accent }}><Languages size={14} /> Перевести</button>
              <button onClick={() => setTranslateText('')} className={`px-4 py-2 rounded-full text-sm border ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-black/10'}`}>Очистить</button>
            </div>
            {translateResult && (
              <div className={`p-3 rounded-2xl border text-sm ${isDark ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-50 border-black/5'}`}>
                <div className="text-xs opacity-50 mb-1">Результат • LibreTranslate / MyMemory</div>
                {translateResult}
              </div>
            )}
            <div className="text-xs opacity-60 flex items-center gap-1"><Sparkles size={12} /> Подсказка: в адресной строке введи <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">/translate привет мир</code></div>
          </div>

          <div className={`p-4 rounded-[20px] border space-y-3 ${isDark ? 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-white' : 'bg-white/70 backdrop-blur-xl border-white/40 shadow'}`} style={{ borderRadius: rounded * 1.2 }}>
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold flex items-center gap-1.5"><Download size={14} style={{ color: accent }} /> Загрузки • красиво</h3><button className={`text-xs px-2 py-1 rounded-full border ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-black/5'}`}>Папка: ~/Загрузки/KAYOR</button></div>
            <div className="space-y-2">
              {downloads.slice(0, 2).map(d => (
                <div key={d.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
                  <div className="w-10 h-10 rounded-xl grid place-items-center text-white shrink-0" style={{ background: accent }}><Download size={16} /></div>
                  <div className="flex-1 min-w-0"><div className="truncate text-sm font-medium">{d.name}</div><div className="text-xs opacity-60">{d.size} • {d.category}</div><div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 mt-1 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${d.progress}%`, background: accent }} /></div></div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500 text-white font-bold shrink-0">{d.status === 'done' ? 'Готово' : `${Math.round(d.progress)}%`}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className={`py-2 rounded-full text-xs font-semibold border flex items-center justify-center gap-1 ${isDark ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-900 text-white border-zinc-900'}`}><HardDrive size={12} /> Выбрать папку</button>
              <button className={`py-2 rounded-full text-xs border flex items-center justify-center gap-1 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-black/10'}`}><Settings size={12} /> Настройки загрузок</button>
            </div>

            <div className={`p-3 rounded-2xl flex items-center gap-3 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-50 border-black/5'}`}>
              <div className="w-10 h-10 rounded-xl grid place-items-center bg-zinc-900 text-white"><Volume2 size={16} /></div>
              <div className="flex-1"><div className="text-sm font-medium">Медиаплеер</div><div className="text-xs opacity-60">lofi hip hop radio • YouTube</div></div>
              <button className="w-8 h-8 rounded-full bg-white text-zinc-900 grid place-items-center shadow"><span className="ml-0.5">▶</span></button>
            </div>
          </div>
        </div>

        {/* Notepad + reading */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className={`lg:col-span-2 p-4 rounded-[20px] border ${isDark ? 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-white' : 'bg-white/70 backdrop-blur-xl border-white/40 shadow'}`} style={{ borderRadius: rounded * 1.2 }}>
            <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold flex items-center gap-1.5"><StickyNote size={14} style={{ color: accent }} /> Блокнот — быстрые заметки</h3><span className="text-xs opacity-60">Автосохранение</span></div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`w-full h-[120px] p-3 rounded-2xl border outline-none resize-none text-sm ${isDark ? 'bg-white text-zinc-900 border-white' : 'bg-white border-black/10'}`} placeholder="Идеи, ссылки, todo…" />
            <div className="mt-2 flex gap-2 text-xs">
              <button onClick={() => setNotes(n => n + '\n• новая заметка')} className="px-3 py-1.5 rounded-full text-white font-semibold" style={{ background: accent }}>+ Заметка</button>
              <span className="opacity-60 flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Синхронизируется при входе</span>
            </div>
          </div>
          <div className={`p-4 rounded-[20px] border space-y-2 ${isDark ? 'bg-white/[0.06] backdrop-blur-xl border-white/10 text-white' : 'bg-white/70 backdrop-blur-xl border-white/40 shadow'}`} style={{ borderRadius: rounded * 1.2 }}>
            <h3 className="text-sm font-semibold flex items-center gap-1.5"><ListChecks size={14} style={{ color: accent }} /> Фишки KAYOR</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { icon: EyeOff, label: 'Инкогнито' },
                { icon: Shield, label: 'Анти-трекер' },
                { icon: Camera, label: 'Скриншот' },
                { icon: BookOpen, label: 'Чтение' },
                { icon: Puzzle, label: 'Расширения' },
                { icon: AppWindow, label: 'DevTools' },
              ].map(f => (
                <div key={f.label} className={`flex items-center gap-2 p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}><f.icon size={12} /> {f.label}</div>
              ))}
            </div>
            <div className="text-xs opacity-60">Калькулятор и конвертер прямо в адресной строке • Жесты мышью • Колесо по вкладкам</div>
          </div>
        </div>

        <div className={`p-3 rounded-2xl border flex flex-wrap items-center gap-2 text-xs ${isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-white/60 border-black/5 text-zinc-600'}`}>
          <span className="flex items-center gap-1"><Crown size={12} style={{ color: accent }} /> KAYOR уважает приватность — без рекламы, без трекеров.</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1"><Monitor size={12} /> Адаптация под HiDPI / 4K • Тачскрин</span>
          <span className="flex-1" />
          <span>Сделано для себя • выбирай иконку и фон • логотип можно заменить в /public</span>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Pages ───────────────────────────────────────────────────────────
function SettingsHeader({ onClose, accent }: any) {
  return (
    <div className="h-[56px] flex items-center gap-3 px-4 border-b border-black/5 dark:border-white/5 shrink-0" style={{ background: `linear-gradient(135deg, ${accent} 0%, #ff6b8a 100%)` }}>
      <div className="w-8 h-8 rounded-xl bg-white grid place-items-center font-black text-xs" style={{ color: accent }}>K</div>
      <div className="flex-1">
        <div className="text-white font-bold leading-none">Настройки KAYOR</div><div className="text-white/80 text-xs">Внешний вид • Приватность • Загрузки • Языки • Система</div>
      </div>
      <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white"><X size={16} /></button>
    </div>
  )
}

function SettingsBody(props: any) {
  const { theme, setTheme, accent, setAccent, compact, setCompact, glassStrength, setGlassStrength, rounded, setRounded, wallpapers, wallpaperId, setWallpaperId, adblock, setAdblock, searchEngine, setSearchEngine, downloadPath, askWhere, setAskWhere, autoDelete, setAutoDelete, notifications, setNotifications, profile, setProfile } = props
  const [tab, setTab] = useState<'appearance' | 'privacy' | 'downloads' | 'languages' | 'system' | 'extensions' | 'about'>('appearance')
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[200px] shrink-0 border-r border-black/5 dark:border-white/5 p-2 space-y-1 overflow-auto bg-black/[0.02] dark:bg-white/[0.02]">
        {[
          { id: 'appearance', label: 'Внешний вид', icon: Palette, desc: 'Тема, стекло, обои' },
          { id: 'privacy', label: 'Приватность', icon: Shield, desc: 'Блокировка, куки' },
          { id: 'downloads', label: 'Загрузки', icon: Download, desc: 'Папка, автоудаление' },
          { id: 'languages', label: 'Языки', icon: Languages, desc: 'Переводчик, проверка' },
          { id: 'extensions', label: 'Расширения', icon: Puzzle, desc: 'CRX, права' },
          { id: 'system', label: 'Система', icon: Monitor, desc: 'Аппаратное ускорение' },
          { id: 'about', label: 'О браузере', icon: Crown, desc: 'Версия, обновления' },
        ].map(i => (
          <button key={i.id} onClick={() => setTab(i.id as any)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left border ${tab === i.id ? 'bg-white dark:bg-white/10 border-black/5 dark:border-white/10 shadow' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}>
            <i.icon size={14} /><span className="flex-1"><span className="block text-sm font-medium">{i.label}</span><span className="block text-xs opacity-60">{i.desc}</span></span>
          </button>
        ))}
        <div className="pt-3 mt-2 border-t border-black/5 dark:border-white/5">
          <div className="text-xs opacity-60 px-2">Профили</div>
          {[
            { name: 'Гость', col: '#6b7280' },
            { name: 'Работа', col: '#0ea5e9' },
            { name: 'Личное', col: accent },
          ].map(p => (
            <div key={p.name} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-sm"><span className="w-6 h-6 rounded-full grid place-items-center text-white text-xs" style={{ background: p.col }}>{p.name[0]}</span> {p.name}</div>
          ))}
          <button className="w-full mt-2 py-2 rounded-full border border-dashed border-black/10 dark:border-white/10 text-xs">+ Новый профиль</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 bg-white dark:bg-[#121216]">
        {tab === 'appearance' && (
          <>
            <h2 className="text-lg font-bold">Внешний вид</h2>

            <div className="grid md:grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Светлая', desc: 'Белый, серый', icon: Sun, bg: '#fff' },
                { id: 'dark', label: 'Тёмная', desc: 'Чёрный, тёмно-серый', icon: Moon, bg: '#0a0a0f' },
                { id: 'glass', label: 'Стекло', desc: 'Жидкое / матовое', icon: Sparkles, bg: 'linear-gradient(135deg,#e8e8ec,#c7d2fe)' },
              ].map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)} className={`p-4 rounded-2xl border-2 text-left relative overflow-hidden ${theme === t.id ? 'border-zinc-900 dark:border-white shadow-lg' : 'border-black/5 dark:border-white/10 hover:border-black/10'}`} style={{ background: t.bg }}>
                  <t.icon size={18} className={t.id === 'dark' ? 'text-white' : 'text-zinc-900'} />
                  <div className={`mt-2 font-semibold ${t.id === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.label}</div><div className={`text-xs ${t.id === 'dark' ? 'text-white/70' : 'opacity-60'}`}>{t.desc}</div>
                  {theme === t.id && <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 grid place-items-center"><Check size={12} /></span>}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-3">
                <div className="text-sm font-semibold">Акцентный цвет</div>
                <div className="flex gap-2 flex-wrap">
                  {['#ff253a', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#111827'].map(c => (
                    <button key={c} onClick={() => setAccent(c)} className={`w-8 h-8 rounded-full border-2 ${accent === c ? 'border-zinc-900 dark:border-white scale-110' : 'border-white/50'}`} style={{ background: c }} />
                  ))}
                  <label className="w-8 h-8 rounded-full border-2 border-dashed border-black/20 dark:border-white/20 grid place-items-center cursor-pointer"><Pipette size={12} /><input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="sr-only" /></label>
                </div>
                <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full" style={{ background: accent }} /> Текущий: <span className="font-mono">{accent}</span> • используется для вкладок, кнопок, стекла</div>
              </div>

              <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-3">
                <div className="text-sm font-semibold">Стекло и скругления</div>
                <label className="block text-xs opacity-70">Сила blur: {glassStrength}px <input type="range" min={0} max={40} value={glassStrength} onChange={e => setGlassStrength(Number(e.target.value))} className="w-full accent-zinc-900" /></label>
                <label className="block text-xs opacity-70">Радиус углов: {rounded}px <input type="range" min={8} max={28} value={rounded} onChange={e => setRounded(Number(e.target.value))} className="w-full accent-zinc-900" /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={compact} onChange={e => setCompact(e.target.checked)} /> Компактный режим — меньше отступы</label>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10">
              <div className="text-sm font-semibold mb-2">Обои новой вкладки</div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {wallpapers.map((w: any) => (
                  <button key={w.id} onClick={() => setWallpaperId(w.id)} className={`h-20 rounded-xl border-2 overflow-hidden relative ${wallpaperId === w.id ? 'border-zinc-900 dark:border-white' : 'border-black/5 dark:border-white/10'}`} style={{ background: w.bg }}>
                    <span className="absolute bottom-1 left-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-zinc-900 text-center">{w.name}</span>
                    {wallpaperId === w.id && <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-zinc-900 text-white grid place-items-center"><Check size={10} /></span>}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-2 rounded-full bg-zinc-900 text-white text-xs flex items-center gap-1"><Upload size={12} /> Своё фото</button>
                <button className="px-3 py-2 rounded-full bg-white border border-black/10 text-xs">Unsplash — случайное</button>
                <span className="text-xs opacity-50 self-center">Поддержка HiDPI / Retina • адаптация под мониторы</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: `${accent}08`, borderColor: `${accent}20` }}>
              <div className="w-10 h-10 rounded-xl grid place-items-center text-white" style={{ background: accent }}><Palette size={16} /></div>
              <div className="flex-1"><div className="text-sm font-semibold">Эффект жидкого стекла как на iPhone</div><div className="text-xs opacity-70">Используем backdrop-filter: blur() + saturate() — уже включено. Настрой силу выше.</div></div>
              <span className="text-xs px-2 py-1 rounded-full bg-white border border-black/5">Glassmorphism</span>
            </div>
          </>
        )}

        {tab === 'privacy' && (
          <>
            <h2 className="text-lg font-bold">Приватность и безопасность</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <span className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl grid place-items-center bg-emerald-500 text-white"><ShieldCheck size={16} /></span><span><span className="block text-sm font-medium">Блокировщик рекламы</span><span className="block text-xs opacity-60">EasyList + анти-трекер, блокировка pop-up</span></span></span>
                <input type="checkbox" checked={adblock} onChange={e => setAdblock(e.target.checked)} className="w-10 h-6 accent-emerald-600" />
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { title: 'HTTPS-принуждение', desc: 'Автопереключение на HTTPS', on: true },
                  { title: 'Защита от фишинга', desc: 'Проверка URL по чёрным спискам', on: true },
                  { title: 'Do Not Track', desc: 'Заголовок DNT', on: false },
                  { title: 'Отключение WebRTC', desc: 'Не светить реальный IP', on: false },
                  { title: 'Блокировка трекеров', desc: 'Как в Firefox', on: adblock },
                  { title: 'Индикатор утечек', desc: 'Предупреждение если пароль утёк', on: true },
                ].map(i => (
                  <label key={i.title} className="flex items-center justify-between p-3 rounded-2xl border border-black/5 dark:border-white/10">
                    <span><span className="block text-sm font-medium">{i.title}</span><span className="block text-xs opacity-60">{i.desc}</span></span>
                    <input type="checkbox" defaultChecked={i.on} className="accent-zinc-900" />
                  </label>
                ))}
              </div>
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 text-sm flex gap-3"><AlertTriangle size={16} className="text-amber-600 shrink-0" /> Менеджер паролей: сохранение, автозаполнение, генератор. Пароли шифруются и синхронизируются при входе через аккаунт.</div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-full bg-zinc-900 text-white text-sm">Очистить данные — час / день / всё время</button>
                <button className="px-4 py-2 rounded-full bg-white border border-black/10 text-sm">Настроить куки</button>
              </div>
            </div>
          </>
        )}

        {tab === 'downloads' && (
          <>
            <h2 className="text-lg font-bold">Загрузки</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 flex items-center gap-3">
                <HardDrive size={18} /><div className="flex-1"><div className="text-sm font-medium">Папка для загрузок</div><div className="text-xs opacity-60 font-mono">{downloadPath}</div></div>
                <button className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs">Изменить</button>
              </div>
              <label className="flex items-center justify-between p-3 rounded-2xl border border-black/5 dark:border-white/10"><span className="text-sm">Спрашивать, куда сохранять каждый раз</span><input type="checkbox" checked={askWhere} onChange={e => setAskWhere(e.target.checked)} className="accent-zinc-900" /></label>
              <div className="grid md:grid-cols-2 gap-3">
                <label className="block p-3 rounded-2xl border border-black/5 dark:border-white/10"><span className="block text-sm font-medium mb-1">Категоризация</span><span className="block text-xs opacity-60 mb-2">Авто-сортировка: картинки, документы, видео, архивы</span><input type="checkbox" defaultChecked className="accent-zinc-900" /> Включено</label>
                <label className="block p-3 rounded-2xl border border-black/5 dark:border-white/10"><span className="block text-sm font-medium">Автоудаление из списка</span>
                  <select value={autoDelete} onChange={e => setAutoDelete(e.target.value)} className="mt-2 w-full px-3 py-2 rounded-full border bg-white dark:bg-zinc-900 text-sm"><option>Никогда</option><option>7 дней</option><option>30 дней</option><option>После закрытия</option></select>
                </label>
              </div>
              <label className="flex items-center justify-between p-3 rounded-2xl border border-black/5 dark:border-white/10"><span className="flex items-center gap-2 text-sm"><Volume2 size={14} /> Уведомления о завершении (системный тост)</span><input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} className="accent-zinc-900" /></label>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-full border text-sm">Показать в проводнике</button>
                <button className="px-4 py-2 rounded-full bg-white border text-sm">Пауза / Возобновление — доступно в боковой панели</button>
              </div>
            </div>
          </>
        )}

        {tab === 'languages' && (
          <>
            <h2 className="text-lg font-bold">Языки и переводчик</h2>
            <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <span className="text-sm">Язык интерфейса</span>
              <select className="px-3 py-1.5 rounded-full border bg-white dark:bg-zinc-900 text-sm"><option>Русский</option><option>English</option></select>
            </div>
            <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 space-y-3">
              <div className="text-sm font-semibold flex items-center gap-1"><Languages size={14} /> Переводчик</div>
              <label className="flex items-center justify-between text-sm"><span>Автоопределение языка — «Эта страница на английском, перевести?»</span><input type="checkbox" defaultChecked className="accent-zinc-900" /></label>
              <label className="flex items-center justify-between text-sm"><span>Перевод выделенного текста — правый клик → Перевести</span><input type="checkbox" defaultChecked className="accent-zinc-900" /></label>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10"><div className="text-xs opacity-60">API</div><div className="text-sm font-medium">LibreTranslate (self-hosted, бесплатно) + MyMemory</div><div className="text-xs opacity-60">Можно подключить DeepL / Google Translate</div></div>
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10"><div className="text-xs opacity-60">Всплывающее окно</div><div className="text-sm font-medium">Мини-окно с результатом + выбор языка</div></div>
              </div>
            </div>
            <div className="p-4 rounded-2xl border flex items-center gap-2" style={{ background: `${accent}08`, borderColor: `${accent}20` }}><CheckCircle2 size={16} style={{ color: accent }} /><span className="text-sm">Проверка орфографии включена. Доступность: крупный шрифт, высокая контрастность.</span></div>
          </>
        )}

        {tab === 'extensions' && (
          <>
            <h2 className="text-lg font-bold">Расширения</h2>
            <div className="p-4 rounded-2xl border border-dashed border-black/10 dark:border-white/10 text-sm opacity-70">Поддержка Chrome CRX через Chromium-движок. В веб-демо — моки. В Electron-сборке подключи chrome-extension:// и магазин.</div>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { name: 'AdBlock (встроен)', on: adblock, icon: Shield },
                { name: 'Dark Reader', on: true, icon: Moon },
                { name: 'Переводчик', on: true, icon: Languages },
                { name: 'KAYOR Notes', on: true, icon: StickyNote },
              ].map(e => (
                <div key={e.name} className="p-3 rounded-2xl border border-black/5 dark:border-white/10 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl grid place-items-center bg-black/5 dark:bg-white/10"><e.icon size={14} /></span><span className="flex-1 text-sm font-medium">{e.name}</span><span className={`px-2 py-1 rounded-full text-xs font-bold ${e.on ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}>{e.on ? 'Вкл' : 'Выкл'}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-full bg-zinc-900 text-white text-sm">Открыть Chrome Web Store</button>
              <button className="px-4 py-2 rounded-full border text-sm">Управление правами</button>
            </div>
          </>
        )}

        {tab === 'system' && (
          <>
            <h2 className="text-lg font-bold">Система</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-2xl border"><span className="text-sm">Аппаратное ускорение</span><input type="checkbox" defaultChecked className="accent-zinc-900" /></label>
              <label className="flex items-center justify-between p-3 rounded-2xl border"><span className="text-sm">Прокси</span><span className="text-xs opacity-60">Системные настройки</span></label>
              <div className="p-4 rounded-2xl border bg-black/5 dark:bg-white/5">
                <div className="text-sm font-semibold">Горячие клавиши</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    ['Ctrl+T', 'Новая вкладка'],
                    ['Ctrl+W', 'Закрыть вкладку'],
                    ['Ctrl+Shift+T', 'Восстановить'],
                    ['Ctrl+L', 'Адресная строка'],
                    ['Ctrl+K', 'Команды'],
                    ['Ctrl+Tab', 'Следующая вкладка'],
                  ].map(([k, d]) => (
                    <div key={k} className="flex justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border"><span>{k}</span><span className="opacity-60">{d}</span></div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-2xl border flex items-center gap-2 text-xs"><Monitor size={12} /> Адаптация под HiDPI / 4K и тачскрин — крупные кнопки на планшетах</div>
            </div>
          </>
        )}

        {tab === 'about' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}, #7b61ff)` }}>
              <div className="text-2xl font-black tracking-tight">KAYOR BROWSER</div><div className="text-white/80 text-sm">Версия 1.0.0 • Stable • Chromium 124 • 64-bit</div>
              <div className="mt-3 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white text-zinc-900 text-xs font-bold">Автообновление — фоновое</span>
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs">Каналы: Stable / Beta / Nightly</span>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border">
                <div className="text-sm font-semibold">Установщик</div><div className="text-xs opacity-60 mt-1">Красивый анимированный установщик (Inno Setup / NSIS / WiX) — выбор папки, языка, импорта данных. Тихая установка + портативная версия с флешки.</div>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs">Скачать installer</button>
                  <button className="px-3 py-1.5 rounded-full border text-xs">Мастер первого запуска</button>
                </div>
              </div>
              <div className="p-4 rounded-2xl border">
                <div className="text-sm font-semibold">Деинсталлятор</div><div className="text-xs opacity-60 mt-1">«Удалить все данные?» да/нет, опрос «Почему уходите?» — уважительно и честно.</div>
                <button className="mt-3 px-3 py-1.5 rounded-full bg-white border text-xs">Удалить KAYOR</button>
              </div>
            </div>
            <div className="text-xs opacity-60">
              Стек: Electron + React / Tauri + Rust / Qt — на выбор. Движок Blink. Блокировщик на базе uBlock Origin. Перевод — LibreTranslate API. Логотип замени в /public/favicon.svg
            </div>
            {profile.provider ? (
              <div className="p-3 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-sm"><CheckCircle2 size={14} className="text-emerald-600" /> Вошёл как {profile.name} • Синхронизация включена</div>
            ) : (
              <div className="p-3 rounded-2xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 flex items-center gap-2 text-sm"><AlertTriangle size={14} className="text-amber-600" /> Войди через Google или Яндекс ID для синхронизации закладок, истории и паролей</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Internal pages ───────────────────────────────────────────────────────────
function HistoryPage({ history, setHistory, onNavigate, theme }: any) {
  return (
    <div className={`flex-1 overflow-auto p-6 ${theme === 'dark' ? 'bg-[#0a0a0f] text-white' : 'bg-white'}`}>
      <div className="max-w-[800px] mx-auto space-y-4">
        <div className="flex items-center justify-between"><h1 className="text-xl font-bold flex items-center gap-2"><Clock size={18} /> История</h1><button onClick={() => setHistory([])} className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs flex items-center gap-1"><Trash size={12} /> Очистить всё</button></div>
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" /><input placeholder="Поиск по истории" className="w-full pl-9 pr-3 py-2 rounded-full border bg-black/5 dark:bg-white/5 outline-none text-sm" /></div>
        {['Сегодня', 'Вчера'].map(group => (
          <div key={group}><div className="text-xs font-bold tracking-widest opacity-40 mt-4 mb-2">{group}</div><div className="space-y-1">
            {history.slice(0, group === 'Сегодня' ? 3 : 2).map((h: any) => (
              <div key={h.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5">
                <span>{h.favicon}</span><div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{h.title}</div><button onClick={() => onNavigate(h.url)} className="text-xs opacity-60 hover:opacity-100 truncate">{h.url}</button></div><span className="text-xs opacity-40">{h.time}</span><button onClick={() => setHistory((prev: any[]) => prev.filter(x => x.id !== h.id))} className="w-7 h-7 grid place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X size={12} /></button>
              </div>
            ))}
          </div></div>
        ))}
      </div>
    </div>
  )
}
function DownloadsPage({ downloads, setDownloads, theme, accent }: any) {
  return (
    <div className={`flex-1 overflow-auto p-6 ${theme === 'dark' ? 'bg-[#0a0a0f] text-white' : 'bg-white'}`}>
      <div className="max-w-[800px] mx-auto space-y-4">
        <h1 className="text-xl font-bold flex items-center gap-2"><Download size={18} /> Загрузки</h1>
        <div className="grid gap-3">
          {downloads.map((d: any) => (
            <div key={d.id} className="p-4 rounded-2xl border flex items-center gap-4 bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5">
              <div className="w-10 h-10 rounded-xl grid place-items-center text-white" style={{ background: accent }}><Download size={16} /></div>
              <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{d.name}</div><div className="text-xs opacity-60">{d.category} • {d.size}</div><div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 mt-2"><div className="h-full rounded-full" style={{ width: `${d.progress}%`, background: accent }} /></div></div>
              <div className="flex flex-col gap-1"><span className="text-xs px-2 py-1 rounded-full bg-emerald-500 text-white text-center">{d.status}</span><button onClick={() => setDownloads((ds: any[]) => ds.filter(x => x.id !== d.id))} className="text-xs opacity-60 hover:opacity-100">Удалить</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
function BookmarksPage({ bookmarks, setBookmarks, theme }: any) {
  return (
    <div className={`flex-1 overflow-auto p-6 ${theme === 'dark' ? 'bg-[#0a0a0f] text-white' : 'bg-white'}`}>
      <div className="max-w-[800px] mx-auto space-y-4">
        <div className="flex items-center justify-between"><h1 className="text-xl font-bold flex items-center gap-2"><Bookmark size={18} /> Закладки</h1><button onClick={() => setBookmarks((b: any[]) => [...b, { id: Math.random().toString(36).slice(2), title: 'Новая закладка', url: 'https://example.com', favicon: '🔖' }])} className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs flex items-center gap-1"><Plus size={12} /> Добавить</button></div>
        <div className="flex gap-2 text-xs"><button className="px-3 py-1.5 rounded-full border">Импорт из Chrome</button><button className="px-3 py-1.5 rounded-full border">Экспорт HTML</button></div>
        <div className="grid gap-1">
          {bookmarks.map((b: any) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
              <span>{b.favicon}</span><span className="flex-1 text-sm">{b.title}</span><span className="text-xs opacity-50">{b.url}</span><button onClick={() => setBookmarks((x: any[]) => x.filter(y => y.id !== b.id))} className="w-7 h-7 grid place-items-center rounded-full hover:bg-black/10"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
function SettingsPage(props: any) {
  return <div className="flex-1 overflow-hidden flex flex-col"><SettingsHeader onClose={() => props.setTheme && props.theme} accent={props.accent} /><SettingsBody {...props} profile={{ name: 'Гость', provider: null }} setProfile={() => {}} /></div>
}
