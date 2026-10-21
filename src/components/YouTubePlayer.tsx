import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadYouTubeIFrameAPI, getYouTubeErrorMessage } from '../lib/youtube';
import { Track } from '../types/theme';
import { AlertCircle, Play, SkipForward, RefreshCw, ExternalLink } from 'lucide-react';

interface YouTubePlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  seekTime: number | null; // Triggered when user scrubs
  isVideoVisible: boolean;
  onPlayerReady?: () => void;
  onStateChange: (state: {
    isPlaying: boolean;
    isBuffering: boolean;
    currentTime: number;
    duration: number;
  }) => void;
  onError: (errorMessage: string | null) => void;
  onTrackEnd: () => void;
  onToggleVideoVisibility: () => void;
  accentColor: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  seekTime,
  isVideoVisible,
  onPlayerReady,
  onStateChange,
  onError,
  onTrackEnd,
  accentColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);

  // Time tracker loop when playing
  const startTimeTracking = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const currentTime = playerRef.current.getCurrentTime() || 0;
          const duration = playerRef.current.getDuration() || 0;
          onStateChange({
            isPlaying: true,
            isBuffering: false,
            currentTime,
            duration,
          });
        } catch (e) {
          // Player might be switching states
        }
      }
    }, 250);
  }, [onStateChange]);

  const stopTimeTracking = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize YouTube API once
  useEffect(() => {
    let mounted = true;
    loadYouTubeIFrameAPI()
      .then(() => {
        if (mounted) {
          setIsApiReady(true);
        }
      })
      .catch((err) => {
        console.error('Failed to initialize YouTube IFrame API:', err);
        if (mounted) {
          const msg = 'YouTube player failed to load. Please check your internet connection.';
          setCurrentError(msg);
          onError(msg);
        }
      });

    return () => {
      mounted = false;
      stopTimeTracking();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [onError, stopTimeTracking]);

  // Create or update YouTube Player instance
  useEffect(() => {
    if (!isApiReady || !containerRef.current || !currentTrack) return;

    const videoId = currentTrack.youtubeVideoId;
    if (!videoId) {
      const msg = `No playable video linked for "${currentTrack.title}". Use Playlist options to assign one.`;
      setCurrentError(msg);
      onError(msg);
      return;
    }

    // If player already exists, load new video
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      if (currentVideoIdRef.current !== videoId) {
        currentVideoIdRef.current = videoId;
        setCurrentError(null);
        onError(null);
        setAutoplayBlocked(false);

        try {
          playerRef.current.loadVideoById({
            videoId,
            startSeconds: 0,
          });
          if (isMuted) {
            playerRef.current.mute();
          } else {
            playerRef.current.unMute();
            playerRef.current.setVolume(volume);
          }
        } catch (e) {
          console.error('Failed to load video on existing player:', e);
        }
      }
      return;
    }

    // Clean container child elements before instantiating new player
    const playerId = 'yt-player-element';
    containerRef.current.innerHTML = `<div id="${playerId}"></div>`;

    currentVideoIdRef.current = videoId;
    setCurrentError(null);
    onError(null);
    setAutoplayBlocked(false);

    try {
      playerRef.current = new window.YT.Player(playerId, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
              event.target.setVolume(volume);
            }
            if (onPlayerReady) onPlayerReady();

            // Attempt initial play
            try {
              event.target.playVideo();
            } catch {
              setAutoplayBlocked(true);
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            // YT.PlayerState: ENDED = 0, PLAYING = 1, PAUSED = 2, BUFFERING = 3, CUED = 5
            if (state === 1) {
              // Playing
              setAutoplayBlocked(false);
              setCurrentError(null);
              onError(null);
              startTimeTracking();
              onStateChange({
                isPlaying: true,
                isBuffering: false,
                currentTime: event.target.getCurrentTime() || 0,
                duration: event.target.getDuration() || 0,
              });
            } else if (state === 2) {
              // Paused
              stopTimeTracking();
              onStateChange({
                isPlaying: false,
                isBuffering: false,
                currentTime: event.target.getCurrentTime() || 0,
                duration: event.target.getDuration() || 0,
              });
            } else if (state === 3) {
              // Buffering
              onStateChange({
                isPlaying: true,
                isBuffering: true,
                currentTime: event.target.getCurrentTime() || 0,
                duration: event.target.getDuration() || 0,
              });
            } else if (state === 0) {
              // Ended
              stopTimeTracking();
              onTrackEnd();
            }
          },
          onError: (event: any) => {
            stopTimeTracking();
            const errorMsg = getYouTubeErrorMessage(event.data);
            setCurrentError(errorMsg);
            onError(errorMsg);
          },
        },
      });
    } catch (e) {
      console.error('Error instantiating YT.Player:', e);
    }
  }, [isApiReady, currentTrack, isMuted, volume, onPlayerReady, onError, onStateChange, onTrackEnd, startTimeTracking, stopTimeTracking]);

  // Handle Play/Pause sync from props
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying && typeof playerRef.current.playVideo === 'function') {
        const state = playerRef.current.getPlayerState ? playerRef.current.getPlayerState() : -1;
        if (state !== 1 && state !== 3) {
          playerRef.current.playVideo();
        }
      } else if (!isPlaying && typeof playerRef.current.pauseVideo === 'function') {
        const state = playerRef.current.getPlayerState ? playerRef.current.getPlayerState() : -1;
        if (state === 1) {
          playerRef.current.pauseVideo();
        }
      }
    } catch (e) {
      console.warn('Error syncing play/pause state:', e);
    }
  }, [isPlaying]);

  // Handle Seek requests
  useEffect(() => {
    if (seekTime === null || !playerRef.current || typeof playerRef.current.seekTo !== 'function') return;
    try {
      playerRef.current.seekTo(seekTime, true);
    } catch (e) {
      console.warn('Seek error:', e);
    }
  }, [seekTime]);

  // Handle Volume & Mute changes
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(volume);
      }
      if (typeof playerRef.current.mute === 'function' && typeof playerRef.current.unMute === 'function') {
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
        }
      }
    } catch (e) {
      // ignore
    }
  }, [volume, isMuted]);

  const handleManualPlay = () => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.playVideo();
        setAutoplayBlocked(false);
      } catch (e) {
        console.error('Play click error:', e);
      }
    }
  };

  const handleRetry = () => {
    if (currentTrack && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      setCurrentError(null);
      onError(null);
      playerRef.current.loadVideoById(currentTrack.youtubeVideoId);
    }
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isVideoVisible ? 'block opacity-100 scale-100' : 'hidden opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative w-full aspect-video max-w-sm rounded-xl overflow-hidden bg-black/90 border border-white/10 shadow-2xl backdrop-blur-md">
        {/* Real YouTube IFrame Container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Autoplay blocked overlay banner */}
        {autoplayBlocked && !currentError && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center z-20">
            <p className="text-sm font-medium text-white mb-3">
              Browser paused autoplay with audio. Click to start listening:
            </p>
            <button
              onClick={handleManualPlay}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-black transition-transform active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              <Play className="w-4 h-4 fill-current" />
              Start Playback
            </button>
          </div>
        )}

        {/* Error overlay banner */}
        {currentError && (
          <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center p-4 text-center z-20">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
            <p className="text-xs font-semibold text-white/90 mb-1 max-w-[240px]">
              {currentError}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
              <button
                onClick={onTrackEnd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-black transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                <SkipForward className="w-3.5 h-3.5 fill-current" />
                Skip Track
              </button>
            </div>
            {currentTrack?.youtubeVideoId && (
              <a
                href={`https://www.youtube.com/watch?v=${currentTrack.youtubeVideoId}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 text-[11px] text-white/50 hover:text-white/80 inline-flex items-center gap-1 underline"
              >
                Open on YouTube <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
