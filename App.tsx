
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Plus, X, Globe, ArrowLeft, ArrowRight, RotateCw, Shield, ShieldOff, 
  Star, Layout, History, Sparkles, Settings, MoreVertical, AlertCircle, 
  Lock, ShieldCheck, Zap, Info, Send, Bot, Trash2, ExternalLink, Clock,
  ChevronRight, Search
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// --- Constants & Utilities ---
const DEFAULT_URL = 'https://www.wikipedia.org';
const SidebarPanel = {
  NONE: 'none',
  AI: 'ai',
  BOOKMARKS: 'bookmarks',
  HISTORY: 'history',
  SETTINGS: 'settings'
};

const getBaseDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

// --- Sub-Components ---

const TabBar = ({ tabs, activeTabId, onSelect, onClose, onAdd }) => (
  <div className="flex items-center px-2 pt-2 gap-1 overflow-x-auto no-scrollbar h-11 bg-slate-950/40">
    {tabs.map((tab) => (
      <div
        key={tab.id}
        onClick={() => onSelect(tab.id)}
        className={`
          group relative flex items-center min-w-[140px] max-w-[220px] h-9 px-3 rounded-t-lg cursor-pointer transition-all overflow-hidden
          ${tab.id === activeTabId 
            ? 'bg-slate-800 text-slate-100 border-t border-slate-700 shadow-sm' 
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden w-full mr-4 z-10">
          <Globe className={`w-3.5 h-3.5 flex-shrink-0 ${tab.isLoading ? 'animate-spin text-blue-400' : ''}`} />
          <span className="text-xs font-medium truncate whitespace-nowrap">
            {tab.title}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(tab.id, e); }}
          className={`
            absolute right-2 p-0.5 rounded-md transition-opacity z-10
            ${tab.id === activeTabId ? 'opacity-100 hover:bg-slate-700' : 'opacity-0 group-hover:opacity-100 hover:bg-slate-700'}
          `}
        >
          <X className="w-3 h-3" />
        </button>
        {tab.isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500/30 overflow-hidden z-20">
            <div className="h-full bg-blue-500 w-1/2 animate-[shimmer_1.5s_infinite]" style={{
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              backgroundSize: '200% 100%'
            }} />
          </div>
        )}
      </div>
    ))}
    <button onClick={onAdd} className="p-2 ml-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors">
      <Plus className="w-4 h-4" />
    </button>
  </div>
);

const AddressBar = ({ url, isLoading, isShieldActive, isBookmarked, onNavigate, onToggleShield, onToggleBookmark, onOpenSidebar }) => {
  const [inputValue, setInputValue] = useState(url);
  useEffect(() => setInputValue(url), [url]);

  return (
    <div className="flex items-center h-12 px-3 gap-3 bg-slate-900/40 backdrop-blur-md border-t border-slate-700/30">
      <div className="flex items-center gap-1">
        <button className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-all active:scale-90"><ArrowLeft className="w-4 h-4" /></button>
        <button className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-all active:scale-90"><ArrowRight className="w-4 h-4" /></button>
        <button onClick={() => onNavigate(url)} className={`p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-all ${isLoading ? 'animate-spin' : ''}`}><RotateCw className="w-4 h-4" /></button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onNavigate(inputValue); }} className="flex-1">
        <div className="relative flex items-center group">
          <div className="absolute left-3 flex items-center gap-2">
            <button type="button" onClick={onToggleShield} className={`transition-all duration-300 flex items-center gap-1.5 ${isShieldActive ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isShieldActive ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
              {isShieldActive && <span className="text-[10px] font-bold bg-emerald-400/20 px-1 rounded">24</span>}
            </button>
          </div>
          <input
            type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-full h-8 px-12 text-xs font-medium text-slate-300 outline-none transition-all"
            spellCheck={false}
          />
          <div className="absolute right-3 flex items-center gap-2">
            <button type="button" onClick={onToggleBookmark} className={`hover:bg-slate-800 p-0.5 rounded transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}>
              <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </form>
      <div className="flex items-center gap-1">
        <button onClick={() => onOpenSidebar(SidebarPanel.AI)} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-blue-200 hover:bg-blue-600/20 border border-blue-500/20 rounded-full transition-all text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Ask Lumina</span>
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-1" />
        <button onClick={() => onOpenSidebar(SidebarPanel.BOOKMARKS)} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"><Layout className="w-4 h-4" /></button>
        <button onClick={() => onOpenSidebar(SidebarPanel.HISTORY)} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"><History className="w-4 h-4" /></button>
        <button onClick={() => onOpenSidebar(SidebarPanel.SETTINGS)} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"><Settings className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

const WebView = ({ url, isLoading, isShieldActive }) => {
  const [loadError, setLoadError] = useState(false);
  useEffect(() => setLoadError(false), [url]);

  return (
    <div className="w-full h-full bg-[#f8fafc] relative flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-bold text-[10px] tracking-widest uppercase">Securing Connection...</p>
        </div>
      )}
      <div className="h-7 bg-slate-100/80 backdrop-blur-sm border-b border-slate-200 px-4 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tight">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-600"><Lock className="w-3 h-3" /><span>Secure</span></div>
          <div className="w-[1px] h-3 bg-slate-300" />
          <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /><span>{getBaseDomain(url)}</span></div>
        </div>
        {isShieldActive && (
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <ShieldCheck className="w-3 h-3" /><span>Shield Active</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 relative overflow-hidden bg-white">
        {loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Connection Hardened</h2>
            <p className="text-sm text-slate-500 max-w-sm">This site restricts embedding for security reasons. Try another URL.</p>
          </div>
        ) : (
          <iframe src={url} className="w-full h-full border-none" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" onError={() => setLoadError(true)} />
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, activePanel, history, bookmarks, currentUrl, onClose, onNavigate }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const apiKey = window.process?.env?.API_KEY;
    if (!input.trim() || isAiLoading || !apiKey) return;
    const userText = input; setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Page: ${currentUrl}\nUser: ${userText}`,
        config: { systemInstruction: 'You are Lumina AI. Concise, helpful, expert. Use markdown.' }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "No response." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "AI Service Unavailable." }]);
    } finally { setIsAiLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-[380px] h-full bg-slate-900 border-l border-slate-800 flex flex-col z-50 shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {activePanel === SidebarPanel.AI && 'Lumina Assistant'}
          {activePanel === SidebarPanel.BOOKMARKS && 'Bookmarks'}
          {activePanel === SidebarPanel.HISTORY && 'History'}
          {activePanel === SidebarPanel.SETTINGS && 'Settings'}
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {activePanel === SidebarPanel.AI && (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-20">
                  <Bot className="w-12 h-12 mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Ready to assist</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiLoading && <div className="flex justify-start"><div className="bg-slate-800 p-3 rounded-2xl text-xs text-blue-400 animate-pulse">Lumina is thinking...</div></div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="relative mt-auto">
              <input 
                type="text" value={input} onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask about this page..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-blue-500" 
              />
              <button type="submit" className="absolute right-2 top-2 p-1.5 text-blue-400"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        )}
        {activePanel === SidebarPanel.BOOKMARKS && (
          <div className="space-y-2">
            {bookmarks.map(b => (
              <div key={b.id} onClick={() => onNavigate(b.url)} className="p-3 bg-slate-800/40 rounded-lg hover:bg-slate-800 cursor-pointer transition-all border border-transparent hover:border-slate-700">
                <p className="text-xs font-bold text-slate-200 truncate">{b.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{b.url}</p>
              </div>
            ))}
          </div>
        )}
        {activePanel === SidebarPanel.HISTORY && (
          <div className="space-y-4">
            {history.map(h => (
              <div key={h.id} onClick={() => onNavigate(h.url)} className="flex items-center gap-3 group cursor-pointer">
                <Clock className="w-3 h-3 text-slate-600 group-hover:text-blue-400" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-300 truncate font-medium group-hover:text-white">{h.title}</p>
                  <p className="text-[9px] text-slate-600">{new Date(h.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {activePanel === SidebarPanel.SETTINGS && (
          <div className="space-y-6">
            <button className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all">
              Clear All Browsing Data
            </button>
            <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Build Info</p>
              <p className="text-xs text-slate-200">Lumina Core v1.3.0</p>
              <p className="text-[10px] text-slate-500">Blink Engine Integrated</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

// --- Main Application ---

const App = () => {
  const [tabs, setTabs] = useState([
    { id: '1', url: DEFAULT_URL, title: 'Wikipedia', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(SidebarPanel.NONE);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [isShieldActive, setIsShieldActive] = useState(true);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleAddTab = useCallback(() => {
    const newId = crypto.randomUUID();
    const newTab = { id: newId, url: 'https://www.google.com/search?igu=1', title: 'New Tab', isLoading: false };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  }, []);

  const handleCloseTab = useCallback((id) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
  }, [tabs, activeTabId]);

  const handleNavigate = useCallback((url) => {
    let finalUrl = url;
    if (!url.startsWith('http')) {
      if (url.includes('.') && !url.includes(' ')) finalUrl = `https://${url}`;
      else finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}&igu=1`;
    }
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: finalUrl, isLoading: true, title: getBaseDomain(finalUrl) } : t));
    setHistory(prev => [{ id: crypto.randomUUID(), url: finalUrl, title: getBaseDomain(finalUrl), timestamp: Date.now() }, ...prev.slice(0, 49)]);
    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
    }, 1000);
  }, [activeTabId]);

  const handleToggleBookmark = useCallback(() => {
    const exists = bookmarks.find(b => b.url === activeTab.url);
    if (exists) setBookmarks(prev => prev.filter(b => b.url !== activeTab.url));
    else setBookmarks(prev => [...prev, { id: crypto.randomUUID(), title: activeTab.title, url: activeTab.url }]);
  }, [activeTab, bookmarks]);

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-200 overflow-hidden select-none">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="bg-slate-950/80 border-b border-slate-700/50 flex flex-col backdrop-blur-xl">
          <TabBar tabs={tabs} activeTabId={activeTabId} onSelect={setActiveTabId} onClose={handleCloseTab} onAdd={handleAddTab} />
          <AddressBar 
            url={activeTab.url} isLoading={activeTab.isLoading} isShieldActive={isShieldActive} 
            isBookmarked={!!bookmarks.find(b => b.url === activeTab.url)} onNavigate={handleNavigate}
            onToggleShield={() => setIsShieldActive(!isShieldActive)} onToggleBookmark={handleToggleBookmark}
            onOpenSidebar={(panel) => setSidebarOpen(sidebarOpen === panel ? SidebarPanel.NONE : panel)}
          />
        </div>
        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 bg-white overflow-hidden relative shadow-inner">
            {tabs.map(tab => (
              <div key={tab.id} className={`absolute inset-0 transition-opacity duration-300 ${tab.id === activeTabId ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                <WebView url={tab.url} isLoading={tab.isLoading} isShieldActive={isShieldActive} />
              </div>
            ))}
          </main>
          <Sidebar 
            isOpen={sidebarOpen !== SidebarPanel.NONE} activePanel={sidebarOpen} history={history} bookmarks={bookmarks}
            currentUrl={activeTab.url} onClose={() => setSidebarOpen(SidebarPanel.NONE)} onNavigate={handleNavigate}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
