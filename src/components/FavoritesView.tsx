import React, { useState } from 'react';
import { Heart, Search, ExternalLink, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { WebApp, AppVersion } from '../types';
import { AppCard } from './AppCard';

interface FavoritesViewProps {
  favoriteApps: WebApp[];
  onOpenDetails: (app: WebApp) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  onBackToStore: () => void;
  version: AppVersion;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteApps,
  onOpenDetails,
  onToggleFavorite,
  isFavorite,
  onBackToStore,
  version,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = favoriteApps.filter(
    (app) =>
      app.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      app.tags.some((t) => t.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl neu-flat border border-white/60">
        <div className="flex items-center gap-3">
          <button
            id="back-to-store-btn"
            onClick={onBackToStore}
            className="p-2.5 rounded-xl neu-button text-neutral-700 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>{version === 'cn' ? '我的收藏夹' : 'My Bookmarked Web Apps'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                {favoriteApps.length}
              </span>
            </h2>
            <p className="text-xs text-neutral-600">
              {version === 'cn'
                ? '保存在本地的常用 Web 应用程序，随时一键快速访问'
                : 'Your saved favorite web tools, readily available on any device'}
            </p>
          </div>
        </div>

        {favoriteApps.length > 0 && (
          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-neutral-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={version === 'cn' ? '在收藏中搜索...' : 'Filter bookmarks...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F0F0F3] border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50 shadow-inner"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {favoriteApps.length === 0 ? (
        <div className="p-12 rounded-3xl neu-flat border border-white/60 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-800">
              {version === 'cn' ? '暂无收藏的应用' : 'No Bookmarks Yet'}
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto">
              {version === 'cn'
                ? '在应用卡片上点击爱心图标，即可将喜爱的网站加入收藏夹'
                : 'Click the heart icon on any application card to bookmark it here'}
            </p>
          </div>
          <button
            onClick={onBackToStore}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{version === 'cn' ? '探索精选应用' : 'Explore Applications'}</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-600">
          {version === 'cn' ? '没有匹配的收藏应用' : 'No matching bookmarked apps found'}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
          {filtered.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onOpenDetails={onOpenDetails}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite(app.id)}
              version={version}
            />
          ))}
        </div>
      )}
    </div>
  );
};
