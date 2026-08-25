import React from 'react';
import { Search, Heart, Plus, Globe, Sparkles, X } from 'lucide-react';
import { AppVersion } from '../types';

interface HeaderProps {
  version: AppVersion;
  onVersionChange: (version: AppVersion) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoritesCount: number;
  currentTab: 'store' | 'favorites';
  onTabChange: (tab: 'store' | 'favorites') => void;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  version,
  onVersionChange,
  searchQuery,
  onSearchChange,
  favoritesCount,
  currentTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F0F0F3]/90 backdrop-blur-md border-b border-neutral-200/70 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Mode Switcher */}
        <div className="w-full md:w-auto flex items-center justify-between gap-4">
          <div
            id="brand-logo"
            onClick={() => onTabChange('store')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-1.5">
                Web App Store
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                  {version === 'cn' ? '国内版' : 'GLOBAL'}
                </span>
              </h1>
              <p className="text-xs text-neutral-700">
                {version === 'cn' ? '精选网页应用与效率工具' : 'Curated Web Applications Directory'}
              </p>
            </div>
          </div>

          {/* Version Switcher Pill */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-200/80 shadow-inner">
            <button
              id="version-cn-btn"
              onClick={() => onVersionChange('cn')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                version === 'cn'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              国内版
            </button>
            <button
              id="version-overseas-btn"
              onClick={() => onVersionChange('overseas')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                version === 'overseas'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Globe className="w-3 h-3" />
              海外版
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full md:max-w-md relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-600 absolute left-3.5 pointer-events-none" />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                version === 'cn'
                  ? '搜索应用名称、功能、标签或域名...'
                  : 'Search by name, tags, description or domain...'
              }
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#F0F0F3] border border-neutral-300/80 text-sm text-neutral-900 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                id="search-clear-btn"
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-0.5 rounded-full hover:bg-neutral-300 text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full md:w-auto flex items-center justify-end gap-2.5">
          <button
            id="tab-store-btn"
            onClick={() => onTabChange('store')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'store'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-[#F0F0F3] text-neutral-700 hover:bg-neutral-200/80 border border-neutral-300/60'
            }`}
          >
            {version === 'cn' ? '应用商店' : 'Explore'}
          </button>

          <button
            id="tab-favorites-btn"
            onClick={() => onTabChange('favorites')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'favorites'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'bg-[#F0F0F3] text-neutral-700 hover:bg-neutral-200/80 border border-neutral-300/60'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${currentTab === 'favorites' ? 'fill-current' : ''}`} />
            <span>{version === 'cn' ? '我的收藏' : 'Bookmarks'}</span>
            {favoritesCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === 'favorites'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            id="add-app-open-btn"
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{version === 'cn' ? '提交应用' : 'Submit App'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
