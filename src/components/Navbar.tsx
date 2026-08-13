import React from 'react';
import { Map, List, Bot, Bookmark, Navigation, BookOpen, Search } from 'lucide-react';
import { UserLocation } from '../types';

interface NavbarProps {
  activeTab: 'map' | 'list' | 'ai' | 'favorites';
  setActiveTab: (tab: 'map' | 'list' | 'ai' | 'favorites') => void;
  favoritesCount: number;
  userLocation: UserLocation | null;
  onGetUserLocation: () => void;
  isLocating: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  userLocation,
  onGetUserLocation,
  isLocating,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white leading-tight tracking-tight">
                埼玉県図書館マップ
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                県立・市立図書館の検索・ナビ
              </p>
            </div>
          </div>

          {/* Quick Search Box (Desktop & Tablet) */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="図書館名、市町村、駅名、設備で検索..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-full bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Location button */}
          <button
            onClick={onGetUserLocation}
            disabled={isLocating}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              userLocation
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
            }`}
            title="現在地を取得して近い順に並び替え"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{userLocation ? '現在地取得済' : '現在地を取得'}</span>
          </button>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>マップ</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span>一覧</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI相談</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'favorites'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">保存</span>
              {favoritesCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                  {favoritesCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Mobile Search input bar */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="図書館名、市町村、駅名等で検索..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
