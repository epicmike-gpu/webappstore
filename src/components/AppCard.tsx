import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';
import { WebApp, AppVersion } from '../types';

interface AppCardProps {
  app: WebApp;
  onOpenDetails: (app: WebApp) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  version: AppVersion;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onOpenDetails,
  onToggleFavorite,
  isFavorite,
  version,
}) => {
  return (
    <div
      id={`app-card-${app.id}`}
      onClick={() => onOpenDetails(app)}
      className="neu-card rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between border border-white/70 group cursor-pointer transition-all relative overflow-hidden h-[155px] sm:h-[185px] hover:-translate-y-0.5"
    >
      {/* Favorite Button */}
      <button
        id={`fav-btn-${app.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(app.id);
        }}
        className={`absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 p-1.5 rounded-xl transition-all z-10 ${
          isFavorite
            ? 'bg-rose-50 text-rose-500 shadow-inner'
            : 'bg-white/80 sm:bg-[#F0F0F3] text-neutral-400 hover:text-rose-500 shadow-sm'
        }`}
        title={isFavorite ? (version === 'cn' ? '取消收藏' : 'Remove') : (version === 'cn' ? '加入收藏' : 'Bookmark')}
      >
        <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Main Content Area */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        {/* App Icon */}
        <div
          className="w-12 h-12 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 overflow-hidden mb-2 sm:mb-2.5 group-hover:scale-105 transition-transform"
          style={{ backgroundColor: app.brandColor || '#6C63FF' }}
        >
          {app.logoUrl ? (
            <img
              src={app.logoUrl}
              alt={app.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            app.name.slice(0, 1).toUpperCase()
          )}
        </div>

        {/* Title & Domain */}
        <div className="w-full px-0.5">
          <h3 className="font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors text-[13px] sm:text-sm line-clamp-1 leading-snug">
            {app.name}
          </h3>
          <p className="text-[11px] text-neutral-500 font-mono truncate hidden sm:block">
            {app.domain}
          </p>
        </div>

        {/* Description (visible on larger screens) */}
        <p className="text-xs text-neutral-600 line-clamp-2 mt-1 mb-2 leading-relaxed hidden sm:block">
          {app.description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="w-full pt-1 sm:pt-2 sm:border-t border-neutral-200/60 flex items-center justify-center sm:justify-between gap-1 mt-auto">
        {/* Tags (Desktop) */}
        <div className="hidden sm:flex items-center gap-1 overflow-hidden flex-wrap">
          {app.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-200/70 text-neutral-700 truncate max-w-[80px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Open Button / Link */}
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:w-auto flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold text-neutral-800 hover:text-indigo-600 py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl neu-button active:scale-95 transition-transform"
        >
          <span>{version === 'cn' ? '打开' : 'Open'}</span>
          <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </a>
      </div>
    </div>
  );
};
