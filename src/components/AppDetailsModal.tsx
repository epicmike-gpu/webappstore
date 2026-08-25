import React, { useState } from 'react';
import { X, ExternalLink, Heart, Copy, Check, ShieldCheck, Globe, Share2 } from 'lucide-react';
import { WebApp, AppVersion } from '../types';

interface AppDetailsModalProps {
  app: WebApp | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  version: AppVersion;
}

export const AppDetailsModal: React.FC<AppDetailsModalProps> = ({
  app,
  onClose,
  onToggleFavorite,
  isFavorite,
  version,
}) => {
  const [copied, setCopied] = useState(false);

  if (!app) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(app.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg neu-flat rounded-3xl p-6 border border-white/80 space-y-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Top Summary */}
        <div className="flex items-start gap-4 pr-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md shrink-0 overflow-hidden"
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
            <h2 className="text-xl font-extrabold text-neutral-900 leading-tight">
              {app.name}
            </h2>
            <p className="text-xs text-neutral-600 font-mono mt-0.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-neutral-600" />
              <span>{app.domain}</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {app.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-4 rounded-2xl bg-white/70 border border-neutral-200/60 shadow-inner">
          <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
            {version === 'cn' ? '应用介绍' : 'About Application'}
          </h3>
          <p className="text-sm text-neutral-700 leading-relaxed">{app.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onToggleFavorite(app.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-inner'
                  : 'neu-button text-neutral-700 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isFavorite ? (version === 'cn' ? '已收藏' : 'Bookmarked') : (version === 'cn' ? '收藏应用' : 'Bookmark')}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl neu-button text-xs font-bold text-neutral-700 hover:text-neutral-900"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">{version === 'cn' ? '已复制' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{version === 'cn' ? '复制链接' : 'Copy Link'}</span>
                </>
              )}
            </button>
          </div>

          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all"
          >
            <span>{version === 'cn' ? '访问该网页应用' : 'Launch Application'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
