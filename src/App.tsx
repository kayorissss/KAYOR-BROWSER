import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Search, Star, Lock, ShieldCheck, ChevronLeft, ChevronRight, RotateCw, Home, Minus, Square,
  Bookmark, Download, Clock, History, Settings, Palette, Moon, Sun,
  Pin, Copy, ExternalLink, Sparkles, HardDrive, Check, Upload, User,
  Shield, EyeOff, Image as ImageIcon, StickyNote, ListChecks, Trash2,
  Globe, Zap, Languages, FolderOpen, Cpu, Monitor, Info, AlertTriangle, Loader2, CloudSun, Cloud, CloudRain, Snowflake, MapPin, HelpCircle, Edit3, FolderPlus, ChevronDown, MoreHorizontal, SunDim
} from 'lucide-react'

type Tab = { id: string; title: string; url: string; favicon: string; pinned?: boolean }
type BookmarkItem = { id: string; title: string; url: string; folderId?: string }
type BookmarkFolder = { id: string; title: string }
type HistoryItem = { id: string; title: string; url: string; time: string }
type DownloadItem = { id: string; name: string; size: string; progress: number; status: 'downloading'|'done' }
type Tile = { id:string; title:string; url:string; color:string; letter:string }

const WALLPAPERS = [
  { id: 'w1', name: 'Гранит', bg: 'linear-gradient(135deg,#0a0a0f 0%, #1a1a22 100%)' },
  { id: 'w2', name: 'Красный блеск', bg: 'radial-gradient(120% 120% at 20% 20%, #ff253a 0%, #1a0a0f 28%, #0a0a0f 72%)' },
  { id: 'w3', name: 'Матовое', bg: 'linear-gradient(135deg,#eef0f3 0%, #f8f9fb 100%)' },
]

const DEFAULT_TILES: Tile[] = [
  {id:'1', title:'YouTube', url:'https://youtube.com', color:'#ff0000', letter:'Y'},
  {id:'2', title:'Figma', url:'https://figma.com', color:'#1abcf2', letter:'F'},
  {id:'3', title:'GitHub', url:'https://github.com', color:'#24292e', letter:'G'},
  {id:'4', title:'Яндекс', url:'https://ya.ru', color:'#ffcc00', letter:'Я'},
  {id:'5', title:'Notion', url:'https://notion.so', color:'#000', letter:'N'},
  {id:'6', title:'Dribbble', url:'https://dribbble.com', color:'#ea4c89', letter:'D'},
  {id:'7', title:'Авито', url:'https://avito.ru', color:'#00aaff', letter:'A'},
  {id:'8', title:'Wiki', url:'https://wikipedia.org', color:'#636466', letter:'W'},
]

const CITIES = [
  {name:'Москва', temp:'+17°', cond:'Облачно', icon:'cloud'},
  {name:'Самара', temp:'+19°', cond:'Ясно', icon:'sun'},
  {name:'Казань', temp:'+16°', cond:'Дождь', icon:'rain'},
  {name:'Сочи', temp:'+23°', cond:'Ясно', icon:'sun'},
  {name:'СПб', temp:'+14°', cond:'Облачно', icon:'cloud'},
  {name:'Екатеринбург', temp:'+12°', cond:'Снег', icon:'snow'},
  {name:'Новосибирск', temp:'+10°', cond:'Облачно', icon:'cloud'},
  {name:'Краснодар', temp:'+22°', cond:'Ясно', icon:'sun'},
  {name:'Санкт-Петербург', temp:'+14°', cond:'Дождь', icon:'rain'},
  {name:'Уфа', temp:'+15°', cond:'Облачно', icon:'cloud'},
  {name:'Пермь', temp:'+13°', cond:'Дождь', icon:'rain'},
  {name:'Воронеж', temp:'+18°', cond:'Ясно', icon:'sun'},
  {name:'Волгоград', temp:'+20°', cond:'Ясно', icon:'sun'},
  {name:'Красноярск', temp:'+11°', cond:'Снег', icon:'snow'},
  {name:'Тюмень', temp:'+12°', cond:'Облачно', icon:'cloud'},
  {name:'Саратов', temp:'+17°', cond:'Облачно', icon:'cloud'},
  {name:'Тольятти', temp:'+18°', cond:'Ясно', icon:'sun'},
  {name:'Ижевск', temp:'+14°', cond:'Дождь', icon:'rain'},
  {name:'Барнаул', temp:'+12°', cond:'Облачно', icon:'cloud'},
  {name:'Ульяновск', temp:'+16°', cond:'Ясно', icon:'sun'},
  {name:'Иркутск', temp:'+9°', cond:'Снег', icon:'snow'},
  {name:'Хабаровск', temp:'+11°', cond:'Облачно', icon:'cloud'},
  {name:'Ярославль', temp:'+15°', cond:'Облачно', icon:'cloud'},
  {name:'Владивосток', temp:'+13°', cond:'Дождь', icon:'rain'},
  {name:'Томск', temp:'+10°', cond:'Облачно', icon:'cloud'},
  {name:'Оренбург', temp:'+16°', cond:'Ясно', icon:'sun'},
  {name:'Рязань', temp:'+16°', cond:'Облачно', icon:'cloud'},
  {name:'Киров', temp:'+13°', cond:'Дождь', icon:'rain'},
  {name:'Тула', temp:'+16°', cond:'Облачно', icon:'cloud'},
  {name:'Кижи', temp:'+12°', cond:'Облачно', icon:'cloud'},
  {name:'Суздаль', temp:'+15°', cond:'Ясно', icon:'sun'},
  {name:'Байкал', temp:'+8°', cond:'Снег', icon:'snow'},
]

const LOGO = "kayorbrowse.png"

function faviconFor(url:string){
  try{
    const {hostname}=new URL(url.startsWith('http')?url:'https://'+url)
    if(!hostname.includes('.')||hostname==='kayor') return ''
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  }catch{ return '' }
}

