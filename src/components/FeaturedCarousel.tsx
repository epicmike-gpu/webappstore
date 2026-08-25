import React from 'react';
import { Sparkles, ExternalLink, Heart, ChevronRight } from 'lucide-react';
import { WebApp, AppVersion } from '../types';

interface FeaturedCarouselProps {
  apps: WebApp[];
  onOpenApp: (app: WebApp) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  version: AppVersion;
  onSelectCategory: (id: string) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  apps,
  onOpenApp,
  onToggleFavorite,
  isFavorite,
  version,
  onSelectCategory,
}) => {
  if (!apps || apps.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-100 text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-neutral-900">
            {version === 'cn' ? '精选推荐' : 'Featured Spotlight'}
          </h2>
        </div>
        <button
          onClick={() => onSelectCategory('ai')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
        >
          <span>{version === 'cn' ? '浏览热门' : 'Explore Trending'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => {
          const isFav = isFavorite(app.id);

          return (
            <div
              key={app.id}
              id={`featured-card-${app.id}`}
              className="neu-card rounded-2xl p-4 relative overflow-hidden border border-white/60 group cursor-pointer"
              onClick={() => onOpenApp(app)}
            >
              {/* Soft decorative background tint */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-15 pointer-events-none transition-opacity group-hover:opacity-25"
                style={{ backgroundColor: app.brandColor || '#6C63FF' }}
              />

              <div className="flex items-start justify-between gap-3 relative z-10 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 overflow-hidden"
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
                    <h3 className="font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors text-sm">
                      {app.name}
                    </h3>
                    <p className="text-xs text-neutral-600 font-mono">{app.domain}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    id={`featured-favorite-${app.id}`}
                    onClick={() => onToggleFavorite(app.id)}
                    className={`p-2 rounded-xl transition-all ${
                      isFav
                        ? 'bg-rose-50 text-rose-500 shadow-inner'
                        : 'bg-white/80 text-neutral-600 hover:text-rose-500 shadow-sm'
                    }`}
                    title={isFav ? '取消收藏' : '加入收藏'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-600 line-clamp-2 mb-3.5 min-h-[32px] relative z-10">
                {app.description}
              </p>

              <div className="flex items-center justify-between relative z-10 pt-2 border-t border-neutral-200/60">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {app.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-200/70 text-neutral-700"
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
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-1 px-2.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 transition-all"
                >
                  <span>{version === 'cn' ? '立即访问' : 'Open'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
