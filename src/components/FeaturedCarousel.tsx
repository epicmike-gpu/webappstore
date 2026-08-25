import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Heart, ChevronRight, ChevronLeft } from 'lucide-react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [apps]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.85;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!apps || apps.length === 0) return null;

  return (
    <section className="mb-6 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-100 text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-neutral-900">
            {version === 'cn' ? '精选推荐' : 'Featured Spotlight'}
          </h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
            {version === 'cn' ? '今日特选' : 'Today'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Swipe / Navigation buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-xl transition-all neu-button ${
                !canScrollLeft ? 'opacity-30 cursor-not-allowed' : 'hover:text-indigo-600 active:scale-95'
              }`}
              title={version === 'cn' ? '向左滑动' : 'Scroll left'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-xl transition-all neu-button ${
                !canScrollRight ? 'opacity-30 cursor-not-allowed' : 'hover:text-indigo-600 active:scale-95'
              }`}
              title={version === 'cn' ? '向右滑动' : 'Scroll right'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onSelectCategory('ai')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 ml-1"
          >
            <span>{version === 'cn' ? '热门' : 'More'}</span>
          </button>
        </div>
      </div>

      {/* 1 Row x 3 Columns Swipeable / Scrollable Carousel Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-2.5 sm:gap-3.5 md:gap-4 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth snap-x snap-mandatory scrollbar-none no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {apps.map((app) => {
          const isFav = isFavorite(app.id);

          return (
            <div
              key={app.id}
              id={`featured-card-${app.id}`}
              onClick={() => onOpenApp(app)}
              className="neu-card rounded-2xl p-2.5 sm:p-4 relative overflow-hidden border border-white/70 group cursor-pointer flex flex-col justify-between h-[155px] sm:h-[175px] shrink-0 snap-start transition-all hover:-translate-y-0.5"
              style={{
                /* Exactly 3 columns per view (minus the gaps) on both mobile & desktop */
                width: 'calc((100% - 20px) / 3)',
                minWidth: '105px',
              }}
            >
              {/* Soft decorative background tint */}
              <div
                className="absolute -top-12 -right-12 w-28 sm:w-32 h-28 sm:h-32 rounded-full blur-2xl opacity-15 pointer-events-none transition-opacity group-hover:opacity-25"
                style={{ backgroundColor: app.brandColor || '#6C63FF' }}
              />

              {/* Card Header & Content */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left relative z-10 w-full">
                {/* Favorite Heart Button */}
                <button
                  id={`feat-fav-${app.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(app.id);
                  }}
                  className={`absolute top-0 right-0 p-1 sm:p-1.5 rounded-xl transition-all z-20 ${
                    isFav
                      ? 'bg-rose-50 text-rose-500 shadow-inner'
                      : 'bg-white/80 sm:bg-[#F0F0F3] text-neutral-400 hover:text-rose-500 shadow-sm'
                  }`}
                  title={isFav ? (version === 'cn' ? '取消收藏' : 'Remove') : (version === 'cn' ? '加入收藏' : 'Bookmark')}
                >
                  <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                </button>

                {/* App Logo */}
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm shrink-0 overflow-hidden mb-2 sm:mb-2 group-hover:scale-105 transition-transform"
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

                {/* App Name & Domain */}
                <div className="w-full px-0.5">
                  <h3 className="font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors text-[12px] sm:text-sm line-clamp-1 leading-snug">
                    {app.name}
                  </h3>

                  <p className="text-[10px] sm:text-[11px] text-neutral-500 font-mono truncate hidden sm:block">
                    {app.domain}
                  </p>

                  <p className="text-xs text-neutral-600 line-clamp-1 leading-relaxed hidden sm:block mt-0.5">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-auto pt-1 sm:pt-2 sm:border-t border-neutral-200/60 flex items-center justify-center sm:justify-between relative z-10">
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                  {version === 'cn' ? '精选' : 'Spotlight'}
                </span>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full sm:w-auto flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold text-neutral-800 hover:text-indigo-600 py-1 sm:py-1 px-2 sm:px-2.5 rounded-lg neu-button active:scale-95 transition-transform"
                >
                  <span>{version === 'cn' ? '打开' : 'Open'}</span>
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
