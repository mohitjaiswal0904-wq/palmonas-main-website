'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type SyntheticEvent,
} from 'react';

import { mediaMessages, VIDEO_LAZY_LOAD_ROOT_MARGIN } from '@/config/media/media.config';

interface SilentVideoProps {
  'src': string;
  'poster'?: string;
  'className'?: string;
  'style'?: CSSProperties;
  'autoPlay'?: boolean;
  'loop'?: boolean;
  /** Custom controls without volume — native `controls` are never used (Safari ignores mute CSS). */
  'controls'?: boolean;
  'preload'?: 'none' | 'metadata' | 'auto';
  'aria-label'?: string;
  'data-cms-builder-node'?: string;
}

/**
 * Format seconds as m:ss for the control bar.
 *
 * @param seconds - Playback position or duration.
 * @returns Zero-padded time label.
 */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Silent CMS video — always muted, optional custom controls with no volume UI.
 */
export function SilentVideo({
  src,
  poster,
  className,
  style,
  autoPlay = false,
  loop = false,
  controls = false,
  preload,
  'aria-label': ariaLabel,
  'data-cms-builder-node': builderNodeId,
}: SilentVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /** Keep the element muted — site videos have no audio. */
  const enforceSilent = useCallback((el: HTMLVideoElement | null) => {
    if (!el) {
      return;
    }

    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;
  }, []);

  // Re-assert mute when the source changes (Safari can restore volume UI otherwise).
  useEffect(() => {
    enforceSilent(videoRef.current);
  }, [src, enforceSilent]);

  // Attach src only when the video is near the viewport so below-fold clips stay off the critical path.
  useEffect(() => {
    const el = videoRef.current;

    if (!el) {
      return undefined;
    }

    if (typeof IntersectionObserver === 'undefined') {
      // Defer load when IO is unavailable — avoid sync setState in this effect.
      const timerId = window.setTimeout(() => {
        setShouldLoad(true);
      }, 0);

      return () => window.clearTimeout(timerId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: VIDEO_LAZY_LOAD_ROOT_MARGIN, threshold: 0 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Start muted playback once the lazy src is attached (HTML autoPlay is unreliable with preload=none).
  useEffect(() => {
    if (!autoPlay || !shouldLoad) {
      return undefined;
    }

    const el = videoRef.current;

    if (!el) {
      return undefined;
    }

    let cancelled = false;

    const tryPlay = () => {
      if (cancelled) {
        return;
      }

      enforceSilent(el);
      void el.play().catch(() => {
        if (!cancelled) {
          setIsPlaying(false);
        }
      });
    };

    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
      return () => {
        cancelled = true;
      };
    }

    el.addEventListener('canplay', tryPlay);

    return () => {
      cancelled = true;
      el.removeEventListener('canplay', tryPlay);
    };
  }, [autoPlay, shouldLoad, src, enforceSilent]);

  // Track fullscreen state for the control-bar label.
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  /**
   * Toggle play/pause on the silent video element.
   */
  const togglePlayback = useCallback(() => {
    const el = videoRef.current;

    if (!el) {
      return;
    }

    enforceSilent(el);

    if (!shouldLoad) {
      setShouldLoad(true);
    }

    if (el.paused) {
      void el.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      el.pause();
    }
  }, [enforceSilent, shouldLoad]);

  /**
   * Seek to a ratio of the timeline (0–1).
   *
   * @param ratio - Fraction of duration.
   */
  const seekToRatio = useCallback((ratio: number) => {
    const el = videoRef.current;

    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) {
      return;
    }

    el.currentTime = Math.min(1, Math.max(0, ratio)) * el.duration;
  }, []);

  /**
   * Enter or exit fullscreen on the video element.
   */
  const toggleFullscreen = useCallback(() => {
    const el = videoRef.current;

    if (!el) {
      return;
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }

    void el.requestFullscreen().catch(() => undefined);
  }, []);

  const onTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(event.currentTarget.currentTime);
  };

  const onLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    enforceSilent(event.currentTarget);
    setDuration(event.currentTarget.duration);
  };

  const onSeekInput = (event: SyntheticEvent<HTMLInputElement>) => {
    seekToRatio(Number(event.currentTarget.value) / 100);
  };

  const onSeekKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.stopPropagation();
    }
  };

  const video = (
    <video
      ref={videoRef}
      key={src}
      src={shouldLoad ? src : undefined}
      poster={poster}
      muted
      playsInline
      autoPlay={autoPlay}
      loop={loop}
      preload={preload ?? 'none'}
      className={className}
      style={style}
      aria-label={ariaLabel}
      data-cms-builder-node={builderNodeId}
      onPlay={() => {
        enforceSilent(videoRef.current);
        setIsPlaying(true);
      }}
      onPause={() => setIsPlaying(false)}
      onTimeUpdate={onTimeUpdate}
      onLoadedMetadata={onLoadedMetadata}
      onVolumeChange={() => enforceSilent(videoRef.current)}
    />
  );

  if (!controls) {
    return video;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full">
      {video}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-2">
        <div className="pointer-events-auto flex items-center gap-2 px-2">
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-white"
            aria-label={isPlaying ? mediaMessages.a11y.pause : mediaMessages.a11y.play}
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="currentColor" d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>
          <span className="shrink-0 text-[11px] text-white tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            aria-label={mediaMessages.a11y.seek}
            className="h-1 min-w-0 flex-1 cursor-pointer accent-white"
            onChange={onSeekInput}
            onKeyDown={onSeekKeyDown}
          />
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-white"
            aria-label={
              isFullscreen ? mediaMessages.a11y.exitFullscreen : mediaMessages.a11y.fullscreen
            }
            onClick={toggleFullscreen}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