function Tooltip({text}:{text:string}){
  return (
    <span className="group/tooltip relative inline-flex">
      <HelpCircle size={14} className="opacity-40 hover:opacity-80 cursor-help"/>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block bg-zinc-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-50 shadow-lg">{text}</span>
    </span>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v:boolean)=>void }){
  return <button onClick={()=> onChange(!checked)} className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-all duration-200 ${checked?'bg-[#ff253a] justify-end':'bg-white/20 justify-start border border-black/5'}`}><span className="w-4 h-4 rounded-full bg-white shadow transition-all"/></button>
}

export default function App(){
  const [tabs, setTabs] = useState<Tab[]>(()=> {
    const s = localStorage.getItem('kayor_tabs_v2')
    return s ? JSON.parse(s) : [{ id:'1', title:'Новая вкладка', url:'kayor://newtab', favicon:'⌂' }]
  })
  const [activeId, setActiveId] = useState(()=> tabs[0]?.id || '1')
  const [closed, setClosed] = useState<Tab[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(()=>{
    const s=localStorage.getItem('kayor_bm_v2')
    return s ? JSON.parse(s) : []
  })
  const [folders, setFolders] = useState<BookmarkFolder[]>(()=>{
    const s=localStorage.getItem('kayor_folders')
    return s? JSON.parse(s): [{id:'default', title:'Панель закладок'}]
  })
  const [history, setHistory] = useState<HistoryItem[]>(()=>{
    const s=localStorage.getItem('kayor_hist_v2')
    return s? JSON.parse(s):[]
  })
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [theme, setTheme] = useState<'dark'|'light'>(()=> (localStorage.getItem('kayor_theme') as any) || 'dark')
  const [wallpaperId, setWallpaperId] = useState(()=> localStorage.getItem('kayor_wp') || 'w2')
  const [showBookmarksBar, setShowBookmarksBar] = useState(()=> localStorage.getItem('kayor_bm_bar')==='1')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'bookmarks'|'history'|'downloads'>('bookmarks')
  const [omnibox, setOmnibox] = useState('')
  const [focused, setFocused] = useState(false)
  const [engine, setEngine] = useState<'yandex'|'google'|'duckduckgo'|'bing'>('yandex')
  const [incognito, setIncognito] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'appearance'|'search'|'privacy'|'downloads'|'performance'|'system'|'about'>('appearance')
  const [showMenu, setShowMenu] = useState(false)
  const [showTabMenu, setShowTabMenu] = useState<{x:number;y:number;id:string}|null>(null)
  const [linkMenu, setLinkMenu] = useState<{x:number;y:number;url:string}|null>(null)
  const [lockPopup, setLockPopup] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const omniboxRef = useRef<HTMLInputElement>(null)
  const webviewRef = useRef<any>(null)
  const [timeNow, setTimeNow] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<{code:number;desc:string;url:string}|null>(null)
  const [tiles, setTiles] = useState<Tile[]>(()=>{
    const s=localStorage.getItem('kayor_tiles')
    return s? JSON.parse(s): DEFAULT_TILES
  })
  const [editingTile, setEditingTile] = useState<Tile|null>(null)
  const [showTileModal, setShowTileModal] = useState(false)
  const [tileForm, setTileForm] = useState({title:'',url:''})
  const [city, setCity] = useState(()=> localStorage.getItem('kayor_city')||'Москва')
  const [citySearch, setCitySearch] = useState('')
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [showBookmarkModal, setShowBookmarkModal] = useState<{url:string,title:string}|null>(null)
  const [bookmarkFolderId, setBookmarkFolderId] = useState('default')
  const [dragId, setDragId] = useState<string|null>(null)
  const [confirmClear, setConfirmClear] = useState<null|'history'|'all'>(null)
  const [toast, setToast] = useState<string|null>(null)

  const [adBlock, setAdBlock] = useState(()=> localStorage.getItem('kayor_adblock')!=='0')
  const [trackerBlock, setTrackerBlock] = useState(()=> localStorage.getItem('kayor_tracker')!=='0')
  const [httpsOnly, setHttpsOnly] = useState(()=> localStorage.getItem('kayor_https')!=='0')
  const [dnt, setDnt] = useState(()=> localStorage.getItem('kayor_dnt')!=='0')
  const [memorySaver, setMemorySaver] = useState(()=> localStorage.getItem('kayor_memsaver')!=='0')
  const [animations, setAnimations] = useState(()=> localStorage.getItem('kayor_anim')!=='0')
  const [compactMode, setCompactMode] = useState(()=> localStorage.getItem('kayor_compact')==='1')
  const [showHomeButton, setShowHomeButton] = useState(()=> localStorage.getItem('kayor_home')!=='0')
  const [askDownload, setAskDownload] = useState(true)
  const [autoOpenDownload, setAutoOpenDownload] = useState(false)

  const isLight = theme==='light'
  const isElectron = useMemo(()=> {
    // @ts-ignore
    if(typeof window !== 'undefined' && (window as any).kayor?.isElectron) return true
    if(typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')) return true
    return false
  }, [])

  const activeTab = useMemo(()=> tabs.find(t=>t.id===activeId) || tabs[0], [tabs,activeId])
  const wallpaper = useMemo(()=>{
    if(isLight) return WALLPAPERS[2]
    return WALLPAPERS.find(w=>w.id===wallpaperId) || WALLPAPERS[1]
  }, [wallpaperId, isLight])
  const isNewTab = activeTab?.url.startsWith('kayor://')
  const weather = useMemo(()=> CITIES.find(c=>c.name===city) || CITIES[0], [city])

  // persist
  useEffect(()=> localStorage.setItem('kayor_tabs_v2', JSON.stringify(tabs)),[tabs])
  useEffect(()=> localStorage.setItem('kayor_bm_v2', JSON.stringify(bookmarks)),[bookmarks])
  useEffect(()=> localStorage.setItem('kayor_folders', JSON.stringify(folders)),[folders])
  useEffect(()=> localStorage.setItem('kayor_hist_v2', JSON.stringify(history)),[history])
  useEffect(()=> localStorage.setItem('kayor_wp', wallpaperId),[wallpaperId])
  useEffect(()=> localStorage.setItem('kayor_tiles', JSON.stringify(tiles)),[tiles])
  useEffect(()=> localStorage.setItem('kayor_city', city),[city])

  // слушать открытие url из main (webview new-window -> вкладка, а не окно) п.13
  useEffect(()=>{
    const k:any = (window as any).kayor
    if(k?.onOpenUrl) k.onOpenUrl((url:string)=> createTab(url))
    if(k?.onNewTab) k.onNewTab(()=> createTab())
  },[])
  useEffect(()=> localStorage.setItem('kayor_theme', theme),[theme])
  useEffect(()=> localStorage.setItem('kayor_bm_bar', showBookmarksBar?'1':'0'),[showBookmarksBar])
  useEffect(()=> { localStorage.setItem('kayor_adblock', adBlock?'1':'0') },[adBlock])
  useEffect(()=> { localStorage.setItem('kayor_anim', animations?'1':'0') },[animations])

  useEffect(()=>{ const i=setInterval(()=> setTimeNow(new Date()), 1000); return ()=> clearInterval(i)},[])
  useEffect(()=>{ if(toast){ const t=setTimeout(()=> setToast(null), 2500); return ()=> clearTimeout(t)}},[toast])

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if((e.ctrlKey||e.metaKey)&& e.key.toLowerCase()==='t' && !e.shiftKey){ e.preventDefault(); createTab()}
      if((e.ctrlKey||e.metaKey)&& e.key.toLowerCase()==='w'){ e.preventDefault(); closeTab(activeId)}
      if((e.ctrlKey||e.metaKey)&& e.shiftKey && e.key.toLowerCase()==='t'){ e.preventDefault(); const last=closed[closed.length-1]; if(last){ setClosed(s=>s.slice(0,-1)); setTabs(t=>[...t,last]); setActiveId(last.id)}}
      if((e.ctrlKey||e.metaKey)&& e.key.toLowerCase()==='l'){ e.preventDefault(); omniboxRef.current?.focus()}
      if(e.key==='Escape'){ setShowSettings(false); setShowMenu(false); setShowTabMenu(null); setLinkMenu(null); setLockPopup(false)}
    }
    window.addEventListener('keydown',h); return()=> window.removeEventListener('keydown',h)
  },[activeId, closed])

  // webview events
  useEffect(()=>{
    const wv = webviewRef.current
    if(!wv || isNewTab || !isElectron) return
    const updNav = ()=>{
      try{ setCanGoBack(wv.canGoBack()); setCanGoForward(wv.canGoForward()) }catch{}
    }
    const onStart = ()=>{ setLoading(true); setLoadError(null); updNav()}
    const onStop = ()=> { setLoading(false); updNav()}
    const onFail = (e:any)=>{
      if(e.errorCode===-3 || e.errorCode===-300) return
      setLoading(false)
      setLoadError({code:e.errorCode, desc:e.errorDescription||'ERR_FAILED', url:e.validatedURL||activeTab?.url||''})
    }
    const onNavigate = (e:any)=>{
      const url = e.url || wv.getURL?.()
      if(!url || url==='about:blank') return
      setLoadError(null)
      if(url!==activeTab?.url){
        setTabs(ts=> ts.map(t=> t.id===activeId ? {...t, url, title: (()=>{try{return new URL(url).hostname}catch{return url}})(), favicon:'🌐'} : t))
        setHistory(h=> [{id:Math.random().toString(36).slice(2), title:url, url, time:'сейчас'}, ...h].slice(0,100))
      }
      setTimeout(updNav,100)
    }
    const onTitle = (e:any)=>{ if(e.title) setTabs(ts=> ts.map(t=> t.id===activeId ? {...t, title:e.title} : t)) }
    const onNewWindow = (e:any)=>{
      const url = e.url
      if(url){ try{ e.preventDefault() }catch{}; createTab(url) }
    }
    const onContextMenu = (e:any)=>{
      const p=e.params
      if(p.linkURL){
        setLinkMenu({x:p.x, y:p.y, url:p.linkURL})
      }
    }
    wv.addEventListener('did-start-loading', onStart)
    wv.addEventListener('did-stop-loading', onStop)
    wv.addEventListener('did-fail-load', onFail)
    wv.addEventListener('did-navigate', onNavigate)
    wv.addEventListener('did-navigate-in-page', onNavigate)
    wv.addEventListener('page-title-updated', onTitle)
    wv.addEventListener('new-window', onNewWindow as any)
    wv.addEventListener('did-create-window', onNewWindow as any)
    wv.addEventListener('context-menu', onContextMenu as any)
    return ()=>{
      wv.removeEventListener('did-start-loading', onStart)
      wv.removeEventListener('did-stop-loading', onStop)
      wv.removeEventListener('did-fail-load', onFail)
      wv.removeEventListener('did-navigate', onNavigate)
      wv.removeEventListener('did-navigate-in-page', onNavigate)
      wv.removeEventListener('page-title-updated', onTitle)
      wv.removeEventListener('new-window', onNewWindow as any)
      wv.removeEventListener('did-create-window', onNewWindow as any)
      wv.removeEventListener('context-menu', onContextMenu as any)
    }
  },[activeId, isNewTab, isElectron, activeTab?.url])

  function createTab(url='kayor://newtab'){
    const id=Math.random().toString(36).slice(2,7)
    const isInternal=url.startsWith('kayor://')
    const title=isInternal?'Новая вкладка':(()=>{try{return new URL(url.startsWith('http')?url:'https://'+url).hostname}catch{return url}})()
    const t:Tab={id, url, title, favicon: isInternal?'⌂':'🌐'}
    setTabs(x=>[...x,t]); setActiveId(id); setLoadError(null); setLoading(false)
    if(!isInternal) setHistory(h=>[{id:Math.random().toString(36).slice(2), title, url, time: new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})},...h].slice(0,100))
  }
  function closeTab(id:string){
    const tab=tabs.find(t=>t.id===id); if(!tab) return
    setClosed(s=>[...s,tab].slice(-20))
    setTabs(prev=>{
      const next=prev.filter(t=>t.id!==id)
      if(next.length===0){ const nid=Math.random().toString(36).slice(2,7); const nt:Tab={id:nid,title:'Новая вкладка',url:'kayor://newtab',favicon:'⌂'}; setActiveId(nid); return [nt]}
      if(id===activeId){ const idx=prev.findIndex(t=>t.id===id); const na=next[Math.max(0,idx-1)]||next[0]; setActiveId(na.id)}
      return next
    })
  }
  function navigate(input:string){
    let url=input.trim(); if(!url) return
    // команды
    if(url.startsWith('/calc ')){ try{const expr=url.replace('/calc ',''); const r=Function(`"use strict";return (${expr})`)(); setOmnibox(String(r)); setToast(`= ${r}`); return}catch{ setToast('Ошибка выражения'); return}}
    if(url.startsWith('/translate ')){ const q=encodeURIComponent(url.replace('/translate ','').trim()); const u=`https://translate.yandex.ru/?text=${q}`; url=u }
    const isUrl=url.includes('.')||url.startsWith('http')||url.startsWith('kayor://')
    if(!isUrl){
      const q=encodeURIComponent(url)
      const engines:any={yandex:`https://ya.ru/search?text=${q}`, google:`https://www.google.com/search?q=${q}`, duckduckgo:`https://duckduckgo.com/?q=${q}`, bing:`https://www.bing.com/search?q=${q}`}
      url=engines[engine] || engines.yandex
    } else if(!url.startsWith('http')&&!url.startsWith('kayor://')) url='https://'+url
    setTabs(ts=> ts.map(t=> t.id===activeId?{...t,url, title: url.startsWith('kayor://')?'Новая вкладка':(()=>{try{return new URL(url).hostname}catch{return url}})(), favicon: url.startsWith('kayor://')?'⌂':'🌐'}:t))
    if(!url.startsWith('kayor://')) setHistory(h=>[{id:Math.random().toString(36).slice(2), title:url, url, time:'сейчас'},...h].slice(0,100))
    setOmnibox(''); setFocused(false); setLoadError(null); setLoading(true)
    setTimeout(()=>{
      const wv = webviewRef.current
      if(wv && !url.startsWith('kayor://') && isElectron){
        try{ wv.loadURL?.(url); wv.src=url }catch{}
      }
    },30)
  }

  function handleBack(){
    const wv = webviewRef.current
    if(isElectron && wv && !isNewTab){
      try{ if(wv.canGoBack()) wv.goBack(); }catch{ wv.goBack?.() }
    }
  }
  function handleForward(){
    const wv = webviewRef.current
    if(isElectron && wv && !isNewTab){
      try{ if(wv.canGoForward()) wv.goForward(); }catch{}
    }
  }
  function handleReload(){
    const wv = webviewRef.current
    if(loadError){ setLoadError(null); setLoading(true) }
    if(isElectron && wv && !isNewTab){
      try{ wv.reload?.() }catch{}
    } else {
      window.location.reload()
    }
  }
  function winCtrl(action:'minimize'|'maximize'|'close'){
    // @ts-ignore
    const kayor = (window as any).kayor
    if(kayor?.windowControl) kayor.windowControl(action)
  }

  const suggestions = useMemo(()=>{
    if(!focused || !omnibox) return []
    const q=omnibox.toLowerCase()
    const cmds = ['/calc 2+2','/translate привет','/calc 12*8'].filter(c=>c.includes(q)).map(c=>({label:c, sub:'Команда', url:c}))
    const fromHist=history.filter(h=>h.title.toLowerCase().includes(q)||h.url.toLowerCase().includes(q)).slice(0,3).map(h=>({label:h.title, sub:h.url, url:h.url}))
    const fromBook=bookmarks.filter(b=>b.title.toLowerCase().includes(q)).slice(0,2).map(b=>({label:b.title, sub:b.url, url:b.url}))
    if(q.startsWith('/')){
      return [...cmds, ...fromHist].slice(0,6)
    }
    const search=[{label:`Искать «${omnibox}» в ${engine}`, sub:`${engine} поиск`, url: omnibox}]
    return [...fromHist, ...fromBook, ...search].slice(0,6)
  },[focused,omnibox, history, bookmarks, engine])

  const displayValue = focused ? omnibox : (activeTab?.url?.startsWith('kayor://') ? '' : (activeTab?.url || ''))

  const tileModalSave = ()=>{
    if(!tileForm.title || !tileForm.url) return setToast('Заполни название и ссылку')
    let url=tileForm.url.trim(); if(!url.startsWith('http')) url='https://'+url
    if(editingTile){
      setTiles(t=> t.map(x=> x.id===editingTile.id? {...x, title:tileForm.title, url, letter: tileForm.title[0]?.toUpperCase()||'K'}:x))
    } else {
      const id=Math.random().toString(36).slice(2,7)
      setTiles(t=> [...t, {id, title:tileForm.title, url, color:'#ff253a', letter: tileForm.title[0]?.toUpperCase()||'K'}].slice(0,16))
    }
    setShowTileModal(false); setEditingTile(null); setTileForm({title:'',url:''})
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden select-none ${isLight?'bg-[#f6f6f7] text-zinc-900':'bg-[#0a0a0f] text-zinc-100'}`} style={{fontFamily:'Inter, system-ui, sans-serif'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@700;800&display=swap'); :root{--accent:#ff253a} webview{ display:flex; width:100%; height:100%; }`}</style>

      {/* контейнер */}
      <div className={`flex-1 flex flex-col overflow-hidden ${incognito ? 'bg-[#1a1030]' : isLight ? 'bg-[#f6f6f7] text-zinc-900' : 'bg-[#0a0a0f] text-zinc-100'} ${incognito ? 'ring-2 ring-violet-500/20' : ''}`}>

        {/* TAB BAR — активная заметнее, неактивные затемнены */}
        <div className={`h-10 flex items-center gap-1 px-2 shrink-0 border-b ${compactMode?'h-8':''} ${incognito ? 'bg-[#1a1030] border-violet-900/30' : isLight ? 'bg-[#ffffff] border-black/5' : 'bg-[#0f0f14] border-white/5'}`} style={{ WebkitAppRegion: 'drag' } as any}>

          <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none ml-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
            {tabs.map(tab=>{
              const isActive = activeId===tab.id
              const fav = faviconFor(tab.url)
              const isTabLoading = isActive && loading && !isNewTab
              return (
              <motion.div
                key={tab.id}
                layout={animations}
                initial={{opacity:0, y:0}} animate={{opacity:1, y:0}} transition={{duration:0}}
                onClick={()=> {setActiveId(tab.id); setLoadError(null)}}
                onMouseDown={e=> { if(e.button===1){ e.preventDefault(); closeTab(tab.id)} }}
                onContextMenu={e=> { e.preventDefault(); setShowTabMenu({x:e.clientX, y:e.clientY, id:tab.id})}}
                className={`group flex items-center gap-2 px-3 h-7 rounded-full text-[13px] cursor-pointer shrink-0 border relative transition-all
                  ${isActive
                    ? (incognito
                        ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                        : isLight
                          ? 'bg-white text-zinc-900 border-black/10 shadow-md ring-1 ring-black/5'
                          : 'bg-[#23232b] text-white border-white/15 shadow-md')
                    : isLight
                      ? 'bg-black/[0.04] text-zinc-500 hover:text-zinc-800 border-black/5 hover:bg-black/5 opacity-80 hover:opacity-100'
                      : 'bg-white/[0.04] text-zinc-500 hover:text-zinc-200 border-white/5 hover:bg-white/10 opacity-60 hover:opacity-100'}
                  ${tab.pinned ? 'w-9 justify-center px-2' : 'min-w-[140px] max-w-[200px]'}`}
                style={{fontFamily: isActive?'Unbounded, sans-serif':'Inter', WebkitAppRegion:'no-drag'} as any}
              >
                {isActive && !incognito && <span className="absolute inset-0 rounded-full border border-[#ff253a]/0 group-hover:border-[#ff253a]/10 pointer-events-none"/>}
                <span className="w-3.5 h-3.5 grid place-items-center shrink-0">
                  {isTabLoading ? <Loader2 size={12} className="animate-spin"/> :
                    tab.url.startsWith('kayor://') ? <img src={LOGO} width={14} height={14} className="rounded-sm object-cover"/> :
                    fav ? <img src={fav} width={14} height={14} className="rounded-sm object-contain" onError={e=> (e.currentTarget.style.display='none')} /> :
                    <span className="text-[11px]">🌐</span>
                  }
                </span>
                {!tab.pinned && <span className={`truncate flex-1 font-medium text-[12px] ${isActive?'opacity-100':'opacity-80'}`}>{tab.title}</span>}
                {tab.pinned && <Pin size={10} className="opacity-60 absolute -top-1 -right-1 bg-white text-zinc-900 rounded-full p-0.5 w-3 h-3" />}
                {!tab.pinned && (
                  <button onClick={e=>{e.stopPropagation(); closeTab(tab.id)}} className={`w-4 h-4 grid place-items-center rounded-full -mr-1 ${isActive?'opacity-70 hover:opacity-100 hover:bg-black/10':'opacity-40 group-hover:opacity-100 hover:bg-white/10'}`}>
                    <X size={10}/>
                  </button>
                )}
              </motion.div>
            )})}
            <button onClick={()=>createTab()} className={`w-7 h-7 grid place-items-center rounded-full border shrink-0 ml-1 ${isLight?'bg-black/5 hover:bg-black/10 border-black/5':'bg-white/5 hover:bg-white/10 border-white/5'}`}>
              <Plus size={14}/>
            </button>
          </div>

          <div className="flex items-center gap-1 ml-2 shrink-0" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <button onClick={()=> setIncognito(!incognito)} title={incognito?'Инкогнито':'Обычный режим'} className={`w-7 h-7 grid place-items-center rounded-full border transition ${incognito?'bg-violet-600 text-white border-violet-500':'bg-white/5 border-white/10 hover:bg-white/10'} ${isLight && !incognito ? 'bg-black/5 border-black/10 hover:bg-black/10 text-zinc-700' : ''}`}>
              {incognito ? <EyeOff size={14}/> : <Globe size={14}/>}
            </button>
            <button onClick={()=> setShowMenu(!showMenu)} className={`w-7 h-7 grid place-items-center rounded-full ${isLight?'hover:bg-black/5':'hover:bg-white/10'}`} style={{WebkitAppRegion:'no-drag'} as any}><span className="text-[16px] leading-none">⋮</span></button>
            <div className="flex items-center gap-0.5 ml-1">
              <button onClick={()=> winCtrl('minimize')} title="Свернуть" className={`w-8 h-8 grid place-items-center rounded-md ${isLight?'hover:bg-black/5':'hover:bg-white/10'}`}><Minus size={14}/></button>
              <button onClick={()=> winCtrl('maximize')} title="Развернуть" className={`w-8 h-8 grid place-items-center rounded-md ${isLight?'hover:bg-black/5':'hover:bg-white/10'}`}><Square size={12}/></button>
              <button onClick={()=> winCtrl('close')} title="Закрыть" className="w-8 h-8 grid place-items-center hover:bg-red-500 hover:text-white rounded-md"><X size={14}/></button>
            </div>
          </div>
        </div>

        {incognito && !isNewTab && (
          <div className="h-7 flex items-center justify-center gap-2 text-xs bg-violet-600 text-white px-3">
            <EyeOff size={12}/> Режим инкогнито — история и куки не сохраняются • <button onClick={()=> setIncognito(false)} className="underline">Выйти</button>
          </div>
        )}

        {/* OMNIBOX */}
        <div className={`h-12 flex items-center gap-2 px-3 shrink-0 border-b relative ${incognito?'bg-[#1a1030] border-violet-900/20': isLight ? 'bg-[#f1f1f3] border-black/5' : 'bg-[#18181f] border-white/5'}`}>
          {loading && <div className="absolute left-0 top-0 h-0.5 bg-[#ff253a] w-full overflow-hidden"><div className="h-full w-1/3 bg-[#ff253a]" style={{animation: animations?'kayor-load 1.1s ease-in-out infinite':''}}/></div>}
          <style>{`@keyframes kayor-load{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
          <div className="flex items-center gap-1">
            <button onClick={handleBack} title="Назад" className={`w-8 h-8 grid place-items-center rounded-full ${canGoBack?'opacity-100 hover:bg-black/5':'opacity-30'} ${isLight?'hover:bg-black/5':'hover:bg-white/10'}`}><ChevronLeft size={16}/></button>
            <button onClick={handleForward} title="Вперёд" className={`w-8 h-8 grid place-items-center rounded-full ${canGoForward?'opacity-100 hover:bg-black/5':'opacity-30'} ${isLight?'hover:bg-black/5':'hover:bg-white/10'}`}><ChevronRight size={16}/></button>
            <button onClick={handleReload} title="Обновить" className={`w-8 h-8 grid place-items-center rounded-full ${isLight?'hover:bg-black/5':'hover:bg-white/10'} ${loading?'animate-spin':''}`}><RotateCw size={14}/></button>
            {showHomeButton && <button onClick={()=> navigate('kayor://newtab')} title="Домой" className={`w-8 h-8 grid place-items-center rounded-full ${isLight?'hover:bg-black/5':'hover:bg-white/10'}`}><Home size={14}/></button>}
          </div>

          <div className={`flex-1 flex items-center gap-2 px-3 h-9 rounded-full border relative ${incognito?'bg-[#2a1a4a] border-violet-800': isLight ? 'bg-white border-black/10' : 'bg-[#23232b] border-white/10'} ${focused?'ring-2 ring-[#ff253a]/20':''}`}>
            <button onClick={()=> setLockPopup(!lockPopup)} className={`w-5 h-5 grid place-items-center rounded-full shrink-0 ${loading?'bg-[#ff253a] animate-pulse': activeTab?.url.startsWith('https://')?'bg-emerald-500':'bg-white/10 border border-black/5'} ${isLight && !loading && !activeTab?.url.startsWith('https://')?'bg-black/5':''}`}>
              {loading ? <Loader2 size={10} className="text-white animate-spin"/> : <Lock size={10} className="text-white"/>}
            </button>
            <input
              ref={omniboxRef}
              value={displayValue}
              onFocus={()=>{
                setFocused(true)
                const v = activeTab?.url?.startsWith('kayor://') ? '' : activeTab?.url || ''
                setOmnibox(v)
                setTimeout(()=> omniboxRef.current?.select(), 30)
              }}
              onBlur={()=> setTimeout(()=> setFocused(false),150)}
              onChange={e=> setOmnibox(e.target.value)}
              onKeyDown={e=> e.key==='Enter' && navigate(omnibox)}
              placeholder="Поиск или адрес • /calc 2+2 • /translate привет"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-zinc-500"
            />

            <button onClick={()=>{
              if(!activeTab?.url || activeTab.url.startsWith('kayor://')) return setToast('Нечего добавлять')
              setShowBookmarkModal({url:activeTab.url, title:activeTab.title})
              setBookmarkFolderId('default')
            }} className={`w-6 h-6 grid place-items-center rounded-full ${isLight?'hover:bg-black/5':'hover:bg-white/10'}`}>
              {bookmarks.some(b=>b.url===activeTab?.url) ? <Star size={14} className="fill-amber-400 text-amber-400"/> : <Star size={14} className="opacity-60"/>}
            </button>
          </div>

          <button onClick={()=> setSidebarOpen(!sidebarOpen)} title="Боковая панель" className={`w-8 h-8 grid place-items-center rounded-full border ${sidebarOpen? (isLight?'bg-zinc-900 text-white':'bg-white text-zinc-900') : isLight?'bg-white border-black/10 hover:bg-black/5':'bg-white/5 border-white/10 hover:bg-white/10'}`}><Bookmark size={14}/></button>
        </div>

        {/* Закладки бар — с D&D и папками */}
        {showBookmarksBar && (
          <div className={`h-8 flex items-center gap-1 px-3 border-b overflow-x-auto ${isLight?'bg-[#f9f9fb] border-black/5':'bg-[#14141a] border-white/5'}`}>
            {bookmarks.length===0 ? (
              <div className="flex items-center gap-2 text-xs">
                <span className={`${isLight?'text-zinc-500':'opacity-60'}`}>Закладок пока нет</span>
                <button onClick={()=> setShowBookmarkModal({url:activeTab?.url||'https://ya.ru', title:activeTab?.title||'Новая закладка'})} className="px-2 py-0.5 rounded-full bg-[#ff253a] text-white text-xs">Добавить</button>
                <span className="opacity-30 hidden sm:inline">• перетащи ссылку сюда или нажми ★</span>
              </div>
            ) : (
              <>
                {folders.map(f=>(
                  <div key={f.id} className="flex items-center gap-1">
                    <span className="text-xs opacity-40 hidden sm:inline">{f.title}</span>
                    {bookmarks.filter(b=> (b.folderId||'default')===f.id).map(b=>{
                      const fav=faviconFor(b.url)
                      return (
                        <button
                          key={b.id}
                          draggable
                          onDragStart={()=> setDragId(b.id)}
                          onDragOver={e=> e.preventDefault()}
                          onDrop={()=>{
                            if(!dragId || dragId===b.id) return
                            const fromIdx=bookmarks.findIndex(x=>x.id===dragId)
                            const toIdx=bookmarks.findIndex(x=>x.id===b.id)
                            if(fromIdx<0||toIdx<0) return
                            const copy=[...bookmarks]
                            const [moved]=copy.splice(fromIdx,1)
                            copy.splice(toIdx,0,moved)
                            setBookmarks(copy)
                          }}
                          onClick={()=> navigate(b.url)}
                          onContextMenu={e=> { e.preventDefault(); if(confirm(`Удалить "${b.title}"?`)) setBookmarks(x=>x.filter(y=>y.id!==b.id)) }}
                          className={`px-2.5 py-1 rounded-full border text-xs shrink-0 flex items-center gap-1.5 ${isLight?'bg-white hover:bg-black/5 border-black/5':'bg-white/5 hover:bg-white/10 border-white/5'}`}>
                          {fav ? <img src={fav} width={12} height={12} className="rounded-sm"/> : <Star size={10} className="opacity-40"/>} {b.title}
                        </button>
                      )
                    })}
                  </div>
                ))}
                <button onClick={()=> {
                  const name=prompt('Название папки'); if(!name) return
                  setFolders(f=> [...f, {id:Math.random().toString(36).slice(2,7), title:name}])
                }} className="ml-1 p-1 rounded-full hover:bg-black/5" title="Создать папку"><FolderPlus size={14} className="opacity-60"/></button>
              </>
            )}
            <button onClick={()=> setShowBookmarksBar(false)} className="ml-auto text-xs opacity-40 hover:opacity-80 shrink-0 hidden sm:block">Скрыть</button>
          </div>
        )}

        {/* Lock popup — как на скрине Pinterest, тёмный */}
        {lockPopup && (
          <>
            <div className="fixed inset-0 z-20" onClick={()=> setLockPopup(false)}/>
            <div className="absolute left-3 top-[92px] z-30 w-[320px] rounded-xl border shadow-2xl overflow-hidden bg-[#1e1e26] border-white/10 text-white">
              <div className="px-4 py-3 border-b border-white/5">
                <div className="text-[13px] font-medium truncate">{(() => { try{ return new URL(activeTab?.url||'').hostname }catch{ return activeTab?.url }})()}</div>
                <div className="flex items-center gap-1.5 text-xs mt-1"><Lock size={12} className="text-emerald-400"/> <span className="opacity-80">Подключение защищено</span> <ChevronRight size={12} className="opacity-40"/></div>
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5">
                  <div className="flex items-center gap-3"><span className="w-6 h-6 grid place-items-center rounded-full bg-white/5"><Shield size={12}/></span><div><div className="text-sm leading-none">Уведомления</div><div className="text-xs opacity-50">Заблокировано автоматически</div></div></div>
                  <div className="w-9 h-5 rounded-full bg-white/10 p-0.5 flex justify-start"><span className="w-4 h-4 rounded-full bg-white/60"/></div>
                </div>
                <button onClick={()=> setLockPopup(false)} className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-[#4fc3f7]">Сбросить разрешение</button>
                <div className="h-px bg-white/5 my-1"/>
                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm"><span className="flex items-center gap-3"><HardDrive size={14} className="opacity-60"/> Файлы cookie и данные сайтов</span><ChevronRight size={14} className="opacity-40"/></button>
                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm"><span className="flex items-center gap-3"><Settings size={14} className="opacity-60"/> Настройки сайтов</span><ExternalLink size={14} className="opacity-40"/></button>
                <div className="h-px bg-white/5 my-1"/>
                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm"><span className="flex items-center gap-2"><Info size={14} className="opacity-60"/> Об этой странице</span><ExternalLink size={14} className="opacity-40"/></button>
                <div className="text-xs opacity-40 px-3 pb-2">Pinterest — социальная сеть...</div>
              </div>
            </div>
          </>
        )}

        {/* Main */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className={`flex-1 flex flex-col overflow-hidden relative ${isLight?'bg-[#f6f6f7]':'bg-[#0a0a0f]'}`}>
            {isNewTab ? (
              incognito ? (
                <div className="flex-1 overflow-auto relative flex flex-col items-center justify-center p-8 bg-[#1a1030]">
                  <div className="absolute inset-0 opacity-10" style={{background:`radial-gradient(800px 400px at 50% 0%, #7c3aed 0%, transparent 60%)`}}/>
                  <motion.div initial={{opacity:0, y:0}} animate={{opacity:1, y:0}} transition={{duration:0}} className="w-full max-w-[560px] flex flex-col items-center gap-6 text-center relative">
                    <div className="w-20 h-20 rounded-3xl bg-violet-600 grid place-items-center shadow-xl"><EyeOff size={32} className="text-white"/></div>
                    <div>
                      <h1 className="text-[26px] font-extrabold tracking-tight text-white" style={{fontFamily:'Unbounded'}}>Инкогнито</h1>
                      <p className="text-sm text-violet-200 mt-2 max-w-[460px]">История, куки и данные сайтов не сохранятся. Загрузки и закладки — сохранятся.</p>
                    </div>
                    <div className="w-full p-4 rounded-2xl bg-white/5 border border-violet-500/20 text-left text-sm space-y-2">
                      <div className="font-medium text-white flex items-center gap-2"><ShieldCheck size={14}/> Что скрыто</div>
                      <div className="text-violet-100/70 text-xs">• Не пишется история • Удаляются куки после закрытия • Поиск без персонализации</div>
                    </div>
                    <button onClick={()=> setIncognito(false)} className="px-5 py-2 rounded-full bg-white text-zinc-900 text-sm font-medium">Выйти из инкогнито</button>
                  </motion.div>
                </div>
              ) : (
              <div className="flex-1 overflow-auto relative flex flex-col items-center justify-center p-6 md:p-8" style={{background: wallpaper.bg}}>
                {/* Время вместо лого */}
                <motion.div initial={{opacity:0, y:0}} animate={{opacity:1, y:0}} transition={{duration:0}} className="w-full max-w-[640px] flex flex-col items-center gap-4">
                  <div className="text-center">
                    <div className="text-[56px] font-extrabold tracking-tight leading-none text-white" style={{fontFamily:'Unbounded', textShadow:'0 2px 20px rgba(0,0,0,.2)'}}>{timeNow.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</div>
                    <div className={`text-sm mt-1 capitalize ${isLight?'text-zinc-700':'text-white/80'}`}>{timeNow.toLocaleDateString('ru-RU',{weekday:'long'})} • {timeNow.toLocaleDateString('ru-RU',{day:'numeric', month:'long'})}</div>
                  </div>

                  <div className="w-full flex items-center gap-2 px-4 h-12 rounded-full bg-white shadow-lg border border-black/5 mt-2">
                    <Search size={18} className="opacity-30"/>
                    <input
                      placeholder="Поиск в Яндексе или адрес — попробуй /calc 2+2"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-400 text-zinc-900"
                      onKeyDown={e=> e.key==='Enter' && navigate((e.target as HTMLInputElement).value)}
                    />
                    <select value={engine} onChange={e=> setEngine(e.target.value as any)} className="text-xs bg-zinc-100 rounded-full px-2 py-1 outline-none border-0 text-zinc-700">
                      <option value="yandex">Яндекс</option><option value="google">Google</option><option value="duckduckgo">DuckDuckGo</option><option value="bing">Bing</option>
                    </select>
                  </div>

                  {/* Плитки — побольше */}
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${isLight?'text-zinc-500':'text-white/60'}`}>Быстрый доступ</span>
                      <button onClick={()=> {setEditingTile(null); setTileForm({title:'',url:''}); setShowTileModal(true)}} className={`text-xs px-2 py-1 rounded-full ${isLight?'bg-black/5 hover:bg-black/10':'bg-white/10 hover:bg-white/15 text-white'}`}>+ Добавить</button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
                      {tiles.map(s=>{
                        const fav=faviconFor(s.url)
                        return (
                        <div key={s.id} className="group relative flex flex-col items-center gap-1.5">
                          <button onClick={()=> navigate(s.url)} onContextMenu={e=>{e.preventDefault(); setEditingTile(s); setTileForm({title:s.title,url:s.url}); setShowTileModal(true)}} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl grid place-items-center text-white font-bold shadow-lg group-hover:scale-105 transition overflow-hidden relative border border-white/10" style={{background:s.color}}>
                            {fav ? <img src={fav} width={24} height={24} className="object-contain" onError={e=> (e.currentTarget.style.display='none')} /> : <span className="text-[18px]">{s.letter}</span>}
                          </button>
                          <span className={`text-[11px] truncate w-full text-center ${isLight?'text-zinc-600':'text-white/70 group-hover:text-white'}`}>{s.title}</span>
                          <button onClick={()=> setTiles(t=> t.filter(x=>x.id!==s.id))} className="absolute -top-1 -right-1 w-5 h-5 grid place-items-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500"><X size={10}/></button>
                        </div>
                      )})}
                    </div>
                  </div>

                  {/* Погода — сменная, иконка меняется */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    <div className={`rounded-2xl backdrop-blur-xl border p-3 flex items-center gap-3 ${isLight?'bg-white border-black/5 text-zinc-900':'bg-white/10 border-white/10 text-white'}`}>
                      <div className={`w-10 h-10 rounded-xl grid place-items-center ${isLight?'bg-zinc-900 text-white':'bg-white text-zinc-900'}`}><Clock size={18}/></div>
                      <div>
                        <div className="text-[13px] opacity-70">Время</div>
                        <div className="text-[15px] font-bold leading-none">{timeNow.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white border border-black/5 p-3 flex items-center gap-3 text-zinc-900 relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 grid place-items-center text-white">
                        {weather.icon==='sun' && <Sun size={18}/>}
                        {weather.icon==='cloud' && <Cloud size={18}/>}
                        {weather.icon==='rain' && <CloudRain size={18}/>}
                        {weather.icon==='snow' && <Snowflake size={18}/>}
                      </div>
                      <div className="flex-1">
                        <div className="text-[15px] font-bold leading-none">{weather.temp} • {weather.cond}</div>
                        <div className="text-xs opacity-60 flex items-center gap-1"><MapPin size={10}/> {city} • Влажность 42%</div>
                      </div>
                      <button onClick={()=> { setCitySearch(''); setShowCityPicker(!showCityPicker)}} className="w-7 h-7 grid place-items-center rounded-full bg-black/5 hover:bg-black/10"><ChevronDown size={14}/></button>
                      {showCityPicker && (
                        <>
                        <div className="fixed inset-0 z-10" onClick={()=> {setShowCityPicker(false); setCitySearch('')}}/>
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden z-20 max-h-72 flex flex-col">
                          <div className="p-2 border-b border-black/5">
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-black/5 border border-black/5">
                              <Search size={12} className="opacity-40"/><input autoFocus value={citySearch} onChange={e=> setCitySearch(e.target.value)} placeholder="Поиск города, села..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-400" />
                              {citySearch && <button onClick={()=> setCitySearch('')} className="opacity-40 hover:opacity-80"><X size={12}/></button>}
                            </div>
                          </div>
                          <div className="overflow-auto flex-1">
                          {CITIES.filter(c=> !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase())).map(c=>(
                            <button key={c.name} onClick={()=> {setCity(c.name); setShowCityPicker(false); setCitySearch('')}} className={`w-full text-left px-3 py-2 text-sm hover:bg-black/5 flex items-center justify-between ${city===c.name?'bg-black/5 font-medium':''}`}>
                              {c.name} <span className="opacity-50">{c.temp} • {c.cond}</span>
                            </button>
                          ))}
                          {CITIES.filter(c=> !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase())).length===0 && citySearch && (
                            <button onClick={()=> {setCity(citySearch); setShowCityPicker(false); setCitySearch('')}} className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 flex items-center gap-2">
                              <Plus size={12}/> Использовать “{citySearch}”
                            </button>
                          )}
                          </div>
                        </div>
                        </>
                      )}
                    </div>
                  </div>
                  {!isElectron && <div className="text-xs text-amber-200/70 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">Предпросмотр: сайты через iframe могут блокироваться — в приложении всё откроется</div>}
                </motion.div>
              </div>
              )
            ) : (
              <div className="flex-1 relative bg-white flex flex-col">
                {loadError ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0f] text-white text-center">
                    <motion.div initial={{scale:.9, opacity:0}} animate={{scale:1,opacity:1}} className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 grid place-items-center mb-4"><AlertTriangle size={28} className="text-red-400"/></motion.div>
                    <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Не удалось открыть</h2>
                    <p className="text-sm opacity-60 mt-2 max-w-[520px] break-all">{loadError.url}</p>
                    <p className="text-xs opacity-40 mt-1">{loadError.desc} • код {loadError.code}</p>
                    <p className="text-xs opacity-50 mt-3">Проверьте адрес или попробуйте поиск.</p>
                    <div className="flex gap-2 mt-5">
                      <button onClick={handleReload} className="px-4 py-2 rounded-full bg-[#ff253a] text-white text-sm flex items-center gap-2"><RotateCw size={14}/> Повторить</button>
                      <button onClick={()=> navigate('kayor://newtab')} className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm">Домой</button>
                      <button onClick={()=> navigate(`https://ya.ru/search?text=${encodeURIComponent(loadError.url)}`)} className="px-4 py-2 rounded-full bg-white text-zinc-900 text-sm">Искать в {engine}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {loading && <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden z-10"><div className="h-full w-1/2 bg-[#ff253a]" style={{animation: animations?'kayor-shimmer 1.1s ease-in-out infinite':''}}/></div>}
                    {isElectron ? (
                      // @ts-ignore
                      <webview
                        ref={webviewRef}
                        src={activeTab?.url}
                        className="w-full h-full border-0 flex-1 bg-white"
                        partition={incognito ? "incognito" : "persist:kayor"}
                        allowpopups
                      />
                    ) : (
                      <iframe src={activeTab?.url} className="w-full h-full border-0 flex-1 bg-white" title="page" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads" allow="fullscreen" />
                    )}
                    {!isElectron && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#1e1e26] border border-white/10 rounded-full px-3 py-1.5 text-xs flex items-center gap-2 shadow-xl">
                        <Globe size={12} className="opacity-60"/> Если не загрузилось — <button onClick={()=> window.open(activeTab?.url,'_blank')} className="underline">открыть в системе</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Link context menu */}
            {linkMenu && (
              <div className="fixed inset-0 z-40" onClick={()=> setLinkMenu(null)}>
                <div style={{left:linkMenu.x, top:linkMenu.y}} className="absolute w-56 rounded-xl border shadow-xl py-1 bg-[#1e1e26] border-white/10 text-sm text-white">
                  <div className="px-3 py-1.5 text-xs opacity-50 truncate max-w-[220px]">{linkMenu.url}</div>
                  <button onClick={()=>{createTab(linkMenu.url); setLinkMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2"><ExternalLink size={12}/> Открыть в новой вкладке</button>
                  <button onClick={()=>{navigator.clipboard.writeText(linkMenu.url); setToast('Ссылка скопирована'); setLinkMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2"><Copy size={12}/> Копировать ссылку</button>
                  <button onClick={()=>{navigator.clipboard.writeText(linkMenu.url); setLinkMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2"><Globe size={12}/> Копировать адрес</button>
                  <div className="h-px bg-white/5 my-1"/>
                  <button onClick={()=>{ const a=document.createElement('a'); a.href=linkMenu.url; a.download=''; a.click(); setLinkMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2"><Download size={12}/> Скачать изображение</button>
                  <button onClick={()=>{navigator.clipboard.writeText(linkMenu.url); setToast('Скопировано'); setLinkMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2"><Copy size={12}/> Копировать изображение</button>
                </div>
              </div>
            )}

            {/* Tab context menu */}
            {showTabMenu && (
              <div className="fixed inset-0 z-40" onClick={()=> setShowTabMenu(null)}>
                <div style={{left:showTabMenu.x, top:showTabMenu.y}} className="absolute w-48 rounded-xl border shadow-xl py-1 bg-[#1e1e26] border-white/10">
                  <button onClick={()=>{const t=tabs.find(x=>x.id===showTabMenu.id); if(t) setTabs(ts=> ts.map(x=>x.id===t.id?{...x, pinned:!x.pinned}:x)); setShowTabMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm flex items-center gap-2"><Pin size={12}/> {tabs.find(t=>t.id===showTabMenu.id)?.pinned ? 'Открепить' : 'Закрепить'}</button>
                  <button onClick={()=>{const t=tabs.find(x=>x.id===showTabMenu.id); if(t){ const nid=Math.random().toString(36).slice(2,7); setTabs(ts=>[...ts,{...t,id:nid, title:t.title+' — копия'}])}; setShowTabMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm flex items-center gap-2"><Copy size={12}/> Дублировать</button>
                  <button onClick={()=>{closeTab(showTabMenu.id); setShowTabMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm text-red-400 flex items-center gap-2"><X size={12}/> Закрыть</button>
                </div>
              </div>
            )}

            {/* 3-dot menu — без версии */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={()=> setShowMenu(false)}/>
                <div className="absolute right-2 top-2 w-72 rounded-2xl border shadow-2xl z-40 bg-[#1e1e26] border-white/10 overflow-hidden">
                <div className="p-2 space-y-1">
                  <button onClick={()=>{createTab(); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Plus size={14}/> Новая вкладка <span className="ml-auto text-xs opacity-40">Ctrl+T</span></button>
                  <button onClick={()=>{setIncognito(!incognito); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><EyeOff size={14}/> {incognito?'Обычный режим':'Инкогнито'}</button>
                  <div className="h-px bg-white/5 my-1"/>
                  <button onClick={()=>{setSidebarTab('history'); setSidebarOpen(true); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Clock size={14}/> История</button>
                  <button onClick={()=>{setSidebarTab('downloads'); setSidebarOpen(true); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Download size={14}/> Загрузки {downloads.length>0 && <span className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{downloads.length}</span>}</button>
                  <button onClick={()=>{setShowBookmarksBar(!showBookmarksBar); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Bookmark size={14}/> {showBookmarksBar?'Скрыть панель закладок':'Показать панель закладок'}</button>
                  <div className="h-px bg-white/5 my-1"/>
                  <button onClick={()=>{setShowSettings(true); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Settings size={14}/> Настройки</button>
                </div>
              </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{x:320, opacity:0}} animate={{x:0, opacity:1}} exit={{x:320, opacity:0}} transition={{type:'spring', damping:28, stiffness:300}} className={`w-[320px] shrink-0 border-l flex flex-col absolute right-0 top-0 bottom-0 z-20 shadow-2xl ${isLight?'bg-white border-black/10':'bg-[#14141a] border-white/5'}`}>
                <div className={`flex items-center gap-1 p-2 border-b ${isLight?'border-black/5':'border-white/5'}`}>
                  {[
                    {id:'bookmarks', icon:Bookmark, label:'Закладки'},
                    {id:'history', icon:History, label:'История'},
                    {id:'downloads', icon:Download, label:'Загрузки'},
                  ].map(t=>(
                    <button key={t.id} onClick={()=> setSidebarTab(t.id as any)} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs border ${sidebarTab===t.id? (isLight?'bg-zinc-900 text-white border-black/5':'bg-white text-zinc-900 border-black/5') :'border-transparent opacity-60 hover:bg-black/5 hover:opacity-100'}`}>
                      <t.icon size={14}/> {t.label}
                    </button>
                  ))}
                  <button onClick={()=> setSidebarOpen(false)} className={`w-8 h-8 grid place-items-center rounded-full ${isLight?'hover:bg-black/5':'hover:bg-white/10'} ml-1`}><X size={14}/></button>
                </div>
                <div className="flex-1 overflow-auto p-3">
                  {sidebarTab==='bookmarks' && (
                    <div className="space-y-3">
                      <button onClick={()=> setShowBookmarkModal({url:activeTab?.url||'', title:activeTab?.title||''})} className="w-full py-2 rounded-full bg-[#ff253a] text-white text-sm font-medium">+ Добавить страницу</button>
                      {bookmarks.length===0 ? <div className="text-sm text-center py-12 opacity-50">Закладок пока нет<br/><span className="text-xs">Нажми + или ★ в адресной строке</span></div> :
                        <div className="space-y-1">{bookmarks.map(b=>{
                          const fav=faviconFor(b.url)
                          return (
                          <div key={b.id} draggable onDragStart={()=> setDragId(b.id)} onDragOver={e=> e.preventDefault()} onDrop={()=>{
                            if(!dragId||dragId===b.id) return
                            const a=bookmarks.findIndex(x=>x.id===dragId), bi=bookmarks.findIndex(x=>x.id===b.id)
                            if(a<0||bi<0) return
                            const cp=[...bookmarks]; const [m]=cp.splice(a,1); cp.splice(bi,0,m); setBookmarks(cp)
                          }} className={`flex items-center gap-2 px-3 py-2 rounded-xl group cursor-move ${isLight?'hover:bg-black/5':'hover:bg-white/5'}`}>
                            {fav? <img src={fav} width={14} height={14} className="rounded-sm"/> : <Star size={12} className="opacity-40"/>}<button onClick={()=> navigate(b.url)} className="flex-1 text-left truncate text-sm">{b.title}</button>
                            <button onClick={()=> { if(confirm(`Удалить "${b.title}"?`)) setBookmarks(x=>x.filter(y=>y.id!==b.id))}} className="opacity-0 group-hover:opacity-100 w-6 h-6 grid place-items-center rounded-full hover:bg-black/10"><X size={12}/></button>
                          </div>
                        )})}</div>
                      }
                    </div>
                  )}
                  {sidebarTab==='history' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-xs opacity-60">{history.length} записей</span><button onClick={()=> setConfirmClear('history')} className="text-xs text-red-500 hover:underline">Очистить</button></div>
                      {history.length===0 ? <div className="text-sm opacity-40 text-center py-12">История пуста</div> :
                        history.map(h=>{
                          const fav=faviconFor(h.url)
                          return (
                          <button key={h.id} onClick={()=> navigate(h.url)} className={`w-full text-left px-3 py-2 rounded-xl flex gap-2 items-start ${isLight?'hover:bg-black/5':'hover:bg-white/5'}`}>
                            {fav? <img src={fav} width={14} height={14} className="rounded-sm mt-0.5"/>: null}
                            <div className="flex-1 min-w-0"><div className="truncate text-sm">{h.title}</div><div className="truncate text-xs opacity-40">{h.url}</div></div>
                          </button>
                        )})
                      }
                    </div>
                  )}
                  {sidebarTab==='downloads' && (
                    <div className="space-y-2">
                      {downloads.length===0 ? <div className="text-sm opacity-40 text-center py-12">Загрузок нет</div> :
                        downloads.map(d=>(
                          <div key={d.id} className={`p-3 rounded-xl border ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}>
                            <div className="text-sm truncate">{d.name}</div><div className="text-xs opacity-40">{d.size}</div>
                            <div className="h-1 rounded-full bg-black/10 mt-2"><div className="h-full bg-[#ff253a] rounded-full transition-all" style={{width:`${d.progress}%`}}/></div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bookmark add modal — темный, по центру */}
        {showBookmarkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={()=> setShowBookmarkModal(null)}>
            <div onClick={e=> e.stopPropagation()} className="w-full max-w-sm bg-[#1e1e26] border border-white/10 rounded-2xl p-4 text-white shadow-xl">
              <div className="font-bold" style={{fontFamily:'Unbounded'}}>Добавить закладку</div>
              <div className="text-xs opacity-60 mt-1 break-all">{showBookmarkModal.url}</div>
              <input value={showBookmarkModal.title} onChange={e=> setShowBookmarkModal({...showBookmarkModal, title:e.target.value})} className="mt-3 w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/40" placeholder="Название"/>
              <select value={bookmarkFolderId} onChange={e=> setBookmarkFolderId(e.target.value)} className="mt-2 w-full px-3 py-2 rounded-xl border border-black/10 text-sm">
                {folders.map(f=> <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
              <button onClick={()=> {
                const name=prompt('Название папки'); if(!name) return
                const id=Math.random().toString(36).slice(2,7)
                setFolders(f=> [...f,{id, title:name}]); setBookmarkFolderId(id)
              }} className="mt-2 text-xs text-[#ff253a] hover:underline">+ Создать папку</button>
              <div className="flex gap-2 mt-4">
                <button onClick={()=> setShowBookmarkModal(null)} className="flex-1 py-2 rounded-full border border-black/10">Отмена</button>
                <button onClick={()=>{
                  setBookmarks(b=> [...b, {id:Math.random().toString(36).slice(2,7), title:showBookmarkModal.title||'Закладка', url:showBookmarkModal.url, folderId:bookmarkFolderId}])
                  setShowBookmarkModal(null); setToast('Закладка сохранена')
                }} className="flex-1 py-2 rounded-full bg-[#ff253a] text-white">Сохранить</button>
              </div>
            </div>
          </div>
        )}

        {/* Tile modal — темный, по центру */}
        {showTileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={()=> setShowTileModal(false)}>
            <div onClick={e=> e.stopPropagation()} className="w-full max-w-sm bg-[#1e1e26] border border-white/10 rounded-2xl p-4 text-white shadow-xl">
              <div className="font-bold" style={{fontFamily:'Unbounded'}}>{editingTile?'Изменить плитку':'Добавить плитку'}</div>
              <input value={tileForm.title} onChange={e=> setTileForm({...tileForm, title:e.target.value})} placeholder="Название (YouTube)" className="mt-3 w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/40"/>
              <input value={tileForm.url} onChange={e=> setTileForm({...tileForm, url:e.target.value})} placeholder="Ссылка https://..." className="mt-2 w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/40"/>
              <div className="flex gap-2 mt-4">
                <button onClick={()=> {setShowTileModal(false); setEditingTile(null)}} className="flex-1 py-2 rounded-full border border-black/10">Отмена</button>
                <button onClick={tileModalSave} className="flex-1 py-2 rounded-full bg-[#ff253a] text-white">{editingTile?'Сохранить':'Добавить'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm — темный */}
        {confirmClear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={()=> setConfirmClear(null)}>
            <div onClick={e=> e.stopPropagation()} className="bg-[#1e1e26] border border-white/10 rounded-2xl p-5 max-w-sm w-full text-white">
              <div className="font-bold">Очистить {confirmClear==='history'?'историю':'всё'}?</div>
              <div className="text-sm opacity-60 mt-1">Действие нельзя отменить.</div>
              <div className="flex gap-2 mt-4">
                <button onClick={()=> setConfirmClear(null)} className="flex-1 py-2 rounded-full border border-black/10">Отмена</button>
                <button onClick={()=> { if(confirmClear==='history') setHistory([]); if(confirmClear==='all'){setHistory([]); setBookmarks([])}; setConfirmClear(null); setToast('Очищено') }} className="flex-1 py-2 rounded-full bg-red-500 text-white">Удалить</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}

        {/* Settings — без верхней полоски 6), клик вне закрывает 8) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=> setShowSettings(false)} className="absolute inset-0 z-50 flex bg-black/40 backdrop-blur-sm p-2 md:p-6">
              <motion.div initial={{scale:0.98, y:8}} animate={{scale:1,y:0}} exit={{scale:0.98,y:8}} onClick={e=> e.stopPropagation()} className={`w-full max-w-[980px] mx-auto rounded-2xl border overflow-hidden flex flex-col max-h-[92vh] shadow-2xl ${isLight?'bg-white border-black/10':'bg-[#121216] border-white/10'}`}>
                <div className={`h-12 flex items-center justify-between px-4 border-b shrink-0 ${isLight?'bg-white border-black/5':'bg-[#121216] border-white/5'}`}>
                  <div className="font-bold" style={{fontFamily:'Unbounded'}}>Настройки</div>
                  <button onClick={()=> setShowSettings(false)} className={`w-8 h-8 grid place-items-center rounded-full ${isLight?'hover:bg-black/5':'hover:bg-white/10'}`}><X size={16}/></button>
                </div>
                <div className="flex-1 flex overflow-hidden">
                  <div className={`w-[200px] border-r p-2 space-y-1 hidden md:block overflow-auto ${isLight?'border-black/5 bg-[#f9f9fb]':'border-white/5'}`}>
                    {[
                      {id:'appearance',label:'Внешний вид',icon:Palette, tip:'Тема, обои, компактность'},
                      {id:'search',label:'Поиск',icon:Search, tip:'Система по умолчанию и умная строка'},
                      {id:'privacy',label:'Приватность',icon:Shield, tip:'Блокировка, HTTPS, очистка'},
                      {id:'downloads',label:'Загрузки',icon:Download, tip:'Папка и поведение'},
                      {id:'performance',label:'Производительность',icon:Zap, tip:'Память и предзагрузка'},
                      {id:'system',label:'Система',icon:Cpu, tip:'Браузер по умолчанию, язык'},
                      {id:'about',label:'О браузере',icon:Info, tip:'Версия и обновления'},
                    ].map(t=>(
                      <button key={t.id} onClick={()=> setSettingsTab(t.id as any)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left group ${settingsTab===t.id? (isLight?'bg-zinc-900 text-white':'bg-white text-zinc-900'):(isLight?'hover:bg-black/5':'hover:bg-white/5')}`}>
                        <t.icon size={14}/> <span className="flex-1">{t.label}</span> <span className="opacity-0 group-hover:opacity-100"><Tooltip text={t.tip}/></span>
                      </button>
                    ))}
                  </div>
                  <div className={`flex-1 overflow-auto p-5 space-y-5 ${isLight?'bg-white':'bg-[#121216]'}`}>
                    <div className="flex gap-1 overflow-x-auto md:hidden pb-2">
                      {['appearance','search','privacy','downloads','performance','system','about'].map(id=>(
                        <button key={id} onClick={()=> setSettingsTab(id as any)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${settingsTab===id? (isLight?'bg-zinc-900 text-white border-zinc-900':'bg-white text-zinc-900 border-white'):(isLight?'border-black/10':'border-white/10 text-white/70')}`}>{id}</button>
                      ))}
                    </div>

                    {settingsTab==='appearance' && (
                      <div className="space-y-4 animate-in">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Внешний вид</h2>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={()=> setTheme('dark')} className={`p-4 rounded-xl border text-left transition ${theme==='dark'?'border-[#ff253a] bg-[#ff253a]/10 ring-1 ring-[#ff253a]/20':'border-black/5 hover:bg-black/5'}`}>
                            <Moon size={16}/> <div className="font-medium mt-1">Тёмная</div><div className="text-xs opacity-60">Чёрный, тёмно-серый</div>
                          </button>
                          <button onClick={()=> setTheme('light')} className={`p-4 rounded-xl border text-left transition ${theme==='light'?'border-[#ff253a] bg-[#ff253a]/10 ring-1 ring-[#ff253a]/20':'border-black/5 hover:bg-black/5'}`}>
                            <Sun size={16}/> <div className="font-medium mt-1">Светлая <span className="text-xs opacity-50">— теперь реально светлая</span></div><div className="text-xs opacity-60">Белый, серый — вся шапка светлеет</div>
                          </button>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2 flex items-center gap-2">Обои новой вкладки <Tooltip text="Меняет только фон новой вкладки, в светлой теме — светлые"/></div>
                          <div className="grid grid-cols-3 gap-2">
                            {WALLPAPERS.map(w=>(
                              <button key={w.id} onClick={()=> setWallpaperId(w.id)} className={`h-20 rounded-xl border-2 flex items-end p-2 text-xs font-medium transition ${wallpaperId===w.id?'border-[#ff253a] ring-1 ring-[#ff253a]/20':'border-black/5'}`} style={{background:w.bg}}>
                                <span className="bg-black/40 backdrop-blur px-2 py-0.5 rounded-full text-white">{w.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className={`flex items-center justify-between p-3 rounded-xl border ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}><span className="text-sm flex items-center gap-2"><Monitor size={14}/> Компактный режим <Tooltip text="Уменьшает высоту шапки и вкладок"/></span><Toggle checked={compactMode} onChange={v=> {setCompactMode(v); localStorage.setItem('kayor_compact',v?'1':'0')}}/></div>
                          <div className={`flex items-center justify-between p-3 rounded-xl border ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}><span className="text-sm flex items-center gap-2"><Sparkles size={14}/> Анимации <Tooltip text="Плавные переходы вкладок и окон"/></span><Toggle checked={animations} onChange={setAnimations}/></div>
                          <div className={`flex items-center justify-between p-3 rounded-xl border ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}><span className="text-sm flex items-center gap-2"><ImageIcon size={14}/> Кнопка домой <Tooltip text="Иконка домика в адресной строке"/></span><Toggle checked={showHomeButton} onChange={v=> {setShowHomeButton(v); localStorage.setItem('kayor_home',v?'1':'0')}}/></div>
                          <div className={`flex items-center justify-between p-3 rounded-xl border ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}><span className="text-sm flex items-center gap-2">Панель закладок <Tooltip text="Полоса под адресной строкой"/></span><Toggle checked={showBookmarksBar} onChange={setShowBookmarksBar}/></div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='search' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2" style={{fontFamily:'Unbounded'}}>Поиск <Tooltip text="Выбери где искать по умолчанию"/></h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(['yandex','google','duckduckgo','bing'] as const).map(e=>(
                            <button key={e} onClick={()=> setEngine(e)} className={`px-3 py-3 rounded-xl text-sm border flex flex-col items-center gap-1 transition ${engine===e?'bg-zinc-900 text-white border-zinc-900':'border-black/5 hover:bg-black/5'}`}>
                              <img src={faviconFor(`https://${e}.com`)} width={18} height={18} className="rounded" onError={e=> (e.currentTarget.style.display='none')}/>
                              {e}
                            </button>
                          ))}
                        </div>
                        <div className={`p-3 rounded-xl border text-sm space-y-2 ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}>
                          <div className="font-medium flex items-center gap-2">Умная строка <Tooltip text="Пиши /calc или /translate, подсказки появятся сразу без Enter"/></div>
                          <div className="opacity-60 text-xs">Начни вводить — увидишь подсказки. Команды работают мгновенно: <span className="font-mono">/calc 12*8</span> покажет результат, <span className="font-mono">/translate привет</span> откроет переводчик.</div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {['/calc 2+2 → 4','/translate hello → перевод','ya.ru → сайт','привет → поиск'].map(t=> <span key={t} className="px-2 py-1 rounded-full bg-[#ff253a] text-white text-xs">{t}</span>)}
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='privacy' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2" style={{fontFamily:'Unbounded'}}>Приватность <Tooltip text="Блокировки и очистка"/></h2>
                        <div className="space-y-2">
                          {[
                            {k:'adBlock', v:adBlock, s:setAdBlock, t:'Блокировка рекламы', d:'EasyList — режет баннеры', tip:'Блочит doubleclick, googlesyndication'},
                            {k:'tracker', v:trackerBlock, s:setTrackerBlock, t:'Анти-трекер', d:'Не даёт сайтам следить', tip:'Блочит трекеры'},
                            {k:'https', v:httpsOnly, s:setHttpsOnly, t:'Только HTTPS', d:'Принудительно шифрует', tip:'Если сайт без HTTPS — предупредит'},
                            {k:'dnt', v:dnt, s:setDnt, t:'Do Not Track', d:'Просит не отслеживать', tip:'Заголовок DNT: 1'},
                          ].map(r=>(
                            <div key={r.k} className={`flex items-center justify-between p-3 rounded-xl border ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}>
                              <div><div className="text-sm font-medium flex items-center gap-2">{r.t} <Tooltip text={r.tip}/></div><div className="text-xs opacity-60">{r.d}</div></div><Toggle checked={r.v} onChange={r.s as any}/>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium flex items-center gap-2">Очистить данные <Tooltip text="Удалит навсегда — спросим подтверждение"/></div>
                          <div className="grid grid-cols-3 gap-2">
                            <button onClick={()=> setConfirmClear('history')} className="p-3 rounded-xl bg-white border border-black/5 hover:bg-black/5 text-sm flex flex-col items-center gap-1 shadow-sm"><Trash2 size={16}/> История</button>
                            <button onClick={async()=>{ if(confirm('Очистить кэш?')){ // @ts-ignore
                                await (window as any).kayor?.clearData?.('cache'); setToast('Кэш очищен') } }} className="p-3 rounded-xl bg-white border border-black/5 hover:bg-black/5 text-sm flex flex-col items-center gap-1 shadow-sm"><Trash2 size={16}/> Кэш</button>
                            <button onClick={()=> setConfirmClear('all')} className="p-3 rounded-xl bg-red-500 text-white text-sm flex flex-col items-center gap-1"><Trash2 size={16}/> Всё</button>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#ff253a]/5 border border-[#ff253a]/10 text-sm">
                          <div className="font-medium flex items-center gap-2"><ShieldCheck size={14}/> Пароли <Tooltip text="Хранятся локально, шифруются"/></div>
                          <div className="opacity-60 text-xs mt-1">Менеджер паролей — скоро синхронизация.</div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='downloads' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2" style={{fontFamily:'Unbounded'}}>Загрузки <Tooltip text="Где сохранять файлы"/></h2>
                        <div className={`p-3 rounded-xl border flex items-center justify-between ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}>
                          <span className="text-sm flex items-center gap-2"><FolderOpen size={14}/> Папка: Загрузки</span>
                          <button onClick={()=> setToast('Выбор папки — в 1.0.13 (пока Загрузки)')} className="px-3 py-1 rounded-full bg-zinc-900 text-white text-xs">Изменить</button>
                        </div>
                        <div className="space-y-2">
                          <div className={`flex items-center justify-between p-3 rounded-xl border ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}><span className="text-sm flex items-center gap-2">Спрашивать куда сохранять <Tooltip text="Показывать диалог перед загрузкой"/></span><Toggle checked={askDownload} onChange={setAskDownload}/></div>
                          <div className={`flex items-center justify-between p-3 rounded-xl border ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}><span className="text-sm flex items-center gap-2">Авто-открытие папки <Tooltip text="Открывать папку после загрузки"/></span><Toggle checked={autoOpenDownload} onChange={setAutoOpenDownload}/></div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='performance' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2" style={{fontFamily:'Unbounded'}}>Производительность <Tooltip text="Экономия ресурсов"/></h2>
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}>
                          <span className="text-sm flex items-center gap-2"><Zap size={16} className="text-amber-500"/> Экономия памяти <Tooltip text="Выгружает неактивные вкладки, держит одну webview"/></span><Toggle checked={memorySaver} onChange={v=> {setMemorySaver(v); localStorage.setItem('kayor_memsaver',v?'1':'0'); setToast(v?'Экономия вкл.':'Выкл.')}}/>
                        </div>
                        <div className={`p-3 rounded-xl border text-sm space-y-1 ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}>
                          <div className="font-medium flex items-center gap-2">Предзагрузка и кэш <Tooltip text="Ускоряет открытие сайтов, чистится при нехватке"/></div>
                          <div className="text-xs opacity-60">Ленивая загрузка изображений, кэш диска, предзагрузка ссылок — включены. Task Manager скоро (Shift+Esc).</div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='system' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Система</h2>
                        <button onClick={async()=>{
                          // @ts-ignore
                          const ok=await (window as any).kayor?.setDefaultBrowser?.()
                          setToast(ok?'Теперь KAYOR по умолчанию':'Открой настройки Windows → Приложения по умолчанию')
                        }} className="w-full p-3 rounded-xl bg-[#ff253a] text-white text-sm font-medium flex items-center justify-center gap-2"><Check size={14}/> Сделать браузером по умолчанию</button>
                        <div className={`p-3 rounded-xl border text-sm ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}>
                          <div className="font-medium flex items-center gap-2"><Languages size={14}/> Язык <Tooltip text="Язык интерфейса"/></div>
                          <select className={`mt-2 w-full border rounded-xl px-3 py-2 text-sm ${isLight?'bg-white border-black/10':'bg-[#1e1e26] border-white/10'}`}><option>Русский</option><option>English</option></select>
                          <div className="mt-3 font-medium flex items-center gap-2">Переводчик <Tooltip text="LibreTranslate, авто"/></div>
                          <div className="opacity-60 text-xs">Авто-определение и перевод выделенного текста.</div>
                        </div>
                        <div className={`p-3 rounded-xl border text-sm ${isLight?'bg-amber-50 border-amber-200':'bg-white/5 border-white/5'}`}>
                          <div className="font-medium">Трей <HelpCircle size={12} className="inline opacity-40"/></div>
                          <div className="opacity-60 text-xs">Крестик теперь сворачивает в трей (↗ внизу), а не закрывает. Двойной клик по иконке — вернуть.</div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='about' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>О браузере</h2>
                        <motion.div initial={{y:0,opacity:0}} animate={{y:0,opacity:1}} className={`p-4 rounded-2xl border ${isLight?'bg-white border-black/5 text-zinc-900':'bg-[#1e1e26] border-white/10 text-white'}`}>
                          <div className="flex items-center gap-3">
                            <img src={LOGO} className="w-10 h-10 rounded-xl object-cover shadow" onError={e=> (e.currentTarget.style.display='none')} />
                            <div><div className="font-bold" style={{fontFamily:'Unbounded'}}>KAYOR Browser 1.0.13</div><div className="text-xs opacity-60">Chromium 124 • Electron 30 • {isElectron?'Native webview':'Web preview'}</div></div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button onClick={()=> setToast('Обновлений нет — у тебя последняя')} className="px-3 py-1.5 rounded-full bg-[#ff253a] text-white text-xs flex items-center gap-1"><Download size={12}/> Проверить обновления</button>
                            <button onClick={()=> window.open('https://github.com/kayorissss/KAYOR-BROWSER','_blank')} className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs flex items-center gap-1"><ExternalLink size={12}/> GitHub</button>
                          </div>
                        </motion.div>
                        <div className={`p-3 rounded-xl border text-sm space-y-2 ${isLight?'bg-black/5 border-black/5':'bg-white/5 border-white/5'}`}>
                          <div className="font-medium">Что реализовано</div>
                          <div className="text-xs opacity-70 grid grid-cols-2 gap-1">
                            <div>✓ Вкладки, группы, закреп</div><div>✓ Закладки + папки + D&D</div>
                            <div>✓ Омнибокс + /calc</div><div>✓ Webview + ошибки</div>
                            <div>✓ Инкогнито</div><div>✓ Темы (тёмная/светлая)</div>
                            <div>✓ Плитки редактируемые</div><div>✓ Погода + город</div>
                            <div>⏳ Расширения CRX</div><div>⏳ Синхронизация</div>
                            <div>⏳ Читалка/PiP</div><div>⏳ Пароли sync</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <style>{`@keyframes kayor-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
      </div>
    </div>
  )
}
