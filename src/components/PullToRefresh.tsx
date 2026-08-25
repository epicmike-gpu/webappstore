import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ArrowDown, Check, Sparkles } from 'lucide-react';
import { AppVersion } from '../types';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  version: AppVersion;
  children: React.ReactNode;
}

const THRESHOLD = 65;
const MAX_PULL = 110;
const DAMPING = 0.42;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  version,
  children,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [status, setStatus] = useState<'idle' | 'pulling' | 'ready' | 'refreshing' | 'success'>('idle');
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isAtTopRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if page/container is scrolled to top
  const checkIsAtTop = useCallback(() => {
    return window.scrollY <= 2 || (document.documentElement?.scrollTop || 0) <= 2;
  }, []);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (status === 'refreshing' || status === 'success') return;
    
    if (checkIsAtTop()) {
      isAtTopRef.current = true;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startYRef.current = clientY;
      isDraggingRef.current = true;
    } else {
      isAtTopRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current || status === 'refreshing' || status === 'success') return;

    if (!isAtTopRef.current) {
      if (checkIsAtTop()) {
        isAtTopRef.current = true;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startYRef.current = clientY;
      }
      return;
    }

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startYRef.current;

    if (deltaY > 0) {
      // Calculate dampened distance
      const distance = Math.min(MAX_PULL, deltaY * DAMPING);
      setPullDistance(distance);

      if (distance >= THRESHOLD) {
        if (status !== 'ready') {
          setStatus('ready');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
              navigator.vibrate(12);
            } catch {
              // ignore vibration error
            }
          }
        }
      } else {
        if (status !== 'pulling') {
          setStatus('pulling');
        }
      }

      // Prevent native overscroll bouncing if pulling down from top
      if (e.cancelable && deltaY > 15) {
        e.preventDefault();
      }
    } else {
      setPullDistance(0);
      setStatus('idle');
    }
  };

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (status === 'ready' || pullDistance >= THRESHOLD) {
      setStatus('refreshing');
      setPullDistance(52); // Settle down at header height

      try {
        await Promise.all([
          onRefresh(),
          new Promise((resolve) => setTimeout(resolve, 650)), // Minimum duration for polished animation
        ]);
        setStatus('success');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([10, 40, 10]);
          } catch {
            // ignore
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch {
        // error
      } finally {
        setStatus('idle');
        setPullDistance(0);
      }
    } else {
      setStatus('idle');
      setPullDistance(0);
    }
  };

  // Attach global touch listeners to ensure gestures work smoothly everywhere
  useEffect(() => {
    const handleWindowTouchStart = (e: TouchEvent) => {
      if (checkIsAtTop()) {
        isAtTopRef.current = true;
        startYRef.current = e.touches[0].clientY;
      } else {
        isAtTopRef.current = false;
      }
    };

    window.addEventListener('touchstart', handleWindowTouchStart, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleWindowTouchStart);
    };
  }, [checkIsAtTop]);

  const progress = Math.min(1, pullDistance / THRESHOLD);
  const rotation = progress * 180;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      className="relative w-full overflow-hidden"
    >
      {/* Pull Indicator Bar */}
      <div
        className="w-full flex items-center justify-center pointer-events-none transition-all duration-200 ease-out z-30"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 6 ? 1 : 0,
        }}
      >
        <div className="py-2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-white/80 text-neutral-800 text-xs font-semibold neu-flat">
          {status === 'refreshing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span className="text-indigo-600 font-bold">
                {version === 'cn' ? '正在刷新应用库...' : 'Updating Web Apps...'}
              </span>
            </>
          ) : status === 'success' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              <span className="text-emerald-700 font-bold">
                {version === 'cn' ? '已刷新至最新' : 'Up to date'}
              </span>
            </>
          ) : status === 'ready' ? (
            <>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center bg-indigo-600 text-white transition-transform duration-200"
                style={{ transform: 'rotate(180deg)' }}
              >
                <ArrowDown className="w-2.5 h-2.5" />
              </div>
              <span className="text-indigo-600 font-bold">
                {version === 'cn' ? '释放立即刷新' : 'Release to refresh'}
              </span>
            </>
          ) : (
            <>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center bg-neutral-200 text-neutral-700 transition-transform duration-100"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <ArrowDown className="w-2.5 h-2.5" />
              </div>
              <span className="text-neutral-600">
                {version === 'cn' ? '下拉刷新应用' : 'Pull down to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="transition-transform duration-150 ease-out"
        style={{
          transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance * 0.15, 12)}px)` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};
