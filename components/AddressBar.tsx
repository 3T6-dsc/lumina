
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Shield, 
  ShieldOff, 
  Star, 
  Layout, 
  History, 
  Sparkles,
  Settings,
  MoreVertical
} from 'lucide-react';
import { SidebarPanel } from '../types.ts';

const AddressBar = ({ 
  url, 
  isLoading, 
  isShieldActive, 
  isBookmarked,
  onNavigate, 
  onToggleShield,
  onToggleBookmark,
  onOpenSidebar
}) => {
  const [inputValue, setInputValue] = useState(url);

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigate(inputValue);
  };

  return (
    <div className="flex items-center h-12 px-3 gap-3 bg-slate-900/40 backdrop-blur-md border-t border-slate-700/30">
      <div className="flex items-center gap-1">
        <button className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-all active:scale-90">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-all active:scale-90">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          className={`p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-all ${isLoading ? 'animate-spin' : ''}`}
          onClick={() => onNavigate(url)}
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1">
        <div className="relative flex items-center group">
          <div className="absolute left-3 flex items-center gap-2">
            <button 
              type="button"
              onClick={onToggleShield}
              className={`transition-all duration-300 flex items-center gap-1.5 ${isShieldActive ? 'text-emerald-400' : 'text-slate-500'}`}
              title={isShieldActive ? 'Privacy Shield: Standard Protection' : 'Privacy Shield: Disabled'}
            >
              {isShieldActive ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
              {isShieldActive && <span className="text-[10px] font-bold bg-emerald-400/20 px-1 rounded">14</span>}
            </button>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-full h-8 px-12 text-xs font-medium text-slate-300 outline-none transition-all"
            spellCheck={false}
          />
          <div className="absolute right-3 flex items-center gap-2">
            <button 
              type="button"
              onClick={onToggleBookmark}
              className={`hover:bg-slate-800 p-0.5 rounded transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </form>

      <div className="flex items-center gap-1">
        <button 
          onClick={() => onOpenSidebar(SidebarPanel.AI)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-blue-200 hover:bg-blue-600/20 border border-blue-500/20 rounded-full transition-all text-xs font-bold"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Ask Lumina</span>
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-1" />
        <button 
          onClick={() => onOpenSidebar(SidebarPanel.BOOKMARKS)}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
          title="Bookmarks"
        >
          <Layout className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onOpenSidebar(SidebarPanel.HISTORY)}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
          title="History"
        >
          <History className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onOpenSidebar(SidebarPanel.SETTINGS)}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AddressBar;
