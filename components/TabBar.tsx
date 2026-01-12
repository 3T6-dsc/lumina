
import React from 'react';
import { Plus, X, Globe } from 'lucide-react';

const TabBar = ({ tabs, activeTabId, onSelect, onClose, onAdd }) => {
  return (
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
            onClick={(e) => onClose(tab.id, e)}
            className={`
              absolute right-2 p-0.5 rounded-md transition-opacity z-10
              ${tab.id === activeTabId ? 'opacity-100 hover:bg-slate-700' : 'opacity-0 group-hover:opacity-100 hover:bg-slate-700'}
            `}
          >
            <X className="w-3 h-3" />
          </button>
          
          {tab.id === activeTabId && !tab.isLoading && (
            <div className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-slate-800 z-10" />
          )}

          {tab.isLoading && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-700/50 overflow-hidden z-20">
              <div className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 w-full animate-[pulse_1.5s_infinite]" />
            </div>
          )}
        </div>
      ))}
      <button
        onClick={onAdd}
        className="p-2 ml-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TabBar;
