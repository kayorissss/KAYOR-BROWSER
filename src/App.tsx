import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Search, Star, Lock, ShieldCheck, ChevronLeft, ChevronRight, RotateCw, Home,
  Bookmark, Download, Clock, History, Settings, Palette, Moon, Sun,
  Pin, Copy, ExternalLink, Sparkles, HardDrive, Check, Upload, User,
  Shield, EyeOff, Image as ImageIcon, StickyNote, ListChecks
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
  const [engine, setEngine] = useState<'yandex'|'google'|'duckduckgo'>('yandex')
  const [incognito, setIncognito] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'appearance'|'search'|'privacy'>('appearance')
  const [showMenu, setShowMenu] = useState(false)
  const [showTabMenu, setShowTabMenu] = useState<{x:number;y:number;id:string}|null>(null)
  const omniboxRef = useRef<HTMLInputElement>(null)
  const [time] = useState(new Date())

  const activeTab = useMemo(()=> tabs.find(t=>t.id===activeId) || tabs[0], [tabs,activeId])
  const wallpaper = useMemo(()=> WALLPAPERS.find(w=>w.id===wallpaperId) || WALLPAPERS[1], [wallpaperId])
  const isNewTab = activeTab?.url.startsWith('kayor://')

  useEffect(()=> localStorage.setItem('kayor_tabs_v2', JSON.stringify(tabs)),[tabs])
  useEffect(()=> localStorage.setItem('kayor_bm_v2', JSON.stringify(bookmarks)),[bookmarks])
  useEffect(()=> localStorage.setItem('kayor_hist_v2', JSON.stringify(history)),[history])
  useEffect(()=> localStorage.setItem('kayor_wp', wallpaperId),[wallpaperId])

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

  function createTab(url='kayor://newtab'){
    const id=Math.random().toString(36).slice(2,7)
    const isInternal=url.startsWith('kayor://')
    const title=isInternal?'Новая вкладка':(()=>{try{return new URL(url.startsWith('http')?url:'https://'+url).hostname}catch{return url}})()
    const t:Tab={id, url, title, favicon: isInternal?'✦':'🌐'}
    setTabs(x=>[...x,t]); setActiveId(id)
    if(!isInternal) setHistory(h=>[{id:Math.random().toString(36).slice(2), title, url, time: new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})},...h].slice(0,50))
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
      const engines:any={yandex:`https://ya.ru/search?text=${q}`, google:`https://www.google.com/search?q=${q}`, duckduckgo:`https://duckduckgo.com/?q=${q}`}
      url=engines[engine]
    } else if(!url.startsWith('http')&&!url.startsWith('kayor://')) url='https://'+url
    setTabs(ts=> ts.map(t=> t.id===activeId?{...t,url, title: url.startsWith('kayor://')?'Новая вкладка':(()=>{try{return new URL(url).hostname}catch{return url}})(), favicon: url.startsWith('kayor://')?'✦':'🌐'}:t))
    if(!url.startsWith('kayor://')) setHistory(h=>[{id:Math.random().toString(36).slice(2), title:url, url, time:'сейчас'},...h].slice(0,50))
    setOmnibox(''); setFocused(false)
  }

  const suggestions = useMemo(()=>{
    if(!focused || !omnibox) return []
    const q=omnibox.toLowerCase()
    const fromHist=history.filter(h=>h.title.toLowerCase().includes(q)||h.url.toLowerCase().includes(q)).slice(0,3).map(h=>({label:h.title, sub:h.url, url:h.url}))
    const fromBook=bookmarks.filter(b=>b.title.toLowerCase().includes(q)).slice(0,2).map(b=>({label:b.title, sub:b.url, url:b.url}))
    const search=[{label:`Искать «${omnibox}» в ${engine}`, sub:`${engine} поиск`, url: omnibox}]
    return [...fromHist, ...fromBook, ...search].slice(0,6)
  },[focused,omnibox, history, bookmarks, engine])

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden select-none ${theme==='dark'?'dark':''}`} style={{fontFamily:'Inter, system-ui, sans-serif'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@700;800&display=swap'); :root{--accent:${accent}}`}</style>

      {/* Intro */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}} className={`flex-1 flex flex-col overflow-hidden ${incognito ? 'bg-[#1a1030]' : theme==='dark' ? 'bg-[#0a0a0f] text-zinc-100' : 'bg-[#f6f6f7] text-zinc-900'} ${incognito ? 'ring-2 ring-violet-500/20' : ''}`}>

        {/* TAB BAR — одна линия с окном */}
        <div className={`h-10 flex items-center gap-1 px-2 shrink-0 border-b ${incognito ? 'bg-[#1a1030] border-violet-900/30' : 'bg-[#0f0f14] border-white/5'}`}>
          <img src="/kayorbrowse.png" alt="K" className="w-6 h-6 rounded-md object-cover ml-1" />
          <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none ml-2">
            {tabs.map(tab=>(
              <motion.div
                key={tab.id}
                layout
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
              <button className="w-8 h-8 grid place-items-center hover:bg-white/10 rounded-md"><span className="text-[14px]">—</span></button>
              <button className="w-8 h-8 grid place-items-center hover:bg-white/10 rounded-md"><span className="text-[12px]">□</span></button>
              <button className="w-8 h-8 grid place-items-center hover:bg-red-500 hover:text-white rounded-md"><X size={14}/></button>
            </div>
          </div>
        </div>

        {/* OMNIBOX */}
        <div className={`h-12 flex items-center gap-2 px-3 shrink-0 border-b ${incognito?'bg-[#1a1030] border-violet-900/20':'bg-[#18181f] border-white/5'}`}>
          <div className="flex items-center gap-1">
            <button onClick={()=> window.history.back()} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10"><ChevronLeft size={16}/></button>
            <button className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 opacity-40"><ChevronRight size={16}/></button>
            <button onClick={()=> setTabs(t=>[...t])} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10"><RotateCw size={14}/></button>
          </div>

          <div className={`flex-1 flex items-center gap-2 px-3 h-9 rounded-full border relative ${incognito?'bg-[#2a1a4a] border-violet-800':'bg-[#23232b] border-white/10'} ${focused?'ring-2 ring-white/10':''}`}>
            <span className={`w-5 h-5 grid place-items-center rounded-full ${activeTab?.url.startsWith('https://')?'bg-emerald-500':'bg-white/10'}`}><Lock size={10} className="text-white"/></span>
            <input
              ref={omniboxRef}
              value={focused ? omnibox : (omnibox || activeTab?.url || '')}
              onFocus={()=> setFocused(true)}
              onBlur={()=> setTimeout(()=> setFocused(false),150)}
              onChange={e=> setOmnibox(e.target.value)}
              onKeyDown={e=> e.key==='Enter' && navigate(omnibox || activeTab?.url || '')}
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
                <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.1}} className="w-full max-w-[640px] flex flex-col items-center gap-6">
                  <img src="/kayorbrowse.png" alt="KAYOR" className="w-20 h-20 rounded-2xl shadow-xl object-cover" />
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
                      <option value="yandex">Яндекс</option><option value="google">Google</option><option value="duckduckgo">DuckDuckGo</option>
                    </select>
                  </div>

                  {/* Speed dial — без подписи */}
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
                </motion.div>

                <button onClick={()=> setShowSettings(true)} className="absolute bottom-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10">
                  <Palette size={14}/>
                </button>
              </div>
            ) : (
              <div className="flex-1 relative bg-white">
                <iframe src={activeTab?.url} className="w-full h-full border-0" title="page" sandbox="allow-same-origin allow-scripts allow-forms allow-popups" />
              </div>
            )}

            {/* Tab context menu */}
            {showTabMenu && (
              <div className="fixed inset-0 z-40" onClick={()=> setShowTabMenu(null)}>
                <div style={{left:showTabMenu.x, top:showTabMenu.y}} className="absolute w-48 rounded-xl border shadow-xl py-1 bg-[#1e1e26] border-white/10">
                  <button onClick={()=>{const t=tabs.find(x=>x.id===showTabMenu.id); if(t) setTabs(ts=> ts.map(x=>x.id===t.id?{...x, pinned:!x.pinned}:x)); setShowTabMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm flex items-center gap-2"><Pin size={12}/> {tabs.find(t=>t.id===showTabMenu.id)?.pinned ? 'Открепить' : 'Закрепить'}</button>
                  <button onClick={()=>{const t=tabs.find(x=>x.id===showTabMenu.id); if(t){ const nid=Math.random().toString(36).slice(2,7); setTabs(ts=>[...ts,{...t,id:nid, title:t.title+' — копия'}])}; setShowTabMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm">Дублировать</button>
                  <button onClick={()=>{closeTab(showTabMenu.id); setShowTabMenu(null)}} className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm text-red-400">Закрыть</button>
                </div>
              </div>
            )}

            {/* Chrome-like 3-dot menu */}
            {showMenu && (
              <div className="absolute right-2 top-12 w-72 rounded-2xl border shadow-2xl z-40 bg-[#1e1e26] border-white/10 overflow-hidden">
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
                <div className="px-3 py-2 bg-white/5 text-xs opacity-40">KAYOR 1.0.7 • Chromium 124</div>
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
                      {history.length===0 ? <div className="text-sm opacity-40 text-center py-12">История пуста</div> :
                        history.map(h=>(
                          <div key={h.id} className="px-3 py-2 rounded-xl hover:bg-white/5">
                            <div className="truncate text-sm">{h.title}</div><div className="truncate text-xs opacity-40">{h.url}</div>
                          </div>
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

        {/* Settings — full page modal, not cut */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex bg-black/50 backdrop-blur-sm p-4 md:p-8">
              <motion.div initial={{scale:0.98, y:8}} animate={{scale:1,y:0}} exit={{scale:0.98,y:8}} className="w-full max-w-[960px] mx-auto bg-[#121216] rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="h-14 flex items-center gap-3 px-4 border-b border-white/5 shrink-0" style={{background: `linear-gradient(135deg, #ff253a, #ff6b8a)`}}>
                  <img src="/kayorbrowse.png" alt="K" className="w-8 h-8 rounded-xl object-cover bg-white"/>
                  <div className="flex-1 text-white"><div className="font-bold leading-none" style={{fontFamily:'Unbounded'}}>KAYOR</div><div className="text-xs opacity-80">Настройки</div></div>
                  <button onClick={()=> setShowSettings(false)} className="w-8 h-8 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white"><X size={16}/></button>
                </div>
                <div className="flex-1 flex overflow-hidden">
                  <div className="w-[180px] border-r border-white/5 p-2 space-y-1 hidden md:block">
                    {[
                      {id:'appearance',label:'Внешний вид',icon:Palette},
                      {id:'search',label:'Поиск',icon:Search},
                      {id:'privacy',label:'Приватность',icon:Shield},
                    ].map(t=>(
                      <button key={t.id} onClick={()=> setSettingsTab(t.id as any)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left ${settingsTab===t.id?'bg-white text-zinc-900':'hover:bg-white/5'}`}>
                        <t.icon size={14}/> {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-auto p-6 space-y-4">
                    {settingsTab==='appearance' && (
                      <>
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Внешний вид</h2>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={()=> setTheme('dark')} className={`p-4 rounded-xl border text-left ${theme==='dark'?'border-white bg-white text-zinc-900':'border-white/10 hover:bg-white/5'}`}>
                            <Moon size={16}/> <div className="font-medium mt-1">Тёмная</div><div className="text-xs opacity-60">Чёрный, тёмно-серый</div>
                          </button>
                          <button onClick={()=> setTheme('light')} className={`p-4 rounded-xl border text-left ${theme==='light'?'border-white bg-white text-zinc-900':'border-white/10 hover:bg-white/5'}`}>
                            <Sun size={16}/> <div className="font-medium mt-1">Светлая</div><div className="text-xs opacity-60">Белый, серый</div>
                          </button>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Обои новой вкладки</div>
                          <div className="grid grid-cols-3 gap-2">
                            {WALLPAPERS.map(w=>(
                              <button key={w.id} onClick={()=> setWallpaperId(w.id)} className={`h-16 rounded-xl border-2 ${wallpaperId===w.id?'border-white':'border-white/10'}`} style={{background:w.bg}}/>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {settingsTab==='search' && (
                      <div className="space-y-3">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Поиск</h2>
                        <div className="flex gap-2">
                          {(['yandex','google','duckduckgo'] as const).map(e=>(
                            <button key={e} onClick={()=> setEngine(e)} className={`px-3 py-2 rounded-full text-sm border ${engine===e?'bg-white text-zinc-900 border-white':'border-white/10 hover:bg-white/5'}`}>{e}</button>
                          ))}
                        </div>
                        <p className="text-sm opacity-60">Подсказки появляются при вводе в адресную строку — из истории и закладок.</p>
                      </div>
                    )}
                    {settingsTab==='privacy' && (
                      <div className="space-y-3">
                        <h2 className="text-lg font-bold" style={{fontFamily:'Unbounded'}}>Приватность</h2>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">Блокировщик рекламы, HTTPS, анти-трекер — включены по умолчанию.</div>
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
