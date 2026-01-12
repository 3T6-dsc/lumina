
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Send,
  Bot,
  RefreshCw,
  Clock,
  Bookmark as BookmarkIcon
} from 'lucide-react';
import { SidebarPanel } from '../types.ts';
import { GoogleGenAI } from '@google/genai';

const Sidebar = ({ 
  isOpen, 
  activePanel, 
  history, 
  bookmarks, 
  currentUrl,
  onClose,
  onNavigate
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const apiKey = window.process?.env?.API_KEY;
    
    if (!input.trim() || isAiLoading) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: The user is currently browsing ${currentUrl}. User query: ${userText}`,
        config: {
          systemInstruction: 'You are Lumina, the native AI engine of the Lumina Web Browser. You are helpful, concise, and professional. Provide web summaries and assistance. Use markdown.',
        },
      });

      const text = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'ai', text }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "Connection failed. Please check your network and API key." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-[380px] h-full bg-slate-900 border-l border-slate-800 flex flex-col z-50 shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          {activePanel === SidebarPanel.AI && <><Sparkles className="w-4 h-4 text-blue-400" /> Lumina Assistant</>}
          {activePanel === SidebarPanel.BOOKMARKS && <><BookmarkIcon className="w-4 h-4 text-yellow-500" /> Bookmarks</>}
          {activePanel === SidebarPanel.HISTORY && <><Clock className="w-4 h-4 text-slate-400" /> History</>}
          {activePanel === SidebarPanel.SETTINGS && <><RefreshCw className="w-4 h-4 text-slate-400" /> Settings</>}
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activePanel === SidebarPanel.AI && (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80 pt-12">
                  <div className="p-5 bg-blue-600/10 rounded-full ring-8 ring-blue-600/5">
                    <Bot className="w-12 h-12 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-lg">Hello, I'm Lumina</h3>
                    <p className="text-xs text-slate-400 max-w-[240px] mt-2 leading-relaxed">
                      I'm built into your browser to help you understand the web. Try asking me to summarize the current page.
                    </p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[92%] p-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                    <div className="flex gap-1.5 px-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="sticky bottom-0 p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Lumina about this page..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500 text-slate-200"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isAiLoading}
                  className="absolute right-2 top-2 p-1.5 text-blue-400 hover:text-blue-300 disabled:opacity-30 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {activePanel === SidebarPanel.BOOKMARKS && (
          <div className="p-4 space-y-2">
            {bookmarks.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-20">No bookmarks saved yet.</div>
            ) : (
              bookmarks.map(b => (
                <div key={b.id} className="group flex items-center justify-between p-3 bg-slate-800/40 rounded-lg hover:bg-slate-800 cursor-pointer" onClick={() => onNavigate(b.url)}>
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-sm font-semibold truncate text-slate-200">{b.title}</span>
                    <span className="text-[10px] text-slate-500 truncate">{b.url}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              ))
            )}
          </div>
        )}

        {activePanel === SidebarPanel.HISTORY && (
          <div className="p-4 space-y-4">
            {history.map(item => (
              <div key={item.id} className="flex gap-3 items-start group">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 group-hover:bg-blue-500 transition-all" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate font-medium cursor-pointer hover:text-white" onClick={() => onNavigate(item.url)}>
                    {item.title}
                  </p>
                  <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activePanel === SidebarPanel.SETTINGS && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">General Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Default Search Engine</span>
                  <select className="bg-slate-800 border border-slate-700 rounded-lg text-xs p-2 outline-none text-slate-300">
                    <option>Google (Default)</option>
                    <option>DuckDuckGo</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-800">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/5 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" />
                Reset Browser Factory Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
