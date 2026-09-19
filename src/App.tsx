import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Search, Star, Lock, ShieldCheck, ChevronLeft, ChevronRight, RotateCw, Home,
  Bookmark, Download, Clock, History, Settings, Palette, Moon, Sun,
  Pin, Copy, ExternalLink, Sparkles, HardDrive, Check, Upload, User,
  Shield, EyeOff, Image as ImageIcon, StickyNote, ListChecks, Trash2,
  Globe, Zap, Languages, FolderOpen, Cpu, Monitor, Info, ToggleLeft
} from 'lucide-react'

type Tab = { id: string; title: string; url: string; favicon: string; pinned?: boolean }
type BookmarkItem = { id: string; title: string; url: string; favicon?: string }
type HistoryItem = { id: string; title: string; url: string; time: string }
type DownloadItem = { id: string; name: string; size: string; progress: number; status: 'downloading'|'done' }

const WALLPAPERS = [
  { id: 'w1', name: 'Гранит', bg: 'linear-gradient(135deg,#0a0a0f 0%, #1a1a22 100%)' },
  { id: 'w2', name: 'Красный блеск', bg: 'radial-gradient(120% 120% at 20% 20%, #ff253a 0%, #1a0a0f 28%, #0a0a0f 72%)' },
  { id: 'w3', name: 'Матовое', bg: 'linear-gradient(135deg,#e8e8ec 0%, #f4f4f5 100%)' },
]

const LOGO = "kayorbrowse.png"

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v:boolean)=>void }){
  return <button onClick={()=> onChange(!checked)} className={`w-9 h-5 rounded-full p-0.5 flex transition ${checked?'bg-[#ff253a] justify-end':'bg-white/20 justify-start'}`}><span className="w-4 h-4 rounded-full bg-white shadow"/></button>
}

