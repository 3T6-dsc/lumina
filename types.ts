
export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: number;
}

export enum SidebarPanel {
  NONE = 'none',
  AI = 'ai',
  BOOKMARKS = 'bookmarks',
  HISTORY = 'history',
  SETTINGS = 'settings'
}
