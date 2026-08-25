import React from 'react';
import { ExternalLink, Heart, ShieldCheck } from 'lucide-react';
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
      className="neu-card rounded-2xl p-4 flex flex-col justify-between border border-white/60 group cursor-pointer transition-all relative overflow-hidden"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 overflow-hidden"
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
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors text-sm">
                  {app.name}
                </h3>
              </div>
              <p className="text-[11px] text-neutral-600 font-mono truncate max-w-[150px]">
                {app.domain}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              id={`fav-btn-${app.id}`}
              onClick={() => onToggleFavorite(app.id)}
              className={`p-2 rounded-xl transition-all ${
                isFavorite
                  ? 'bg-rose-50 text-rose-500 shadow-inner'
                  : 'bg-[#F0F0F3] text-neutral-600 hover:text-rose-500 shadow-sm'
              }`}
              title={isFavorite ? '取消收藏' : '加入收藏'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-600 line-clamp-2 mb-3 min-h-[32px] leading-relaxed">
          {app.description}
        </p>
      </div>

      {/* Footer Tags & Actions */}
      <div className="pt-2.5 border-t border-neutral-200/60 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1 overflow-hidden flex-wrap">
          {app.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-200/70 text-neutral-700 truncate max-w-[90px]"
            >
              {tag}
            </span>
          ))}
        </div>

        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-indigo-600 py-1.5 px-3 rounded-xl neu-button active:scale-95"
        >
          <span>{version === 'cn' ? '打开' : 'Open'}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