export default function App(){
  const [tabs, setTabs] = useState<Tab[]>(()=> {
    const s = localStorage.getItem('kayor_tabs_v2')
    return s ? JSON.parse(s) : [{ id:'1', title:'Новая вкладка', url:'kayor://newtab', favicon:'✦' }]
  })
  const [activeId, setActiveId] = useState(()=> tabs[0]?.id || '1')
  const [closed, setClosed] = useState<Tab[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(()=>{
    const s=localStorage.getItem('kayor_bm_v2')
    return s ? JSON.parse(s) : []
  })
  const [history, setHistory] = useState<HistoryItem[]>(()=>{
    const s=localStorage.getItem('kayor_hist_v2')
    return s? JSON.parse(s):[]
  })
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [theme, setTheme] = useState<'dark'|'light'>(()=> (localStorage.getItem('kayor_theme') as any) || 'dark')
  const [accent] = useState('#ff253a')
  const [wallpaperId, setWallpaperId] = useState(()=> localStorage.getItem('kayor_wp') || 'w2')
  const [showBookmarksBar, setShowBookmarksBar] = useState(false)
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
  const omniboxRef = useRef<HTMLInputElement>(null)
  const webviewRef = useRef<any>(null)
  const [time] = useState(new Date())

  // new settings
  const [adBlock, setAdBlock] = useState(()=> localStorage.getItem('kayor_adblock')!=='0')
  const [trackerBlock, setTrackerBlock] = useState(()=> localStorage.getItem('kayor_tracker')!=='0')
  const [httpsOnly, setHttpsOnly] = useState(()=> localStorage.getItem('kayor_https')!=='0')
  const [dnt, setDnt] = useState(()=> localStorage.getItem('kayor_dnt')!=='0')
  const [memorySaver, setMemorySaver] = useState(true)
  const [animations, setAnimations] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [showHomeButton, setShowHomeButton] = useState(true)

  const isElectron = useMemo(()=> {
    // @ts-ignore
    if(typeof window !== 'undefined' && (window as any).kayor?.isElectron) return true
    if(typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')) return true
    return false
  }, [])

  const activeTab = useMemo(()=> tabs.find(t=>t.id===activeId) || tabs[0], [tabs,activeId])
  const wallpaper = useMemo(()=> WALLPAPERS.find(w=>w.id===wallpaperId) || WALLPAPERS[1], [wallpaperId])
  const isNewTab = activeTab?.url.startsWith('kayor://')

  useEffect(()=> localStorage.setItem('kayor_tabs_v2', JSON.stringify(tabs)),[tabs])
  useEffect(()=> localStorage.setItem('kayor_bm_v2', JSON.stringify(bookmarks)),[bookmarks])
  useEffect(()=> localStorage.setItem('kayor_hist_v2', JSON.stringify(history)),[history])
  useEffect(()=> localStorage.setItem('kayor_wp', wallpaperId),[wallpaperId])
  useEffect(()=> localStorage.setItem('kayor_adblock', adBlock?'1':'0'),[adBlock])
  useEffect(()=> localStorage.setItem('kayor_tracker', trackerBlock?'1':'0'),[trackerBlock])
  useEffect(()=> localStorage.setItem('kayor_https', httpsOnly?'1':'0'),[httpsOnly])
  useEffect(()=> localStorage.setItem('kayor_dnt', dnt?'1':'0'),[dnt])

  // sync omnibox with active tab when switching
  useEffect(()=>{
    if(!focused){
      // keep display in sync, but don't overwrite while typing
    }
  },[activeId])

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if((e.ctrlKey||e.metaKey)&& e.key.toLowerCase()==='t' && !e.shiftKey){ e.preventDefault(); createTab()}
      if((e.ctrlKey||e.metaKey)&& e.key.toLowerCase()==='w'){ e.preventDefault(); closeTab(activeId)}
      if((e.ctrlKey||e.metaKey)&& e.shiftKey && e.key.toLowerCase()==='t'){ e.preventDefault(); const last=closed[closed.length-1]; if(last){ setClosed(s=>s.slice(0,-1)); setTabs(t=>[...t,last]); setActiveId(last.id)}}
      if((e.ctrlKey||e.metaKey)&& e.key.toLowerCase()==='l'){ e.preventDefault(); omniboxRef.current?.focus()}
      if(e.key==='Escape'){ setShowSettings(false); setShowMenu(false); setShowTabMenu(null)}
    }
    window.addEventListener('keydown',h); return()=> window.removeEventListener('keydown',h)
  },[activeId, closed])

  // webview events
  useEffect(()=>{
    const wv = webviewRef.current
    if(!wv || isNewTab || !isElectron) return
    const onNavigate = (e:any)=>{
      const url = e.url || wv.getURL?.()
      if(!url || url==='about:blank') return
      if(url!==activeTab?.url){
        setTabs(ts=> ts.map(t=> t.id===activeId ? {...t, url, title: (()=>{try{return new URL(url).hostname}catch{return url}})(), favicon:'🌐'} : t))
        setHistory(h=> [{id:Math.random().toString(36).slice(2), title:url, url, time:'сейчас'}, ...h].slice(0,100))
      }
    }
    const onTitle = (e:any)=>{
      const title = e.title
      if(title) setTabs(ts=> ts.map(t=> t.id===activeId ? {...t, title} : t))
    }
    const onFavicon = (e:any)=>{
      const favicons = e.favicons
      if(favicons && favicons[0]) setTabs(ts=> ts.map(t=> t.id===activeId ? {...t, favicon:'🌐'} : t))
    }
    const onNewWindow = (e:any)=>{
      const url = e.url
      if(url){ e.preventDefault?.(); createTab(url) }
    }
    wv.addEventListener('did-navigate', onNavigate)
    wv.addEventListener('did-navigate-in-page', onNavigate)
    wv.addEventListener('page-title-updated', onTitle)
    wv.addEventListener('page-favicon-updated', onFavicon)
    wv.addEventListener('new-window', onNewWindow as any)
    // @ts-ignore - electron 30 uses did-create-window
    wv.addEventListener('did-create-window', onNewWindow as any)
    return ()=>{
      wv.removeEventListener('did-navigate', onNavigate)
      wv.removeEventListener('did-navigate-in-page', onNavigate)
      wv.removeEventListener('page-title-updated', onTitle)
      wv.removeEventListener('page-favicon-updated', onFavicon)
      wv.removeEventListener('new-window', onNewWindow as any)
      wv.removeEventListener('did-create-window', onNewWindow as any)
    }
  },[activeId, isNewTab, isElectron, activeTab?.url])

  // when active tab url changes externally, load it in webview
  useEffect(()=>{
    const wv = webviewRef.current
    if(!wv || isNewTab || !isElectron) return
    try{
      const current = wv.getURL?.()
      if(current !== activeTab?.url && activeTab?.url && !activeTab.url.startsWith('kayor://')){
        wv.loadURL?.(activeTab.url)
        // fallback src attr
        wv.src = activeTab.url
      }
    }catch{}
  },[activeTab?.url, isNewTab, isElectron])

  function createTab(url='kayor://newtab'){
    const id=Math.random().toString(36).slice(2,7)
    const isInternal=url.startsWith('kayor://')
    const title=isInternal?'Новая вкладка':(()=>{try{return new URL(url.startsWith('http')?url:'https://'+url).hostname}catch{return url}})()
    const t:Tab={id, url, title, favicon: isInternal?'✦':'🌐'}
    setTabs(x=>[...x,t]); setActiveId(id)
    if(!isInternal) setHistory(h=>[{id:Math.random().toString(36).slice(2), title, url, time: new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})},...h].slice(0,100))
  }
  function closeTab(id:string){
    const tab=tabs.find(t=>t.id===id); if(!tab) return
    setClosed(s=>[...s,tab].slice(-20))
    setTabs(prev=>{
      const next=prev.filter(t=>t.id!==id)
      if(next.length===0){ const nid=Math.random().toString(36).slice(2,7); const nt:Tab={id:nid,title:'Новая вкладка',url:'kayor://newtab',favicon:'✦'}; setActiveId(nid); return [nt]}
      if(id===activeId){ const idx=prev.findIndex(t=>t.id===id); const na=next[Math.max(0,idx-1)]||next[0]; setActiveId(na.id)}
      return next
    })
  }
  function navigate(input:string){
    let url=input.trim(); if(!url) return
    if(url.startsWith('/calc ')){ try{const expr=url.replace('/calc ',''); const r=Function(`"use strict";return (${expr})`)(); setOmnibox(String(r)); return}catch{}}
    const isUrl=url.includes('.')||url.startsWith('http')||url.startsWith('kayor://')
    if(!isUrl){
      const q=encodeURIComponent(url)
      const engines:any={yandex:`https://ya.ru/search?text=${q}`, google:`https://www.google.com/search?q=${q}`, duckduckgo:`https://duckduckgo.com/?q=${q}`, bing:`https://www.bing.com/search?q=${q}`}
      url=engines[engine] || engines.yandex
    } else if(!url.startsWith('http')&&!url.startsWith('kayor://')) url='https://'+url
    setTabs(ts=> ts.map(t=> t.id===activeId?{...t,url, title: url.startsWith('kayor://')?'Новая вкладка':(()=>{try{return new URL(url).hostname}catch{return url}})(), favicon: url.startsWith('kayor://')?'✦':'🌐'}:t))
    if(!url.startsWith('kayor://')) setHistory(h=>[{id:Math.random().toString(36).slice(2), title:url, url, time:'сейчас'},...h].slice(0,100))
    setOmnibox(''); setFocused(false)
    // force webview load
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
      try{ if(wv.canGoBack?.()) wv.goBack(); else wv.goBack?.() }catch{ wv.goBack?.() }
    } else {
      window.history.back()
    }
  }
  function handleForward(){
    const wv = webviewRef.current
    if(isElectron && wv && !isNewTab){
      try{ if(wv.canGoForward?.()) wv.goForward(); }catch{ wv.goForward?.() }
    } else {
      window.history.forward()
    }
  }
  function handleReload(){
    const wv = webviewRef.current
    if(isElectron && wv && !isNewTab){
      try{ wv.reload?.() }catch{}
    } else {
      window.location.reload()
    }
  }

  const suggestions = useMemo(()=>{
    if(!focused || !omnibox) return []
    const q=omnibox.toLowerCase()
    const fromHist=history.filter(h=>h.title.toLowerCase().includes(q)||h.url.toLowerCase().includes(q)).slice(0,3).map(h=>({label:h.title, sub:h.url, url:h.url}))
    const fromBook=bookmarks.filter(b=>b.title.toLowerCase().includes(q)).slice(0,2).map(b=>({label:b.title, sub:b.url, url:b.url}))
    const search=[{label:`Искать «${omnibox}» в ${engine}`, sub:`${engine} поиск`, url: omnibox}]
    return [...fromHist, ...fromBook, ...search].slice(0,6)
  },[focused,omnibox, history, bookmarks, engine])

  const displayValue = focused ? omnibox : (activeTab?.url?.startsWith('kayor://') ? '' : (activeTab?.url || ''))

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden select-none ${theme==='dark'?'dark':''}`} style={{fontFamily:'Inter, system-ui, sans-serif'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@700;800&display=swap'); :root{--accent:${accent}} webview{ display:flex; width:100%; height:100%; }`}</style>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration: animations?0.4:0}} className={`flex-1 flex flex-col overflow-hidden ${incognito ? 'bg-[#1a1030]' : theme==='dark' ? 'bg-[#0a0a0f] text-zinc-100' : 'bg-[#f6f6f7] text-zinc-900'} ${incognito ? 'ring-2 ring-violet-500/20' : ''}`}>

        {/* TAB BAR — одна линия с окном */}
        <div className={`h-10 flex items-center gap-1 px-2 shrink-0 border-b ${compactMode?'h-8':''} ${incognito ? 'bg-[#1a1030] border-violet-900/30' : 'bg-[#0f0f14] border-white/5'}`}>
          {/* ЛОГО — иконка слева как в Chrome/Yandex */}
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            <img src={LOGO} alt="KAYOR" className="w-6 h-6 rounded-md object-cover" onError={(e)=> (e.currentTarget.style.display='none')} />
            <span className="hidden lg:block text-[11px] font-extrabold tracking-wide opacity-70" style={{fontFamily:'Unbounded'}}>KAYOR</span>
          </div>
          <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none ml-2">
            {tabs.map(tab=>(
              <motion.div
                key={tab.id}
                layout={animations}
                initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} transition={{duration:0.18}}
                onClick={()=> setActiveId(tab.id)}
                onMouseDown={e=> { if(e.button===1){ e.preventDefault(); closeTab(tab.id)} }}
                onContextMenu={e=> { e.preventDefault(); setShowTabMenu({x:e.clientX, y:e.clientY, id:tab.id})}}
                className={`group flex items-center gap-2 px-3 h-7 rounded-full text-[13px] cursor-pointer shrink-0 border relative
                  ${activeId===tab.id ? (incognito?'bg-violet-600 text-white border-violet-500' : 'bg-[#23232b] text-white border-white/10') : 'bg-white/[0.06] text-zinc-400 hover:text-zinc-200 border-white/5 hover:bg-white/10'}
                  ${tab.pinned ? 'w-9 justify-center px-2' : 'min-w-[140px] max-w-[200px]'}`}
                style={{fontFamily: activeId===tab.id?'Unbounded, sans-serif':'Inter'}}
              >
                <span className="text-[11px] leading-none">{tab.favicon}</span>
                {!tab.pinned && <span className="truncate flex-1 font-medium text-[12px]">{tab.title}</span>}
                {tab.pinned && <Pin size={10} className="opacity-60 absolute -top-1 -right-1 bg-white text-zinc-900 rounded-full p-0.5 w-3 h-3" />}
                {!tab.pinned && (
                  <button onClick={e=>{e.stopPropagation(); closeTab(tab.id)}} className="w-4 h-4 grid place-items-center rounded-full opacity-60 group-hover:opacity-100 hover:bg-white/10 -mr-1">
                    <X size={10}/>
                  </button>
                )}
              </motion.div>
            ))}
            <button onClick={()=>createTab()} className="w-7 h-7 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 shrink-0 ml-1">
              <Plus size={14}/>
            </button>
          </div>

          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button onClick={()=> setIncognito(!incognito)} className={`hidden sm:flex items-center gap-1 px-2.5 h-7 rounded-full text-xs border ${incognito?'bg-violet-600 text-white border-violet-500':'bg-white/5 border-white/10 hover:bg-white/10'}`}>
              <EyeOff size={12}/> {incognito?'Инкогнито':'Обычный'}
            </button>
            <div className="w-px h-5 bg-white/10 mx-1 hidden md:block"/>
            <button onClick={()=> setShowSettings(true)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-white/10"><Settings size={14}/></button>
            <div className="hidden md:flex items-center gap-0.5 ml-1">
              <button onClick={()=> (window as any).kayor && (window as any).electron?.minimize?.()} className="w-8 h-8 grid place-items-center hover:bg-white/10 rounded-md"><span className="text-[14px]">—</span></button>
              <button className="w-8 h-8 grid place-items-center hover:bg-white/10 rounded-md"><span className="text-[12px]">□</span></button>
              <button className="w-8 h-8 grid place-items-center hover:bg-red-500 hover:text-white rounded-md"><X size={14}/></button>
            </div>
          </div>
        </div>

        {/* OMNIBOX */}
        <div className={`h-12 flex items-center gap-2 px-3 shrink-0 border-b ${incognito?'bg-[#1a1030] border-violet-900/20':'bg-[#18181f] border-white/5'}`}>
          <div className="flex items-center gap-1">
            <button onClick={handleBack} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10"><ChevronLeft size={16}/></button>
            <button onClick={handleForward} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 opacity-60"><ChevronRight size={16}/></button>
            <button onClick={handleReload} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10"><RotateCw size={14}/></button>
            {showHomeButton && <button onClick={()=> navigate('kayor://newtab')} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10"><Home size={14}/></button>}
          </div>

          <div className={`flex-1 flex items-center gap-2 px-3 h-9 rounded-full border relative ${incognito?'bg-[#2a1a4a] border-violet-800':'bg-[#23232b] border-white/10'} ${focused?'ring-2 ring-white/10':''}`}>
            <span className={`w-5 h-5 grid place-items-center rounded-full ${activeTab?.url.startsWith('https://')?'bg-emerald-500':'bg-white/10'}`}><Lock size={10} className="text-white"/></span>
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
              placeholder="Поиск или адрес"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-zinc-500"
            />
            <button onClick={()=> setBookmarks(b=> b.some(x=>x.url===activeTab?.url) ? b.filter(x=>x.url!==activeTab?.url) : [...b,{id:Math.random().toString(36).slice(2), title:activeTab?.title||'Закладка', url:activeTab?.url||''}])} className="w-6 h-6 grid place-items-center rounded-full hover:bg-white/10">
              {bookmarks.some(b=>b.url===activeTab?.url) ? <Star size={14} className="fill-amber-400 text-amber-400"/> : <Star size={14} className="opacity-60"/>}
            </button>
            <button onClick={()=> setShowMenu(!showMenu)} className="w-6 h-6 grid place-items-center rounded-full hover:bg-white/10"><span className="text-[16px] leading-none">⋮</span></button>

            {focused && suggestions.length>0 && (
              <div className="absolute left-0 right-0 top-[44px] rounded-2xl border shadow-2xl overflow-hidden z-30 bg-[#1e1e26] border-white/10">
                {suggestions.map((s,i)=>(
                  <button key={i} onClick={()=> navigate(s.url)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left">
                    <Search size={14} className="opacity-40"/>
                    <span className="flex-1 truncate text-[13px]">{s.label}</span>
                    <span className="text-xs opacity-40 truncate max-w-[180px]">{s.sub}</span>
                  </button>
                ))}
                <div className="px-4 py-2 bg-white/5 text-xs opacity-50 flex justify-between"><span>Подсказки из истории и закладок</span><span>↵</span></div>
              </div>
            )}
          </div>

          <button onClick={()=> setSidebarOpen(!sidebarOpen)} className={`w-8 h-8 grid place-items-center rounded-full border ${sidebarOpen?'bg-white text-zinc-900':'bg-white/5 border-white/10 hover:bg-white/10'}`}><Bookmark size={14}/></button>
        </div>

        {/* Bookmarks bar — скрыта по умолчанию */}
        {showBookmarksBar && (
          <div className="h-8 flex items-center gap-1 px-3 border-b bg-[#14141a] border-white/5 overflow-x-auto">
            {bookmarks.length===0 ? <span className="text-xs opacity-40">Нет закладок — нажми ★ чтобы добавить</span> :
              bookmarks.map(b=>(
                <button key={b.id} onClick={()=> navigate(b.url)} className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs shrink-0 flex items-center gap-1">
                  <span className="opacity-60">★</span> {b.title}
                </button>
              ))
            }
            <button onClick={()=> setShowBookmarksBar(false)} className="ml-auto text-xs opacity-40 hover:opacity-80">Скрыть</button>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0f] relative">
            {isNewTab ? (
              <div className="flex-1 overflow-auto relative flex flex-col items-center justify-center p-8" style={{background: wallpaper.bg}}>
                <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{duration: animations?0.5:0, delay:0.1}} className="w-full max-w-[640px] flex flex-col items-center gap-6">
                  <img src={LOGO} alt="KAYOR" className="w-20 h-20 rounded-2xl shadow-xl object-cover" onError={e=> (e.currentTarget.style.display='none')} />
                  <div className="text-center">
                    <h1 className="text-[28px] font-extrabold tracking-tight text-white" style={{fontFamily:'Unbounded'}}>KAYOR</h1>
                    <p className="text-sm text-white/60 mt-1">Быстрый • Приватный • Без рекламы</p>
                  </div>

                  <div className="w-full flex items-center gap-2 px-4 h-12 rounded-full bg-white shadow-lg border border-black/5">
                    <Search size={18} className="opacity-30"/>
                    <input
                      placeholder="Поиск в Яндексе или адрес"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-400"
                      onKeyDown={e=> e.key==='Enter' && navigate((e.target as HTMLInputElement).value)}
                    />
                    <select value={engine} onChange={e=> setEngine(e.target.value as any)} className="text-xs bg-zinc-100 rounded-full px-2 py-1 outline-none border-0">
                      <option value="yandex">Яндекс</option><option value="google">Google</option><option value="duckduckgo">DuckDuckGo</option><option value="bing">Bing</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 w-full">
                    {[
                      {t:'YouTube', u:'https://youtube.com', c:'#ff0000', l:'Y'},
                      {t:'Figma', u:'https://figma.com', c:'#1abcf2', l:'F'},
                      {t:'GitHub', u:'https://github.com', c:'#24292e', l:'G'},
                      {t:'Яндекс', u:'https://ya.ru', c:'#ffcc00', l:'Я'},
                      {t:'Notion', u:'https://notion.so', c:'#000', l:'N'},
                      {t:'Dribbble', u:'https://dribbble.com', c:'#ea4c89', l:'D'},
                      {t:'Авито', u:'https://avito.ru', c:'#00aaff', l:'A'},
                      {t:'Wiki', u:'https://wikipedia.org', c:'#636466', l:'W'},
                    ].map(s=>(
                      <button key={s.t} onClick={()=> navigate(s.u)} className="flex flex-col items-center gap-2 group">
                        <span className="w-12 h-12 rounded-2xl grid place-items-center text-white font-bold shadow group-hover:scale-105 transition" style={{background:s.c}}>{s.l}</span>
                        <span className="text-xs text-white/70 group-hover:text-white">{s.t}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>{time.toLocaleDateString('ru-RU',{weekday:'long', day:'numeric', month:'long'})}</span>
                    <span>•</span><span className="flex items-center gap-1">⛅ 18° Москва</span>
                  </div>
                  {!isElectron && <div className="text-xs text-amber-200/70 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">Предпросмотр в браузере: сайты через iframe могут блокироваться — в приложении всё откроется</div>}
                </motion.div>

                <button onClick={()=> setShowSettings(true)} className="absolute bottom-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10">
                  <Palette size={14}/>
                </button>
              </div>
            ) : (
              <div className="flex-1 relative bg-white flex flex-col">
                {/* БРАУЗЕР: webview в Electron, iframe в web-превью */}
                {isElectron ? (
                  // @ts-ignore
                  <webview
                    ref={webviewRef}
                    src={activeTab?.url}
                    className="w-full h-full border-0 flex-1"
                    partition={incognito ? "incognito" : "persist:kayor"}
                    allowpopups
                    webpreferences="allowRunningInsecureContent=no"
                  />
                ) : (
                  <iframe src={activeTab?.url} className="w-full h-full border-0 flex-1" title="page" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads" allow="fullscreen" />
                )}
                {/* фолбэк подсказка если iframe заблокирован */}
                {!isElectron && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#1e1e26] border border-white/10 rounded-full px-3 py-1.5 text-xs flex items-center gap-2 shadow-xl">
                    <Globe size={12} className="opacity-60"/> Если страница не загрузилась — <button onClick={()=> window.open(activeTab?.url,'_blank')} className="underline">открыть в системе</button>
                  </div>
                )}
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

            {/* Chrome-like 3-dot menu */}
            {showMenu && (
              <div className="absolute right-2 top-2 w-72 rounded-2xl border shadow-2xl z-40 bg-[#1e1e26] border-white/10 overflow-hidden">
                <div className="p-2 space-y-1">
                  <button onClick={()=>{createTab(); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Plus size={14}/> Новая вкладка <span className="ml-auto text-xs opacity-40">Ctrl+T</span></button>
                  <button onClick={()=>{setIncognito(!incognito); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><EyeOff size={14}/> {incognito?'Обычный режим':'Инкогнито'}</button>
                  <div className="h-px bg-white/5 my-1"/>
                  <button onClick={()=>{setSidebarTab('history'); setSidebarOpen(true); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Clock size={14}/> История</button>
                  <button onClick={()=>{setSidebarTab('downloads'); setSidebarOpen(true); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Download size={14}/> Загрузки {downloads.length>0 && <span className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{downloads.length}</span>}</button>
                  <button onClick={()=>{setShowBookmarksBar(!showBookmarksBar); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Bookmark size={14}/> {showBookmarksBar?'Скрыть панель закладок':'Показать панель закладок'} <span className="ml-auto text-xs opacity-40">Ctrl+Shift+B</span></button>
                  <div className="h-px bg-white/5 my-1"/>
                  <button onClick={()=>{setShowSettings(true); setSettingsTab('appearance'); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Palette size={14}/> Внешний вид</button>
                  <button onClick={()=>{setShowSettings(true); setShowMenu(false)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-sm"><Settings size={14}/> Настройки</button>
                </div>
                <div className="px-3 py-2 bg-white/5 text-xs opacity-40">KAYOR 1.0.9 • Chromium 124 • {isElectron?'Electron':'Web'}</div>
              </div>
            )}
          </div>

          {/* Sidebar — drawer, hidden by default */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{x:320, opacity:0}} animate={{x:0, opacity:1}} exit={{x:320, opacity:0}} transition={{type:'spring', damping:28, stiffness:300}} className="w-[320px] shrink-0 border-l bg-[#14141a] border-white/5 flex flex-col absolute right-0 top-0 bottom-0 z-20 shadow-2xl">
                <div className="flex items-center gap-1 p-2 border-b border-white/5">
                  {[
                    {id:'bookmarks', icon:Bookmark, label:'Закладки'},
                    {id:'history', icon:History, label:'История'},
                    {id:'downloads', icon:Download, label:'Загрузки'},
                  ].map(t=>(
                    <button key={t.id} onClick={()=> setSidebarTab(t.id as any)} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs border ${sidebarTab===t.id?'bg-white text-zinc-900 border-black/5':'border-transparent opacity-60 hover:bg-white/5 hover:opacity-100'}`}>
                      <t.icon size={14}/> {t.label}
                    </button>
                  ))}
                  <button onClick={()=> setSidebarOpen(false)} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 ml-1"><X size={14}/></button>
                </div>
                <div className="flex-1 overflow-auto p-3">
                  {sidebarTab==='bookmarks' && (
                    <div className="space-y-3">
                      <button onClick={()=> setBookmarks(b=>[...b,{id:Math.random().toString(36).slice(2), title:activeTab?.title||'Закладка', url:activeTab?.url||''}])} className="w-full py-2 rounded-full bg-[#ff253a] text-white text-sm font-medium">+ Добавить страницу</button>
                      {bookmarks.length===0 ? <div className="text-sm opacity-40 text-center py-12">Нет закладок</div> :
                        <div className="space-y-1">{bookmarks.map(b=>(
                          <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 group">
                            <span className="text-xs">★</span><button onClick={()=> navigate(b.url)} className="flex-1 text-left truncate text-sm">{b.title}</button>
                            <button onClick={()=> setBookmarks(x=>x.filter(y=>y.id!==b.id))} className="opacity-0 group-hover:opacity-100 w-6 h-6 grid place-items-center rounded-full hover:bg-white/10"><X size={12}/></button>
                          </div>
                        ))}</div>
                      }
                    </div>
                  )}
                  {sidebarTab==='history' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-xs opacity-60">{history.length} записей</span><button onClick={()=> setHistory([])} className="text-xs text-red-400 hover:underline">Очистить</button></div>
                      {history.length===0 ? <div className="text-sm opacity-40 text-center py-12">История пуста</div> :
                        history.map(h=>(
                          <button key={h.id} onClick={()=> navigate(h.url)} className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5">
                            <div className="truncate text-sm">{h.title}</div><div className="truncate text-xs opacity-40">{h.url}</div>
                          </button>
                        ))
                      }
                    </div>
                  )}
                  {sidebarTab==='downloads' && (
                    <div className="space-y-2">
                      {downloads.length===0 ? <div className="text-sm opacity-40 text-center py-12">Загрузок нет</div> :
                        downloads.map(d=>(
                          <div key={d.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-sm truncate">{d.name}</div><div className="text-xs opacity-40">{d.size}</div>
                            <div className="h-1 rounded-full bg-white/10 mt-2"><div className="h-full bg-[#ff253a] rounded-full" style={{width:`${d.progress}%`}}/></div>
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

        {/* Settings — расширенные */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex bg-black/50 backdrop-blur-sm p-2 md:p-6">
              <motion.div initial={{scale:0.98, y:8}} animate={{scale:1,y:0}} exit={{scale:0.98,y:8}} className="w-full max-w-[980px] mx-auto bg-[#121216] rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh]">
                <div className="h-14 flex items-center gap-3 px-4 border-b border-white/5 shrink-0" style={{background: `linear-gradient(135deg, #ff253a, #ff6b8a)`}}>
                  <img src={LOGO} alt="K" className="w-8 h-8 rounded-xl object-cover bg-white" onError={e=> (e.currentTarget.style.display='none')}/>
                  <div className="flex-1 text-white"><div className="font-bold leading-none" style={{fontFamily:'Unbounded'}}>KAYOR</div><div className="text-xs opacity-80">Настройки • 1.0.9</div></div>
                  <button onClick={()=> setShowSettings(false)} className="w-8 h-8 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white"><X size={16}/></button>
                </div>
                <div className="flex-1 flex overflow-hidden">
                  <div className="w-[200px] border-r border-white/5 p-2 space-y-1 hidden md:block overflow-auto">
                    {[
                      {id:'appearance',label:'Внешний вид',icon:Palette},
                      {id:'search',label:'Поиск',icon:Search},
                      {id:'privacy',label:'Приватность',icon:Shield},
                      {id:'downloads',label:'Загрузки',icon:Download},
                      {id:'performance',label:'Производительность',icon:Zap},
                      {id:'system',label:'Система',icon:Cpu},
                      {id:'about',label:'О браузере',icon:Info},
                    ].map(t=>(
                      <button key={t.id} onClick={()=> setSettingsTab(t.id as any)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left ${settingsTab===t.id?'bg-white text-zinc-900':'hover:bg-white/5'}`}>
                        <t.icon size={14}/> {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-auto p-5 space-y-5">
                    {/* mobile tabs */}
                    <div className="flex gap-1 overflow-x-auto md:hidden pb-2">
                      {['appearance','search','privacy','downloads','performance','system','about'].map(id=>(
                        <button key={id} onClick={()=> setSettingsTab(id as any)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${settingsTab===id?'bg-white text-zinc-900 border-white':'border-white/10'}`}>{id}</button>
                      ))}
                    </div>

                    {settingsTab==='appearance' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Внешний вид</h2>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={()=> setTheme('dark')} className={`p-4 rounded-xl border text-left ${theme==='dark'?'border-white bg-white text-zinc-900':'border-white/10 hover:bg-white/5'}`}>
                            <Moon size={16}/> <div className="font-medium mt-1">Тёмная</div><div className="text-xs opacity-60">Чёрный, тёмно-серый • по умолчанию</div>
                          </button>
                          <button onClick={()=> setTheme('light')} className={`p-4 rounded-xl border text-left ${theme==='light'?'border-white bg-white text-zinc-900':'border-white/10 hover:bg-white/5'}`}>
                            <Sun size={16}/> <div className="font-medium mt-1">Светлая</div><div className="text-xs opacity-60">Белый, серый</div>
                          </button>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Обои новой вкладки</div>
                          <div className="grid grid-cols-3 gap-2">
                            {WALLPAPERS.map(w=>(
                              <button key={w.id} onClick={()=> setWallpaperId(w.id)} className={`h-20 rounded-xl border-2 flex items-end p-2 text-xs font-medium ${wallpaperId===w.id?'border-white':'border-white/10'}`} style={{background:w.bg}}>
                                <span className="bg-black/40 backdrop-blur px-2 py-0.5 rounded-full text-white">{w.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"><span className="text-sm flex items-center gap-2"><Monitor size={14}/> Компактный режим</span><Toggle checked={compactMode} onChange={setCompactMode} /></div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"><span className="text-sm flex items-center gap-2"><Sparkles size={14}/> Анимации</span><Toggle checked={animations} onChange={setAnimations} /></div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"><span className="text-sm flex items-center gap-2"><ImageIcon size={14}/> Кнопка домой в панели</span><Toggle checked={showHomeButton} onChange={setShowHomeButton} /></div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"><span className="text-sm">Показывать панель закладок</span><Toggle checked={showBookmarksBar} onChange={setShowBookmarksBar} /></div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='search' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Поиск</h2>
                        <div>
                          <div className="text-sm font-medium mb-2">Поисковая система по умолчанию</div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(['yandex','google','duckduckgo','bing'] as const).map(e=>(
                              <button key={e} onClick={()=> setEngine(e)} className={`px-3 py-3 rounded-xl text-sm border flex flex-col items-center gap-1 ${engine===e?'bg-white text-zinc-900 border-white':'border-white/10 hover:bg-white/5'}`}><Globe size={16}/>{e}</button>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm space-y-2">
                          <div className="font-medium">Умная строка</div>
                          <div className="opacity-60 text-xs">Подсказки из истории и закладок • Команды /calc 2+2, /translate</div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="px-2 py-1 rounded-full bg-white/10 text-xs">/calc</span>
                            <span className="px-2 py-1 rounded-full bg-white/10 text-xs">/translate</span>
                            <span className="px-2 py-1 rounded-full bg-white/10 text-xs">@вкладки</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='privacy' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Приватность и защита</h2>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"><span className="text-sm"><span className="font-medium">Блокировка рекламы</span> <span className="opacity-60">• EasyList</span></span><Toggle checked={adBlock} onChange={setAdBlock} /></div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"><span className="text-sm font-medium">Анти-трекер</span><Toggle checked={trackerBlock} onChange={setTrackerBlock} /></div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"><span className="text-sm font-medium">Только HTTPS</span><Toggle checked={httpsOnly} onChange={setHttpsOnly} /></div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"><span className="text-sm font-medium">Do Not Track</span><Toggle checked={dnt} onChange={setDnt} /></div>
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">Защита от фишинга, блокировка всплывающих окон, WebRTC защита — включены по умолчанию.</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Очистить данные</div>
                          <div className="grid grid-cols-3 gap-2">
                            <button onClick={()=> setHistory([])} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm flex flex-col items-center gap-1"><Trash2 size={16}/> История</button>
                            <button onClick={()=> setHistory([])} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm flex flex-col items-center gap-1"><Trash2 size={16}/> Кэш</button>
                            <button onClick={()=> {setHistory([]); setBookmarks([])}} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm flex flex-col items-center gap-1"><Trash2 size={16}/> Всё</button>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#ff253a]/10 border border-[#ff253a]/20 text-sm">
                          <div className="font-medium flex items-center gap-2"><ShieldCheck size={14}/> Пароли</div>
                          <div className="opacity-70 text-xs mt-1">Менеджер паролей сохраняет логины локально (шифровано). В 1.0 будет синхронизация.</div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='downloads' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Загрузки</h2>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2"><FolderOpen size={14}/> Папка: Загрузки</span>
                          <button className="px-3 py-1 rounded-full bg-white text-zinc-900 text-xs">Изменить</button>
                        </div>
                        <div className="space-y-2 text-sm opacity-70">
                          <div>• Спрашивать куда сохранять — вкл.</div>
                          <div>• Уведомления о завершении — вкл.</div>
                          <div>• Авто-открытие папки — выкл.</div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='performance' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Производительность</h2>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"><span className="text-sm"><span className="font-medium">Экономия памяти</span> <span className="opacity-60">• спящие вкладки</span></span><Toggle checked={memorySaver} onChange={setMemorySaver} /></div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">Предзагрузка, ленивая загрузка, кэш — включены. Task Manager: Shift+Esc (скоро).</div>
                      </div>
                    )}

                    {settingsTab==='system' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Система</h2>
                        <button className="w-full p-3 rounded-xl bg-white text-zinc-900 text-sm font-medium">Сделать браузером по умолчанию</button>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                          <div className="font-medium flex items-center gap-2"><Languages size={14}/> Язык</div>
                          <select className="mt-2 w-full bg-[#1e1e26] border border-white/10 rounded-xl px-3 py-2 text-sm"><option>Русский</option><option>English</option></select>
                          <div className="mt-3 font-medium">Переводчик</div>
                          <div className="opacity-60 text-xs">Авто-определение, перевод страницы и выделенного текста (LibreTranslate).</div>
                        </div>
                      </div>
                    )}

                    {settingsTab==='about' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>О браузере</h2>
                        <div className="p-4 rounded-xl bg-white text-zinc-900">
                          <div className="flex items-center gap-3">
                            <img src={LOGO} className="w-10 h-10 rounded-xl" onError={e=> (e.currentTarget.style.display='none')} />
                            <div><div className="font-bold" style={{fontFamily:'Unbounded'}}>KAYOR Browser 1.0.9</div><div className="text-xs opacity-60">Chromium 124 • Electron 30 • {isElectron?'Native webview':'Web preview'}</div></div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button className="px-3 py-1.5 rounded-full bg-[#ff253a] text-white text-xs">Проверить обновления</button>
                            <button onClick={()=> window.open('https://github.com/kayorissss/KAYOR-BROWSER','_blank')} className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs flex items-center gap-1"><ExternalLink size={12}/> GitHub</button>
                          </div>
                        </div>
                        <div className="text-xs opacity-50">Сборка Stable • Автообновления: вкл. • Каналы: Stable / Beta / Nightly (скоро)</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
