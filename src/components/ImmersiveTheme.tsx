import React, { useState, useEffect, useCallback } from 'react';
import { ThemeConfig, ThemeId, Track, PlayerState } from '../types/theme';
import { THEMES } from '../data/themes';
import {
  loadThemePlaylist,
  saveThemePlaylist,
  restoreThemePlaylist,
  isPlaylistCustomized,
  loadVolumeSettings,
  saveVolumeSettings,
} from '../lib/storage';
import { MusicPlayer } from './MusicPlayer';
import { YouTubePlayer } from './YouTubePlayer';
import { PlaylistDrawer } from './PlaylistDrawer';
import { ChangeVibeModal } from './ChangeVibeModal';
import { ArrowLeft, Compass, Maximize2, Minimize2 } from 'lucide-react';

interface ImmersiveThemeProps {
  theme: ThemeConfig;
  onSelectTheme: (themeId: ThemeId) => void;
  onReturnToHome: () => void;
}

export const ImmersiveTheme: React.FC<ImmersiveThemeProps> = ({
  theme,
  onSelectTheme,
  onReturnToHome,
}) => {
  // Playlist state
  const [tracks, setTracks] = useState<Track[]>(() =>
    loadThemePlaylist(theme.id, theme.defaultTracks)
  );
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Load custom playlist whenever theme changes
  useEffect(() => {
    const loaded = loadThemePlaylist(theme.id, theme.defaultTracks);
    setTracks(loaded);
    setCurrentTrackIndex(0);
  }, [theme.id, theme.defaultTracks]);

  // Audio / Player State
  const initialVolume = loadVolumeSettings();
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume: initialVolume.volume,
    isMuted: initialVolume.isMuted,
    currentTrackIndex: 0,
    error: null,
    isVideoVisible: false,
    autoplayBlocked: false,
  });

  const [seekTime, setSeekTime] = useState<number | null>(null);

  // Modals & Drawers
  const [isPlaylistDrawerOpen, setIsPlaylistDrawerOpen] = useState(false);
  const [isChangeVibeOpen, setIsChangeVibeOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentTrack: Track | null = tracks[currentTrackIndex] || null;
  const isCustomized = isPlaylistCustomized(tracks, theme.defaultTracks);

  // Playback handlers
  const handlePlay = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: true, error: null }));
  }, []);

  const handlePause = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const handleNext = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
      error: null,
    }));
  }, [tracks.length]);

  const handlePrevious = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
      error: null,
    }));
  }, [tracks.length]);

  const handleSeek = useCallback((seconds: number) => {
    setSeekTime(seconds);
    // Reset seek trigger after small delay
    setTimeout(() => setSeekTime(null), 100);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setPlayerState((prev) => {
      saveVolumeSettings(newVolume, prev.isMuted);
      return { ...prev, volume: newVolume, isMuted: false };
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    setPlayerState((prev) => {
      const nextMuted = !prev.isMuted;
      saveVolumeSettings(prev.volume, nextMuted);
      return { ...prev, isMuted: nextMuted };
    });
  }, []);

  const handleToggleVideo = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      isVideoVisible: !prev.isVideoVisible,
    }));
  }, []);

  // Playlist management handlers
  const handleSelectTrack = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
      error: null,
    }));
  }, []);

  const handleAddTrack = useCallback((newTrackData: Omit<Track, 'id'>) => {
    const newTrack: Track = {
      ...newTrackData,
      id: `custom-${Date.now()}`,
    };
    setTracks((prev) => {
      const updated = [...prev, newTrack];
      saveThemePlaylist(theme.id, updated);
      return updated;
    });
  }, [theme.id]);

  const handleRemoveTrack = useCallback((indexToRemove: number) => {
    setTracks((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      saveThemePlaylist(theme.id, updated);
      return updated;
    });

    // Adjust active track index if needed
    setCurrentTrackIndex((prev) => {
      if (prev >= tracks.length - 1) {
        return Math.max(0, tracks.length - 2);
      }
      return prev;
    });
  }, [theme.id, tracks.length]);

  const handleMoveTrack = useCallback((index: number, direction: 'up' | 'down') => {
    setTracks((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;

      saveThemePlaylist(theme.id, updated);
      return updated;
    });

    // Follow the track index if currently selected
    setCurrentTrackIndex((prev) => {
      if (prev === index) {
        return direction === 'up' ? index - 1 : index + 1;
      }
      return prev;
    });
  }, [theme.id]);

  const handleRestoreDefaults = useCallback(() => {
    const restored = restoreThemePlaylist(theme.id, theme.defaultTracks);
    setTracks(restored);
    setCurrentTrackIndex(0);
  }, [theme.id, theme.defaultTracks]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      } else if (e.code === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handlePrevious();
      } else if (e.code === 'KeyM') {
        handleToggleMute();
      } else if (e.code === 'Escape') {
        setIsPlaylistDrawerOpen(false);
        setIsChangeVibeOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, handleToggleMute]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white flex flex-col justify-between select-none">
      {/* 1. THE THEME'S BACKGROUND ARTWORK (Primary Visual Dominance) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={theme.backgroundImage}
          alt={theme.name}
          className="w-full h-full object-cover object-center filter transition-all duration-1000 scale-[1.01]"
          onError={(e) => {
            if (theme.fallbackImage && !e.currentTarget.src.includes(theme.fallbackImage)) {
              e.currentTarget.src = theme.fallbackImage;
            }
          }}
        />

        {/* Theme-specific cinematic subtle color gradient overlay for text readability */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-60"
          style={{ background: theme.overlayGradient }}
        />

        {/* Bottom vignette to cradle the player without blocking center subject */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Top subtle vignette */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      </div>

      {/* TOP HEADER CONTROLS: Return to selection & Compact Change Vibe */}
      <header className="relative z-20 flex items-center justify-between p-4 sm:p-6">
        {/* Left: Back to all worlds */}
        <button
          onClick={onReturnToHome}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all text-xs font-medium text-white/80 hover:text-white"
          title="Back to theme selection"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>All Worlds</span>
        </button>

        {/* Center: Theme Name & Cultural Identity */}
        <div className="text-center drop-shadow-md">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 block">
            {theme.hindiName}
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
            {theme.name}
          </h2>
        </div>

        {/* Right: Change Vibe & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChangeVibeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 hover:border-white/40 backdrop-blur-md transition-all text-xs font-semibold text-white active:scale-95 shadow-lg"
            title="Switch to another theme"
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Change Vibe</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all text-white/70 hover:text-white"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* DOCKED YOUTUBE PLAYER VIEWPORT (Top right or bottom right, toggleable) */}
      <div className="relative z-30 self-end px-4 sm:px-6 mb-2">
        <YouTubePlayer
          currentTrack={currentTrack}
          isPlaying={playerState.isPlaying}
          volume={playerState.volume}
          isMuted={playerState.isMuted}
          seekTime={seekTime}
          isVideoVisible={playerState.isVideoVisible}
          onPlayerReady={() => {
            // ready
          }}
          onStateChange={(state) => {
            setPlayerState((prev) => ({
              ...prev,
              isPlaying: state.isPlaying,
              isBuffering: state.isBuffering,
              currentTime: state.currentTime,
              duration: state.duration,
            }));
          }}
          onError={(errorMessage) => {
            setPlayerState((prev) => ({ ...prev, error: errorMessage }));
          }}
          onTrackEnd={handleNext}
          onToggleVideoVisibility={handleToggleVideo}
          accentColor={theme.themeColor}
        />
      </div>

      {/* 2. THE MUSIC PLAYER (Ergonomically positioned at bottom) */}
      <div className="relative z-30 pb-4 sm:pb-6">
        <MusicPlayer
          currentTrack={currentTrack}
          currentTrackIndex={currentTrackIndex}
          totalTracks={tracks.length}
          theme={theme}
          isPlaying={playerState.isPlaying}
          isBuffering={playerState.isBuffering}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          volume={playerState.volume}
          isMuted={playerState.isMuted}
          error={playerState.error}
          isVideoVisible={playerState.isVideoVisible}
          onPlay={handlePlay}
          onPause={handlePause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onTogglePlaylist={() => setIsPlaylistDrawerOpen(true)}
          onChangeVibe={() => setIsChangeVibeOpen(true)}
          onToggleVideo={handleToggleVideo}
        />
      </div>

      {/* CONTEXTUAL PLAYLIST DRAWER */}
      <PlaylistDrawer
        isOpen={isPlaylistDrawerOpen}
        onClose={() => setIsPlaylistDrawerOpen(false)}
        theme={theme}
        tracks={tracks}
        currentTrackIndex={currentTrackIndex}
        onSelectTrack={handleSelectTrack}
        onAddTrack={handleAddTrack}
        onRemoveTrack={handleRemoveTrack}
        onMoveTrack={handleMoveTrack}
        onRestoreDefaults={handleRestoreDefaults}
        isCustomized={isCustomized}
      />

      {/* CHANGE VIBE MODAL */}
      <ChangeVibeModal
        isOpen={isChangeVibeOpen}
        onClose={() => setIsChangeVibeOpen(false)}
        currentThemeId={theme.id}
        onSelectTheme={onSelectTheme}
        onReturnToHome={onReturnToHome}
      />
    </div>
  );
};
