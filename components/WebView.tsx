
import React, { useState, useEffect } from 'react';
import { AlertCircle, Lock, ShieldCheck, Zap, Globe, Info } from 'lucide-react';

interface WebViewProps {
  url: string;
  isLoading: boolean;
  isShieldActive: boolean;
}

const WebView: React.FC<WebViewProps> = ({ url, isLoading, isShieldActive }) => {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Reset error state on URL change
    setLoadError(false);
  }, [url]);

  return (
    <div className="w-full h-full bg-[#f8fafc] relative flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-all duration-300">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-bold text-xs tracking-widest uppercase">Analyzing Connection...</p>
        </div>
      )}

      {/* Security Status Bar (Native Feel) */}
      <div className="h-7 bg-slate-100/80 backdrop-blur-sm border-b border-slate-200 px-4 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tight">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Lock className="w-3 h-3" />
            <span>Connection Secure</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            <span>{new URL(url).hostname}</span>
          </div>
        </div>
        
        {isShieldActive && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <ShieldCheck className="w-3 h-3" />
              <span>Shield Active: Blocking 14 Trackers</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-600">
              <Zap className="w-3 h-3" />
              <span>HTTPS Upgraded</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden bg-white">
        {loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <AlertCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Refused to Connect</h2>
            <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
              This website has security policies that prevent it from being loaded in an iframe. Lumina's security isolation is active.
            </p>
            <div className="flex gap-4">
              <button className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95">
                Open in Workspace Tab
              </button>
              <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-full hover:bg-slate-50 transition-all active:scale-95">
                Troubleshoot Connection
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-none"
            title="Lumina Render Engine"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onError={() => setLoadError(true)}
          />
        )}
      </div>

      {/* Reader Mode Suggestion - Subtle Floating UI */}
      {!loadError && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 text-white shadow-2xl rounded-full text-[11px] font-bold border border-slate-700 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>SMART VIEW AVAILABLE</span>
            <div className="w-[1px] h-3 bg-slate-700 mx-1" />
            <button className="text-blue-400 hover:text-blue-300">ACTIVATE</button>
          </div>
        </div>
      )}
      
      {/* Site Info Bubble */}
      <button className="absolute bottom-6 right-6 p-3 bg-white border border-slate-200 shadow-lg rounded-full text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all">
        <Info className="w-5 h-5" />
      </button>
    </div>
  );
};

export default WebView;
