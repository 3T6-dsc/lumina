
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Search, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Send,
  MessageSquare,
  Bot,
  Info,
  RefreshCw
} from 'lucide-react';
import { SidebarPanel, Bookmark, HistoryItem } from '../types';
import { GoogleGenAI } from '@google/genai';

interface SidebarProps {
  isOpen: boolean;
  activePanel: SidebarPanel;
  history: HistoryItem[];
  bookmarks: Bookmark[];
  currentUrl: string;
  onClose: () => void;
  onNavigate: (url: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  activePanel, 
  history, 
  bookmarks, 
  currentUrl,
  onClose,
  onNavigate
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'downloaded'>('idle');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsAiLoading(true);

    try {
      // Corrected: Initialize GoogleGenAI instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: The user is browsing ${currentUrl}. User query: ${userText}`,
        config: {
          systemInstruction: 'You are Lumina, the native AI engine of the Lumina Web Browser. You are helpful, concise, and professional. You provide web summaries, technical explanations, and browsing assistance. Use markdown for formatting.',
        },
      });

      // Corrected: Direct access to response.text property
      const text = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'ai', text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to Lumina intelligence. Please check your network and API key settings." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-[380px] h-full bg-slate-900 border-l border-slate-800 flex flex-col z-50 shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          {activePanel === SidebarPanel.AI && <><Sparkles className="w-4 h-4 text-blue-400" /> Lumina Assistant</>}
          {activePanel === SidebarPanel.BOOKMARKS && 'Bookmarks'}
          {activePanel === SidebarPanel.HISTORY && 'History'}
          {activePanel === SidebarPanel.SETTINGS && 'Settings'}
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activePanel === SidebarPanel.AI && (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                  <div className="p-4 bg-slate-800 rounded-2xl">
                    <Bot className="w-12 h-12 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200">How can I help you today?</h3>
                  <p className="text-xs text-slate-400 max-w-[200px]">I can summarize pages, translate content, or help with complex queries while you browse.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Lumina about this page..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isAiLoading}
                  className="absolute right-2 top-2 p-1.5 text-blue-400 hover:text-blue-300 disabled:opacity-30 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {activePanel === SidebarPanel.BOOKMARKS && (
          <div className="p-4 space-y-2">
            {bookmarks.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-10">No bookmarks saved yet.</p>
            ) : (
              bookmarks.map(b => (
                <div key={b.id} className="group flex items-center justify-between p-3 bg-slate-800/40 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => onNavigate(b.url)}>
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-sm font-semibold truncate text-slate-200">{b.title}</span>
                    <span className="text-[10px] text-slate-500 truncate">{b.url}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400" />
                </div>
              ))
            )}
          </div>
        )}

        {activePanel === SidebarPanel.HISTORY && (
          <div className="p-4 space-y-4">
            {history.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-10">Your browsing history is empty.</p>
            ) : (
              history.map(item => (
                <div key={item.id} className="flex gap-3 items-start group">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 group-hover:bg-blue-500 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm text-slate-300 truncate font-medium cursor-pointer hover:text-white"
                      onClick={() => onNavigate(item.url)}
                    >
                      {item.title}
                    </p>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-[10px] text-slate-600 truncate max-w-[150px]">{item.url}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activePanel === SidebarPanel.SETTINGS && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">General</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Default Search Engine</span>
                  <select className="bg-slate-800 border border-slate-700 rounded text-xs p-1 outline-none text-slate-300 focus:border-blue-500">
                    <option>Google</option>
                    <option>DuckDuckGo</option>
                    <option>Bing</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Privacy Shield Level</span>
                  <select className="bg-slate-800 border border-slate-700 rounded text-xs p-1 outline-none text-slate-300">
                    <option>Standard</option>
                    <option>Aggressive</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">About Lumina</h3>
              <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-4 flex flex-col items-center gap-3">
                 <div className="p-3 bg-blue-500/10 rounded-full">
                    <Info className="w-6 h-6 text-blue-400" />
                 </div>
                 <div className="text-center">
                   <p className="text-sm font-bold text-slate-200">Lumina Browser</p>
                   <p className="text-[10px] text-slate-500 mb-2">Version 1.2.4 (Open Build)</p>
                   
                   <div className="flex flex-col gap-2 items-center">
                      <div className="flex gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded">Blink Engine</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded">Gemini AI</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1">
                        <RefreshCw className={`w-2.5 h-2.5 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                        <span>System is up to date</span>
                      </div>
                   </div>
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Advanced</h3>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-900/50 text-red-500 rounded-lg text-sm hover:bg-red-950/20 transition-colors">
                <Trash2 className="w-4 h-4" />
                Clear Browsing Data
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
