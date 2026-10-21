import React, { useState } from 'react';
import { Track, ThemeConfig } from '../types/theme';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  Compass,
  Tv,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface MusicPlayerProps {
  currentTrack: Track | null;
  currentTrackIndex: number;
  totalTracks: number;
  theme: ThemeConfig;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  error: string | null;
  isVideoVisible: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onTogglePlaylist: () => void;
  onChangeVibe: () => void;
  onToggleVideo: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  currentTrackIndex,
  totalTracks,
  theme,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  volume,
  isMuted,
  error,
  isVideoVisible,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onTogglePlaylist,
  onChangeVibe,
  onToggleVideo,
}) => {
  const [isSeekingLocally, setIsSeekingLocally] = useState(false);
  const [localSeekTime, setLocalSeekTime] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const displayTime = isSeekingLocally ? localSeekTime : currentTime;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalSeekTime(val);
  };

  const handleSeekStart = () => {
    setIsSeekingLocally(true);
  };

  const handleSeekEnd = () => {
    setIsSeekingLocally(false);
    onSeek(localSeekTime);
  };

  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Playback Error Warning Banner if applicable */}
      {error && (
        <div className="mb-2 p-2.5 rounded-xl bg-stone-900/90 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300 backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <button
            onClick={onNext}
            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium shrink-0 ml-2"
          >
            Skip to next
          </button>
        </div>
      )}

      {/* Main Glass Control Console */}
      <div className="relative rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-3 sm:p-4 shadow-2xl">
        {/* Subtle theme accent highlight at top border */}
        <div
          className="absolute top-0 left-8 right-8 h-[1px] opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.themeColor}, transparent)`,
          }}
        />

        {/* Top Seek Progress Bar */}
        <div className="mb-3">
          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={displayTime}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              disabled={duration <= 0}
              aria-label="Seek track position"
              className="w-full h-1.5 rounded-full appearance-none bg-white/15 relative z-10"
              style={{
                background: `linear-gradient(to right, ${theme.themeColor} 0%, ${theme.themeColor} ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-white/50 font-mono mt-1">
            <span>{formatTime(displayTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>

        {/* Bottom Control Bar: Left (Track Info), Middle (Playback Controls), Right (Actions) */}
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/10 overflow-hidden shadow-inner"
              style={{
                backgroundColor: `rgba(${theme.themeColorRgb}, 0.15)`,
              }}
            >
              {isBuffering ? (
                <Loader2
                  className="w-5 h-5 animate-spin"
                  style={{ color: theme.themeColor }}
                />
              ) : (
                <span
                  className="text-xs font-serif font-bold"
                  style={{ color: theme.themeColor }}
                >
                  {currentTrackIndex + 1}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate tracking-wide">
                {currentTrack?.title || 'No track selected'}
              </h4>
              <p className="text-xs text-white/60 truncate">
                {currentTrack?.artist || theme.name}
                {currentTrack?.year && ` · ${currentTrack.year}`}
              </p>
            </div>
          </div>

          {/* Primary Controls (Prev, Play/Pause, Next) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onPrevious}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Previous track"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={isPlaying ? onPause : onPlay}
              className="p-3 sm:p-3.5 rounded-full text-black shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
              style={{ backgroundColor: theme.themeColor }}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <Loader2 className="w-5 h-5 animate-spin text-black" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Next track"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Auxiliary Controls (Volume, Video Toggle, Playlist, Change Vibe) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Volume Control */}
            <div
              className="relative hidden sm:flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={onToggleMute}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black/90 border border-white/15 rounded-lg shadow-xl backdrop-blur-md w-28">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-full"
                    style={{
                      accentColor: theme.themeColor,
                    }}
                    aria-label="Volume slider"
                  />
                </div>
              )}
            </div>

            {/* Video Viewport Toggle */}
            <button
              onClick={onToggleVideo}
              className={`p-2 rounded-lg transition-colors border ${
                isVideoVisible
                  ? 'border-white/30 bg-white/15 text-white'
                  : 'border-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={isVideoVisible ? 'Hide official video window' : 'Show official video window'}
              aria-label="Toggle official video display"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Playlist Drawer Trigger */}
            <button
              onClick={onTogglePlaylist}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs"
              title="View & customize playlist"
              aria-label="View playlist"
            >
              <ListMusic className="w-4 h-4" />
              <span className="hidden md:inline font-medium">Playlist</span>
              <span className="text-[10px] opacity-60">({totalTracks})</span>
            </button>

            {/* Change Vibe Trigger */}
            <button
              onClick={onChangeVibe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs text-white border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all active:scale-95"
              title="Change vibe"
              aria-label="Change vibe"
            >
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Change Vibe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
