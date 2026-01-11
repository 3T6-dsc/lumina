
import React, { useState, useCallback, useEffect } from 'react';
import { Tab, SidebarPanel, Bookmark, HistoryItem } from './types.ts';
import TabBar from './components/TabBar.tsx';
import AddressBar from './components/AddressBar.tsx';
import WebView from './components/WebView.tsx';
import Sidebar from './components/Sidebar.tsx';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_URL = 'https://www.wikipedia.org';

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: DEFAULT_URL, title: 'Wikipedia', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [sidebarOpen, setSidebarOpen] = useState<SidebarPanel>(SidebarPanel.NONE);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isShieldActive, setIsShieldActive] = useState(true);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleAddTab = useCallback(() => {
    const newTab: Tab = {
      id: uuidv4(),
      url: 'https://www.google.com/search?igu=1',
      title: 'New Tab',
      isLoading: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const handleCloseTab = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  }, [tabs, activeTabId]);

  const handleNavigate = useCallback((url: string) => {
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = `https://${url}`;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}&igu=1`;
      }
    }

    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, url: finalUrl, isLoading: true } : t
    ));

    // Add to history
    setHistory(prev => [
      { id: uuidv4(), url: finalUrl, title: finalUrl, timestamp: Date.now() },
      ...prev.slice(0, 49)
    ]);

    // Simulate load completion
    setTimeout(() => {
      setTabs(prev => prev.map(t => 
        t.id === activeTabId ? { ...t, isLoading: false } : t
      ));
    }, 1000);
  }, [activeTabId]);

  const handleToggleBookmark = useCallback(() => {
    const exists = bookmarks.find(b => b.url === activeTab.url);
    if (exists) {
      setBookmarks(prev => prev.filter(b => b.url !== activeTab.url));
    } else {
      setBookmarks(prev => [...prev, { id: uuidv4(), title: activeTab.title, url: activeTab.url }]);
    }
  }, [activeTab, bookmarks]);

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-200 overflow-hidden select-none">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Browser Top Bar */}
        <div className="bg-slate-900 border-b border-slate-700/50 flex flex-col">
          <TabBar 
            tabs={tabs} 
            activeTabId={activeTabId} 
            onSelect={setActiveTabId} 
            onClose={handleCloseTab} 
            onAdd={handleAddTab} 
          />
          <AddressBar 
            url={activeTab.url} 
            isLoading={activeTab.isLoading}
            isShieldActive={isShieldActive}
            isBookmarked={!!bookmarks.find(b => b.url === activeTab.url)}
            onNavigate={handleNavigate}
            onToggleShield={() => setIsShieldActive(!isShieldActive)}
            onToggleBookmark={handleToggleBookmark}
            onOpenSidebar={(panel) => setSidebarOpen(sidebarOpen === panel ? SidebarPanel.NONE : panel)}
          />
        </div>

        {/* Browser Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 bg-white overflow-hidden relative">
            {tabs.map(tab => (
              <div 
                key={tab.id} 
                className={`absolute inset-0 transition-opacity duration-300 ${tab.id === activeTabId ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              >
                <WebView url={tab.url} isLoading={tab.isLoading} isShieldActive={isShieldActive} />
              </div>
            ))}
          </main>
          
          <Sidebar 
            isOpen={sidebarOpen !== SidebarPanel.NONE} 
            activePanel={sidebarOpen}
            history={history}
            bookmarks={bookmarks}
            currentUrl={activeTab.url}
            onClose={() => setSidebarOpen(SidebarPanel.NONE)}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
